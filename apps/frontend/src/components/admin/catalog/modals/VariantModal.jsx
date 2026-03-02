import { useState, useEffect } from "react";

export default function VariantModal({
    open,
    onClose,
    onSave,
    flavorId,
    initialData = null,
}) {
    const [label, setLabel] = useState("");
    const [price, setPrice] = useState(0);
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        if (initialData) {
            setLabel(initialData.label || "");
            setPrice(initialData.priceCents / 100);
            setImageUrl(initialData.imageUrl || "");
        }
    }, [initialData]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="w-[500px] bg-white rounded-xl p-6 space-y-6">
                <h2 className="text-lg font-semibold">
                    {initialData ? "Editar variante" : "Nueva variante"}
                </h2>

                <div className="space-y-4">
                    <input
                        placeholder="Label (Simple, Doble...)"
                        className="w-full border rounded-lg px-3 py-2"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                    />

                    <input
                        type="number"
                        className="w-full border rounded-lg px-3 py-2"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                    />

                    <input
                        placeholder="Imagen URL"
                        className="w-full border rounded-lg px-3 py-2"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose}>Cancelar</button>
                    <button
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                        onClick={() =>
                            onSave({
                                flavorId,
                                label,
                                priceCents: price * 100,
                                imageUrl,
                            })
                        }
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}