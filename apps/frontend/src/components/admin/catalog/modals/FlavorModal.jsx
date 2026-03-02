import { useState, useEffect } from "react";

export default function FlavorModal({
    open,
    onClose,
    onSave,
    familyId,
    initialData = null,
}) {
    const [nameSuffix, setNameSuffix] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (initialData) {
            setNameSuffix(initialData.nameSuffix || "");
            setDescription(initialData.description || "");
        }
    }, [initialData]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="w-[600px] bg-white rounded-xl p-6 space-y-6">
                <h2 className="text-lg font-semibold">
                    {initialData ? "Editar sabor" : "Nuevo sabor"}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm">Nombre del sabor</label>
                        <input
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                            value={nameSuffix}
                            onChange={(e) => setNameSuffix(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm">Descripción</label>
                        <textarea
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose}>Cancelar</button>
                    <button
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                        onClick={() =>
                            onSave({ familyId, nameSuffix, description })
                        }
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}