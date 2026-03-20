// src/store/draftStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { normalizeFamilyForForm } from "../components/admin/catalog/helpers/familyForm.helpers";

/**
 * Guarda un borrador de producto en localStorage.
 * Se actualiza automáticamente mientras el usuario edita el wizard.
 *
 * draft: null | { family: EditableFamily, step: number, savedAt: string }
 */
export const useDraftStore = create(
    persist(
        (set, get) => ({
            draft: null,

            // Llamar en cada onChange del wizard
            saveDraft(family, step) {
                set({
                    draft: {
                        family: normalizeFamilyForForm(family),
                        step,
                        savedAt: new Date().toISOString(),
                    },
                });
            },

            // Llamar al crear exitosamente o al descartar explícitamente
            clearDraft() {
                set({ draft: null });
            },

            hasDraft() {
                return !!get().draft;
            },
        }),
        {
            name: "encaja_product_draft",
            // Solo persistir el draft, no las funciones
            partialize: (s) => ({ draft: s.draft }),
        }
    )
);