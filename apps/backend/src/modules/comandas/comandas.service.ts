// src/modules/comandas/comandas.service.ts
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { CreateComandaDto } from "./dto/create-comanda.dto";

/**
 * Input para registrar impresión (v1).
 */
type MarkPrintedInput = {
    success: boolean;
    printerName: string | null;
    errorMessage: string | null;
    performedByUserId: string;
};

type VoidOrderInput = {
    reason: string;
    voidedByUserId: string;
};

@Injectable()
export class ComandasService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Nombre “plano” para snapshot desde variante.
     * family.name + flavor.nameSuffix + variant.label (si existe)
     */
    private flattenVariantName(v: {
        label: string;
        flavor: { nameSuffix: string; family: { name: string } };
    }) {
        const familyName = v.flavor.family.name ?? "";
        const suffix = (v.flavor.nameSuffix ?? "").trim();
        const label = (v.label ?? "").trim();
        return `${familyName} ${suffix} ${label}`.replace(/\s+/g, " ").trim();
    }

    /**
     * Mapper: Prisma Order -> payload API estable.
     */
    private mapOrder(order: any) {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            createdByUserId: order.createdByUserId,
            notes: order.notes,
            total: order.total,

            print: {
                status: order.printStatus,
                printedAt: order.printedAt,
                printerName: order.printerName,
                error: order.printError,
                lastPrintedByUserId: order.lastPrintedByUserId,
            },

            void: {
                isVoided: order.isVoided,
                voidedAt: order.voidedAt,
                voidedByUserId: order.voidedByUserId,
                reason: order.voidReason,
            },

            items: (order.items ?? []).map((i: any) => ({
                id: i.id,
                variantId: i.variantId,
                name: i.itemNameSnapshot,
                unitPrice: i.unitPriceSnapshot,
                quantity: i.quantity,
                subtotal: i.subtotalSnapshot,
                notes: i.notes,
            })),
        };
    }

    /**
     * Query estándar para devolver una orden completa.
     */
    private async loadOrderOrThrow(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!order) throw new NotFoundException("Comanda no encontrada");
        return order;
    }

    /**
     * Crea una comanda (Order) con items (OrderItem) usando snapshot de variante.
     * v1: sin modificadores, sin combos.
     */
    async create(dto: CreateComandaDto, createdByUserId: string) {
        if (!dto.items?.length) {
            throw new BadRequestException("La comanda requiere al menos 1 ítem.");
        }

        const user = await this.prisma.user.findFirst({
            where: { id: createdByUserId, isActive: true },
            select: { id: true },
        });
        if (!user) throw new BadRequestException("Operario inválido.");

        // Variantes para snapshot (solo activas)
        // Nota: CreateComandaDto probablemente aún use productId; acá lo tratamos como variantId.
        const variantIds = dto.items.map((i) => i.productId);

        const variants = await this.prisma.productVariant.findMany({
            where: { id: { in: variantIds }, isActive: true },
            select: {
                id: true,
                label: true,
                priceCents: true,
                currency: true,
                flavor: {
                    select: {
                        nameSuffix: true,
                        family: { select: { name: true } },
                    },
                },
            },
        });

        const variantMap = new Map(variants.map((v) => [v.id, v]));

        // Número secuencial simple (v1)
        const last = await this.prisma.order.findFirst({
            orderBy: { orderNumber: "desc" },
            select: { orderNumber: true },
        });
        const nextNumber = (last?.orderNumber ?? 0) + 1;

        const itemsCreate = dto.items.map((i) => {
            const v = variantMap.get(i.productId);
            if (!v) {
                throw new BadRequestException(
                    `Variante inválida o inactiva: ${i.productId}`,
                );
            }

            const qty = Math.max(1, i.quantity ?? 1);
            const unit = v.priceCents;
            const subtotal = unit * qty;

            return {
                variantId: v.id,
                itemNameSnapshot: this.flattenVariantName(v),
                unitPriceSnapshot: unit,
                quantity: qty,
                subtotalSnapshot: subtotal,
                notes: i.notes ?? null,
            };
        });

        const total = itemsCreate.reduce((acc, it) => acc + it.subtotalSnapshot, 0);

        const order = await this.prisma.order.create({
            data: {
                orderNumber: nextNumber,
                createdByUserId,
                notes: dto.notes ?? null,
                total,
                items: { create: itemsCreate },
            },
            include: { items: true },
        });

        return this.mapOrder(order);
    }

    /**
     * Obtiene una comanda por ID (payload estable).
     */
    async getById(id: string) {
        const order = await this.loadOrderOrThrow(id);
        return this.mapOrder(order);
    }

    /**
     * Devuelve ticket en texto (v1).
     */
    async getTicketText(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
                createdByUser: { select: { displayName: true } },
            },
        });

        if (!order) throw new NotFoundException("Comanda no encontrada");

        const money = (cents: number) => {
            const value = cents / 100;
            return value.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        };

        const lines: string[] = [];
        lines.push("ENCAJA");
        lines.push("------------------------------");
        lines.push(`COMANDA #${order.orderNumber}`);
        lines.push(`Fecha: ${new Date(order.createdAt).toLocaleString("es-AR")}`);
        lines.push(`Operario: ${order.createdByUser.displayName}`);
        if (order.notes) lines.push(`Nota: ${order.notes}`);
        lines.push("------------------------------");

        for (const item of order.items) {
            lines.push(`${item.quantity} x ${item.itemNameSnapshot}`);
            if (item.notes) lines.push(`  * ${item.notes}`);
            lines.push(`  $ ${money(item.subtotalSnapshot)}`);
            lines.push("");
        }

        lines.push("------------------------------");
        lines.push(`TOTAL: $ ${money(order.total)}`);
        lines.push("------------------------------");

        return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            text: lines.join("\n"),
        };
    }

    /**
     * Marca impresión.
     */
    async markPrinted(id: string, input: MarkPrintedInput) {
        const orderExists = await this.prisma.order.findUnique({
            where: { id },
            select: { id: true, isVoided: true },
        });
        if (!orderExists) throw new NotFoundException("Comanda no encontrada");
        if (orderExists.isVoided) {
            throw new BadRequestException(
                "No se puede registrar impresión: comanda anulada.",
            );
        }

        await this.prisma.orderPrintLog.create({
            data: {
                orderId: id,
                success: input.success,
                printerName: input.printerName,
                errorMessage: input.errorMessage,
                performedByUserId: input.performedByUserId,
            },
        });

        return this.prisma.order.update({
            where: { id },
            data: {
                printStatus: input.success ? "OK" : "ERROR",
                printedAt: input.success ? new Date() : null,
                printerName: input.printerName,
                printError: input.success ? null : input.errorMessage,
                lastPrintedByUserId: input.performedByUserId,
            },
        });
    }

    async voidOrder(id: string, input: VoidOrderInput) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            select: { id: true, isVoided: true, printStatus: true },
        });
        if (!order) throw new NotFoundException("Comanda no encontrada");

        if (order.isVoided) {
            throw new BadRequestException("La comanda ya está anulada.");
        }

        const updated = await this.prisma.order.update({
            where: { id },
            data: {
                isVoided: true,
                voidedAt: new Date(),
                voidReason: input.reason,
                voidedByUserId: input.voidedByUserId,
            },
            include: { items: true },
        });

        return this.mapOrder(updated);
    }
}