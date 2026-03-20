// src/store/orderStore.js
import { create } from "zustand";
import { api } from "../lib/api";
import { notify } from "./notifyStore";

export const useOrderStore = create((set, get) => ({
    items: [],
    submitting: false,
    submitError: null,
    lastOrder: null,

    // 🔥 NUEVO
    isConfirmOpen: false,
    lastResult: null,

    openConfirm() {
        set({ isConfirmOpen: true });
    },

    closeConfirm() {
        set({ isConfirmOpen: false });
    },

    clearResult() {
        set({ lastResult: null });
    },

    add(product) {
    set((state) => {
        const existing = state.items.find((x) => x.id === product.id);

        if (existing) {
            return {
                items: state.items.map((x) =>
                    x.id === product.id
                        ? { ...x, qty: x.qty + 1 }
                        : x
                ),
            };
        }

        return {
            items: [
                ...state.items,
                {
                    ...product, // 👈 CLAVE (NO perder datos)
                    qty: 1,
                    notes: product.notes ?? null,
                },
            ],
        };
    });
},

    inc(id) {
        set((state) => ({
            items: state.items.map((x) =>
                x.id === id ? { ...x, qty: x.qty + 1 } : x
            ),
        }));
    },

    dec(id) {
        set((state) => ({
            items: state.items
                .map((x) =>
                    x.id === id ? { ...x, qty: x.qty - 1 } : x
                )
                .filter((x) => x.qty > 0),
        }));
    },

    clear() {
        set({ items: [], submitError: null });
    },

    async submit(data) {
        const state = get();
        if (!state.items.length) return null;

        set({ submitting: true, submitError: null });

        try {
            const payload = {
                ...data,
                items: state.items.map((it) => ({
                    productId: it.id,
                    quantity: it.qty,
                    notes: it.notes ?? null,
                })),
            };

            const order = await api.orders.crearComanda(payload);

            notify.success(`Comanda #${order.orderNumber} creada`);

            let printResult = null;

            try {
                printResult = await api.orders.print(order.id);

                if (printResult?.success) {
                    notify.success(`Comanda #${order.orderNumber} impresa`);
                } else {
                    notify.error(`Error al imprimir`);
                }
            } catch (e) {
                notify.error("Error de impresora");
            }

            const result = { order, printResult };

            set({
                submitting: false,
                lastOrder: order,
                lastResult: result,
                isConfirmOpen: false,
                items: [],
            });

            return result;

        } catch (e) {
            notify.error("Error al crear comanda");

            set({
                submitting: false,
                submitError: e.message,
            });

            throw e;
        }
    },
}));