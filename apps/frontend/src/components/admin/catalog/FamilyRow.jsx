// src/components/admin/catalog/FamilyRow.jsx
import { useState } from "react";
import { ChevronDown, Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import FlavorRow from "./FlavorRow";

export default function FamilyRow({
    family,
    onEditFamily,
    onCreateFlavor,
    onEditFlavor,
    onCreateVariant,
    onEditVariant,
    onDeleteFamily,
    onDeleteFamilyHard,
    onDeleteFlavor,
    onDeleteVariant,
    onRestoreFamily,
    onRestoreFlavor,
    onRestoreVariant,
    showInactive = false,
}) {
    const [open, setOpen] = useState(false);
    const isInactive = family.isActive === false;
    
    console.log("onDeleteFamilyHard:", onDeleteFamilyHard);
    return (
        <>
            <tr className={`bg-(--app-bg)/40 transition-opacity ${isInactive ? "opacity-50" : ""}`}>
                <td className="px-12 py-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setOpen(!open)}>
                            <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                        {family.imageUrl && (
                            <img src={family.imageUrl} className="w-8 h-8 rounded-md object-cover" />
                        )}
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{family.name}</span>
                            {isInactive && (
                                <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                    deshabilitado
                                </span>
                            )}
                        </div>
                    </div>
                </td>

                <td className="px-4 text-sm">{family.flavors?.length ?? 0} sabores</td>

                <td className="px-4 text-right space-x-3">
                    {isInactive ? (
                        <>
                            <button
                                onClick={() => onRestoreFamily(family)}
                                className="text-gray-400 hover:text-green-600 transition-colors"
                                title="Rehabilitar familia y todo su contenido"
                            >
                                <RotateCcw size={15} />
                            </button>
                            <button
                                onClick={() => onDeleteFamilyHard?.(family)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Eliminar definitivamente"
                            >
                                <Trash2 size={15} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => onDeleteFamily(family)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Deshabilitar"
                            >
                                <Trash2 size={15} />
                            </button>
                            <button onClick={() => onEditFamily(family)} className="text-gray-500 hover:text-black">
                                <Pencil size={16} />
                            </button>
                            <button onClick={() => onCreateFlavor(family.id)} className="text-purple-600 hover:text-purple-800">
                                <Plus size={16} />
                            </button>
                        </>
                    )}
                </td>

                <td />
            </tr>

            {open &&
                family.flavors?.map((flavor) => (
                    <FlavorRow
                        key={flavor.id}
                        flavor={flavor}
                        onEditFlavor={onEditFlavor}
                        onCreateVariant={onCreateVariant}
                        onEditVariant={onEditVariant}
                        onDeleteFlavor={onDeleteFlavor}
                        onRestoreFlavor={onRestoreFlavor}
                        onDeleteVariant={onDeleteVariant}
                        onRestoreVariant={onRestoreVariant}
                        showInactive={showInactive}
                    />
                ))}
        </>
    );
}