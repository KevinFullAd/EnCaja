import { useMemo } from "react";
import { useOrderStore } from "../../store/orderStore";
import OrderItemRow from "../order/OrderItemRow";

const SERVICE_CHARGE_RATE = 0.2;
// Si TAX es un monto fijo (centavos), dejalo como FIXED_TAX_CENTS.
// Si después pasa a porcentaje, lo cambiamos a rate.
const FIXED_TAX_CENTS = 0; // ej: 5000 => $50,00

function toCents(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return 0;
    return Math.round(value);
}

function itemUnitPriceCents(it) {
    if (typeof it?.priceCents === "number") return toCents(it.priceCents);
    if (typeof it?.basePrice === "number") return toCents(it.basePrice);
    if (typeof it?.price === "number") return Math.round(it.price * 100);
    return 0;
}

function formatMoney(cents, currency = "ARS") {
    const safe = typeof cents === "number" && !Number.isNaN(cents) ? cents : 0;
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(safe / 100);
}

export default function OrderPanel() {
    const items = useOrderStore((s) => s.items);
    const inc = useOrderStore((s) => s.inc);
    const dec = useOrderStore((s) => s.dec);

    const currency = items?.[0]?.currency ?? "ARS";

    const { subtotalCents, discountCents, serviceChargeCents, taxCents, totalCents } = useMemo(() => {
        const subtotal = (items ?? []).reduce((sum, it) => {
            const unit = itemUnitPriceCents(it);
            const qty = typeof it?.qty === "number" && it.qty > 0 ? it.qty : 0;
            return sum + unit * qty;
        }, 0);

        const discount = 0;

        const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE);
        const tax = toCents(FIXED_TAX_CENTS);

        const total = Math.max(0, subtotal - discount + serviceCharge + tax);

        return {
            subtotalCents: subtotal,
            discountCents: discount,
            serviceChargeCents: serviceCharge,
            taxCents: tax,
            totalCents: total,
        };
    }, [items]);

    return (
        <aside className="w-80 shrink-0 bg-(--app-surface) border-l border-(--app-border) flex flex-col h-full">
            <div className="px-5 pt-5 pb-3">
                <h2 className="text-lg font-bold text-(--app-text)">Current Order</h2>

                <div className="flex items-center gap-2 mt-3">
                    <div className="w-7 h-7 rounded-full bg-(--app-border) flex items-center justify-center">
                        <span className="text-xs font-medium text-(--app-muted)">EW</span>
                    </div>
                    <span className="text-sm font-medium text-(--app-text)">Emma Wang</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
                {items.length === 0 ? (
                    <p className="text-sm text-(--app-muted) py-8 text-center">No items yet</p>
                ) : (
                    <div className="divide-y divide-(--app-border)">
                        {items.map((it) => (
                            <OrderItemRow key={it.id} item={it} onInc={inc} onDec={dec} />
                        ))}
                    </div>
                )}
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-(--app-border)">
                <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between text-(--app-muted)">
                        <span>Subtotal</span>
                        <span className="text-(--app-text)">{formatMoney(subtotalCents, currency)}</span>
                    </div>

                    <div className="flex justify-between text-(--app-muted)">
                        <span>Discount</span>
                        <span className="text-(--app-text)">{formatMoney(discountCents, currency)}</span>
                    </div>

                    <div className="flex justify-between text-(--app-muted)">
                        <span>Service Charge</span>
                        <span className="text-(--app-text)">
                            {SERVICE_CHARGE_RATE > 0 ? `${Math.round(SERVICE_CHARGE_RATE * 100)}%` : "—"}
                        </span>
                    </div>

                    <div className="flex justify-between text-(--app-muted)">
                        <span>Tax</span>
                        <span className="text-(--app-text)">{formatMoney(taxCents, currency)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-(--app-border)">
                    <span className="text-base font-bold text-(--app-text)">Total</span>
                    <span className="text-xl font-bold text-(--app-text)">{formatMoney(totalCents, currency)}</span>
                </div>

                <button className="w-full mt-4 py-3 bg-(--app-text) text-(--app-surface) font-semibold rounded-xl hover:opacity-90 transition">
                    Continue
                </button>
            </div>
        </aside>
    );
}