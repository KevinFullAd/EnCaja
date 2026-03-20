// src/components/admin/catalog/FlavorRow.jsx
import { useState } from "react";
import { ChevronDown, Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import VariantRow from "./VariantRow";

export default function FlavorRow({
    flavor,
    onEditFlavor,
    onCreateVariant,
    onEditVariant,
    onDeleteFlavor,
    onDeleteFlavorHard,
    onRestoreFlavor,
    onDeleteVariant,
    onDeleteVariantHard,
    onRestoreVariant,
    showInactive = false,
}) {
    const [open, setOpen] = useState(false);
    const isInactive = flavor.isActive === false;

    return (
        <>
            <tr className={`bg-(--app-bg)/80 transition-opacity ${isInactive ? "opacity-50" : ""}`}>
                <td className="px-20 py-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setOpen(!open)}>
                            <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="font-medium">{flavor.nameSuffix || "Default"}</div>
                                {isInactive && (
                                    <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                        deshabilitado
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">{flavor.description}</div>
                        </div>
                    </div>
                </td>

                <td className="text-sm px-4">{flavor.variants?.length ?? 0} variantes</td>

                <td className="text-right px-4 space-x-3">
                    {isInactive ? (
                        <>
                            <button
                                onClick={() => onRestoreFlavor(flavor)}
                                className="text-gray-400 hover:text-green-600 transition-colors"
                                title="Rehabilitar sabor y sus variantes"
                            >
                                <RotateCcw size={14} />
                            </button>
                            <button
                                onClick={() => onDeleteFlavorHard?.(flavor)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Eliminar definitivamente"
                            >
                                <Trash2 size={14} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => onDeleteFlavor(flavor)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Deshabilitar"
                            >
                                <Trash2 size={14} />
                            </button>
                            <button onClick={() => onEditFlavor(flavor)} className="text-gray-500 hover:text-black">
                                <Pencil size={16} />
                            </button>
                            <button onClick={() => onCreateVariant(flavor.id)} className="text-purple-600 hover:text-purple-800">
                                <Plus size={16} />
                            </button>
                        </>
                    )}
                </td>

                <td />
            </tr>

            {open &&
                flavor.variants?.map((variant) => (
                    <VariantRow
                        key={variant.id}
                        variant={variant}
                        onEditVariant={onEditVariant}
                        onDeleteVariant={onDeleteVariant}
                        onDeleteVariantHard={onDeleteVariantHard}
                        onRestoreVariant={onRestoreVariant}
                        showInactive={showInactive}
                    />
                ))}
        </>
    );
}