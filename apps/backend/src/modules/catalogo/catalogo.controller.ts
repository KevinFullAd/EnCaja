import { Controller, Get, Query } from '@nestjs/common';
import { CatalogoService } from './catalogo.service';

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
}
