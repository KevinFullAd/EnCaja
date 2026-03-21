// src/app.module.ts
import { Module } from "@nestjs/common";
import { PrismaModule }   from "./infra/prisma/prisma.module";
import { EventModule }    from "./modules/events/event.module";
import { SistemaModule }  from "./modules/sistema/sistema.module";
import { CatalogoModule } from "./modules/catalogo/catalogo.module";
import { ComandasModule } from "./modules/comandas/comandas.module";
import { UsuariosModule } from "./modules/usuarios/usuarios.module";
import { UploadsModule }  from "./modules/uploads/upload.module";
import { ReportesModule } from "./modules/reportes/reportes.module"; 
 

@Module({
    imports: [
        PrismaModule,
        EventModule,      // Global — disponible en todos los módulos
        SistemaModule,
        CatalogoModule,
        ComandasModule,
        UsuariosModule,
        UploadsModule,
        ReportesModule,
    ],
})
export class AppModule {}