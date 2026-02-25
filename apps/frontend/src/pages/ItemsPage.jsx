import { useMemo } from "react";
import CategoryTabs from "../components/items/CategoryTabs";
import ProductGrid from "../components/items/ProductGrid";
import { PRODUCTS } from "../data/products";
import { useUIStore } from "../store/uiStore";
import Searcher from "../components/items/Searcher";

const normalizeText = (text) =>
    text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

export default function ItemsPage() {
    const { activeCategoryId, searchQuery, setSearchQuery } = useUIStore();

    const filteredProducts = useMemo(() => {
        const q = normalizeText((searchQuery ?? "").trim());

        return PRODUCTS
            .filter((p) => p.active !== false)
            .filter((p) => (activeCategoryId === "all" ? true : p.categoryId === activeCategoryId))
            .filter((p) => {
                if (!q) return true;
                const hay = normalizeText(p.name); // <-- SOLO name
                return hay.includes(q);
            });
    }, [activeCategoryId, searchQuery]);

    return (
        <main className="flex-1 overflow-y-scroll px-6 py-5 bg-(--app-bg)">
            <div className="mb-1">
                <span className="text-sm font-medium text-purple-600">Items</span>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-(--app-text)">Menú</h1>

                <div className="flex items-center gap-2">
                    <Searcher value={searchQuery} onChange={setSearchQuery} />
                </div>
            </div>

            <div className="mb-6">
                <CategoryTabs />
            </div>

            <ProductGrid products={filteredProducts} />
        </main>
    );
}