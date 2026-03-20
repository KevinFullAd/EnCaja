// src/components/ui/ImageInput.jsx
import { useRef, useState } from "react";
import { Upload, Link, X, Loader } from "lucide-react";
import { api } from "../../lib/api";

/**
 * Componente reutilizable para ingresar una imagen.
 * Permite pegar una URL o subir un archivo desde la PC.
 *
 * Props:
 *   value     — URL actual (string)
 *   onChange  — (url: string | null) => void
 *   className — clases extra para el contenedor
 */
export default function ImageInput({ value, onChange, className = "" }) {
    const [tab, setTab] = useState("url"); // "url" | "upload"
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const inputRef = useRef(null);

    const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

    // URL absoluta para mostrar preview — si es relativa, le agrega el base
    const previewSrc = value
        ? value.startsWith("http") ? value : `${API_BASE}${value}`
        : null;

    async function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadError(null);

        try {
            const { url } = await api.uploads.imagen(file);
            onChange(url);
            setTab("url"); // volver al tab URL para mostrar el resultado
        } catch (err) {
            setUploadError(err?.message ?? "Error al subir la imagen");
        } finally {
            setUploading(false);
            // Limpiar el input para permitir subir el mismo archivo de nuevo
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Tabs */}
            <div className="flex gap-1 p-0.5 rounded-lg bg-(--app-bg) border border-(--app-border) w-fit">
                <button
                    type="button"
                    onClick={() => setTab("url")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        tab === "url"
                            ? "bg-(--app-surface) text-(--app-text) shadow-sm"
                            : "text-(--app-muted) hover:text-(--app-text)"
                    }`}
                >
                    <Link size={11} />
                    URL
                </button>
                <button
                    type="button"
                    onClick={() => setTab("upload")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        tab === "upload"
                            ? "bg-(--app-surface) text-(--app-text) shadow-sm"
                            : "text-(--app-muted) hover:text-(--app-text)"
                    }`}
                >
                    <Upload size={11} />
                    Subir
                </button>
            </div>

            {/* Contenido del tab activo */}
            {tab === "url" && (
                <div className="flex gap-2 items-center">
                    <input
                        type="url"
                        className="flex-1 px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-bg) text-(--app-text) text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all placeholder:text-(--app-muted)"
                        placeholder="https://..."
                        value={value ?? ""}
                        onChange={(e) => onChange(e.target.value || null)}
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            className="text-(--app-muted) hover:text-red-500 transition-colors flex-shrink-0"
                            title="Limpiar imagen"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            )}

            {tab === "upload" && (
                <div>
                    <label
                        className={`flex flex-col items-center justify-center gap-2 h-20 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                            uploading
                                ? "border-(--app-border) bg-(--app-bg) cursor-wait"
                                : "border-(--app-border) hover:border-purple-400 hover:bg-purple-50/50"
                        }`}
                    >
                        {uploading ? (
                            <Loader size={20} className="text-purple-500 animate-spin" />
                        ) : (
                            <>
                                <Upload size={18} className="text-(--app-muted)" />
                                <span className="text-xs text-(--app-muted)">
                                    JPG, PNG, WEBP — máx. 5 MB
                                </span>
                            </>
                        )}
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            disabled={uploading}
                            onChange={handleFile}
                        />
                    </label>

                    {uploadError && (
                        <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                    )}
                </div>
            )}

            {/* Preview — siempre visible si hay imagen */}
            {previewSrc && (
                <div className="flex items-center gap-2">
                    <img
                        src={previewSrc}
                        alt="Preview"
                        className="w-14 h-14 rounded-lg object-cover border border-(--app-border)"
                        onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div className="text-xs text-(--app-muted) truncate flex-1">
                        {value}
                    </div>
                </div>
            )}
        </div>
    );
}