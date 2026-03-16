// src/modules/catalogo/dto/update-producto.dto.ts

export class UpdateVariantDto {
    id?: string;           // si tiene id => update, si no => create
    slug?: string;
    label?: string;
    priceCents?: number;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
}

export class UpdateFlavorDto {
    id?: string;           // si tiene id => update, si no => create
    slug?: string;
    nameSuffix?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
    variants?: UpdateVariantDto[];
}

export class UpdateProductFamilyDto {
    categoryId?: string;
    slug?: string;
    name?: string;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
    flavors?: UpdateFlavorDto[];
}