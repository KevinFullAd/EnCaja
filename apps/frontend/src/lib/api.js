const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

function getToken() {
    return localStorage.getItem("encaja_token");
}

function setToken(token) {
    localStorage.setItem("encaja_token", token);
}

function clearToken() {
    localStorage.removeItem("encaja_token");
}

async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) return res.json();
    return res.text();
}

export const api = {
    auth: {
        async login(pin) {
            const data = await apiFetch("/api/sistema/login", {
                method: "POST",
                body: { pin },
                auth: false,
            });
            const token = data.access_token ?? data.token;
            if (!token) throw new Error("Login sin token");
            setToken(token);
            return data;
        },
        logout() {
            clearToken();
        },
        getToken,
    },

    catalog: {
        categorias() {
            return apiFetch("/api/catalogo/categorias", { auth: false }); // hoy no está protegido
        },
        familias() {
            return apiFetch("/api/catalogo/familias", { auth: false }); // hoy no está protegido
        },
    },

    orders: {
        crearComanda(payload) {
            return apiFetch("/api/comandas", { method: "POST", body: payload, auth: true });
        },
        getById(id) {
            return apiFetch(`/api/comandas/${id}`, { auth: true });
        },
        ticket(id) {
            return apiFetch(`/api/comandas/${id}/ticket`, { auth: true });
        },
        print(id, payload) {
            return apiFetch(`/api/comandas/${id}/print`, { method: "POST", body: payload, auth: true });
        },
        anular(id, payload) {
            return apiFetch(`/api/comandas/${id}/anular`, { method: "POST", body: payload, auth: true });
        },
    },
};