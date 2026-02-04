export type CreateComandaDto = {
    notes?: string;
    items: Array<{
        productId: string;
        quantity: number;
        notes?: string;
    }>;
};
