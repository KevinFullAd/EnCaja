// src/modules/events/event.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";

export type EventType     = "INFO" | "SUCCESS" | "WARNING" | "ERROR";
export type EventCategory = "ORDER" | "PRINT" | "AUTH" | "CATALOG" | "USERS" | "SYSTEM";

export interface EmitEventDto {
    type:      EventType;
    category:  EventCategory;
    message:   string;
    metadata?: Record<string, any> | null;
    userId?:   string | null;
}

@Injectable()
export class EventService {
    private readonly logger = new Logger(EventService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Emite un evento: lo persiste en BD y loguea en consola.
     * No lanza excepción si falla — los eventos nunca deben cortar el flujo principal.
     */
    async emit(dto: EmitEventDto): Promise<void> {
        try {
            await this.prisma.systemEvent.create({
                data: {
                    type:     dto.type,
                    category: dto.category,
                    message:  dto.message,
                    metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
                    userId:   dto.userId ?? null,
                },
            });

            const prefix = dto.type === "ERROR" ? "❌" : dto.type === "WARNING" ? "⚠️" : dto.type === "SUCCESS" ? "✅" : "ℹ️";
            this.logger.log(`${prefix} [${dto.category}] ${dto.message}`);
        } catch (err) {
            // Silencioso — no queremos que un fallo de logging corte una operación
            this.logger.error(`EventService.emit falló: ${err?.message}`);
        }
    }

    /**
     * Consulta de eventos para el panel de reportes.
     */
    async findAll(params: {
        type?:     EventType;
        category?: EventCategory;
        userId?:   string;
        desde?:    string;
        hasta?:    string;
        page?:     number;
        pageSize?: number;
    }) {
        const { type, category, userId, desde, hasta, page = 1, pageSize = 50 } = params;

        const where: any = {};
        if (type)     where.type = type;
        if (category) where.category = category;
        if (userId)   where.userId = userId;
        if (desde || hasta) {
            where.createdAt = {};
            if (desde) where.createdAt.gte = new Date(desde);
            if (hasta) where.createdAt.lte = new Date(hasta);
        }

        const [total, items] = await Promise.all([
            this.prisma.systemEvent.count({ where }),
            this.prisma.systemEvent.findMany({
                where,
                include: { user: { select: { displayName: true } } },
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
            items: items.map((e) => ({
                id:        e.id,
                type:      e.type,
                category:  e.category,
                message:   e.message,
                metadata:  e.metadata ? JSON.parse(e.metadata) : null,
                createdAt: e.createdAt,
                usuario:   e.user?.displayName ?? null,
            })),
        };
    }
}