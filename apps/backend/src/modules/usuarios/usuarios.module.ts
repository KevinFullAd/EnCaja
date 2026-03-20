// src/modules/usuarios/usuarios.module.ts
import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { AuthModule } from '../sistema/auth/auth.module';
import { PrismaModule } from '../../infra/prisma/prisma.module';

@Module({
    imports: [AuthModule, PrismaModule],
    controllers: [UsuariosController],
    providers: [UsuariosService],
})
export class UsuariosModule {}