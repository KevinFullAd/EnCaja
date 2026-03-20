// src/modules/sistema/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../../infra/prisma/prisma.service";

type JwtPayload = {
    sub: string;
    role: string;
    displayName: string;
};

// Secret compartido — mismo valor en JwtModule y JwtStrategy
const JWT_SECRET = process.env.JWT_SECRET ?? "encaja_pos_secret_2026";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JWT_SECRET,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.prisma.user.findFirst({
            where: { id: payload.sub, isActive: true },
            select: { id: true, role: true, displayName: true },
        });

        if (!user) throw new UnauthorizedException("Token inválido");

        return {
            userId: user.id,
            role: user.role,
            displayName: user.displayName,
        };
    }
}