// src/app/routes/ProtectedRoute.jsx
import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { PATHS } from "./routes";

export function ProtectedRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    // Escuchar evento de 401 desde apiFetch
    useEffect(() => {
        function handleUnauthorized() {
            logout();
            navigate(PATHS.LOGIN, { replace: true });
        }
        window.addEventListener("encaja:unauthorized", handleUnauthorized);
        return () => window.removeEventListener("encaja:unauthorized", handleUnauthorized);
    }, [logout, navigate]);

    // Verificar sesión al montar — si el token expiró, redirigir
    if (!isAuthenticated()) {
        logout();
        return <Navigate to={PATHS.LOGIN} replace />;
    }

    return <Outlet />;
}

export function AdminRoute() {
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    if (!isAuthenticated()) {
        return <Navigate to={PATHS.LOGIN} replace />;
    }

    if (user?.role !== "ADMIN") {
        return <Navigate to={PATHS.ITEMS} replace />;
    }

    return <Outlet />;
}