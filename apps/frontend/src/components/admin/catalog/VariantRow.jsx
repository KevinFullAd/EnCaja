// src/components/admin/catalog/VariantRow.jsx
import { Pencil } from "lucide-react";

function moneyARS(value) {
    // Dividimos por 100 para que los últimos dos dígitos sean decimales
    const amount = Number(value ?? 0) / 100;

    return amount.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
export default function VariantRow({ variant, onEditVariant }) {
    return (
        <tr className="bg-white border-b border-t border-collapse border-(--app-border) hover:bg-(--app-bg)
        ">
            <td className="px-28 py-2 text-sm">
                {variant.label || variant.slug}
            </td>

            <td className="px-4 text-sm">
                {moneyARS(variant.priceCents)}
            </td>

            <td className="px-4 text-right">
                <button
                    onClick={() => onEditVariant(variant)}
                    className="text-gray-500 hover:text-black"
                >
                    <Pencil size={14} />
                </button>
            </td>

            <td />
        </tr>
    );
}