import { NavLink } from "react-router-dom";
import {
    Home,
    Grid,
    List,
    MessageCircle,
    Settings,
    User,
    Scan
} from "lucide-react";

const navItems = [
    { to: "/items", icon: Grid, label: "items" },
    { to: "/users", icon: User, label: "users" },
    { to: "/settings", icon: Settings, label: "settings" },
];

export default function Sidebar() {
    return (
        <aside className="flex flex-col items-center justify-between w-16 bg-white border-r border-gray-100 py-6">
            <div className="flex flex-col items-center gap-6">
                <div className="w-9 h-9 rounded-full border-[2.5px] border-gray-800 flex items-center justify-center mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-800" />
                </div>

                <nav className="flex flex-col items-center gap-5">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                "w-10 h-10 flex items-center justify-center rounded-xl transition-colors " +
                                (isActive ? "bg-purple-50" : "hover:bg-gray-50")
                            }
                            aria-label={label}
                        >
                            {({ isActive }) => (
                                <Icon
                                    size={22}
                                    strokeWidth={2}
                                    className={isActive ? "text-purple-600" : "text-gray-400"}
                                />
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <button className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                <Scan size={20} className="text-white" />
            </button>
        </aside>
    );
}