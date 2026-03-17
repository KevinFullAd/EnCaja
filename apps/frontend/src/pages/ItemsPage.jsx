import { useEffect, useMemo, useState } from "react";
import CategoryTabs from "../components/items/CategoryTabs";
import ProductGrid from "../components/items/ProductGrid";
import Searcher from "../components/items/Searcher";
import { api } from "../lib/api";
import { groupFamiliesByFlavor } from "../data/expandCatalog";

const normalizeText = (text) =>
    (text ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

export default function ItemsPage() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    const [activeCategoryId, setActiveCategoryId] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        (async () => {
            const [cats, fams] = await Promise.all([
                api.catalog.categorias(),
                api.catalog.familias(),
            ]);

            setCategories(cats);
            setProducts(groupFamiliesByFlavor(fams)); // 🔥 cambio clave
        })().catch(console.error);
    }, []);

    const filteredProducts = useMemo(() => {
        const q = normalizeText(searchQuery).trim();

        return (products ?? [])
            .filter((p) => activeCategoryId === "all" ? true : p.categoryId === activeCategoryId)
            .filter((p) => {
                if (!q) return true;
                return normalizeText(`${p.name} ${p.description ?? ""}`).includes(q);
            });
    }, [products, activeCategoryId, searchQuery]);

    return (
        <main className="flex h-dvh bg-(--app-bg)">
            <div className="min-w-3/4 flex-1 p-6">
                <div className="mb-1">
                    <span className="text-sm font-medium text-purple-600">Items</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-(--app-text)">Menú</h1>
                    <Searcher value={searchQuery} onChange={setSearchQuery} />
                </div>

                <div className="mb-6">
                    <CategoryTabs
                        categories={categories}
                        active={activeCategoryId}
                        onSelect={setActiveCategoryId}
                    />
                </div>

                <ProductGrid products={filteredProducts} />
            </div>
        </main>
    );
}