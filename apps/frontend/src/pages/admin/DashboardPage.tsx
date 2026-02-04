// src/pages/admin/DashboardPage.tsx
import React from "react"
import { useAuth } from "@/app/providers/AuthProviders"
import POSPage from "../operario/POSPage"

export default function DashboardPage() {
    const { user, logout } = useAuth()

    return (
        <div className="h-screen p-6">
            <POSPage />
        </div>
    )
}
