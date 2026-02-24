import { create } from "zustand";

export const useOrderStore = create((set) => ({
    items: [
        { id: 1, name: "Raspberry Tart", price: 6.12, qty: 1, image: "/images/raspberry-tart.jpg" },
        { id: 7, name: "Lemon Tart", price: 2.86, qty: 1, image: "/images/lemon-tart.jpg" },
    ],

    add(product) {
        set((state) => {
            const existing = state.items.find((x) => x.id === product.id);
            if (existing) {
                return {
                    items: state.items.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x)),
                };
            }
            return { items: [...state.items, { ...product, qty: 1 }] };
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

    clear() {
        set({ items: [] });
    },
}));