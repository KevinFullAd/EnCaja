// src/components/admin/catalog/FamilyTable.jsx
import { useState } from "react";
import FamilyRow from "./FamilyRow";

export default function FamilyTable({ families = [] }) {
    const [openFamilies, setOpenFamilies] = useState(new Set());

    const toggleFamily = (id) => {
        setOpenFamilies((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    if (!families.length) {
        return (
            <div className="text-sm text-(--app-muted)">
                No hay productos en esta categoría.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {families.map((family) => (
                <FamilyRow
                    key={family.id}
                    family={family}
                    isOpen={openFamilies.has(family.id)}
                    onToggle={() => toggleFamily(family.id)}
                />
            ))}
        </div>
    );
}