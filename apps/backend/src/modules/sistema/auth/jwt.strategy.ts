import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../infra/prisma/prisma.service';

type JwtPayload = {
    sub: string;
    role: string;
    displayName: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET ?? 'dev_secret',
        });
    }

    async validate(payload: JwtPayload) {
        // Validación mínima: el usuario existe y está activo
        const user = await this.prisma.user.findFirst({
            where: { id: payload.sub, isActive: true },
            select: { id: true, role: true, displayName: true },
        });

        if (!user) throw new UnauthorizedException('Token inválido');

        return {
            userId: user.id,
            role: user.role,
            displayName: user.displayName,
        };
    }
}
