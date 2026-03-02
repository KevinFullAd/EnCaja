// src/components/admin/catalog/CategoryRow.jsx
import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import FamilyRow from "./FamilyRow";

export default function CategoryRow({
    cat,
    isOpen,
    onToggle,

    onCreateFamily,
    onEditFamily,
    onCreateFlavor,
    onEditFlavor,
    onCreateVariant,
    onEditVariant,
}) {
    return (
        <>
            <tr className="border-b border-(--app-border) hover:bg-(--app-bg)">
                <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onToggle}>
                            <ChevronDown
                                className={`transition-transform ${isOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {cat.image && (
                            <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-10 h-10 rounded-lg object-cover"
                            />
                        )}

                        <div>
                            <div className="font-semibold">{cat.name}</div>
                            <div className="text-xs text-gray-500">
                                {cat.families.length} productos
                            </div>
                        </div>
                    </div>
                </td>

                <td className="px-4 py-4 text-sm">
                    {cat.families.length}
                </td>

                <td className="px-4 py-4 text-right">
                    <button
                        className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                        onClick={() => onCreateFamily(cat.id)}
                    >
                        <Plus size={16} />
                        Familia
                    </button>
                </td>

                <td />
            </tr>

            {/* EXPANSIÓN */}
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
                    />
                ))}
        </>
    );
}