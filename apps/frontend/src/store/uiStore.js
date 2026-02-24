import { create } from "zustand";

export const useUIStore = create((set) => ({
    activeCategory: "Cakes",
    searchQuery: "",

    setActiveCategory: (cat) => set({ activeCategory: cat }),
    setSearchQuery: (q) => set({ searchQuery: q }),
}));