export function moneyFromCents(cents) {
    return (cents / 100).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}