// src/components/items/ProductCard.jsx
import { Plus } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

function formatMoney(priceCents, currency = "ARS") {
    return (priceCents / 100).toLocaleString("es-AR", {
        style: "currency",
        currency,
    });
}

function resolveUrl(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function ProductCard({ product, onOpen }) {
    const imageSrc = resolveUrl(product.imageUrl);

    const minPrice = product.variants?.reduce((min, v) => {
        if (typeof v.priceCents !== "number") return min;
        return min === null || v.priceCents < min ? v.priceCents : min;
    }, null);

    const currency = product.variants?.[0]?.currency ?? "ARS";

    return (
        <div className="flex flex-col gap-2 group">
            <button onClick={(e) => onOpen?.(e)} className="text-left">
                <div className="rounded-2xl overflow-hidden aspect-square bg-(--app-bg) relative transition-all duration-200 group-hover:shadow-md group-hover:scale-[1.02]">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-(--app-muted) text-xs">
                            Sin imagen
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
            </button>

            <div className="flex items-end justify-between px-0.5">
                <div>
                    <p className="text-sm font-medium text-(--app-text)">{product.name}</p>
                    <p className="text-sm font-bold text-(--app-text)">
                        {formatMoney(minPrice, currency)}
                    </p>
                </div>

                <button
                    onClick={(e) => onOpen?.(e)}
                    className="w-16 h-7 rounded-full border-2 border-purple-600 flex items-center justify-center transition-all duration-200 hover:bg-purple-600 hover:text-white hover:scale-105 active:scale-95"
                >
                    <Plus size={16} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}