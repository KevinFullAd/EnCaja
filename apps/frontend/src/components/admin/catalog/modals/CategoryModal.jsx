// src/components/admin/catalog/modals/CategoryModal.jsx
import { useState, useEffect } from "react";
import { Tag } from "lucide-react";

export default function CategoryModal({ open, onClose, onSave, initialData = null }) {
    const isEdit = !!initialData?.id;
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            setName(initialData?.name ?? "");
            setIsActive(initialData?.isActive !== false);
            setError(null);
        }
    }, [open, initialData]);

    async function handleSave() {
        if (!name.trim()) return setError("El nombre es obligatorio");
        setSaving(true);
        try {
            await onSave({ name: name.trim(), isActive });
        } catch (e) {
            setError(e?.message ?? "Error al guardar");
        } finally {
            setSaving(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative z-10 bg-(--app-surface) border border-(--app-border) rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                        <Tag size={16} className="text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-(--app-text)">
                            {isEdit ? "Editar categoría" : "Nueva categoría"}
                        </h2>
                        <p className="text-xs text-(--app-muted)">
                            Las categorías agrupan familias de productos
                        </p>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-(--app-muted)">Nombre</label>
                    <input
                        autoFocus
                        className="w-full px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-bg) text-(--app-text) text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
                        placeholder="Ej: Hamburguesas, Bebidas..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    />
                </div>

                {/* Toggle activa — útil para rehabilitar desde el modal */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                        onClick={() => setIsActive((v) => !v)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${isActive ? "bg-purple-600" : "bg-(--app-border)"}`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-sm text-(--app-text)">Categoría activa</span>
                </label>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="flex-1 px-4 py-2 rounded-lg border border-(--app-border) text-sm font-medium text-(--app-muted) hover:bg-(--app-bg) transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                        {saving
                            ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            : isEdit ? "Guardar" : "Crear"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}