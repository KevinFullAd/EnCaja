// src/app/config/env.ts
function mustGetEnv(key: string): string {
    const v = (import.meta.env as any)[key]
    if (!v) throw new Error(`Missing env var: ${key}`)
    return String(v)
}

// Ej: VITE_API_URL="http://localhost:3000"
export const ENV = {
    API_URL: mustGetEnv("VITE_API_URL"),
} as const
