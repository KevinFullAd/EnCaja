// src/pages/admin/AdminReportes.jsx
import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
    TrendingUp, ShoppingBag, Receipt, AlertCircle,
    Printer, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp,
    Search, Calendar, Activity,
} from "lucide-react";
import { api } from "../../lib/api";

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatMoney(amount) {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(amount ?? 0);
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatShortDate(dateStr) {
    if (!dateStr) return "";
    const [, m, d] = dateStr.split("-");
    return `${d}/${m}`;
}

// ─── UI primitivos ────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, sub, color = "purple" }) {
    const colors = {
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        green:  "bg-green-50  text-green-600  border-green-100",
        amber:  "bg-amber-50  text-amber-600  border-amber-100",
        red:    "bg-red-50    text-red-600    border-red-100",
    };
    return (
        <div className="rounded-xl border border-(--app-border) bg-(--app-surface) p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${colors[color]}`}>
                <Icon size={16} />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-(--app-muted)">{label}</p>
                <p className="text-lg font-bold text-(--app-text) truncate">{value}</p>
                {sub && <p className="text-xs text-(--app-muted)">{sub}</p>}
            </div>
        </div>
    );
}

function SectionTitle({ children }) {
    return <h2 className="text-sm font-semibold text-(--app-text)">{children}</h2>;
}

