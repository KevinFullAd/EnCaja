// src/components/admin/catalog/VariantRow.jsx
import { Pencil, Trash2, RotateCcw } from "lucide-react";

function moneyARS(value) {
    const amount = Number(value ?? 0) / 100;
    return amount.toLocaleString("es-AR", {
        style: "currency", currency: "ARS",
        minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
}

export default function VariantRow({
    variant,
    onEditVariant,
    onDeleteVariant,
    onDeleteVariantHard,
    onRestoreVariant,
    showInactive = false,
}) {
    const isInactive = variant.isActive === false;

    return (
        <tr className={`bg-(--app-bg) border-b border-t border-collapse border-(--app-border) hover:bg-(--app-surface) transition-opacity ${isInactive ? "opacity-50" : ""}`}>
            <td className="px-28 py-2 text-sm">
                <div className="flex items-center gap-2">
                    <span>{variant.label || variant.slug}</span>
                    {isInactive && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            deshabilitado
                        </span>
                    )}
                </div>
            </td>

            <td className="px-4 text-sm">{moneyARS(variant.priceCents)}</td>

            <td className="px-4 text-right space-x-3">
                {isInactive ? (
                    <>
                        <button
                            onClick={() => onRestoreVariant(variant)}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Rehabilitar variante"
                        >
                            <RotateCcw size={13} />
                        </button>
                        <button
                            onClick={() => onDeleteVariantHard?.(variant)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar definitivamente"
                        >
                            <Trash2 size={13} />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => onDeleteVariant(variant)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Deshabilitar"
                    >
                        <Trash2 size={13} />
                    </button>
                )}
                <button onClick={() => onEditVariant(variant)} className="text-gray-500 hover:text-black">
                    <Pencil size={14} />
                </button>
            </td>

            <td />
        </tr>
    );
}