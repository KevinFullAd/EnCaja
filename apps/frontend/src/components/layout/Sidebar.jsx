import { NavLink } from "react-router-dom";
import { Grid, Settings, User,Package, Expand,Minimize, Sun, Moon } from "lucide-react";
import { useTheme } from "../../app/provider/ThemeProvider";
import { useState } from "react";

const navItems = [
    { to: "/items", icon: Grid, label: "items" },
    { to: "/admin/catalog", icon: Package, label: "admin" },
    { to: "/users", icon: User, label: "users" },
    { to: "/settings", icon: Settings, label: "settings" },
];

export default function Sidebar() {
    const { theme, toggleTheme } = useTheme();

    const [isFullScreen, setIsFullScreen] = useState(false);
    const toggleScreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            setIsFullScreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullScreen(false);
        }
    }
    const isDark = theme === "dark";

    return (
        <aside className="flex flex-col items-center justify-between w-16 bg-(--app-surface) border-r border-(--app-border) py-6">
            <div className="flex flex-col items-center gap-6">
                <div className="w-9 h-9 rounded-full border-[2.5px] border-(--app-text) flex items-center justify-center mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-(--app-text)" />
                </div>

                <nav className="flex flex-col items-center gap-5">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                "w-10 h-10 flex items-center justify-center rounded-xl transition-colors " +
                                (isActive
                                    ? "bg-purple-50 dark:bg-purple-950/40"
                                    : "hover:bg-gray-50 dark:hover:bg-white/5")
                            }
                            aria-label={label}
                        >
                            {({ isActive }) => (
                                <Icon
                                    size={22}
                                    strokeWidth={2}
                                    className={isActive ? "text-purple-600" : "text-(--app-muted)"}
                                />
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="flex flex-col items-center gap-3">
                {/* Toggle theme */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-full border border-(--app-border) bg-(--app-surface) flex items-center justify-center hover:opacity-90 transition"
                    aria-label="Cambiar tema"
                    title={`Tema actual: ${theme}`}
                >
                    {isDark ? (
                        <Sun size={18} className="text-(--app-text)" />
                    ) : (
                        <Moon size={18} className="text-(--app-text)" />
                    )}
                </button>

                {/* Acción inferior existente */}
                <button
                    type="button"
                    onClick={toggleScreen}
                    className="w-10 h-10 rounded-full border border-(--app-border) bg-(--app-surface)  flex items-center justify-center"
                    aria-label="Scan"
                >   
                    {isFullScreen ? (
                        <Minimize size={18} className="text-(--app-text)" />
                    ) : (
                        <Expand size={18} className="text-(--app-text)" />
                    )}
                </button>
            </div>
        </aside>
    );
}