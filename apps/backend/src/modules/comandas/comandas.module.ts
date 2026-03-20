// src/modules/comandas/comandas.module.ts
import { Module } from "@nestjs/common";
import { ComandasController } from "./comandas.controller";
import { ComandasService } from "./comandas.service";
import { PrinterModule } from "../printer/printer.module";
import { AuthModule } from "../sistema/auth/auth.module";

@Module({
    imports: [AuthModule, PrinterModule],
    controllers: [ComandasController],
    providers: [ComandasService],
})
export class ComandasModule {}