import { Minus, Plus } from "lucide-react";

function formatMoneyFromCents(priceCents, currency = "ARS") {
    if (typeof priceCents !== "number") return "—";
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(priceCents / 100);
}

function formatMoneyFromFloat(price) {
    if (typeof price !== "number") return "—";
    return "£" + price.toFixed(2).replace(".", ",");
}

export default function OrderItemRow({ item, onInc, onDec }) {
    const priceLabel =
        typeof item.priceCents === "number"
            ? formatMoneyFromCents(item.priceCents, item.currency ?? "ARS")
            : formatMoneyFromFloat(item.price);

    return (
        <div className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-(--app-border)/30">
                <img
                    src={item.imageUrl ?? item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-(--app-text) truncate">{item.name}</p>
                <p className="text-sm font-bold text-(--app-text)">{priceLabel}</p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onDec(item.id)}
                    className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors"
                    aria-label="Decrease quantity"
                >
                    <Minus size={14} strokeWidth={2.5} className="text-purple-600" />
                </button>

                <span className="text-sm font-medium w-4 text-center text-(--app-text)">
                    {item.qty}
                </span>

                <button
                    type="button"
                    onClick={() => onInc(item.id)}
                    className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors"
                    aria-label="Increase quantity"
                >
                    <Plus size={14} strokeWidth={2.5} className="text-purple-600" />
                </button>
            </div>
        </div>
    );
}