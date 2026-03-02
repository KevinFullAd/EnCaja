// src/components/admin/catalog/FlavorRow.jsx
import { useState } from "react";
import { ChevronDown, Plus, Pencil } from "lucide-react";
import VariantRow from "./VariantRow";

export default function FlavorRow({
    flavor,
    onEditFlavor,
    onCreateVariant,
    onEditVariant,
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <tr className="bg-gray-50 ">
                <td className="px-20 py-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setOpen(!open)}>
                            <ChevronDown
                                size={16}
                                className={`transition-transform ${open ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        <div>
                            <div className="font-medium">
                                {flavor.nameSuffix || "Default"}
                            </div>
                            <div className="text-xs text-gray-500">
                                {flavor.description}
                            </div>
                        </div>
                    </div>
                </td>

                <td className="text-sm px-4">
                    {flavor.variants?.length ?? 0} variantes
                </td>

                <td className="text-right px-4 space-x-3">
                    <button
                        onClick={() => onEditFlavor(flavor)}
                        className="text-gray-500 hover:text-black"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        onClick={() => onCreateVariant(flavor.id)}
                        className="text-purple-600 hover:text-purple-800"
                    >
                        <Plus size={16} />
                    </button>
                </td>

                <td />
            </tr>

            {open &&
                flavor.variants?.map((variant) => (
                    <VariantRow
                        key={variant.id}
                        variant={variant}
                        onEditVariant={onEditVariant}
                    />
                ))}
        </>
    );
}