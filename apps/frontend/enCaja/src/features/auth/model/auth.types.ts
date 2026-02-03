// src/features/auth/model/auth.types.ts
import type { User } from "@/entities/user/model/types"

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated"

export type AuthState = {
    status: AuthStatus
    token: string | null
    user: User | null
}
