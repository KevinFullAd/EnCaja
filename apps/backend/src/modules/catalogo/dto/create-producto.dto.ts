// src/modules/catalogo/dto/create-producto.dto.ts

export class CreateVariantDto {
    slug: string;          // simple | doble | triple
    label?: string;        // "Simple"
    priceCents: number;
    imageUrl?: string;
    sortOrder?: number;
}

export class CreateFlavorDto {
    slug: string;          // nachos | verdeo
    nameSuffix?: string;   // "con nachos"
    description?: string;
    sortOrder?: number;
    variants: CreateVariantDto[];
}

export class CreateProductFamilyDto {
    categoryId: string;
    slug: string;
    name: string;
    imageUrl?: string;
    sortOrder?: number;
    flavors: CreateFlavorDto[];
}