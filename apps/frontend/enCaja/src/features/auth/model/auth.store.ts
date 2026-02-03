// src/features/auth/model/auth.store.ts
import type { AuthState } from "./auth.types"
import type { User } from "@/entities/user/model/types"

const TOKEN_KEY = "pos.token"

export function loadToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_KEY)
    } catch {
        return null
    }
}

export function saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
}

export const initialAuthState: AuthState = {
    status: "idle",
    token: loadToken(),
    user: null,
}

export function setAuthenticated(next: { token: string; user: User }): AuthState {
    return { status: "authenticated", token: next.token, user: next.user }
}

export function setUnauthenticated(): AuthState {
    return { status: "unauthenticated", token: null, user: null }
}
