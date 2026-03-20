// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { PATHS } from "../app/routes/routes";
import { Delete } from "lucide-react";

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

export default function LoginPage() {
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    function handleKey(k) {
        if (k === "⌫") return setPin((p) => p.slice(0, -1));
        if (k === "") return;
        if (pin.length >= 4) return;
        setPin((p) => p + k);
    }

    async function handleSubmit() {
        if (!pin) return;
        setLoading(true);
        setError(null);
        try {
            await login(pin);
            navigate(PATHS.ITEMS, { replace: true });
        } catch {
            setError("PIN incorrecto");
            setPin("");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-(--app-bg) flex items-center justify-center p-4">
            <div className="bg-(--app-surface) border border-(--app-border) rounded-2xl shadow-lg w-full max-w-xs p-8 space-y-6">
                {/* Logo / título */}
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold text-(--app-text)">EnCaja</h1>
                    <p className="text-sm text-(--app-muted)">Ingresá tu PIN para continuar</p>
                </div>

                {/* Indicador de PIN */}
                <div className="flex justify-center gap-3">
                    {Array.from({ length: Math.max(pin.length, 4) }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full border-2 transition-colors ${
                                i < pin.length
                                    ? "bg-purple-600 border-purple-600"
                                    : "border-gray-300"
                            }`}
                        />
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <p className="text-center text-sm text-red-500">{error}</p>
                )}

                {/* Teclado numérico */}
                <div className="grid grid-cols-3 gap-3">
                    {KEYS.map((k, i) => (
                        <button
                            key={i}
                            onClick={() => handleKey(k)}
                            disabled={loading || k === ""}
                            className={`h-14 rounded-xl text-lg font-semibold transition-colors
                                ${k === "" ? "invisible" : ""}
                                ${k === "⌫"
                                    ? "text-gray-400 hover:bg-gray-100 active:bg-gray-200"
                                    : "bg-(--app-bg) hover:bg-purple-50 active:bg-purple-100 text-(--app-text) border border-(--app-border)"
                                }
                                disabled:opacity-40`}
                        >
                            {k === "⌫" ? <Delete size={20} className="mx-auto" /> : k}
                        </button>
                    ))}
                </div>

                {/* Botón ingresar */}
                <button
                    onClick={handleSubmit}
                    disabled={!pin || loading}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors disabled:opacity-40 flex items-center justify-center"
                >
                    {loading
                        ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : "Ingresar"
                    }
                </button>
            </div>
        </div>
    );
}