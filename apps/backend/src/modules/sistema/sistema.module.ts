// src/modules/sistema/sistema.module.ts
import { Module } from '@nestjs/common';
import { SistemaController } from './sistema.controller';
import { SistemaService } from './sistema.service';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [SistemaController],
    providers: [SistemaService],
})
export class SistemaModule {}