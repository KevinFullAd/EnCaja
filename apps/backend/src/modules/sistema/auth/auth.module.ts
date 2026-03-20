// src/modules/sistema/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";
import type { StringValue } from "ms";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.register({
            secret: process.env.JWT_SECRET ?? "encaja_pos_secret_2026",
            signOptions: {
                expiresIn: (process.env.JWT_EXPIRES_IN ?? "10h") as StringValue,
            },
        }),
    ],
    providers: [JwtStrategy],
    exports: [JwtModule, PassportModule],
})
export class AuthModule {}