import { Controller, Get, Post, Body } from "@nestjs/common";
import { CatalogoService } from "./catalogo.service";
import { CreateCategoryDto } from "./dto/create-categoria.dto";
import { CreateProductFamilyDto } from "./dto/create-producto.dto";

@Controller("api/catalogo")
export class CatalogoController {
    constructor(private readonly service: CatalogoService) { }

    // ===== CATEGORIAS =====

    @Get("categorias")
    categorias() {
        return this.service.categorias();
    }

    @Post("categorias")
    crearCategoria(@Body() dto: CreateCategoryDto) {
        return this.service.crearCategoria(dto);
    }

    // ===== PRODUCTOS (familias) =====

    @Post("familias")
    crearFamilia(@Body() dto: CreateProductFamilyDto) {
        return this.service.crearFamilia(dto);
    }

    @Get("familias")
    familias() {
        return this.service.familias();
    }
}