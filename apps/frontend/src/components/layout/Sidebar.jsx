// src/components/layout/Sidebar.jsx
import { useNavigate } from "react-router-dom";
import NavItem from "../items/NavItem";
import { Grid, Settings, Package, Users, BarChart2, Expand, Minimize, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "../../app/provider/ThemeProvider";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";
import { PATHS } from "../../app/routes/routes";

const publicNav = [
    { to: PATHS.ITEMS, icon: Grid, label: "items" },
];

const adminNav = [
    { to: PATHS.ADMIN_CATALOG,  icon: Package,   label: "catálogo" },
    { to: PATHS.ADMIN_USERS,    icon: Users,     label: "usuarios" },
    { to: PATHS.ADMIN_REPORTES, icon: BarChart2, label: "reportes" },
];

const bottomNav = [
    { to: PATHS.SETTINGS, icon: Settings, label: "ajustes" },
];

export default function Sidebar() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const isAdmin = user?.role === "ADMIN";

    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleScreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            setIsFullScreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    function handleLogout() {
        logout();
        navigate(PATHS.LOGIN, { replace: true });
    }

    const isDark = theme === "dark";

    return (
        <aside className="flex flex-col items-center justify-between w-16 bg-(--app-surface) border-r border-(--app-border) py-6">
            <div className="flex flex-col items-center gap-6">
                <div className="w-9 h-9 rounded-full border-[2.5px] border-(--app-text) flex items-center justify-center mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-(--app-text)" />
                </div>

                <nav className="flex flex-col items-center gap-5">
                    {publicNav.map(({ to, icon: Icon, label }) => (
                        <NavItem key={to} to={to} icon={Icon} label={label} />
                    ))}

                    {isAdmin && (
                        <>
                            <div className="w-5 border-t border-(--app-border)" />
                            {adminNav.map(({ to, icon: Icon, label }) => (
                                <NavItem key={to} to={to} icon={Icon} label={label} />
                            ))}
                        </>
                    )}

                    <div className="w-5 border-t border-(--app-border)" />

                    {bottomNav.map(({ to, icon: Icon, label }) => (
                        <NavItem key={to} to={to} icon={Icon} label={label} />
                    ))}
                </nav>
            </div>

            <div className="flex flex-col items-center gap-3">
                <button type="button" onClick={toggleTheme}
                    className="w-10 h-10 rounded-full border border-(--app-border) bg-(--app-surface) flex items-center justify-center hover:opacity-90 transition"
                    aria-label="Cambiar tema" title={`Tema actual: ${theme}`}
                >
                    {isDark
                        ? <Sun size={18} className="text-(--app-text)" />
                        : <Moon size={18} className="text-(--app-text)" />
                    }
                </button>

                <button type="button" onClick={toggleScreen}
                    className="w-10 h-10 rounded-full border border-(--app-border) bg-(--app-surface) flex items-center justify-center"
                    aria-label="Pantalla completa"
                >
                    {isFullScreen
                        ? <Minimize size={18} className="text-(--app-text)" />
                        : <Expand size={18} className="text-(--app-text)" />
                    }
                </button>

                <button type="button" onClick={handleLogout}
                    className="w-10 h-10 rounded-full border border-(--app-border) bg-(--app-surface) flex items-center justify-center hover:border-red-300 transition-colors"
                    aria-label="Cerrar sesión" title="Cerrar sesión"
                >
                    <LogOut size={18} className="text-(--app-muted) hover:text-red-500 transition-colors" />
                </button>
            </div>
        </aside>
    );
}