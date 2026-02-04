import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class SistemaService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) { }

    private hashPin(pin: string) {
        return crypto.createHash('sha256').update(pin).digest('hex');
    }

    async login(pin: string) {
        const pinHash = this.hashPin(pin);

        const user = await this.prisma.user.findFirst({
            where: { pinHash, isActive: true },
            select: { id: true, displayName: true, role: true, isActive: true },
        });

        if (!user) throw new UnauthorizedException('PIN inválido');

        const token = await this.jwt.signAsync({
            sub: user.id,
            role: user.role,
            displayName: user.displayName,
        });

        return {
            token,
            user: {
                id: user.id,
                displayName: user.displayName,
                role: user.role,
            },
        };
    }
}
