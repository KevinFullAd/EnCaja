// src/components/ui/NotificationToast.jsx
import { useRef } from "react";
import { useNotifyStore } from "../../store/notifyStore";
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    X,
} from "lucide-react";

const CONFIG = {
    success: {
        icon: CheckCircle,
        bg: "bg-green-50 border-green-200",
        text: "text-green-800",
        icon_class: "text-green-500",
        accent: "bg-green-500",
    },
    error: {
        icon: XCircle,
        bg: "bg-red-50 border-red-200",
        text: "text-red-800",
        icon_class: "text-red-500",
        accent: "bg-red-500",
    },
    warning: {
        icon: AlertTriangle,
        bg: "bg-amber-50 border-amber-200",
        text: "text-amber-800",
        icon_class: "text-amber-500",
        accent: "bg-amber-500",
    },
    info: {
        icon: Info,
        bg: "bg-blue-50 border-blue-200",
        text: "text-blue-800",
        icon_class: "text-blue-500",
        accent: "bg-blue-500",
    },
};

export default function NotificationToast() {
    const notifications = useNotifyStore((s) => s.notifications);
    const dismiss = useNotifyStore((s) => s.dismiss);

    const timeouts = useRef({});

    if (!notifications.length) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end gap-2 w-full max-w-sm pointer-events-none">
            {notifications.map((n, i) => {
                const cfg = CONFIG[n.type] ?? CONFIG.info;
                const Icon = cfg.icon;

                return (
                    <div
                        key={n.id}
                        className={`
                            pointer-events-auto
                            relative
                            flex items-start gap-3
                            px-4 py-3
                            rounded-xl border shadow-lg
                            bg-white

                            transform transition-all duration-300 ease-out
                            animate-toast-in

                            ${cfg.bg}
                        `}
                        style={{
                            transform: `translateY(${i * -4}px) scale(${1 - i * 0.02})`,
                            zIndex: 1000 - i,
                        }}
                        onMouseEnter={() => {
                            if (timeouts.current[n.id]) {
                                clearTimeout(timeouts.current[n.id]);
                            }
                        }}
                    >
                        {/* Accent bar */}
                        <div className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${cfg.accent}`} />

                        {/* Icon */}
                        <Icon
                            size={16}
                            className={`${cfg.icon_class} flex-shrink-0 mt-0.5`}
                        />

                        {/* Message */}
                        <p
                            className={`flex-1 text-sm font-medium leading-snug ${cfg.text}`}
                        >
                            {n.message}
                        </p>

                        {/* Close */}
                        <button
                            onClick={() => dismiss(n.id)}
                            className={`${cfg.icon_class} opacity-60 hover:opacity-100 transition-opacity`}
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}