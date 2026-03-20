// src/modules/comandas/comandas.service.ts
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { PrinterService } from "../printer/printer.service";
import { EventService } from "../events/event.service";
import { CreateComandaDto } from "./dto/create-comanda.dto";

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

// ─── Helpers de formato ───────────────────────────────────────────────────

const W = 24;

function divider(char = "-"): string { return char.repeat(W); }

function center(text: string): string {
    const len = text.length;
    if (len >= W) return text.slice(0, W);
    return " ".repeat(Math.floor((W - len) / 2)) + text;
}

function row(label: string, value: string): string[] {
    const gap = W - label.length - value.length;
    if (gap >= 1) return [label + " ".repeat(gap) + value];
    return [label, " ".repeat(W - value.length) + value];
}

function priceRight(cents: number): string {
    const money = fmtMoney(cents);
    return " ".repeat(W - money.length) + money;
}

function formatItem(qty: number, name: string, subtotalCents: number, notes: string | null): string[] {
    const prefix = `${qty}x `;
    const maxLen = W - prefix.length;
    const nameLines: string[] = [];
    let remaining = name;
    while (remaining.length > maxLen) {
        let cut = maxLen;
        const lastSpace = remaining.lastIndexOf(" ", maxLen);
        if (lastSpace > 0) cut = lastSpace;
        nameLines.push(remaining.slice(0, cut));
        remaining = remaining.slice(cut).trimStart();
    }
    if (remaining) nameLines.push(remaining);
    const lines: string[] = [prefix + nameLines[0]];
    for (let i = 1; i < nameLines.length; i++) lines.push(" ".repeat(prefix.length) + nameLines[i]);
    if (notes) lines.push(`  > ${notes.slice(0, W - 4)}`);
    lines.push(priceRight(subtotalCents));
    return lines;
}

