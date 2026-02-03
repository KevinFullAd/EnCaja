import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/shared/ui/Sidebar";
import { useAuth } from "@/app/providers/AuthProviders"; // ajusta el path real

export default function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Si por alguna razón llegas aquí sin user, puedes no renderizar sidebar
    // (normalmente el guard lo evita).
    if (!user) return <Outlet />;

    return (
        <div className="flex h-screen bg-red-100">
            <Sidebar
                activePath={location.pathname}
                role={user.role}
                onNavigate={navigate}
            />
            <div className="flex min-w-0 flex-1">
                <Outlet />
            </div>
        </div>
    );
}
