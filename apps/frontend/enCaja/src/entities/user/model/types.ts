// src/entities/user/model/types.ts
export type Role = "OPERARIO" | "ADMIN"

export interface User {
    id: number
    role: Role
    displayName: string
}
