// src/modules/usuarios/usuarios.service.ts
import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import * as crypto from 'crypto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
    constructor(private readonly prisma: PrismaService) {}

    private hashPin(pin: string) {
        return crypto.createHash('sha256').update(pin).digest('hex');
    }

    listar() {
        return this.prisma.user.findMany({
            where: { isActive: true },
            select: {
                id: true,
                displayName: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async crear(dto: CreateUsuarioDto) {
        // Verificar que el PIN no esté en uso
        const pinHash = this.hashPin(dto.pin);
        const existe = await this.prisma.user.findFirst({ where: { pinHash } });
        if (existe) throw new ConflictException('Ese PIN ya está en uso');

        return this.prisma.user.create({
            data: {
                displayName: dto.displayName.trim(),
                pinHash,
                role: dto.role ?? 'OPERARIO',
            },
            select: {
                id: true,
                displayName: true,
                role: true,
                createdAt: true,
            },
        });
    }

    async actualizar(id: string, dto: UpdateUsuarioDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user || !user.isActive) throw new NotFoundException('Usuario no encontrado');

        const data: Record<string, any> = {};

        if (dto.displayName) data.displayName = dto.displayName.trim();
        if (dto.role) data.role = dto.role;
        if (dto.isActive !== undefined) data.isActive = dto.isActive;

        if (dto.pin) {
            const pinHash = this.hashPin(dto.pin);
            // Verificar que el nuevo PIN no lo use otro usuario
            const colision = await this.prisma.user.findFirst({
                where: { pinHash, NOT: { id } },
            });
            if (colision) throw new ConflictException('Ese PIN ya está en uso');
            data.pinHash = pinHash;
        }

        return this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                displayName: true,
                role: true,
                isActive: true,
            },
        });
    }

    async eliminar(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
}