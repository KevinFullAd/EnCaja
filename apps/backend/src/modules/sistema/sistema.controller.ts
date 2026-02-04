import { Body, Controller, Post } from '@nestjs/common';
import { SistemaService } from './sistema.service';
import type { LoginDto } from './dto/login.dto';

@Controller('api/sistema')
export class SistemaController {
    constructor(private readonly service: SistemaService) { }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.service.login(dto.pin);
    }
}
