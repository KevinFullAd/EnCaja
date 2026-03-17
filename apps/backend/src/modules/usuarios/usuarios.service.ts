// src/modules/usuarios/usuarios.service.ts
import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
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

    private async contarAdminsActivos(): Promise<number> {
        return this.prisma.user.count({
            where: { role: 'ADMIN', isActive: true },
        });
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

        // Protección: si es el único ADMIN activo, no se puede cambiar su rol ni su PIN
        if (user.role === 'ADMIN') {
            const totalAdmins = await this.contarAdminsActivos();

            if (totalAdmins === 1) {
                if (dto.role && dto.role !== 'ADMIN') {
                    throw new BadRequestException(
                        'No podés cambiar el rol del único administrador activo del sistema.'
                    );
                }
                if (dto.pin) {
                    throw new BadRequestException(
                        'No podés cambiar el PIN del único administrador activo del sistema.'
                    );
                }
            }
        }

        const data: Record<string, any> = {};
        if (dto.displayName) data.displayName = dto.displayName.trim();
        if (dto.role)        data.role = dto.role;
        if (dto.isActive !== undefined) data.isActive = dto.isActive;

        if (dto.pin) {
            const pinHash = this.hashPin(dto.pin);
            const colision = await this.prisma.user.findFirst({
                where: { pinHash, NOT: { id } },
            });
            if (colision) throw new ConflictException('Ese PIN ya está en uso');
            data.pinHash = pinHash;
        }

        return this.prisma.user.update({
            where: { id },
            data,
            select: { id: true, displayName: true, role: true, isActive: true },
        });
    }

    async eliminar(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        // Protección: no se puede eliminar el último ADMIN activo
        if (user.role === 'ADMIN') {
            const totalAdmins = await this.contarAdminsActivos();
            if (totalAdmins === 1) {
                throw new BadRequestException(
                    'No podés eliminar el único administrador activo del sistema.'
                );
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
}