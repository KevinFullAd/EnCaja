import { create } from "zustand";

export const useUIStore = create((set) => ({
    activeCategoryId: "all",
    searchQuery: "",
    
    setActiveCategory: (id) => set({ activeCategoryId: id }),
    setSearchQuery: (q) => set({ searchQuery: q }),
}));