// src/store/deleteStore.js
import { create } from "zustand";
import { api } from "../lib/api";

/*
  target: null | {
    type: "category" | "family" | "flavor" | "variant" | "usuario"
    data: object
    title: string
    description?: string
    onSuccess?: () => void
    onConfirm?: () => Promise<void>   // override total del confirm si se necesita
  }
*/

export const useDeleteStore = create((set, get) => ({
    target: null,
    loading: false,

    askDelete(target) {
        set({ target });
    },

    cancel() {
        if (get().loading) return;
        set({ target: null });
    },

    async confirm() {
        const { target } = get();
        if (!target) return;

        set({ loading: true });

        try {
            // Si el target trae su propio handler, lo usamos
            if (target.onConfirm) {
                await target.onConfirm();
            } else {
                const { type, data } = target;
                if (type === "category") await api.catalog.eliminarCategoria(data.id);
                if (type === "family")   await api.catalog.eliminarFamilia(data.id);
                if (type === "flavor")   await api.catalog.eliminarFlavor(data.id);
                if (type === "variant")  await api.catalog.eliminarVariant(data.id);
            }

            target.onSuccess?.();
            set({ target: null });
        } catch (e) {
            console.error("deleteStore error:", e);
            alert(String(e?.message ?? e));
        } finally {
            set({ loading: false });
        }
    },
}));