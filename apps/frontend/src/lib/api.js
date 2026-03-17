// src/lib/api.js
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

function getToken() { return localStorage.getItem("encaja_token"); }
function setToken(token) { localStorage.setItem("encaja_token", token); }
function clearToken() { localStorage.removeItem("encaja_token"); }

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
        categorias({ includeInactive = false } = {}) {
            const qs = includeInactive ? "?includeInactive=true" : "";
            return apiFetch(`/api/catalogo/categorias${qs}`, { auth: false });
        },
        familias({ includeInactive = false } = {}) {
            const qs = includeInactive ? "?includeInactive=true" : "";
            return apiFetch(`/api/catalogo/familias${qs}`, { auth: false });
        },
        crearCategoria(payload) {
            return apiFetch("/api/catalogo/categorias", { method: "POST", body: payload, auth: false });
        },
        actualizarCategoria(id, payload) {
            return apiFetch(`/api/catalogo/categorias/${id}`, { method: "PATCH", body: payload, auth: false });
        },
        crearFamilia(payload) {
            return apiFetch("/api/catalogo/familias", { method: "POST", body: payload, auth: false });
        },
        actualizarFamilia(id, payload) {
            return apiFetch(`/api/catalogo/familias/${id}`, { method: "PATCH", body: payload, auth: false });
        },

        // Rehabilitar en cascada
        rehabilitarCategoria(id) {
            return apiFetch(`/api/catalogo/categorias/${id}/rehabilitar`, { method: "PATCH", auth: false });
        },
        rehabilitarFamilia(id) {
            return apiFetch(`/api/catalogo/familias/${id}/rehabilitar`, { method: "PATCH", auth: false });
        },
        rehabilitarFlavor(id) {
            return apiFetch(`/api/catalogo/flavors/${id}/rehabilitar`, { method: "PATCH", auth: false });
        },
        rehabilitarVariant(id) {
            return apiFetch(`/api/catalogo/variants/${id}/rehabilitar`, { method: "PATCH", auth: false });
        },

        // Soft delete
        eliminarCategoria(id) {
            return apiFetch(`/api/catalogo/categorias/${id}`, { method: "DELETE", auth: false });
        },
        eliminarFamilia(id) {
            return apiFetch(`/api/catalogo/familias/${id}`, { method: "DELETE", auth: false });
        },
        eliminarFlavor(id) {
            return apiFetch(`/api/catalogo/flavors/${id}`, { method: "DELETE", auth: false });
        },
        eliminarVariant(id) {
            return apiFetch(`/api/catalogo/variants/${id}`, { method: "DELETE", auth: false });
        },

        // Hard delete — elimina definitivamente
        eliminarCategoriaHard(id) {
            return apiFetch(`/api/catalogo/categorias/${id}?hard=true`, { method: "DELETE", auth: false });
        },
        eliminarFamiliaHard(id) {
            return apiFetch(`/api/catalogo/familias/${id}?hard=true`, { method: "DELETE", auth: false });
        },
        eliminarFlavorHard(id) {
            return apiFetch(`/api/catalogo/flavors/${id}?hard=true`, { method: "DELETE", auth: false });
        },
        eliminarVariantHard(id) {
            return apiFetch(`/api/catalogo/variants/${id}?hard=true`, { method: "DELETE", auth: false });
        },
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
        print(id, payload) { return apiFetch(`/api/comandas/${id}/print`, { method: "POST", body: payload }); },
        anular(id, payload) { return apiFetch(`/api/comandas/${id}/anular`, { method: "POST", body: payload }); },
    },
};