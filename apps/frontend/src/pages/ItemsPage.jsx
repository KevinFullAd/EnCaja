import { useMemo } from "react";
import CategoryTabs from "../components/items/CategoryTabs";
import ProductGrid from "../components/items/ProductGrid";
import { PRODUCTS } from "../data/products";
import { useUIStore } from "../store/uiStore";

export default function ItemsPage() {
    const { activeCategory, searchQuery, setActiveCategory, setSearchQuery } = useUIStore();

    const filteredProducts = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q));
    }, [searchQuery]);

    return (
        <main className="flex-1 overflow-y-auto px-6 py-5">
            <div className="mb-1">
                <span className="text-sm font-medium text-purple-600">Items</span>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Desserts</h1>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 w-56">
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="ml-0 flex-1 text-sm bg-transparent outline-none text-gray-900"
                            aria-label="Search products"
                        />
                    </div>
                    <button className="w-10 h-10 bg-white border border-gray-200 rounded-xl" aria-label="Filter" />
                </div>
            </div>

            <div className="mb-6">
                <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
            </div>

            <ProductGrid products={filteredProducts} />
        </main>
    );
}