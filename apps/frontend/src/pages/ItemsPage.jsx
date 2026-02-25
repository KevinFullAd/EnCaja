import { useEffect, useMemo, useState } from "react";
import CategoryTabs from "../components/items/CategoryTabs";
import ProductGrid from "../components/items/ProductGrid";
import { useUIStore } from "../store/uiStore";
import Searcher from "../components/items/Searcher";
import OrderPanel from "../components/layout/OrderPanel";
import { api } from "../lib/api";
import { expandFamiliesToProducts } from "../data/expandCatalog";

const normalizeText = (text) =>
    (text ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function ItemsPage() {
    const { activeCategoryId, searchQuery, setSearchQuery } = useUIStore();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        (async () => {
            const [cats, fams] = await Promise.all([
                api.catalog.categorias(),
                api.catalog.familias(),
            ]);
            setCategories(cats);
            setProducts(expandFamiliesToProducts(fams));
        })().catch(console.error);
    }, []);

    const filteredProducts = useMemo(() => {
        const q = normalizeText(searchQuery).trim();

        return (products ?? [])
            .filter((p) => p.active !== false)
            .filter((p) => (activeCategoryId === "all" ? true : p.categoryId === activeCategoryId))
            .filter((p) => {
                if (!q) return true;
                const hay = normalizeText(`${p.name} ${p.description ?? ""}`);
                return hay.includes(q);
            });
    }, [products, activeCategoryId, searchQuery]);

    return (
        <main className="p-6 flex bg-(--app-bg)">
            <div className="max-w-3/4">
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
                    <CategoryTabs categories={categories} />
                </div>

                <ProductGrid products={filteredProducts} />
            </div>

            <OrderPanel />


        </main>
    );
}