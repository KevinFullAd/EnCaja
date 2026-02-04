import { Module } from '@nestjs/common';
import { PrismaModule } from './infra/prisma/prisma.module';
import { CatalogoModule } from './modules/catalogo/catalogo.module';
import { ComandasModule } from './modules/comandas/comandas.module';
import { SistemaModule } from './modules/sistema/sistema.module';

@Module({
    imports: [PrismaModule, SistemaModule, CatalogoModule, ComandasModule],
})
export class AppModule { }
