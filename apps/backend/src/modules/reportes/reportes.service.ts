// src/modules/reportes/reportes.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";

function startOf(unit: "day" | "week" | "month", now = new Date()): Date {
    const d = new Date(now);
    if (unit === "day") {
        d.setHours(0, 0, 0, 0);
    } else if (unit === "week") {
        const day = d.getDay(); // 0=dom
        const diff = (day === 0 ? -6 : 1) - day; // lunes
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
    } else {
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
    }
    return d;
}

function formatMoney(cents: number) {
    return cents / 100;
}

@Injectable()
export class ReportesService {
    constructor(private readonly prisma: PrismaService) {}

    // ======================
    // DASHBOARD
    // ======================

    async getDashboard() {
        const now = new Date();
        const hoy   = startOf("day", now);
        const semana = startOf("week", now);
        const mes   = startOf("month", now);

        const [
            ventasHoy, ventasSemana, ventasMes,
            countHoy, countSemana, countMes,
            anuladas,
            ventasPorDia,
        ] = await Promise.all([
            // Totales
            this.prisma.order.aggregate({ where: { isVoided: false, createdAt: { gte: hoy } }, _sum: { total: true }, _count: true }),
            this.prisma.order.aggregate({ where: { isVoided: false, createdAt: { gte: semana } }, _sum: { total: true }, _count: true }),
            this.prisma.order.aggregate({ where: { isVoided: false, createdAt: { gte: mes } }, _sum: { total: true }, _count: true }),
            // Counts separados (para ticket promedio)
            this.prisma.order.count({ where: { isVoided: false, createdAt: { gte: hoy } } }),
            this.prisma.order.count({ where: { isVoided: false, createdAt: { gte: semana } } }),
            this.prisma.order.count({ where: { isVoided: false, createdAt: { gte: mes } } }),
            // Anuladas hoy
            this.prisma.order.count({ where: { isVoided: true, createdAt: { gte: hoy } } }),
            // Ventas por día — últimos 14 días para el gráfico
            this.prisma.$queryRaw<{ dia: string; total: number; count: number }[]>`
                SELECT
                    date(createdAt) as dia,
                    SUM(total)      as total,
                    COUNT(*)        as count
                FROM "Order"
                WHERE isVoided = 0
                AND createdAt >= datetime('now', '-14 days')
                GROUP BY date(createdAt)
                ORDER BY dia ASC
            `,
        ]);

        const totalHoy    = ventasHoy._sum.total ?? 0;
        const totalSemana = ventasSemana._sum.total ?? 0;
        const totalMes    = ventasMes._sum.total ?? 0;

        return {
            hoy: {
                total: formatMoney(totalHoy),
                comandas: countHoy,
                ticketPromedio: countHoy > 0 ? formatMoney(Math.round(totalHoy / countHoy)) : 0,
                anuladas,
            },
            semana: {
                total: formatMoney(totalSemana),
                comandas: countSemana,
                ticketPromedio: countSemana > 0 ? formatMoney(Math.round(totalSemana / countSemana)) : 0,
            },
            mes: {
                total: formatMoney(totalMes),
                comandas: countMes,
                ticketPromedio: countMes > 0 ? formatMoney(Math.round(totalMes / countMes)) : 0,
            },
            grafico: ventasPorDia.map((r) => ({
                dia: r.dia,
                total: formatMoney(Number(r.total)),
                comandas: Number(r.count),
            })),
        };
    }

    // ======================
    // PRODUCTOS TOP
    // ======================

    async getProductosTop(desde?: string, hasta?: string, limit = 10) {
        const where: any = {};
        if (desde || hasta) {
            where.order = { createdAt: {} };
            if (desde) where.order.createdAt.gte = new Date(desde);
            if (hasta) where.order.createdAt.lte = new Date(hasta);
        }
        where.order = { ...where.order, isVoided: false };

        const items = await this.prisma.orderItem.groupBy({
            by: ["itemNameSnapshot"],
            where,
            _sum: { quantity: true, subtotalSnapshot: true },
            _count: true,
            orderBy: { _sum: { quantity: "desc" } },
            take: limit,
        });

        return items.map((i, idx) => ({
            rank: idx + 1,
            nombre: i.itemNameSnapshot,
            cantidad: i._sum.quantity ?? 0,
            total: formatMoney(i._sum.subtotalSnapshot ?? 0),
        }));
    }

