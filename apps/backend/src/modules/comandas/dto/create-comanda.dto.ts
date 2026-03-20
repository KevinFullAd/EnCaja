// src/modules/comandas/dto/create-comanda.dto.ts
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateComandaItemDto {
    @IsString()
    productId: string; // variantId en el back

    @IsInt()
    @Min(1)
    quantity: number;

    @IsOptional()
    @IsString()
    notes?: string | null;
}

export class CreateComandaDto {
    @IsOptional()
    @IsString()
    clientName?: string | null;

    @IsOptional()
    @IsString()
    tableNumber?: string | null;

    @IsOptional()
    @IsString()
    notes?: string | null;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateComandaItemDto)
    items: CreateComandaItemDto[];
}