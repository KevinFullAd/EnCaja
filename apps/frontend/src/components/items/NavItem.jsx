import { NavLink } from "react-router-dom";

export default function NavItem({
    to,
    icon: Icon,
    label,
    variant = "default", // default | logout
}) {
    const isLogout = variant === "logout";

    return (
        <NavLink
            to={to}
            aria-label={label}
            className={({ isActive }) => {
                const base =
                    "group relative flex items-center justify-center w-11 h-11 rounded-xl border transition-all duration-200 ease-out";

                const common =
                    "border-transparent text-(--app-muted) hover:scale-[1.05] active:scale-[0.97]";

                const hover = isLogout
                    ? "hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/40"
                    : "hover:bg-purple-500/10 hover:text-purple-500 hover:border-purple-500/40";

                const active = isActive
                    ? isLogout
                        ? "bg-red-500/15 text-red-500 border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.35)]"
                        : "bg-purple-500/15 text-purple-500 border-purple-500 shadow-[0_0_0_1px_rgba(168,85,247,0.35)]"
                    : "";

                return `${base} ${common} ${hover} ${active}`;
            }}
        >
            {({ isActive }) => (
                <>
                    <Icon
                        size={22}
                        strokeWidth={2}
                        className={`transition-colors duration-200 ${isActive
                                ? variant === "logout"
                                    ? "text-red-500"
                                    : "text-purple-500"
                                : "group-hover:text-current"
                            }`}
                    />
 
                </>
            )}
        </NavLink>
    );
}