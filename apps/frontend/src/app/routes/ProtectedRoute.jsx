// src/app/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { PATHS } from "./routes";

// Requiere sesión activa
export function ProtectedRoute() {
    const { user } = useAuthStore();
    if (!user) return <Navigate to={PATHS.LOGIN} replace />;
    return <Outlet />;
}

// Requiere rol ADMIN
export function AdminRoute() {
    const { user } = useAuthStore();
    if (!user) return <Navigate to={PATHS.LOGIN} replace />;
    if (user.role !== "ADMIN") return <Navigate to={PATHS.ITEMS} replace />;
    return <Outlet />;
}