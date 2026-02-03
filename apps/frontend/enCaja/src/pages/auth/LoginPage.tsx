// src/pages/auth/LoginPage.tsx
import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/app/providers/AuthProviders"
import PinLoginForm from "@/features/auth/ui/PinLoginForm"

export default function LoginPage() {
    const { status, token, user } = useAuth()
    const nav = useNavigate()

    useEffect(() => {
        if (status === "authenticated" && token) {
            if (user?.role === "ADMIN") nav("/admin", { replace: true })
            else nav("/", { replace: true })
        }
    }, [status, token, user, nav])

    return (
        <div className="h-screen flex items-center w-screen justify-center bg-muted/30 p-6">
            <div className="w-full max-w-85 rounded-2xl bg-card border border-border p-6">
                <h1 className="text-xl font-semibold mb-1">POS</h1>
                <p className="text-sm text-muted-foreground mb-6">Ingresá con tu PIN</p>
                <PinLoginForm />
            </div>
        </div>
    )
}
