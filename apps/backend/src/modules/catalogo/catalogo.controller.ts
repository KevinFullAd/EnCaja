// src/modules/catalogo/catalogo.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { CatalogoService } from "./catalogo.service";
import { CreateCategoryDto } from "./dto/create-categoria.dto";
import { CreateProductFamilyDto } from "./dto/create-producto.dto";
import { UpdateIsActiveDto } from "./dto/update-catalogo.dto";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto";
import { UpdateProductFamilyDto } from "./dto/update-producto.dto";

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

    @Delete("categorias/:id")
    eliminarCategoria(@Param("id") id: string) {
        return this.service.eliminarCategoria(id);
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
        // Si solo viene isActive (rehabilitar), delegamos al método simple
        if (Object.keys(dto).length === 1 && dto.isActive !== undefined) {
            return this.service.actualizarFamiliaIsActive(id, { isActive: dto.isActive });
        }
        return this.service.actualizarFamilia(id, dto);
    }

    @Delete("familias/:id")
    eliminarFamilia(@Param("id") id: string) {
        return this.service.eliminarFamilia(id);
    }

    // ===== FLAVORS =====

    @Patch("flavors/:id")
    actualizarFlavor(@Param("id") id: string, @Body() dto: UpdateIsActiveDto) {
        return this.service.actualizarFlavor(id, dto);
    }

    @Delete("flavors/:id")
    eliminarFlavor(@Param("id") id: string) {
        return this.service.eliminarFlavor(id);
    }

    // ===== VARIANTS =====

    @Patch("variants/:id")
    actualizarVariant(@Param("id") id: string, @Body() dto: UpdateIsActiveDto) {
        return this.service.actualizarVariant(id, dto);
    }

    @Delete("variants/:id")
    eliminarVariant(@Param("id") id: string) {
        return this.service.eliminarVariant(id);
    }
}