// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/api";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,   // { id, displayName, role }
            token: null,

            async login(pin) {
                const data = await api.auth.login(pin);
                set({ user: data.user, token: data.token });
                return data;
            },

            logout() {
                api.auth.logout();
                set({ user: null, token: null });
            },
        }),
        {
            name: "encaja_auth",
            partialize: (s) => ({ user: s.user, token: s.token }),
        }
    )
);