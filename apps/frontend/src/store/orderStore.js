import { create } from "zustand";
import { api } from "../lib/api";

export const useOrderStore = create((set, get) => ({
    // items del carrito: id = variantId del backend
    items: [],

    // opcionales: estado de envío + última orden/ticket
    submitting: false,
    submitError: null,
    lastOrder: null,
    lastTicket: null,

    add(product) {
        // product esperado:
        // { id, name, priceCents, imageUrl, notes? }
        set((state) => {
            const existing = state.items.find((x) => x.id === product.id);
            if (existing) {
                return {
                    items: state.items.map((x) =>
                        x.id === product.id ? { ...x, qty: x.qty + 1 } : x
                    ),
                };
            }

            return {
                items: [
                    ...state.items,
                    {
                        id: product.id,
                        name: product.name,
                        priceCents: product.priceCents,
                        imageUrl: product.imageUrl,
                        qty: 1,
                        notes: product.notes ?? null,
                    },
                ],
            };
        });
    },

    inc(id) {
        set((state) => ({
            items: state.items.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)),
        }));
    },

    dec(id) {
        set((state) => ({
            items: state.items
                .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
                .filter((x) => x.qty > 0),
        }));
    },

    setItemNotes(id, notes) {
        set((state) => ({
            items: state.items.map((x) => (x.id === id ? { ...x, notes: notes || null } : x)),
        }));
    },

    clear() {
        set({ items: [], submitError: null, lastOrder: null, lastTicket: null });
    },

    // total en centavos (derivado)
    getTotalCents() {
        const { items } = get();
        return items.reduce((acc, it) => acc + (it.priceCents ?? 0) * (it.qty ?? 0), 0);
    },

    // === INTEGRACIÓN BACKEND ===
    // Crea comanda y devuelve la orden (response del backend).
    async submit({ notes } = {}) {
        const state = get();
        if (!state.items.length) return null;

        set({ submitting: true, submitError: null });

        try {
            const payload = {
                notes: notes ?? null,
                items: state.items.map((it) => ({
                    productId: it.id, // OJO: el backend lo está tratando como variantId
                    quantity: it.qty,
                    notes: it.notes ?? null,
                })),
            };

            const order = await api.orders.crearComanda(payload);

            set({
                submitting: false,
                lastOrder: order,
            });

            return order;
        } catch (e) {
            set({ submitting: false, submitError: e?.message ?? String(e) });
            throw e;
        }
    },

    // Trae ticket texto para la última orden (o la que pases)
    async fetchTicket(orderId) {
        const id = orderId ?? get().lastOrder?.id;
        if (!id) return null;

        const ticket = await api.orders.ticket(id);
        set({ lastTicket: ticket });
        return ticket;
    },

    async markPrinted(orderId, { success, printerName, errorMessage } = {}) {
        const id = orderId ?? get().lastOrder?.id;
        if (!id) return null;

        return api.orders.print(id, {
            success: !!success,
            printerName: printerName ?? null,
            errorMessage: errorMessage ?? null,
        });
    },

    async voidOrder(orderId, reason) {
        const id = orderId ?? get().lastOrder?.id;
        if (!id) return null;

        return api.orders.anular(id, { reason });
    },
}));