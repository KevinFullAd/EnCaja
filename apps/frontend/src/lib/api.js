// src/lib/api.js
const API_BASE = window?.electronAPI?.getApiBaseUrl?.() 
    || import.meta.env.VITE_API_BASE 
    || "http://localhost:3000";
    
function getToken() { return localStorage.getItem("encaja_token"); }
function setToken(token) { localStorage.setItem("encaja_token", token); }
function clearToken() { localStorage.removeItem("encaja_token"); }

/**
 * Limpia la sesión cuando el back devuelve 401.
 * Usa un evento custom para que ProtectedRoute lo maneje
 * sin causar loops de render.
 */
function onUnauthorized() {
    clearToken();
    localStorage.removeItem("encaja_auth");
    // Dispara evento — ProtectedRoute lo escucha y redirige al login
    window.dispatchEvent(new CustomEvent("encaja:unauthorized"));
}

async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        method, headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && auth) {
        onUnauthorized();
        throw new Error("Sesión expirada. Ingresá tu PIN nuevamente.");
    }

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        try {
            const json = JSON.parse(text);
            throw new Error(json.message ?? `HTTP ${res.status}`);
        } catch {
            throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
        }
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) return res.json();
    return res.text();
}

export const api = {
    auth: {
        async login(pin) {
            const data = await apiFetch("/api/sistema/login", { method: "POST", body: { pin }, auth: false });
            const token = data.access_token ?? data.token;
            if (!token) throw new Error("Login sin token");
            setToken(token);
            return data;
        },
        logout() { clearToken(); },
        getToken,
    },

    catalog: {
        categorias({ includeInactive = false } = {}) { return apiFetch(`/api/catalogo/categorias${includeInactive ? "?includeInactive=true" : ""}`, { auth: false }); },
        familias({ includeInactive = false } = {}) { return apiFetch(`/api/catalogo/familias${includeInactive ? "?includeInactive=true" : ""}`, { auth: false }); },
        crearCategoria(payload) { return apiFetch("/api/catalogo/categorias", { method: "POST", body: payload }); },
        actualizarCategoria(id, payload) { return apiFetch(`/api/catalogo/categorias/${id}`, { method: "PATCH", body: payload }); },
        crearFamilia(payload) { return apiFetch("/api/catalogo/familias", { method: "POST", body: payload }); },
        actualizarFamilia(id, payload) { return apiFetch(`/api/catalogo/familias/${id}`, { method: "PATCH", body: payload }); },
        rehabilitarCategoria(id) { return apiFetch(`/api/catalogo/categorias/${id}/rehabilitar`, { method: "PATCH" }); },
        rehabilitarFamilia(id) { return apiFetch(`/api/catalogo/familias/${id}/rehabilitar`, { method: "PATCH" }); },
        rehabilitarFlavor(id) { return apiFetch(`/api/catalogo/flavors/${id}/rehabilitar`, { method: "PATCH" }); },
        rehabilitarVariant(id) { return apiFetch(`/api/catalogo/variants/${id}/rehabilitar`, { method: "PATCH" }); },
        eliminarCategoria(id) { return apiFetch(`/api/catalogo/categorias/${id}`, { method: "DELETE" }); },
        eliminarFamilia(id) { return apiFetch(`/api/catalogo/familias/${id}`, { method: "DELETE" }); },
        eliminarFlavor(id) { return apiFetch(`/api/catalogo/flavors/${id}`, { method: "DELETE" }); },
        eliminarVariant(id) { return apiFetch(`/api/catalogo/variants/${id}`, { method: "DELETE" }); },
        eliminarCategoriaHard(id) { return apiFetch(`/api/catalogo/categorias/${id}?hard=true`, { method: "DELETE" }); },
        eliminarFamiliaHard(id) { return apiFetch(`/api/catalogo/familias/${id}?hard=true`, { method: "DELETE" }); },
        eliminarFlavorHard(id) { return apiFetch(`/api/catalogo/flavors/${id}?hard=true`, { method: "DELETE" }); },
        eliminarVariantHard(id) { return apiFetch(`/api/catalogo/variants/${id}?hard=true`, { method: "DELETE" }); },
    },

    uploads: {
        async imagen(file) {
            const token = getToken();
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`${API_BASE}/api/uploads/imagen`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });
            if (res.status === 401) { onUnauthorized(); throw new Error("Sesión expirada."); }
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                try { const json = JSON.parse(text); throw new Error(json.message ?? `HTTP ${res.status}`); }
                catch { throw new Error(`HTTP ${res.status}`); }
            }
            return res.json();
        },
    },

    usuarios: {
        listar() { return apiFetch("/api/usuarios"); },
        crear(payload) { return apiFetch("/api/usuarios", { method: "POST", body: payload }); },
        actualizar(id, payload) { return apiFetch(`/api/usuarios/${id}`, { method: "PATCH", body: payload }); },
        eliminar(id) { return apiFetch(`/api/usuarios/${id}`, { method: "DELETE" }); },
    },

    orders: {
        crearComanda(payload) { return apiFetch("/api/comandas", { method: "POST", body: payload }); },
        getById(id) { return apiFetch(`/api/comandas/${id}`); },
        ticket(id) { return apiFetch(`/api/comandas/${id}/ticket`); },
        print(id) { return apiFetch(`/api/comandas/${id}/print`, { method: "POST" }); },
        anular(id, payload) { return apiFetch(`/api/comandas/${id}/anular`, { method: "POST", body: payload }); },
    },

    reportes: {
        dashboard() { return apiFetch("/api/reportes/dashboard"); },
        productosTop(params = {}) {
            const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null)).toString();
            return apiFetch(`/api/reportes/productos-top${qs ? "?" + qs : ""}`);
        },
        porOperario(params = {}) {
            const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null)).toString();
            return apiFetch(`/api/reportes/por-operario${qs ? "?" + qs : ""}`);
        },
        comandas(params = {}) {
            const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== "")).toString();
            return apiFetch(`/api/reportes/comandas${qs ? "?" + qs : ""}`);
        },
        impresion(limit) { return apiFetch(`/api/reportes/impresion${limit ? "?limit=" + limit : ""}`); },
        reimprimirComanda(id) { return apiFetch(`/api/comandas/${id}/print`, { method: "POST" }); },
        eventos(params = {}) {
            const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== "")).toString();
            return apiFetch(`/api/reportes/eventos${qs ? "?" + qs : ""}`);
        },
    },
};