// src/modules/usuarios/usuarios.controller.ts
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../sistema/auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../sistema/auth/roles.guard';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('api/usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsuariosController {
    constructor(private readonly service: UsuariosService) {}

    @Get()
    listar() {
        return this.service.listar();
    }

    @Post()
    crear(@Body() dto: CreateUsuarioDto) {
        return this.service.crear(dto);
    }

    @Patch(':id')
    actualizar(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
        return this.service.actualizar(id, dto);
    }

    @Delete(':id')
    eliminar(@Param('id') id: string) {
        return this.service.eliminar(id);
    }
}