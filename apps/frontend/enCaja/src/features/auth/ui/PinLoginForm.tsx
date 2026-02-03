// src/features/auth/ui/PinLoginForm.tsx
import React, { useMemo, useState } from "react"
import { useAuth } from "@/app/providers/AuthProviders"

export default function PinLoginForm() {
    const { login, status } = useAuth()
    const [pin, setPin] = useState("")
    const [error, setError] = useState<string | null>(null)

    const disabled = useMemo(() => status === "loading" || pin.trim().length < 4, [status, pin])

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        try {
            await login(pin.trim())
            // si no tira error, ya guardó token + estado authenticated
        } catch (err: any) {
            setError(err?.message ?? "Error al ingresar")
        }
    }

    return (
        <form onSubmit={onSubmit} className="w-full space-y-3">
            <div>
                <label className="block text-sm font-medium mb-2">PIN</label>
                <input
                    autoFocus
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    placeholder="••••"
                />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
                type="submit"
                disabled={disabled}
                className={[
                    "w-full py-3 rounded-xl font-medium transition-colors",
                    disabled ? "bg-muted text-muted-foreground" : "bg-indigo-600 text-white hover:bg-indigo-700",
                ].join(" ")}
            >
                {status === "loading" ? "Ingresando..." : "Ingresar"}
            </button>
        </form>
    )
}
