// src/modules/reportes/reportes.module.ts
import { Module } from "@nestjs/common";
import { ReportesController } from "./reportes.controller";
import { ReportesService } from "./reportes.service";
import { AuthModule } from "../sistema/auth/auth.module";

@Module({
    imports: [AuthModule],
    controllers: [ReportesController],
    providers: [ReportesService],
})
export class ReportesModule {}
