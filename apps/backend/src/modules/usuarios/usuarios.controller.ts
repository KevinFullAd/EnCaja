// src/modules/usuarios/usuarios.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../sistema/auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../sistema/auth/roles.guard";
import { UsuariosService } from "./usuarios.service";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";

type ReqUser = { userId: string; role: string; displayName: string };

@Controller("api/usuarios")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class UsuariosController {
    constructor(private readonly service: UsuariosService) {}

    @Get()
    listar() {
        return this.service.listar();
    }

    @Post()
    crear(@Body() dto: CreateUsuarioDto, @Req() req: Request) {
        const user = req.user as ReqUser;
        return this.service.crear(dto, user.userId);
    }

    @Patch(":id")
    actualizar(@Param("id") id: string, @Body() dto: UpdateUsuarioDto, @Req() req: Request) {
        const user = req.user as ReqUser;
        return this.service.actualizar(id, dto, user.userId);
    }

    @Delete(":id")
    eliminar(@Param("id") id: string, @Req() req: Request) {
        const user = req.user as ReqUser;
        return this.service.eliminar(id, user.userId);
    }
}