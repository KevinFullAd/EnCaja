export type ComandaDto = {
    id: string;
    orderNumber: number;
    createdAt: string;
    total: number;
    notes?: string | null;
    items: Array<{
        id: string;
        productNameSnapshot: string;
        unitPriceSnapshot: number;
        quantity: number;
        subtotalSnapshot: number;
        notes?: string | null;
    }>;
};
