// src/modules/catalogo/dto/producto.dto.ts

export type ProductDto = {
    id: string;
    categoryId: string;

    name: string;
    description?: string;

    priceCents: number;     // ARS centavos
    currency: "ARS";

    imageUrl?: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;

    // opcional para el futuro
    kind?: "burger" | "side" | "drink" | "promo";
    burger?: {
        ingredients: Array<{
            ingredientId: string;
            qty: number;        // 1,2,3...
            unit?: "unit" | "g" | "ml";
        }>;
    };
};