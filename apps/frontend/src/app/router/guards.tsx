import React from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "@/entities/user/model/types";
import { useAuth } from "@/app/providers/AuthProviders"; // ajusta path real

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { status } = useAuth();
    if (status === "loading") return null; // o un loader
    if (status !== "authenticated") return <Navigate to="/auth/login" replace />;
    return <>{children}</>;
}

export function RoleGuard({
    allow,
    children,
}: {
    allow: Role[];
    children: React.ReactNode;
}) {
    const { status, user } = useAuth();

    if (status === "loading") return null;
    if (status !== "authenticated" || !user) return <Navigate to="/auth/login" replace />;
    if (!allow.includes(user.role)) return <Navigate to="/operario/pos" replace />;

    return <>{children}</>;
}
