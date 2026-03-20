// src/modules/sistema/sistema.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { EventService } from "../events/event.service";
import * as crypto from "crypto";

@Injectable()
export class SistemaService {
    constructor(
        private readonly prisma:  PrismaService,
        private readonly jwt:     JwtService,
        private readonly events:  EventService,
    ) {}

    private hashPin(pin: string) {
        return crypto.createHash("sha256").update(pin).digest("hex");
    }

    async login(pin: string) {
        const pinHash = this.hashPin(pin);

        const user = await this.prisma.user.findFirst({
            where: { pinHash, isActive: true },
            select: { id: true, displayName: true, role: true, isActive: true },
        });

        if (!user) {
            // Loguear intento fallido sin userId
            await this.events.emit({
                type: "WARNING", category: "AUTH",
                message: "Intento de login con PIN inválido",
                metadata: { pinHash: pinHash.slice(0, 8) + "..." }, // solo prefijo por seguridad
            });
            throw new UnauthorizedException("PIN inválido");
        }

        const token = await this.jwt.signAsync({
            sub: user.id,
            role: user.role,
            displayName: user.displayName,
        });

        // Loguear login exitoso
        await this.events.emit({
            type: "INFO", category: "AUTH",
            message: `Login exitoso — ${user.displayName} (${user.role})`,
            metadata: { userId: user.id, role: user.role },
            userId: user.id,
        });

        return {
            token,
            user: { id: user.id, displayName: user.displayName, role: user.role },
        };
    }
}