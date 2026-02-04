import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SistemaController } from './sistema.controller';
import { SistemaService } from './sistema.service';
import { JwtStrategy } from './auth/jwt.strategy';
import type { StringValue } from 'ms';


@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET ?? 'dev_secret',
            signOptions: {
                expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as StringValue,
            },
        }),
    ],
    controllers: [SistemaController],
    providers: [SistemaService, JwtStrategy],
})
export class SistemaModule { }
