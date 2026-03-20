import { create } from "zustand";
import { api } from "../lib/api";
import { notify } from "./notifyStore";

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
            if (target.onConfirm) {
                await target.onConfirm();
            } else {
                const { type, data } = target;

                if (type === "category") await api.catalog.eliminarCategoria(data.id);
                if (type === "family")   await api.catalog.eliminarFamilia(data.id);
                if (type === "flavor")   await api.catalog.eliminarFlavor(data.id);
                if (type === "variant")  await api.catalog.eliminarVariant(data.id);
            }

            notify.success("Elemento eliminado correctamente");

            target.onSuccess?.();
            set({ target: null });

        } catch (e) {
            console.error("deleteStore error:", e);
            notify.error(e?.message ?? "Error al eliminar");
        } finally {
            set({ loading: false });
        }
    },
}));