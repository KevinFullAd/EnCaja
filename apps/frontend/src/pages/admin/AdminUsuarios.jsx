// src/pages/admin/AdminUsuarios.jsx
import { useState, useEffect } from "react";
import { Pencil, Trash2, ShieldCheck, User, ShieldAlert, RotateCcw, EyeOff, X } from "lucide-react";
import { api } from "../../lib/api";
import { useDeleteStore } from "../../store/deleteStore";
import ConfirmDeleteModal from "../../components/admin/catalog/modals/ConfirmDeleteModal";

const ROLE_LABEL = { ADMIN: "Admin", OPERARIO: "Operario" };
const ROLE_STYLE = {
    ADMIN: "bg-purple-100 text-purple-700",
    OPERARIO: "bg-gray-100 text-gray-600",
};

// ─── Modal crear / editar ──────────────────────────────────────────────────
function UsuarioModal({ open, initialData, onClose, onSave }) {
    const isEdit = !!initialData?.id;
    const [form, setForm] = useState({ displayName: "", pin: "", role: "OPERARIO" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            setForm({ displayName: initialData?.displayName ?? "", pin: "", role: initialData?.role ?? "OPERARIO" });
            setError(null);
        }
    }, [open, initialData]);

    const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

    async function handleSubmit() {
        if (!form.displayName.trim()) return setError("El nombre es obligatorio");
        if (!isEdit && !form.pin.trim()) return setError("El PIN es obligatorio");
        if (form.pin && form.pin.length < 4) return setError("El PIN debe tener al menos 4 caracteres");
        setSaving(true);
        setError(null);
        try {
            const payload = { displayName: form.displayName.trim(), role: form.role };
            if (form.pin) payload.pin = form.pin;
            await onSave(payload);
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
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-base font-semibold text-gray-800">
                    {isEdit ? "Editar usuario" : "Nuevo usuario"}
                </h2>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Nombre</label>
                    <input
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        value={form.displayName}
                        onChange={(e) => set("displayName", e.target.value)}
                        placeholder="Ej: María"
                        autoFocus
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">
                        {isEdit ? "Nuevo PIN (dejá vacío para no cambiar)" : "PIN"}
                    </label>
                    <input
                        type="password"
                        inputMode="numeric"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        value={form.pin}
                        onChange={(e) => set("pin", e.target.value)}
                        placeholder="••••"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Rol</label>
                    <div className="flex gap-2">
                        {["OPERARIO", "ADMIN"].map((r) => (
                            <button key={r} onClick={() => set("role", r)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                    form.role === r
                                        ? "bg-purple-600 text-white border-purple-600"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}>
                                {ROLE_LABEL[r]}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                        <ShieldAlert size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 leading-snug">{error}</p>
                    </div>
                )}

                <div className="flex gap-3 pt-1">
                    <button onClick={onClose} disabled={saving}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
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

// ─── Página principal ──────────────────────────────────────────────────────
export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editor, setEditor] = useState(null);
    const [showInactive, setShowInactive] = useState(false);
    const [restoreError, setRestoreError] = useState(null);

    const { askDelete, target, loading: deleteLoading, confirm, cancel } = useDeleteStore();

    async function refresh() {
        setLoading(true);
        try {
            const qs = showInactive ? "?includeInactive=true" : "";
            const data = await fetch(
                `${import.meta.env.VITE_API_BASE ?? "http://localhost:3000"}/api/usuarios${qs}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("encaja_token")}` } }
            ).then((r) => r.json());
            setUsuarios(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { refresh(); }, [showInactive]);

    async function handleSave(payload) {
        if (editor?.data?.id) {
            await api.usuarios.actualizar(editor.data.id, payload);
        } else {
            await api.usuarios.crear(payload);
        }
        setEditor(null);
        await refresh();
    }

    async function handleRestore(u) {
        setRestoreError(null);
        try {
            await api.usuarios.rehabilitar(u.id);
            await refresh();
        } catch (e) {
            setRestoreError(e?.message ?? "Error al rehabilitar");
        }
    }

    function handleAskDelete(u) {
        askDelete({
            type: "usuario",
            data: u,
            title: `Deshabilitar a "${u.displayName}"`,
            description: "El usuario perderá acceso al sistema inmediatamente.",
            onConfirm: () => api.usuarios.eliminar(u.id),
            onSuccess: refresh,
        });
    }

    function handleAskDeleteHard(u) {
        askDelete({
            type: "usuario",
            data: u,
            title: `Eliminar definitivamente a "${u.displayName}"`,
            description: "Se eliminará permanentemente del sistema. Esta acción no se puede deshacer.",
            onConfirm: () => api.usuarios.eliminarHard(u.id),
            onSuccess: refresh,
        });
    }

    const adminCount = usuarios.filter((u) => u.role === "ADMIN" && u.isActive).length;
    const inactiveCount = usuarios.filter((u) => !u.isActive).length;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-sm text-purple-600 font-medium">Admin</span>
                    <h1 className="text-2xl font-bold text-(--app-text)">Usuarios</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowInactive((v) => !v)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                            showInactive
                                ? "border-amber-300 bg-amber-50 text-amber-700"
                                : "border-(--app-border) text-(--app-muted) hover:border-amber-300 hover:text-amber-600"
                        }`}
                    >
                        <EyeOff size={14} />
                        <span>{showInactive ? "Ocultar deshabilitados" : "Ver deshabilitados"}</span>
                        {!showInactive && inactiveCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                                {inactiveCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setEditor({})}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                        Nuevo usuario +
                    </button>
                </div>
            </div>

            {/* Error banner rehabilitar */}
            {restoreError && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50">
                    <ShieldAlert size={16} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 flex-1">{restoreError}</p>
                    <button onClick={() => setRestoreError(null)} className="text-red-400 hover:text-red-600">
                        <X size={14} />
                    </button>
                </div>
            )}

            {showInactive && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50">
                    <EyeOff size={14} className="text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                        Estás viendo usuarios deshabilitados. El ↺ rehabilita, el 🗑 elimina definitivamente.
                    </p>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-(--app-border) bg-(--app-surface)">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="border-b border-(--app-border) text-left text-sm text-(--app-muted)">
                            <th className="px-4 py-3">Usuario</th>
                            <th className="px-4 py-3">Rol</th>
                            <th className="px-4 py-3">Desde</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-(--app-muted)">Cargando...</td></tr>
                        )}
                        {!loading && usuarios.length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-(--app-muted)">No hay usuarios.</td></tr>
                        )}
                        {!loading && usuarios.map((u) => {
                            const isProtected = u.role === "ADMIN" && u.isActive && adminCount === 1;
                            const isInactive = !u.isActive;

                            return (
                                <tr key={u.id} className={`border-b border-(--app-border) hover:bg-(--app-bg) transition-opacity ${isInactive ? "opacity-50" : ""}`}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                {u.role === "ADMIN"
                                                    ? <ShieldCheck size={15} className="text-purple-600" />
                                                    : <User size={15} className="text-gray-500" />
                                                }
                                            </div>
                                            <div>
                                                <span className="font-medium text-sm">{u.displayName}</span>
                                                {isProtected && (
                                                    <p className="text-xs text-purple-500">Cuenta protegida</p>
                                                )}
                                                {isInactive && (
                                                    <p className="text-xs text-amber-600">Deshabilitado</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_STYLE[u.role]}`}>
                                            {ROLE_LABEL[u.role]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(u.createdAt).toLocaleDateString("es-AR")}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-3">
                                        {isInactive ? (
                                            <>
                                                <button
                                                    onClick={() => handleRestore(u)}
                                                    className="text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Rehabilitar usuario"
                                                >
                                                    <RotateCcw size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleAskDeleteHard(u)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Eliminar definitivamente"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => !isProtected && handleAskDelete(u)}
                                                    className={`transition-colors ${isProtected ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:text-red-500"}`}
                                                    title={isProtected ? "No se puede deshabilitar el único administrador" : "Deshabilitar"}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setEditor({ data: u })}
                                                    className="text-gray-500 hover:text-black transition-colors"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <UsuarioModal
                open={!!editor}
                initialData={editor?.data}
                onClose={() => setEditor(null)}
                onSave={handleSave}
            />

            <ConfirmDeleteModal
                open={!!target}
                title={target?.title}
                description={target?.description}
                loading={deleteLoading}
                onClose={cancel}
                onConfirm={confirm}
            />
        </div>
    );
}