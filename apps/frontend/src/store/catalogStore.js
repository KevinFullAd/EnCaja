import { create } from "zustand";

export const useCatalogStore = create((set) => ({
    // ========================
    // STATE
    // ========================
    isModalOpen: false,
    selectedFamily: null,
    mode: "create", // "create" | "edit"

    // ========================
    // ACTIONS
    // ========================
    openCreate: () =>
        set({
            isModalOpen: true,
            selectedFamily: null,
            mode: "create",
        }),

    openEdit: (family) =>
        set({
            isModalOpen: true,
            selectedFamily: family,
            mode: "edit",
        }),

    closeModal: () =>
        set({
            isModalOpen: false,
            selectedFamily: null,
            mode: "create",
        }),
}));