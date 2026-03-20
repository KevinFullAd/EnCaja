export function moneyFromCents(cents) {
    return (cents / 100).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
 

export function toCents(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return 0;
    return Math.round(value);
}

export function itemUnitPriceCents(it) {
    if (typeof it?.priceCents === "number") return toCents(it.priceCents);
    return 0;
}

export function formatMoney(cents, currency = "ARS") {
    const safe = typeof cents === "number" && !Number.isNaN(cents) ? cents : 0;
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(safe / 100);
}
