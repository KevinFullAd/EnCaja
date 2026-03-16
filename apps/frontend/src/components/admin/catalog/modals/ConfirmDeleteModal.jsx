// src/components/admin/catalog/modals/ConfirmDeleteModal.jsx
import { Trash2, AlertTriangle } from "lucide-react";

export default function ConfirmDeleteModal({ open, title, description, onClose, onConfirm, loading = false }) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Panel */}
            <div
                className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Ícono */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
                    <AlertTriangle size={24} className="text-red-500" />
                </div>

                {/* Texto */}
                <div className="text-center space-y-1">
                    <h2 className="text-base font-semibold text-(--app-text, #111)">
                        {title ?? "¿Eliminar este elemento?"}
                    </h2>
                    {description && (
                        <p className="text-sm text-gray-500 leading-snug">
                            {description}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 pt-1">
                        Esta acción no se puede deshacer.
                    </p>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Trash2 size={14} />
                        )}
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}