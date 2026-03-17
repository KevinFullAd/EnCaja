// src/components/items/ProductGrid.jsx
import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { useOrderStore } from "../../store/orderStore";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

function resolveUrl(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatMoney(priceCents, currency = "ARS") {
    return (priceCents / 100).toLocaleString("es-AR", {
        style: "currency",
        currency,
    });
}

export default function ProductGrid({ products }) {
    const [cols, setCols] = useState(3);
    const [openId, setOpenId] = useState(null);

    const add = useOrderStore((s) => s.add);
    const containerRef = useRef(null);

    const increaseCols = () => setCols((c) => Math.min(c + 1, 5));
    const decreaseCols = () => setCols((c) => Math.max(c - 1, 2));

    function handleAdd(product, variant) {
        add({
            id: variant.id,
            name: `${product.name} ${variant.label}`.trim(),
            priceCents: variant.priceCents,
            // Resolver URL al momento de agregar — queda absoluta en el store
            imageUrl: resolveUrl(variant.imageUrl ?? product.imageUrl),
        });
        setOpenId(null);
    }

    function handleOpen(e, product) {
        e.stopPropagation();
        if (product.variants.length === 1) {
            handleAdd(product, product.variants[0]);
            return;
        }
        setOpenId((prev) => (prev === product.id ? null : product.id));
    }

    useEffect(() => {
        function handleClickOutside(e) {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target)) {
                setOpenId(null);
            }
        }
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="flex flex-col gap-4">
            {/* GRID CONTROL */}
            <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-(--app-border) bg-(--app-bg-secondary) overflow-hidden">
                    <button
                        onClick={decreaseCols}
                        className="w-9 h-8 flex items-center justify-center text-(--app-text-muted) hover:bg-(--app-hover) hover:text-(--app-text) transition-colors"
                    >
                        −
                    </button>
                    <div className="px-3 text-xs font-semibold text-(--app-text)">
                        {cols}
                    </div>
                    <button
                        onClick={increaseCols}
                        className="w-9 h-8 flex items-center justify-center text-(--app-text-muted) hover:bg-(--app-hover) hover:text-(--app-text) transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* GRID */}
            <div
                className="grid gap-5"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
                {products.map((p) => (
                    <div key={p.id} className="relative group">
                        <ProductCard
                            product={p}
                            onOpen={(e) => handleOpen(e, p)}
                        />
                        {/* DROPDOWN */}
                        <div
                            className={`absolute left-0 right-0 top-full mt-2 z-50 
                            transition-all duration-150 origin-top 
                            ${openId === p.id
                                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                            }`}
                        >
                            <div className="rounded-xl border border-(--app-border) bg-white shadow-lg p-1.5">
                                {p.variants.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAdd(p, v);
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-(--app-text) transition-all duration-150 hover:bg-purple-200 active:scale-[0.98]"
                                    >
                                        <span className="font-medium">{v.label || "Normal"}</span>
                                        <span className="text-xs font-semibold text-(--app-text-muted)">
                                            {formatMoney(v.priceCents, v.currency)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}