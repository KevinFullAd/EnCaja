// src/store/notifyStore.js
import { create } from "zustand";

let nextId = 0;

/**
 * Store global de notificaciones — accesible desde cualquier archivo.
 *
 * Uso:
 *   import { useNotifyStore } from "../store/notifyStore";
 *   const notify = useNotifyStore.getState().push;   // fuera de componentes (stores, utils)
 *   const { push } = useNotifyStore();               // dentro de componentes React
 *
 * Tipos: "success" | "error" | "warning" | "info"
 */
export const useNotifyStore = create((set) => ({
    notifications: [],

    push(message, type = "info", duration = 4000) {
        const id = ++nextId;
        set((state) => ({
            notifications: [...state.notifications, { id, message, type }],
        }));
        // Auto-dismiss
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            }));
        }, duration);
    },

    dismiss(id) {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }));
    },
}));

/**
 * Helper para usar fuera de componentes React (en stores, utils, etc.)
 * sin necesidad de hook.
 *
 * Ejemplo en orderStore.js:
 *   import { notify } from "./notifyStore";
 *   notify.success("Comanda #12 creada");
 *   notify.error("Error al imprimir");
 */
export const notify = {
    success: (msg, duration)  => useNotifyStore.getState().push(msg, "success", duration),
    error:   (msg, duration)  => useNotifyStore.getState().push(msg, "error",   duration ?? 6000),
    warning: (msg, duration)  => useNotifyStore.getState().push(msg, "warning", duration),
    info:    (msg, duration)  => useNotifyStore.getState().push(msg, "info",    duration),
};