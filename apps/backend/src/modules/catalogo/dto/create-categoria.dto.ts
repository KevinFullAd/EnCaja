// src/modules/catalogo/dto/categoria.dto.ts
export class CreateCategoryDto {
    slug: string;
    name: string;
    sortOrder?: number;
}