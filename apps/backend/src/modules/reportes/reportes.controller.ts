// src/modules/reportes/reportes.controller.ts
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ReportesService } from "./reportes.service";
import { EventService } from "../events/event.service";
import { JwtAuthGuard } from "../sistema/auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../sistema/auth/roles.guard";

@Controller("api/reportes")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class ReportesController {
    constructor(
        private readonly service: ReportesService,
        private readonly events:  EventService,
    ) {}

    @Get("dashboard")
    dashboard() { return this.service.getDashboard(); }

    @Get("productos-top")
    productosTop(@Query("desde") desde?: string, @Query("hasta") hasta?: string, @Query("limit") limit?: string) {
        return this.service.getProductosTop(desde, hasta, limit ? Number(limit) : 10);
    }

    @Get("por-operario")
    porOperario(@Query("desde") desde?: string, @Query("hasta") hasta?: string) {
        return this.service.getPorOperario(desde, hasta);
    }

    @Get("comandas")
    comandas(
        @Query("numero")       numero?: string,
        @Query("cliente")      cliente?: string,
        @Query("desde")        desde?: string,
        @Query("hasta")        hasta?: string,
        @Query("soloAnuladas") soloAnuladas?: string,
        @Query("page")         page?: string,
        @Query("pageSize")     pageSize?: string,
    ) {
        return this.service.getComandas({
            numero:       numero ? Number(numero) : undefined,
            cliente, desde, hasta,
            soloAnuladas: soloAnuladas === "true",
            page:         page ? Number(page) : 1,
            pageSize:     pageSize ? Number(pageSize) : 20,
        });
    }

    @Get("impresion")
    impresion(@Query("limit") limit?: string) {
        return this.service.getEstadoImpresion(limit ? Number(limit) : 50);
    }

    @Get("eventos")
    eventos(
        @Query("type")     type?: string,
        @Query("category") category?: string,
        @Query("userId")   userId?: string,
        @Query("desde")    desde?: string,
        @Query("hasta")    hasta?: string,
        @Query("page")     page?: string,
        @Query("pageSize") pageSize?: string,
    ) {
        return this.events.findAll({
            type:     type as any,
            category: category as any,
            userId,
            desde,
            hasta,
            page:     page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 50,
        });
    }
}