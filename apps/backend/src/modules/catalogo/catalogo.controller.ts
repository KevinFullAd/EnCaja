// src/modules/catalogo/catalogo.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseBoolPipe } from "@nestjs/common";
import { CatalogoService } from "./catalogo.service";
import { CreateCategoryDto } from "./dto/create-categoria.dto";
import { CreateProductFamilyDto } from "./dto/create-producto.dto";
import { UpdateProductFamilyDto } from "./dto/update-producto.dto";
import { UpdateIsActiveDto } from "./dto/update-catalogo.dto";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto";

@Controller("api/catalogo")
export class CatalogoController {
    constructor(private readonly service: CatalogoService) { }

    // ===== CATEGORIAS =====

    @Get("categorias")
    categorias(@Query("includeInactive") includeInactive?: string) {
        return this.service.categorias(includeInactive === "true");
    }

    @Post("categorias")
    crearCategoria(@Body() dto: CreateCategoryDto) {
        return this.service.crearCategoria(dto);
    }

    @Patch("categorias/:id")
    actualizarCategoria(@Param("id") id: string, @Body() dto: UpdateCategoriaDto) {
        return this.service.actualizarCategoria(id, dto);
    }

    @Patch("categorias/:id/rehabilitar")
    rehabilitarCategoria(@Param("id") id: string) {
        return this.service.rehabilitarCategoria(id);
    }

    @Delete("categorias/:id")
    eliminarCategoria(
        @Param("id") id: string,
        @Query("hard", new ParseBoolPipe({ optional: true })) hard?: boolean,
    ) {
        return hard ? this.service.eliminarCategoriaHard(id) : this.service.eliminarCategoria(id);
    }

    // ===== FAMILIAS =====

    @Get("familias")
    familias(@Query("includeInactive") includeInactive?: string) {
        return this.service.familias(includeInactive === "true");
    }

    @Post("familias")
    crearFamilia(@Body() dto: CreateProductFamilyDto) {
        return this.service.crearFamilia(dto);
    }

    @Patch("familias/:id")
    actualizarFamilia(@Param("id") id: string, @Body() dto: UpdateProductFamilyDto) {
        if (Object.keys(dto).length === 1 && dto.isActive !== undefined) {
            return this.service.actualizarFamiliaIsActive(id, { isActive: dto.isActive });
        }
        return this.service.actualizarFamilia(id, dto);
    }

    @Patch("familias/:id/rehabilitar")
    rehabilitarFamilia(@Param("id") id: string) {
        return this.service.rehabilitarFamilia(id);
    }

    @Delete("familias/:id")
    eliminarFamilia(
        @Param("id") id: string,
        @Query("hard", new ParseBoolPipe({ optional: true })) hard?: boolean,
    ) {
        return hard ? this.service.eliminarFamiliaHard(id) : this.service.eliminarFamilia(id);
    }

    // ===== FLAVORS =====

    @Patch("flavors/:id")
    actualizarFlavor(@Param("id") id: string, @Body() dto: UpdateIsActiveDto) {
        return this.service.actualizarFlavor(id, dto);
    }

    @Patch("flavors/:id/rehabilitar")
    rehabilitarFlavor(@Param("id") id: string) {
        return this.service.rehabilitarFlavor(id);
    }

    @Delete("flavors/:id")
    eliminarFlavor(
        @Param("id") id: string,
        @Query("hard", new ParseBoolPipe({ optional: true })) hard?: boolean,
    ) {
        return hard ? this.service.eliminarFlavorHard(id) : this.service.eliminarFlavor(id);
    }

    // ===== VARIANTS =====

    @Patch("variants/:id")
    actualizarVariant(@Param("id") id: string, @Body() dto: UpdateIsActiveDto) {
        return this.service.actualizarVariant(id, dto);
    }

    @Patch("variants/:id/rehabilitar")
    rehabilitarVariant(@Param("id") id: string) {
        return this.service.rehabilitarVariant(id);
    }

    @Delete("variants/:id")
    eliminarVariant(
        @Param("id") id: string,
        @Query("hard", new ParseBoolPipe({ optional: true })) hard?: boolean,
    ) {
        return hard ? this.service.eliminarVariantHard(id) : this.service.eliminarVariant(id);
    }
}