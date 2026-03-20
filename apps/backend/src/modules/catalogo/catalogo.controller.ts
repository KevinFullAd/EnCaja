// src/modules/catalogo/catalogo.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseBoolPipe, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../sistema/auth/jwt-auth.guard";
import { CatalogoService } from "./catalogo.service";
import { CreateCategoryDto } from "./dto/create-categoria.dto";
import { CreateProductFamilyDto } from "./dto/create-producto.dto";
import { UpdateProductFamilyDto } from "./dto/update-producto.dto";
import { UpdateIsActiveDto } from "./dto/update-catalogo.dto";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto";

type ReqUser = { userId: string; role: string; displayName: string };

function uid(req: Request): string | undefined {
    return (req.user as ReqUser)?.userId;
}

@Controller("api/catalogo")
export class CatalogoController {
    constructor(private readonly service: CatalogoService) {}

    // ===== CATEGORIAS =====

    @Get("categorias")
    categorias(@Query("includeInactive") includeInactive?: string) {
        return this.service.categorias(includeInactive === "true");
    }

    @Post("categorias")
    @UseGuards(JwtAuthGuard)
    crearCategoria(@Body() dto: CreateCategoryDto, @Req() req: Request) {
        return this.service.crearCategoria(dto, uid(req));
    }

    @Patch("categorias/:id")
    @UseGuards(JwtAuthGuard)
    actualizarCategoria(@Param("id") id: string, @Body() dto: UpdateCategoriaDto, @Req() req: Request) {
        return this.service.actualizarCategoria(id, dto, uid(req));
    }

    @Patch("categorias/:id/rehabilitar")
    @UseGuards(JwtAuthGuard)
    rehabilitarCategoria(@Param("id") id: string, @Req() req: Request) {
        return this.service.rehabilitarCategoria(id, uid(req));
    }

    @Delete("categorias/:id")
    @UseGuards(JwtAuthGuard)
    eliminarCategoria(
        @Param("id") id: string,
        @Req() req: Request,
        @Query("hard", new ParseBoolPipe({ optional: true })) hard?: boolean,
    ) {
        return hard
            ? this.service.eliminarCategoriaHard(id, uid(req))
            : this.service.eliminarCategoria(id, uid(req));
    }

    // ===== FAMILIAS =====

    @Get("familias")
    familias(@Query("includeInactive") includeInactive?: string) {
        return this.service.familias(includeInactive === "true");
    }

    @Post("familias")
    @UseGuards(JwtAuthGuard)
    crearFamilia(@Body() dto: CreateProductFamilyDto, @Req() req: Request) {
        return this.service.crearFamilia(dto, uid(req));
    }

    @Patch("familias/:id")
    @UseGuards(JwtAuthGuard)
    actualizarFamilia(@Param("id") id: string, @Body() dto: UpdateProductFamilyDto, @Req() req: Request) {
        if (Object.keys(dto).length === 1 && dto.isActive !== undefined) {
            return this.service.actualizarFamiliaIsActive(id, { isActive: dto.isActive });
        }
        return this.service.actualizarFamilia(id, dto, uid(req));
    }

    @Patch("familias/:id/rehabilitar")
    @UseGuards(JwtAuthGuard)
    rehabilitarFamilia(@Param("id") id: string, @Req() req: Request) {
        return this.service.rehabilitarFamilia(id, uid(req));
    }

    @Delete("familias/:id")
    @UseGuards(JwtAuthGuard)
    eliminarFamilia(
        @Param("id") id: string,
        @Req() req: Request,
        @Query("hard", new ParseBoolPipe({ optional: true })) hard?: boolean,
    ) {
        return hard
            ? this.service.eliminarFamiliaHard(id, uid(req))
            : this.service.eliminarFamilia(id, uid(req));
    }

    // ===== FLAVORS =====

    @Patch("flavors/:id")
    @UseGuards(JwtAuthGuard)
    actualizarFlavor(@Param("id") id: string, @Body() dto: UpdateIsActiveDto, @Req() req: Request) {
        return this.service.actualizarFlavor(id, dto);
    }

    @Patch("flavors/:id/rehabilitar")
    @UseGuards(JwtAuthGuard)
    rehabilitarFlavor(@Param("id") id: string, @Req() req: Request) {
        return this.service.rehabilitarFlavor(id, uid(req));
    }

    @Delete("flavors/:id")
    @UseGuards(JwtAuthGuard)
    eliminarFlavor(
        @Param("id") id: string,
        @Req() req: Request,
        @Query("hard", new ParseBoolPipe({ optional: true })) hard?: boolean,
    ) {
        return hard
            ? this.service.eliminarFlavorHard(id, uid(req))
            : this.service.eliminarFlavor(id, uid(req));
    }

    // ===== VARIANTS =====

    @Patch("variants/:id")
    @UseGuards(JwtAuthGuard)
    actualizarVariant(@Param("id") id: string, @Body() dto: UpdateIsActiveDto, @Req() req: Request) {
        return this.service.actualizarVariant(id, dto);
    }

    @Patch("variants/:id/rehabilitar")
    @UseGuards(JwtAuthGuard)
    rehabilitarVariant(@Param("id") id: string, @Req() req: Request) {
        return this.service.rehabilitarVariant(id, uid(req));
    }

    @Delete("variants/:id")
    @UseGuards(JwtAuthGuard)
    eliminarVariant(
        @Param("id") id: string,
        @Req() req: Request,
        @Query("hard", new ParseBoolPipe({ optional: true })) hard?: boolean,
    ) {
        return hard
            ? this.service.eliminarVariantHard(id, uid(req))
            : this.service.eliminarVariant(id, uid(req));
    }
}