// src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './infra/prisma/prisma.module';
import { CatalogoModule } from './modules/catalogo/catalogo.module';
import { ComandasModule } from './modules/comandas/comandas.module';
import { SistemaModule } from './modules/sistema/sistema.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { DevModule } from './modules/dev/dev.module';

const isDev = (process.env.NODE_ENV ?? 'development') === 'development';

@Module({
    imports: [
        PrismaModule,
        SistemaModule,
        CatalogoModule,
        ComandasModule,
        UsuariosModule,
        ...(isDev ? [DevModule] : []),
    ],
})
export class AppModule {}