    // ======================
    // VENTAS POR OPERARIO
    // ======================

    async getPorOperario(desde?: string, hasta?: string) {
        const dateFilter: any = {};
        if (desde) dateFilter.gte = new Date(desde);
        if (hasta) dateFilter.lte = new Date(hasta);

        const orders = await this.prisma.order.groupBy({
            by: ["createdByUserId"],
            where: {
                isVoided: false,
                ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
            },
            _sum: { total: true },
            _count: true,
        });

        // Enriquecer con nombre del operario
        const userIds = orders.map((o) => o.createdByUserId);
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, displayName: true },
        });
        const userMap = new Map(users.map((u) => [u.id, u.displayName]));

        return orders
            .map((o) => ({
                operario: userMap.get(o.createdByUserId) ?? "Desconocido",
                comandas: o._count,
                total: formatMoney(o._sum.total ?? 0),
                ticketPromedio: o._count > 0
                    ? formatMoney(Math.round((o._sum.total ?? 0) / o._count))
                    : 0,
            }))
            .sort((a, b) => b.total - a.total);
    }

    // ======================
    // HISTORIAL DE COMANDAS
    // ======================

    async getComandas(params: {
        numero?: number;
        cliente?: string;
        desde?: string;
        hasta?: string;
        soloAnuladas?: boolean;
        page?: number;
        pageSize?: number;
    }) {
        const { numero, cliente, desde, hasta, soloAnuladas, page = 1, pageSize = 20 } = params;

        const where: any = {};
        if (numero)       where.orderNumber = numero;
        if (cliente)      where.clientName = { contains: cliente };
        if (soloAnuladas) where.isVoided = true;
        if (desde || hasta) {
            where.createdAt = {};
            if (desde) where.createdAt.gte = new Date(desde);
            if (hasta) where.createdAt.lte = new Date(hasta);
        }

        const [total, items] = await Promise.all([
            this.prisma.order.count({ where }),
            this.prisma.order.findMany({
                where,
                include: {
                    createdByUser: { select: { displayName: true } },
                    items: true,
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);

        return {
            total,
            page,
            pageSize,
            pages: Math.ceil(total / pageSize),
            items: items.map((o) => ({
                id: o.id,
                numero: o.orderNumber,
                fecha: o.createdAt,
                operario: o.createdByUser.displayName,
                cliente: o.clientName,
                retiro: o.tableNumber,
                notas: o.notes,
                total: formatMoney(o.total),
                isVoided: o.isVoided,
                voidReason: o.voidReason,
                printStatus: o.printStatus,
                printedAt: o.printedAt,
                printerName: o.printerName,
                printError: o.printError,
                itemCount: o.items.length,
                items: o.items.map((i) => ({
                    nombre: i.itemNameSnapshot,
                    cantidad: i.quantity,
                    subtotal: formatMoney(i.subtotalSnapshot),
                    notas: i.notes,
                })),
            })),
        };
    }

    // ======================
    // ESTADO DE IMPRESIÓN
    // ======================

    async getEstadoImpresion(limit = 50) {
        const [logs, errores, pendientes] = await Promise.all([
            this.prisma.orderPrintLog.findMany({
                take: limit,
                orderBy: { printedAt: "desc" },
                include: {
                    order: { select: { orderNumber: true, clientName: true } },
                    performedByUser: { select: { displayName: true } },
                },
            }),
            this.prisma.order.count({
                where: { printStatus: "ERROR", isVoided: false },
            }),
            this.prisma.order.count({
                where: { printStatus: "PENDING", isVoided: false },
            }),
        ]);

        return {
            resumen: { errores, pendientes },
            logs: logs.map((l) => ({
                id: l.id,
                orderId: l.orderId,
                orderNumber: l.order.orderNumber,
                cliente: l.order.clientName,
                success: l.success,
                printerName: l.printerName,
                errorMessage: l.errorMessage,
                printedAt: l.printedAt,
                operario: l.performedByUser.displayName,
            })),
        };
    }
}
