// src/pages/ItemsPage.jsx
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
            setProducts(groupFamiliesByFlavor(fams));
        })().catch(console.error);
    }, []);

    const filteredProducts = useMemo(() => {
        const q = normalizeText(searchQuery).trim();

        return (products ?? [])
            .filter((p) =>
                activeCategoryId === "all"
                    ? true
                    : p.categoryId === activeCategoryId
            )
            .filter((p) => {
                if (!q) return true;
                return normalizeText(p.name).includes(q);
            });
    }, [products, activeCategoryId, searchQuery]);

    return (
        <div className="flex flex-col h-screen p-6">
            {/* Header */}
            <div className="mb-1">
                <span className="text-sm font-medium text-purple-600">
                    Items
                </span>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-(--app-text)">
                    Menú
                </h1>
                <Searcher value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <CategoryTabs
                    categories={categories}
                    active={activeCategoryId}
                    onSelect={setActiveCategoryId}
                />
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto">
                <ProductGrid products={filteredProducts} />
            </div>
        </div>
    );
}