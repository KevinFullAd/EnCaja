import { useMemo } from "react";
import CategoryTabs from "../components/items/CategoryTabs";
import ProductGrid from "../components/items/ProductGrid";
import { PRODUCTS } from "../data/products";
import { useUIStore } from "../store/uiStore";

export default function ItemsPage() {
    const {
        activeCategoryId,
        searchQuery,
        setSearchQuery,
        setActiveCategory,
    } = useUIStore();

    const filteredProducts = useMemo(() => {
        const q = (searchQuery ?? "").trim().toLowerCase();

        return PRODUCTS
            .filter((p) => p.active !== false)
            .filter((p) => (activeCategoryId === "all" ? true : p.categoryId === activeCategoryId))
            .filter((p) => {
                if (!q) return true;
                const hay = `${p.name} ${p.description ?? ""}`.toLowerCase();
                return hay.includes(q);
            });
    }, [activeCategoryId, searchQuery]);

    return (
        <main className="flex-1 overflow-y-scroll px-6 py-5 bg-(--app-bg)">
            <div className="mb-1">
                <span className="text-sm font-medium text-purple-600">Items</span>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-(--app-text)">Desserts</h1>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-(--app-surface) border border-(--app-border) rounded-xl px-3 py-2 w-56">
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="ml-0 flex-1 text-sm bg-transparent outline-none text-(--app-text) placeholder:text-(--app-muted)"
                            aria-label="Search products"
                            placeholder="Search"
                        />
                    </div>

                    <button
                        className="w-10 h-10 bg-(--app-surface) border border-(--app-border) rounded-xl"
                        aria-label="Filter"
                        type="button"
                    />
                </div>
            </div>

            <div className="mb-6">
                <CategoryTabs />
            </div>

            <ProductGrid products={filteredProducts} />
        </main>
    );
}