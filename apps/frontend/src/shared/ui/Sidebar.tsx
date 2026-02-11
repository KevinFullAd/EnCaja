// src\shared\ui\Sidebar.tsx

import {
    FaHome,
    FaThLarge,
    FaBookmark,
    FaShoppingCart,
    FaEnvelope,
    FaCog,
    FaQuestionCircle,
    FaSignOutAlt,
} from "react-icons/fa";
import type { Role } from "@/entities/user/model/types";
import { useAuth } from "@/app/providers/AuthProviders";
import { useNavigate } from "react-router-dom";

type NavItem = {
    id: string;
    icon: React.ComponentType<{ size?: number }>;
    to: string;
    roles: Role[];
};

const NAV_ITEMS: NavItem[] = [
    { id: "home", icon: FaHome, to: "/", roles: ["ADMIN", "OPERARIO"] },
    { id: "pos", icon: FaThLarge, to: "/operario/pos", roles: ["ADMIN", "OPERARIO"] },

    { id: "admin", icon: FaBookmark, to: "/admin", roles: ["ADMIN"] },
    { id: "orders", icon: FaShoppingCart, to: "/admin/orders", roles: ["ADMIN"] },
    { id: "messages", icon: FaEnvelope, to: "/admin/messages", roles: ["ADMIN"] },

    { id: "settings", icon: FaCog, to: "/admin/settings", roles: ["ADMIN"] },
    { id: "help", icon: FaQuestionCircle, to: "/admin/help", roles: ["ADMIN"] },
];

export default function Sidebar({
    activePath,
    role,
    onNavigate,
}: {
    activePath: string;
    role: Role;
    onNavigate: (to: string) => void;
}) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const safeRole: Role = role === "ADMIN" ? "ADMIN" : "OPERARIO";
    const visible = NAV_ITEMS.filter((i) => i.roles.includes(safeRole));
    const top = visible.filter((i) => !["settings", "help"].includes(i.id));
    const bottom = visible.filter((i) => ["settings", "help"].includes(i.id));

    const Button = (item: NavItem) => {
        const Icon = item.icon;
        const isActive =
            activePath === item.to || (item.to !== "/" && activePath.startsWith(item.to));

        return (
            <button
                key={item.id}
                onClick={() => onNavigate(item.to)}
                className={[
                    "flex w-full  items-center justify-center rounded-xl transition-colors",
                    isActive
                        ? "bg-violet-600 text-violet-400"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                ].join(" ")}
            >
                <Icon size={20} />
            </button>
        );
    };

    return (
        <aside className="flex w-16 flex-col items-center justify-between bg-white py-6 shadow-[1px_0_0_0] shadow-gray-200">
            {/* Logo */}
            <div className="mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white font-bold">
                    C
                </div>
            </div>

            {/* Navegación principal */}
            <nav className="flex flex-1 flex-col items-center gap-3">
                {top.map(Button)}
            </nav>

            {/* Inferior */}
            <nav className="flex flex-col items-center gap-3">
                {bottom.map(Button)}
                <button
                    onClick={() => {
                        logout();
                        navigate("/auth/login", { replace: true });
                    }}
                    className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    aria-label="Logout"
                >
                    <FaSignOutAlt size={18} />
                </button>
            </nav>
        </aside>
    );
}
