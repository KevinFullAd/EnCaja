// src/components/admin/catalog/CategoryRow.jsx
import { ChevronDown, Plus, Trash2, Pencil, RotateCcw } from "lucide-react";
import FamilyRow from "./FamilyRow";

export default function CategoryRow({
    cat,
    isOpen,
    onToggle,
    onCreateFamily,
    onEditCategory,
    onEditFamily,
    onCreateFlavor,
    onEditFlavor,
    onCreateVariant,
    onEditVariant,
    onDeleteCategory,
    onDeleteCategoryHard,
    onRestoreCategory,
    onDeleteFamily,
    onDeleteFamilyHard,
    onDeleteFlavor,
    onDeleteFlavorHard,
    onDeleteVariant,
    onDeleteVariantHard,
    onRestoreFamily,
    onRestoreFlavor,
    onRestoreVariant,
    showInactive = false,
}) {
    const isInactive = cat.active === false;

    return (
        <>
            <tr className={`border-b border-(--app-border) hover:bg-(--app-bg) transition-opacity ${isInactive ? "opacity-50" : ""}`}>
                <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onToggle}>
                            <ChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {cat.image && (
                            <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="font-semibold">{cat.name}</div>
                                {isInactive && (
                                    <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                        deshabilitada
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">{cat.families.length} productos</div>
                        </div>
                    </div>
                </td>

                <td className="px-4 py-4 text-sm">{cat.families.length}</td>

                <td className="px-4 py-4 text-right space-x-3">
                    {isInactive ? (
                        <>
                            <button
                                onClick={() => onRestoreCategory(cat)}
                                className="text-gray-400 hover:text-green-600 transition-colors"
                                title="Rehabilitar categoría y todo su contenido"
                            >
                                <RotateCcw size={15} />
                            </button>
                            <button
                                onClick={() => onDeleteCategoryHard?.(cat)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Eliminar definitivamente"
                            >
                                <Trash2 size={15} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => onDeleteCategory(cat)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Deshabilitar categoría"
                            >
                                <Trash2 size={15} />
                            </button>
                            <button
                                onClick={() => onEditCategory(cat)}
                                className="text-gray-500 hover:text-black transition-colors"
                                title="Editar categoría"
                            >
                                <Pencil size={15} />
                            </button>
                            <button
                                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                                onClick={() => onCreateFamily(cat.id)}
                            >
                                <Plus size={16} />
                                Familia
                            </button>
                        </>
                    )}
                </td>

                <td />
            </tr>

            {isOpen &&
                cat.families.map((family) => (
                    <FamilyRow
                        key={family.id}
                        family={family}
                        onEditFamily={onEditFamily}
                        onCreateFlavor={onCreateFlavor}
                        onEditFlavor={onEditFlavor}
                        onCreateVariant={onCreateVariant}
                        onEditVariant={onEditVariant}
                        onDeleteFamily={onDeleteFamily}
                        onDeleteFamilyHard={onDeleteFamilyHard}
                        onDeleteFlavor={onDeleteFlavor}
                        onDeleteFlavorHard={onDeleteFlavorHard}
                        onDeleteVariant={onDeleteVariant}
                        onDeleteVariantHard={onDeleteVariantHard}
                        onRestoreFamily={onRestoreFamily}
                        onRestoreFlavor={onRestoreFlavor}
                        onRestoreVariant={onRestoreVariant}
                        showInactive={showInactive}
                    />
                ))}
        </>
    );
}