function fmtMoney(cents: number): string {
    return "$" + (cents / 100).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(date: Date): string {
    const d = date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
    const t = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${d} ${t}`;
}

// ─── Service ──────────────────────────────────────────────────────────────

@Injectable()
export class ComandasService {
    constructor(
        private readonly prisma:   PrismaService,
        private readonly printer:  PrinterService,
        private readonly events:   EventService,
    ) {}

    private flattenVariantName(v: { label: string; flavor: { nameSuffix: string; family: { name: string } } }) {
        return `${v.flavor.family.name ?? ""} ${(v.flavor.nameSuffix ?? "").trim()} ${(v.label ?? "").trim()}`.replace(/\s+/g, " ").trim();
    }

    private mapOrder(order: any) {
        return {
            id: order.id, orderNumber: order.orderNumber, createdAt: order.createdAt,
            createdByUserId: order.createdByUserId, clientName: order.clientName,
            tableNumber: order.tableNumber, notes: order.notes, total: order.total,
            print: { status: order.printStatus, printedAt: order.printedAt, printerName: order.printerName, error: order.printError, lastPrintedByUserId: order.lastPrintedByUserId },
            void: { isVoided: order.isVoided, voidedAt: order.voidedAt, voidedByUserId: order.voidedByUserId, reason: order.voidReason },
            items: (order.items ?? []).map((i: any) => ({ id: i.id, variantId: i.variantId, name: i.itemNameSnapshot, unitPrice: i.unitPriceSnapshot, quantity: i.quantity, subtotal: i.subtotalSnapshot, notes: i.notes })),
        };
    }

    private async loadOrderOrThrow(id: string) {
        const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
        if (!order) throw new NotFoundException("Comanda no encontrada");
        return order;
    }

    async create(dto: CreateComandaDto, createdByUserId: string) {
        if (!dto.items?.length) throw new BadRequestException("La comanda requiere al menos 1 ítem.");

        const user = await this.prisma.user.findFirst({ where: { id: createdByUserId, isActive: true }, select: { id: true } });
        if (!user) throw new BadRequestException("Operario inválido.");

        const variants = await this.prisma.productVariant.findMany({
            where: { id: { in: dto.items.map((i) => i.productId) }, isActive: true },
            select: { id: true, label: true, priceCents: true, currency: true, flavor: { select: { nameSuffix: true, family: { select: { name: true } } } } },
        });
        const variantMap = new Map(variants.map((v) => [v.id, v]));

        const last = await this.prisma.order.findFirst({ orderBy: { orderNumber: "desc" }, select: { orderNumber: true } });
        const nextNumber = (last?.orderNumber ?? 0) + 1;

        const itemsCreate = dto.items.map((i) => {
            const v = variantMap.get(i.productId);
            if (!v) throw new BadRequestException(`Variante inválida o inactiva: ${i.productId}`);
            const qty = Math.max(1, i.quantity ?? 1);
            return { variantId: v.id, itemNameSnapshot: this.flattenVariantName(v), unitPriceSnapshot: v.priceCents, quantity: qty, subtotalSnapshot: v.priceCents * qty, notes: i.notes ?? null };
        });

        const total = itemsCreate.reduce((acc, it) => acc + it.subtotalSnapshot, 0);

        const order = await this.prisma.order.create({
            data: { orderNumber: nextNumber, createdByUserId, clientName: dto.clientName?.trim() || null, tableNumber: dto.tableNumber?.trim() || null, notes: dto.notes?.trim() || null, total, items: { create: itemsCreate } },
            include: { items: true },
        });

        // Evento
        await this.events.emit({
            type: "SUCCESS", category: "ORDER",
            message: `Comanda #${nextNumber} creada${dto.clientName ? ` — ${dto.clientName}` : ""}${dto.tableNumber ? ` (${dto.tableNumber})` : ""}`,
            metadata: { orderId: order.id, orderNumber: nextNumber, total: total / 100, itemCount: itemsCreate.length, clientName: dto.clientName, tableNumber: dto.tableNumber },
            userId: createdByUserId,
        });

        return this.mapOrder(order);
    }

    async getById(id: string) {
        return this.mapOrder(await this.loadOrderOrThrow(id));
    }

    async getTicketText(id: string) {
        const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true, createdByUser: { select: { displayName: true } } } });
        if (!order) throw new NotFoundException("Comanda no encontrada");

        const lines: string[] = [];
        lines.push(divider("="));
        lines.push(center("ENCAJA"));
        lines.push(divider("="));

        const retiro = (order.tableNumber ?? "").toUpperCase();
        const header = `#${order.orderNumber}${retiro ? " " + retiro : ""}`;
        lines.push(...row(header, fmtDate(new Date(order.createdAt))));
        lines.push(`Op: ${order.createdByUser.displayName}`.slice(0, W));
        if (order.clientName) lines.push(`Cli: ${order.clientName}`.slice(0, W));
        lines.push(divider("-"));

        for (const item of order.items) {
            lines.push(...formatItem(item.quantity, item.itemNameSnapshot, item.subtotalSnapshot, item.notes));
        }

        lines.push(divider("-"));
        lines.push(...row("TOTAL:", fmtMoney(order.total)));

        if (order.notes) {
            lines.push(divider("-"));
            const words = order.notes.split(" ");
            let current = "";
            for (const word of words) {
                if ((current + " " + word).trim().length <= W) { current = (current + " " + word).trim(); }
                else { if (current) lines.push(current); current = word.slice(0, W); }
            }
            if (current) lines.push(current);
        }

        lines.push(divider("="));

        return { orderId: order.id, orderNumber: order.orderNumber, text: lines.join("\n") };
    }

    async printAndMark(id: string, performedByUserId: string) {
        const orderExists = await this.prisma.order.findUnique({ where: { id }, select: { id: true, isVoided: true } });
        if (!orderExists) throw new NotFoundException("Comanda no encontrada");
        if (orderExists.isVoided) throw new BadRequestException("No se puede imprimir una comanda anulada.");

        const ticket = await this.getTicketText(id);
        const result = await this.printer.printText(ticket.text);

        await this.prisma.orderPrintLog.create({
            data: { orderId: id, success: result.success, printerName: result.printerName, errorMessage: result.error, performedByUserId },
        });
        await this.prisma.order.update({
            where: { id },
            data: { printStatus: result.success ? "OK" : "ERROR", printedAt: result.success ? new Date() : null, printerName: result.printerName, printError: result.success ? null : result.error, lastPrintedByUserId: performedByUserId },
        });

        // Evento
        await this.events.emit({
            type: result.success ? "SUCCESS" : "ERROR",
            category: "PRINT",
            message: result.success
                ? `Comanda #${ticket.orderNumber} impresa correctamente en ${result.printerName}`
                : `Error al imprimir comanda #${ticket.orderNumber}: ${result.error}`,
            metadata: { orderId: id, orderNumber: ticket.orderNumber, printerName: result.printerName, error: result.error },
            userId: performedByUserId,
        });

        return { success: result.success, printerName: result.printerName, error: result.error, orderNumber: ticket.orderNumber };
    }

    async markPrinted(id: string, input: MarkPrintedInput) {
        const orderExists = await this.prisma.order.findUnique({ where: { id }, select: { id: true, isVoided: true } });
        if (!orderExists) throw new NotFoundException("Comanda no encontrada");
        if (orderExists.isVoided) throw new BadRequestException("No se puede registrar impresión: comanda anulada.");

        await this.prisma.orderPrintLog.create({ data: { orderId: id, success: input.success, printerName: input.printerName, errorMessage: input.errorMessage, performedByUserId: input.performedByUserId } });
        return this.prisma.order.update({
            where: { id },
            data: { printStatus: input.success ? "OK" : "ERROR", printedAt: input.success ? new Date() : null, printerName: input.printerName, printError: input.success ? null : input.errorMessage, lastPrintedByUserId: input.performedByUserId },
        });
    }

    async voidOrder(id: string, input: VoidOrderInput) {
        const order = await this.prisma.order.findUnique({ where: { id }, select: { id: true, isVoided: true, orderNumber: true } });
        if (!order) throw new NotFoundException("Comanda no encontrada");
        if (order.isVoided) throw new BadRequestException("La comanda ya está anulada.");

        const updated = await this.prisma.order.update({
            where: { id },
            data: { isVoided: true, voidedAt: new Date(), voidReason: input.reason, voidedByUserId: input.voidedByUserId },
            include: { items: true },
        });

        // Evento
        await this.events.emit({
            type: "WARNING", category: "ORDER",
            message: `Comanda #${order.orderNumber} anulada — Motivo: ${input.reason}`,
            metadata: { orderId: id, orderNumber: order.orderNumber, reason: input.reason },
            userId: input.voidedByUserId,
        });

        return this.mapOrder(updated);
    }
}