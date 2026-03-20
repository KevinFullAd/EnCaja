// src/modules/usuarios/usuarios.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { EventService } from "../events/event.service";
import * as crypto from "crypto";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";

@Injectable()
export class UsuariosService {
    constructor(
        private readonly prisma:  PrismaService,
        private readonly events:  EventService,
    ) {}

    private hashPin(pin: string) {
        return crypto.createHash("sha256").update(pin).digest("hex");
    }

    private async contarAdminsActivos(): Promise<number> {
        return this.prisma.user.count({ where: { role: "ADMIN", isActive: true } });
    }

    listar() {
        return this.prisma.user.findMany({
            where: { isActive: true },
            select: { id: true, displayName: true, role: true, isActive: true, createdAt: true },
            orderBy: { createdAt: "asc" },
        });
    }

    async crear(dto: CreateUsuarioDto, createdByUserId?: string) {
        const pinHash = this.hashPin(dto.pin);
        const existe = await this.prisma.user.findFirst({ where: { pinHash } });
        if (existe) throw new ConflictException("Ese PIN ya está en uso");

        const user = await this.prisma.user.create({
            data: { displayName: dto.displayName.trim(), pinHash, role: dto.role ?? "OPERARIO" },
            select: { id: true, displayName: true, role: true, createdAt: true },
        });

        await this.events.emit({
            type: "INFO", category: "USERS",
            message: `Usuario creado: ${user.displayName} (${user.role})`,
            metadata: { userId: user.id, role: user.role },
            userId: createdByUserId ?? null,
        });

        return user;
    }

    async actualizar(id: string, dto: UpdateUsuarioDto, updatedByUserId?: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user || !user.isActive) throw new NotFoundException("Usuario no encontrado");

        if (user.role === "ADMIN") {
            const totalAdmins = await this.contarAdminsActivos();
            if (totalAdmins === 1) {
                if (dto.role && dto.role !== "ADMIN") throw new BadRequestException("No podés cambiar el rol del único administrador activo del sistema.");
                if (dto.pin) throw new BadRequestException("No podés cambiar el PIN del único administrador activo del sistema.");
            }
        }

        const data: Record<string, any> = {};
        if (dto.displayName) data.displayName = dto.displayName.trim();
        if (dto.role)        data.role = dto.role;
        if (dto.isActive !== undefined) data.isActive = dto.isActive;

        if (dto.pin) {
            const pinHash = this.hashPin(dto.pin);
            const colision = await this.prisma.user.findFirst({ where: { pinHash, NOT: { id } } });
            if (colision) throw new ConflictException("Ese PIN ya está en uso");
            data.pinHash = pinHash;
        }

        const updated = await this.prisma.user.update({ where: { id }, data, select: { id: true, displayName: true, role: true, isActive: true } });

        // Armar descripción del cambio
        const changes: string[] = [];
        if (dto.displayName) changes.push(`nombre → "${dto.displayName.trim()}"`);
        if (dto.role)        changes.push(`rol → ${dto.role}`);
        if (dto.pin)         changes.push("PIN actualizado");

        await this.events.emit({
            type: "INFO", category: "USERS",
            message: `Usuario ${user.displayName} actualizado: ${changes.join(", ") || "sin cambios visibles"}`,
            metadata: { targetUserId: id, changes },
            userId: updatedByUserId ?? null,
        });

        return updated;
    }

    async eliminar(id: string, deletedByUserId?: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException("Usuario no encontrado");

        if (user.role === "ADMIN") {
            const totalAdmins = await this.contarAdminsActivos();
            if (totalAdmins === 1) throw new BadRequestException("No podés eliminar el único administrador activo del sistema.");
        }

        await this.prisma.user.update({ where: { id }, data: { isActive: false } });

        await this.events.emit({
            type: "WARNING", category: "USERS",
            message: `Usuario ${user.displayName} eliminado`,
            metadata: { targetUserId: id, role: user.role },
            userId: deletedByUserId ?? null,
        });
    }
}