import { useState, useEffect } from "react";

export default function FamilyModal({
    open,
    onClose,
    onSave,
    categories = [],
    initialData = null,
    flavors = [],
}) {
    const [categoryId, setCategoryId] = useState("");
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (initialData) {
            setCategoryId(initialData.categoryId);
            setName(initialData.name);
            setImageUrl(initialData.imageUrl || "");
            setIsActive(initialData.isActive);
        }
    }, [initialData]);

    if (!open) return null;

    const allowVariantsInline = flavors.length <= 1;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="w-[720px] bg-white rounded-xl p-6 space-y-6">
                <h2 className="text-lg font-semibold">
                    {initialData ? "Editar familia" : "Nueva familia"}
                </h2>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm">Categoría</label>
                        <select
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="">Seleccionar</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm">Nombre</label>
                        <input
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="text-sm">Imagen URL</label>
                        <input
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                    </div>
                </div>

                {allowVariantsInline && (
                    <div className="border-t pt-4">
                        <p className="text-sm text-gray-500">
                            Esta familia tiene un solo sabor. Podrás gestionar variantes aquí.
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button onClick={onClose}>Cancelar</button>
                    <button
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                        onClick={() =>
                            onSave({ categoryId, name, imageUrl, isActive })
                        }
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}