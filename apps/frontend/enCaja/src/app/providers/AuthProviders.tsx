import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { Role, User } from "@/entities/user/model/types"
import { loginWithPin } from "@/features/auth/api/auth.api"
import {
    clearToken,
    initialAuthState,
    saveToken,
    setAuthenticated,
    setUnauthenticated,
} from "@/features/auth/model/auth.store"
import type { AuthState } from "@/features/auth/model/auth.types"

type AuthContextValue = AuthState & {
    login: (pin: string) => Promise<void>
    logout: () => void
    hasRole: (role: Role) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Helper: decodifica JWT sin verificar firma (válido para cliente)
function decodeToken(token: string) {
    try {
        const payload = token.split('.')[1]
        if (!payload) return null
        const decoded = JSON.parse(atob(payload))
        return decoded
    } catch {
        return null
    }
}

function normalizeRole(value: unknown): Role {
    const r = String(value ?? "").toUpperCase();
    if (r === "ADMIN") return "ADMIN";
    return "OPERARIO";
}

function userFromTokenOrNull(token: string): User | null {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    return {
        id: Number(decoded.sub ?? 0),
        displayName: String(decoded.displayName ?? "Unknown"),
        role: normalizeRole(decoded.role),
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>(() => initialAuthState)

    // Bootstrap: si hay token guardado, decodificarlo y restaurar user
    // Bootstrap: si hay token guardado, decodificarlo y restaurar user
    useEffect(() => {
        if (!state.token) {
            setState((p) => ({ ...p, status: "unauthenticated", user: null }));
            return;
        }

        const u = userFromTokenOrNull(state.token);
        if (!u) {
            clearToken();
            setState((p) => ({ ...p, status: "unauthenticated", token: null, user: null }));
            return;
        }

        setState((p) => ({ ...p, status: "authenticated", user: u }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const login = useCallback(async (pin: string) => {
        setState((p) => ({ ...p, status: "loading" }));

        const res = await loginWithPin(pin);

        saveToken(res.token);

        // Preferimos el user del backend, pero normalizado; si viene mal, usamos el token.
        const user: User | null =
            res.user
                ? {
                    id: res.user.id,
                    displayName: res.user.displayName,
                    role: normalizeRole(res.user.role),
                }
                : userFromTokenOrNull(res.token);

        if (!user) {
            clearToken();
            setState(() => setUnauthenticated());
            return;
        }

        setState(() => setAuthenticated({ token: res.token, user }));
    }, []);


    const logout = useCallback(() => {
        clearToken()
        setState(() => setUnauthenticated())
    }, [])

    const hasRole = useCallback(
        (role: Role) => state.user?.role === role,
        [state.user]
    )

    const value = useMemo<AuthContextValue>(
        () => ({ ...state, login, logout, hasRole }),
        [state, login, logout, hasRole]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}