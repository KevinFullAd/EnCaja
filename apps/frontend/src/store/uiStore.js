// src/store/uiStore.js
// Store de UI global — intencionalmente vacío.
// Los filtros de cada página (categoría activa, búsqueda) viven
// como useState local en cada componente.
// Solo agregar acá estado que genuinamente deba sobrevivir navegación.
import { create } from "zustand";
 
export const useUIStore = create(() => ({}));