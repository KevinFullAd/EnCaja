// src/features/auth/api/auth.api.ts
import { http } from "@/shared/api/http"
import type { User } from "@/entities/user/model/types"

type LoginRawResponse = {
    token: string
    displayName: string
    role: "ADMIN" | "OPERARIO"
}

export async function loginWithPin(pin: string): Promise<{ token: string; user: User }> {
    const res = await http<LoginRawResponse>("/api/sistema/login", {
        method: "POST",
        body: { pin },
    })

    return {
        token: res.token,
        user: {
            id: 0, // si no viene, poner 0 o null
            displayName: res.displayName,
            role: res.role,
        },
    }
}
