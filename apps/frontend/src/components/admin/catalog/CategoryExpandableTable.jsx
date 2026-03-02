// src/components/admin/catalog/CategoryExpandableTable.jsx
import { useMemo, useState } from "react";
import CategoryRow from "./CategoryRow";

export default function CategoryExpandableTable({
    categories = [],
    families = [],

    // 🔥 nuevos callbacks
    onCreateFamily,
    onEditFamily,
    onCreateFlavor,
    onEditFlavor,
    onCreateVariant,
    onEditVariant,
}) {
    const [open, setOpen] = useState(() => new Set());

    const toggle = (id) => {
        setOpen((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // Agrupar familias por categoría
    const byCategory = useMemo(() => {
        const map = new Map();
        for (const f of families ?? []) {
            const key = f.categoryId ?? "uncategorized";
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(f);
        }
        return map;
    }, [families]);

    const rows = useMemo(() => {
        return (categories ?? []).map((c) => {
            const fams = byCategory.get(c.id) ?? [];

            const representativeImage =
                fams.find((f) => f.imageUrl)?.imageUrl ?? null;

            return {
                id: c.id,
                name: c.name,
                active: c.isActive !== false,
                families: fams,
                image: representativeImage,
            };
        });
    }, [categories, byCategory]);

    return (
        <div className="overflow-hidden rounded-xl border border-(--app-border) bg-(--app-surface)">
            <div className="w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="border-b border-(--app-border) text-left text-sm text-(--app-muted)">
                            <th className="px-4 py-3">Categoría</th>
                            <th className="px-4 py-3">Productos</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                            <th className="w-12 px-4 py-3"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((cat) => {
                            const isOpen = open.has(cat.id);

                            return (
                                <CategoryRow
                                    key={cat.id}
                                    cat={cat}
                                    isOpen={isOpen}
                                    onToggle={() => toggle(cat.id)}

                                    // 🔥 pasamos callbacks hacia abajo
                                    onCreateFamily={onCreateFamily}
                                    onEditFamily={onEditFamily}
                                    onCreateFlavor={onCreateFlavor}
                                    onEditFlavor={onEditFlavor}
                                    onCreateVariant={onCreateVariant}
                                    onEditVariant={onEditVariant}
                                />
                            );
                        })}

                        {rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-10 text-center text-sm text-(--app-muted)"
                                >
                                    No hay categorías para mostrar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}