function Badge({ children, color = "gray" }) {
    const colors = {
        green:  "bg-green-100  text-green-700",
        red:    "bg-red-100    text-red-700",
        amber:  "bg-amber-100  text-amber-700",
        gray:   "bg-gray-100   text-gray-600",
        purple: "bg-purple-100 text-purple-700",
        blue:   "bg-blue-100   text-blue-700",
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
}

// ─── Tab: Dashboard ───────────────────────────────────────────────────────

function TabDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("hoy");

    useEffect(() => {
        setLoading(true);
        api.reportes.dashboard().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="py-20 text-center text-sm text-(--app-muted)">Cargando...</div>;
    if (!data) return null;

    const p = data[period] ?? data.hoy;

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                {[["hoy", "Hoy"], ["semana", "Esta semana"], ["mes", "Este mes"]].map(([key, label]) => (
                    <button key={key} onClick={() => setPeriod(key)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${period === key ? "bg-(--app-text) text-(--app-surface)" : "border border-(--app-border) text-(--app-muted) hover:text-(--app-text)"}`}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard icon={TrendingUp}  color="purple" label="Ventas"          value={formatMoney(p.total)}          sub={`${p.comandas} comandas`} />
                <MetricCard icon={ShoppingBag} color="green"  label="Comandas"        value={p.comandas}                    sub="confirmadas" />
                <MetricCard icon={Receipt}     color="amber"  label="Ticket promedio" value={formatMoney(p.ticketPromedio)} />
                <MetricCard icon={AlertCircle} color="red"    label="Anuladas hoy"    value={data.hoy.anuladas} />
            </div>

            <div className="rounded-xl border border-(--app-border) bg-(--app-surface) p-4 space-y-3">
                <SectionTitle>Ventas últimos 14 días</SectionTitle>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.grafico} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" vertical={false} />
                        <XAxis dataKey="dia" tickFormatter={formatShortDate} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                        <Tooltip formatter={(v) => [formatMoney(v), "Ventas"]} labelFormatter={formatShortDate} contentStyle={{ borderRadius: 8, border: "1px solid var(--app-border)", fontSize: 12 }} />
                        <Bar dataKey="total" fill="rgb(147,51,234)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <TabProductosTop embedded />
                <TabPorOperario embedded />
            </div>
        </div>
    );
}

// ─── Tab: Productos top ───────────────────────────────────────────────────

function TabProductosTop({ embedded = false }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { api.reportes.productosTop().then(setData).catch(console.error).finally(() => setLoading(false)); }, []);

    const content = (
        <div className="space-y-2">
            {loading && <p className="text-sm text-(--app-muted) py-4 text-center">Cargando...</p>}
            {!loading && data.map((item) => (
                <div key={item.rank} className="flex items-center gap-3 py-2">
                    <span className="w-5 text-xs font-bold text-(--app-muted) text-right flex-shrink-0">{item.rank}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-(--app-text) truncate">{item.nombre}</p>
                        <div className="h-1.5 bg-(--app-border) rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (item.cantidad / (data[0]?.cantidad || 1)) * 100)}%` }} />
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-(--app-text)">{item.cantidad} uds</p>
                        <p className="text-xs text-(--app-muted)">{formatMoney(item.total)}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    if (embedded) return <div className="rounded-xl border border-(--app-border) bg-(--app-surface) p-4 space-y-3"><SectionTitle>Productos más vendidos</SectionTitle>{content}</div>;
    return <div className="space-y-4"><SectionTitle>Productos más vendidos</SectionTitle>{content}</div>;
}

// ─── Tab: Por operario ────────────────────────────────────────────────────

function TabPorOperario({ embedded = false }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { api.reportes.porOperario().then(setData).catch(console.error).finally(() => setLoading(false)); }, []);

    const content = (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-(--app-border) text-left text-(--app-muted) text-xs">
                        <th className="pb-2 font-medium">Operario</th>
                        <th className="pb-2 font-medium text-right">Comandas</th>
                        <th className="pb-2 font-medium text-right">Promedio</th>
                        <th className="pb-2 font-medium text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-(--app-border)">
                    {loading && <tr><td colSpan={4} className="py-4 text-center text-(--app-muted) text-xs">Cargando...</td></tr>}
                    {!loading && data.map((row) => (
                        <tr key={row.operario}>
                            <td className="py-2 font-medium text-(--app-text)">{row.operario}</td>
                            <td className="py-2 text-right text-(--app-muted)">{row.comandas}</td>
                            <td className="py-2 text-right text-(--app-muted)">{formatMoney(row.ticketPromedio)}</td>
                            <td className="py-2 text-right font-semibold text-(--app-text)">{formatMoney(row.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (embedded) return <div className="rounded-xl border border-(--app-border) bg-(--app-surface) p-4 space-y-3"><SectionTitle>Ventas por operario</SectionTitle>{content}</div>;
    return <div className="space-y-4"><SectionTitle>Ventas por operario</SectionTitle>{content}</div>;
}

// ─── Tab: Historial ───────────────────────────────────────────────────────

function ReintentarImpresion({ orderId, label = "Reintentar", onSuccess }) {
    const [loading, setLoading] = useState(false);
    async function handleClick(e) {
        e.stopPropagation();
        setLoading(true);
        try { await api.reportes.reimprimirComanda(orderId); onSuccess?.(); }
        catch (err) { alert(err?.message ?? "Error al reimprimir"); }
        finally { setLoading(false); }
    }
    return (
        <button onClick={handleClick} disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-(--app-border) text-xs text-(--app-muted) hover:border-purple-400 hover:text-purple-600 transition-all disabled:opacity-50">
            {loading ? <RefreshCw size={11} className="animate-spin" /> : <Printer size={11} />}
            {label}
        </button>
    );
}

function TabHistorial() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [filters, setFilters] = useState({ numero: "", cliente: "", desde: "", hasta: "", soloAnuladas: false, page: 1 });

    const load = useCallback(() => {
        setLoading(true);
        api.reportes.comandas({ ...filters, numero: filters.numero || undefined, soloAnuladas: filters.soloAnuladas || undefined })
            .then(setData).catch(console.error).finally(() => setLoading(false));
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    function setFilter(key, value) { setFilters((f) => ({ ...f, [key]: value, page: 1 })); }

    const printStatusColor = (s) => s === "OK" ? "green" : s === "ERROR" ? "red" : "gray";

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
                {[
                    { key: "numero", placeholder: "# comanda", width: "w-36" },
                    { key: "cliente", placeholder: "cliente", width: "w-40" },
                ].map(({ key, placeholder, width }) => (
                    <div key={key} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-surface) ${width}`}>
                        <Search size={13} className="text-(--app-muted)" />
                        <input className="flex-1 text-sm bg-transparent outline-none text-(--app-text) placeholder:text-(--app-muted)"
                            placeholder={placeholder} value={filters[key]} onChange={(e) => setFilter(key, e.target.value)} />
                    </div>
                ))}
                {["desde", "hasta"].map((key) => (
                    <div key={key} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-surface)">
                        <Calendar size={13} className="text-(--app-muted)" />
                        <input type="date" className="text-sm bg-transparent outline-none text-(--app-text)"
                            value={filters[key]} onChange={(e) => setFilter(key, e.target.value)} />
                    </div>
                ))}
                <label className="flex items-center gap-2 text-sm text-(--app-muted) cursor-pointer">
                    <input type="checkbox" checked={filters.soloAnuladas} onChange={(e) => setFilter("soloAnuladas", e.target.checked)} className="accent-purple-600" />
                    Solo anuladas
                </label>
            </div>

            <div className="rounded-xl border border-(--app-border) bg-(--app-surface) overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-(--app-border) text-left text-xs text-(--app-muted)">
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3">Retiro</th>
                            <th className="px-4 py-3">Operario</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3">Impresión</th>
                            <th className="w-8 px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-(--app-border)">
                        {loading && <tr><td colSpan={9} className="px-4 py-10 text-center text-(--app-muted)">Cargando...</td></tr>}
                        {!loading && data?.items?.map((order) => (
                            <>
                                <tr key={order.id} className="hover:bg-(--app-bg) cursor-pointer" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                                    <td className="px-4 py-3 font-semibold">#{order.numero}</td>
                                    <td className="px-4 py-3 text-(--app-muted) text-xs">{formatDate(order.fecha)}</td>
                                    <td className="px-4 py-3">{order.cliente ?? <span className="text-(--app-muted)">—</span>}</td>
                                    <td className="px-4 py-3">{order.retiro ? <Badge color="purple">{order.retiro}</Badge> : <span className="text-(--app-muted)">—</span>}</td>
                                    <td className="px-4 py-3 text-(--app-muted)">{order.operario}</td>
                                    <td className="px-4 py-3 text-right font-semibold">{formatMoney(order.total)}</td>
                                    <td className="px-4 py-3">{order.isVoided ? <Badge color="red">Anulada</Badge> : <Badge color="green">OK</Badge>}</td>
                                    <td className="px-4 py-3"><Badge color={printStatusColor(order.printStatus)}>{order.printStatus}</Badge></td>
                                    <td className="px-4 py-3">{expanded === order.id ? <ChevronUp size={14} className="text-(--app-muted)" /> : <ChevronDown size={14} className="text-(--app-muted)" />}</td>
                                </tr>
                                {expanded === order.id && (
                                    <tr key={`${order.id}-detail`} className="bg-(--app-bg)">
                                        <td colSpan={9} className="px-6 py-4">
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    {order.items.map((item, i) => (
                                                        <div key={i} className="flex justify-between text-sm">
                                                            <span className="text-(--app-muted)">{item.cantidad}x {item.nombre}</span>
                                                            <span className="font-medium">{formatMoney(item.subtotal)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {order.notas && <p className="text-xs text-(--app-muted) italic">Nota: {order.notas}</p>}
                                                {order.isVoided && order.voidReason && <p className="text-xs text-red-500">Motivo anulación: {order.voidReason}</p>}
                                                {order.printStatus === "ERROR" && (
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-red-500">Error: {order.printError ?? "desconocido"}</p>
                                                        <ReintentarImpresion orderId={order.id} onSuccess={load} />
                                                    </div>
                                                )}
                                                {order.printStatus === "PENDING" && !order.isVoided && <ReintentarImpresion orderId={order.id} label="Imprimir" onSuccess={load} />}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                        {!loading && data?.items?.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-(--app-muted)">No hay comandas.</td></tr>}
                    </tbody>
                </table>
            </div>

            {data && data.pages > 1 && (
                <div className="flex items-center justify-between text-sm text-(--app-muted)">
                    <span>{data.total} resultados</span>
                    <div className="flex items-center gap-2">
                        <button disabled={filters.page <= 1} onClick={() => setFilter("page", filters.page - 1)} className="px-3 py-1.5 rounded-lg border border-(--app-border) disabled:opacity-40 hover:bg-(--app-bg)">Anterior</button>
                        <span>{filters.page} / {data.pages}</span>
                        <button disabled={filters.page >= data.pages} onClick={() => setFilter("page", filters.page + 1)} className="px-3 py-1.5 rounded-lg border border-(--app-border) disabled:opacity-40 hover:bg-(--app-bg)">Siguiente</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Tab: Impresión ───────────────────────────────────────────────────────

function TabImpresion() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        api.reportes.impresion().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-4">
            {data && (
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <MetricCard icon={XCircle}     color="red"   label="Errores pendientes" value={data.resumen.errores} />
                    <MetricCard icon={AlertCircle} color="amber" label="Sin imprimir"        value={data.resumen.pendientes} />
                </div>
            )}
            <div className="rounded-xl border border-(--app-border) bg-(--app-surface) overflow-hidden">
                <div className="px-4 py-3 border-b border-(--app-border) flex items-center justify-between">
                    <SectionTitle>Últimas impresiones</SectionTitle>
                    <button onClick={load} className="text-(--app-muted) hover:text-(--app-text) transition-colors"><RefreshCw size={14} /></button>
                </div>
                <div className="divide-y divide-(--app-border)">
                    {loading && <p className="px-4 py-8 text-center text-sm text-(--app-muted)">Cargando...</p>}
                    {!loading && data?.logs?.map((log) => (
                        <div key={log.id} className="px-4 py-3 flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                {log.success ? <CheckCircle size={15} className="text-green-500" /> : <XCircle size={15} className="text-red-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-(--app-text)">#{log.orderNumber}</span>
                                    {log.cliente && <span className="text-xs text-(--app-muted)">{log.cliente}</span>}
                                    <span className="text-xs text-(--app-muted)">{log.printerName ?? "—"}</span>
                                </div>
                                {log.errorMessage && <p className="text-xs text-red-500 mt-0.5 truncate">{log.errorMessage}</p>}
                            </div>
                            <div className="flex-shrink-0 text-right space-y-1">
                                <p className="text-xs text-(--app-muted)">{log.operario}</p>
                                <p className="text-xs text-(--app-muted)">{formatDate(log.printedAt)}</p>
                                {!log.success && <ReintentarImpresion orderId={log.orderId} onSuccess={load} />}
                            </div>
                        </div>
                    ))}
                    {!loading && data?.logs?.length === 0 && <p className="px-4 py-8 text-center text-sm text-(--app-muted)">Sin registros.</p>}
                </div>
            </div>
        </div>
    );
}

// ─── Tab: Eventos del sistema ─────────────────────────────────────────────

const EVENT_TYPE_CONFIG = {
    SUCCESS: { color: "green", label: "Éxito" },
    ERROR:   { color: "red",   label: "Error" },
    WARNING: { color: "amber", label: "Aviso" },
    INFO:    { color: "blue",  label: "Info"  },
};

const EVENT_CAT_CONFIG = {
    ORDER:   { color: "purple", label: "Comanda" },
    PRINT:   { color: "blue",   label: "Impresión" },
    AUTH:    { color: "amber",  label: "Auth" },
    CATALOG: { color: "green",  label: "Catálogo" },
    USERS:   { color: "purple", label: "Usuarios" },
    SYSTEM:  { color: "gray",   label: "Sistema" },
};

function TabEventos() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ type: "", category: "", desde: "", hasta: "", page: 1 });

    const load = useCallback(() => {
        setLoading(true);
        api.reportes.eventos({ ...filters, type: filters.type || undefined, category: filters.category || undefined })
            .then(setData).catch(console.error).finally(() => setLoading(false));
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    function setFilter(key, value) { setFilters((f) => ({ ...f, [key]: value, page: 1 })); }

    return (
        <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-2 items-center">
                <select
                    className="px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-surface) text-sm text-(--app-text)"
                    value={filters.type} onChange={(e) => setFilter("type", e.target.value)}
                >
                    <option value="">Todos los tipos</option>
                    {Object.entries(EVENT_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select
                    className="px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-surface) text-sm text-(--app-text)"
                    value={filters.category} onChange={(e) => setFilter("category", e.target.value)}
                >
                    <option value="">Todas las categorías</option>
                    {Object.entries(EVENT_CAT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                {["desde", "hasta"].map((key) => (
                    <div key={key} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-surface)">
                        <Calendar size={13} className="text-(--app-muted)" />
                        <input type="date" className="text-sm bg-transparent outline-none text-(--app-text)"
                            value={filters[key]} onChange={(e) => setFilter(key, e.target.value)} />
                    </div>
                ))}
                <button onClick={load} className="p-2 rounded-lg border border-(--app-border) text-(--app-muted) hover:text-(--app-text) transition-colors">
                    <RefreshCw size={14} />
                </button>
            </div>

            <div className="rounded-xl border border-(--app-border) bg-(--app-surface) overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-(--app-border) text-left text-xs text-(--app-muted)">
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Categoría</th>
                            <th className="px-4 py-3">Mensaje</th>
                            <th className="px-4 py-3">Usuario</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-(--app-border)">
                        {loading && <tr><td colSpan={5} className="px-4 py-10 text-center text-(--app-muted)">Cargando...</td></tr>}
                        {!loading && data?.items?.map((event) => {
                            const typeCfg = EVENT_TYPE_CONFIG[event.type] ?? { color: "gray", label: event.type };
                            const catCfg  = EVENT_CAT_CONFIG[event.category] ?? { color: "gray", label: event.category };
                            return (
                                <tr key={event.id} className="hover:bg-(--app-bg)">
                                    <td className="px-4 py-2.5 text-xs text-(--app-muted) whitespace-nowrap">{formatDate(event.createdAt)}</td>
                                    <td className="px-4 py-2.5"><Badge color={typeCfg.color}>{typeCfg.label}</Badge></td>
                                    <td className="px-4 py-2.5"><Badge color={catCfg.color}>{catCfg.label}</Badge></td>
                                    <td className="px-4 py-2.5 text-sm text-(--app-text)">{event.message}</td>
                                    <td className="px-4 py-2.5 text-xs text-(--app-muted)">{event.usuario ?? "—"}</td>
                                </tr>
                            );
                        })}
                        {!loading && data?.items?.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-(--app-muted)">No hay eventos.</td></tr>}
                    </tbody>
                </table>
            </div>

            {data && data.pages > 1 && (
                <div className="flex items-center justify-between text-sm text-(--app-muted)">
                    <span>{data.total} eventos</span>
                    <div className="flex items-center gap-2">
                        <button disabled={filters.page <= 1} onClick={() => setFilter("page", filters.page - 1)} className="px-3 py-1.5 rounded-lg border border-(--app-border) disabled:opacity-40 hover:bg-(--app-bg)">Anterior</button>
                        <span>{filters.page} / {data.pages}</span>
                        <button disabled={filters.page >= data.pages} onClick={() => setFilter("page", filters.page + 1)} className="px-3 py-1.5 rounded-lg border border-(--app-border) disabled:opacity-40 hover:bg-(--app-bg)">Siguiente</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────

const TABS = [
    { id: "dashboard", label: "Dashboard" },
    { id: "historial", label: "Historial" },
    { id: "impresion", label: "Impresión" },
    { id: "eventos",   label: "Eventos",   icon: Activity },
];

export default function AdminReportes() {
    const [tab, setTab] = useState("dashboard");

    return (
        <div className="p-6 space-y-6">
            <div>
                <span className="text-sm text-purple-600 font-medium">Admin</span>
                <h1 className="text-2xl font-bold text-(--app-text)">Reportes</h1>
            </div>

            <div className="flex gap-1 border-b border-(--app-border)">
                {TABS.map((t) => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            tab === t.id ? "border-purple-600 text-purple-600" : "border-transparent text-(--app-muted) hover:text-(--app-text)"
                        }`}
                    >
                        {t.icon && <t.icon size={13} />}
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "dashboard" && <TabDashboard />}
            {tab === "historial" && <TabHistorial />}
            {tab === "impresion" && <TabImpresion />}
            {tab === "eventos"   && <TabEventos />}
        </div>
    );
}