import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../sistema/auth/jwt-auth.guard';
import { ComandasService } from './comandas.service';
import type { CreateComandaDto } from './dto/create-comanda.dto';
import type { VoidComandaDto } from './dto/void-comanda.dto';

type ReqUser = { userId: string; role: string; displayName: string };

@Controller('api/comandas')
@UseGuards(JwtAuthGuard)
export class ComandasController {
    constructor(private readonly service: ComandasService) { }

    @Post()
    create(@Body() dto: CreateComandaDto, @Req() req: Request) {
        const user = req.user as ReqUser;
        return this.service.create(dto, user.userId);
    }

    @Get(':id')
    getById(@Param('id') id: string) {
        return this.service.getById(id);
    }

    @Get(':id/ticket')
    ticket(@Param('id') id: string) {
        return this.service.getTicketText(id);
    }

    @Post(':id/print')
    @HttpCode(200)
    markPrinted(
        @Param('id') id: string,
        @Body()
        body: {
            success?: boolean;
            printerName?: string;
            errorMessage?: string | null;
        },
        @Req() req: Request,
    ) {
        const user = req.user as ReqUser;

        if (!body || typeof body.success !== 'boolean') {
            throw new BadRequestException(
                'Body inválido. Se requiere JSON: { "success": true|false, "printerName"?: string, "errorMessage"?: string|null }',
            );
        }

        return this.service.markPrinted(id, {
            success: body.success,
            printerName: body.printerName ?? null,
            errorMessage: body.errorMessage ?? null,
            performedByUserId: user.userId,
        });
    }

    @Post(':id/anular')
    @HttpCode(200)
    void(
        @Param('id') id: string,
        @Body() dto: VoidComandaDto,
        @Req() req: Request,
    ) {
        const user = req.user as ReqUser;

        if (user.role !== 'ADMIN') {
            throw new ForbiddenException('Solo ADMIN puede anular comandas.');
        }

        if (!dto?.reason || dto.reason.trim().length < 3) {
            throw new BadRequestException('Motivo requerido (mínimo 3 caracteres).');
        }

        return this.service.voidOrder(id, {
            reason: dto.reason.trim(),
            voidedByUserId: user.userId,
        });
    }
}
