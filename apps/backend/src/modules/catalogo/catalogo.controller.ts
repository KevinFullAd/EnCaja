import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CatalogoService } from './catalogo.service';
import { CreateProductoDto } from './dto/create-producto.dto';

@Controller('api/catalogo')
export class CatalogoController {
    constructor(private readonly service: CatalogoService) { }

    @Get('categorias')
    categorias() {
        return this.service.categorias();
    }

    @Get('productos')
    productos(@Query('categoriaId') categoriaId?: string) {
        return this.service.productos(categoriaId);
    }

    @Post('productos')
    crearProducto(@Body() dto: CreateProductoDto) {
        return this.service.crearProducto(dto);
    }
}
