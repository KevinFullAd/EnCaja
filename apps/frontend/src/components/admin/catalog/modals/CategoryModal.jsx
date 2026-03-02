import { useState, useEffect } from "react";

export default function CategoryModal({
    open,
    onClose,
    onSave,
    initialData = null,
}) {
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setIsActive(initialData.isActive);
        } else {
            setName("");
            setIsActive(true);
        }
    }, [initialData]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="w-[480px] bg-white rounded-xl p-6 space-y-6">
                <h2 className="text-lg font-semibold">
                    {initialData ? "Editar categoría" : "Nueva categoría"}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm">Nombre</label>
                        <input
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        Activa
                    </label>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose}>Cancelar</button>
                    <button
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                        onClick={() => onSave({ name, isActive })}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}