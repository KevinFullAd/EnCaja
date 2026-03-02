// src/components/admin/catalog/FamilyRow.jsx
import { useState } from "react";
import { ChevronDown, Plus, Pencil } from "lucide-react";
import FlavorRow from "./FlavorRow";

export default function FamilyRow({
    family,
    onEditFamily,
    onCreateFlavor,
    onEditFlavor,
    onCreateVariant,
    onEditVariant,
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <tr className="bg-(--app-bg)/40 ">
                <td className="px-12 py-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setOpen(!open)}>
                            <ChevronDown
                                size={18}
                                className={`transition-transform ${open ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {family.imageUrl && (
                            <img
                                src={family.imageUrl}
                                className="w-8 h-8 rounded-md object-cover"
                            />
                        )}

                        <span className="font-medium">{family.name}</span>
                    </div>
                </td>

                <td className="px-4 text-sm">
                    {family.flavors?.length ?? 0} sabores
                </td>

                <td className="px-4 text-right space-x-3">
                    <button
                        onClick={() => onEditFamily(family)}
                        className="text-gray-500 hover:text-black"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        onClick={() => onCreateFlavor(family.id)}
                        className="text-purple-600 hover:text-purple-800"
                    >
                        <Plus size={16} />
                    </button>
                </td>

                <td />
            </tr>

            {open &&
                family.flavors?.map((flavor) => (
                    <FlavorRow
                        key={flavor.id}
                        flavor={flavor}
                        family={family}
                        onEditFlavor={onEditFlavor}
                        onCreateVariant={onCreateVariant}
                        onEditVariant={onEditVariant}
                    />
                ))}
        </>
    );
}