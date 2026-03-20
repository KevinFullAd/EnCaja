// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/api";

/**
 * Decodifica el payload de un JWT sin verificar firma.
 * Solo para leer la expiración en el cliente.
 */
function decodeJwt(token) {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

/**
 * Devuelve true si el token existe y NO está expirado.
 * Margen de 60 segundos para evitar race conditions.
 */
function isTokenValid(token) {
    if (!token) return false;
    const decoded = decodeJwt(token);
    if (!decoded?.exp) return false;
    return decoded.exp * 1000 > Date.now() + 60_000;
}

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,

            async login(pin) {
                const data = await api.auth.login(pin);
                set({ user: data.user });
                return data;
            },

            logout() {
                api.auth.logout();
                set({ user: null });
            },

            /**
             * Verifica que el token en localStorage siga siendo válido.
             * Si expiró o no existe, hace logout limpio.
             * Llamar al arrancar la app y antes de rutas protegidas.
             */
            checkSession() {
                const token = api.auth.getToken();
                const { user } = get();

                if (!user) return false;

                if (!isTokenValid(token)) {
                    // Token expirado o inexistente — limpiar todo
                    api.auth.logout();
                    set({ user: null });
                    return false;
                }

                return true;
            },

            isAuthenticated() {
                const token = api.auth.getToken();
                const { user } = get();
                return !!user && isTokenValid(token);
            },
        }),
        {
            name: "encaja_auth",
            partialize: (state) => ({ user: state.user }),
        }
    )
);