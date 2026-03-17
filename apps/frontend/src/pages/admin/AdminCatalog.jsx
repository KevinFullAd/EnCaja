// src/pages/admin/AdminCatalog.jsx
import { useState, useEffect, useMemo } from "react";
import Searcher from "../../components/items/Searcher";
import { useDeleteStore } from "../../store/deleteStore";
import { useDraftStore } from "../../store/draftStore";
import CategoryExpandableTable from "../../components/admin/catalog/CategoryExpandableTable";
import CategoryModal from "../../components/admin/catalog/modals/CategoryModal";
import ProductWizardModal from "../../components/admin/catalog/modals/ProductWizardModal";
import ConfirmDeleteModal from "../../components/admin/catalog/modals/ConfirmDeleteModal";
import { api } from "../../lib/api";
import { BookmarkCheck, X, EyeOff, AlertCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

const normalizeText = (text) =>
    (text ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function slugify(text) {
    return (text ?? "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

// Resuelve URL relativa a absoluta para imágenes subidas localmente
function resolveImageUrl(url) {
    if (!url) return url;
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url}`;
}

// Aplica resolveImageUrl a todas las imágenes de las familias
function resolveImages(families) {
    return (families ?? []).map((fam) => ({
        ...fam,
        imageUrl: resolveImageUrl(fam.imageUrl),
        flavors: (fam.flavors ?? []).map((fl) => ({
            ...fl,
            variants: (fl.variants ?? []).map((v) => ({
                ...v,
                imageUrl: resolveImageUrl(v.imageUrl),
            })),
        })),
    }));
}

function DraftBanner({ draft, onContinue, onDiscard }) {
    const name = draft?.family?.name?.trim();
    const savedAt = draft?.savedAt
        ? new Date(draft.savedAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
        : null;
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-purple-200 bg-purple-50 dark:border-purple-900/40 dark:bg-purple-950/20">
            <BookmarkCheck size={16} className="text-purple-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                    Borrador guardado{name ? `: "${name}"` : ""}
                </p>
                {savedAt && <p className="text-xs text-purple-500">Guardado a las {savedAt}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={onContinue} className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors">
                    Continuar
                </button>
                <button onClick={onDiscard} className="text-purple-400 hover:text-purple-600 transition-colors">
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}

function ErrorBanner({ message, onDismiss }) {
    if (!message) return null;
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/10">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400 flex-1">{message}</p>
            <button onClick={onDismiss} className="text-red-400 hover:text-red-600 transition-colors">
                <X size={14} />
            </button>
        </div>
    );
}

export default function AdminCatalog() {
    const [searchQuery, setSearchQuery] = useState("");
    const { askDelete, target, loading: deleteLoading, confirm, cancel } = useDeleteStore();
    const { draft, clearDraft } = useDraftStore();

    const [categories, setCategories] = useState([]);
    const [families, setFamilies] = useState([]);
    const [showInactive, setShowInactive] = useState(false);
    const [editor, setEditor] = useState(null);
    const [restoreError, setRestoreError] = useState(null);

    async function refreshCatalog() {
        const [cats, fams] = await Promise.all([
            api.catalog.categorias({ includeInactive: showInactive }),
            api.catalog.familias({ includeInactive: showInactive }),
        ]);
        setCategories(cats);
        setFamilies(resolveImages(fams)); // ← fix imágenes locales
    }

    useEffect(() => { refreshCatalog().catch(console.error); }, [showInactive]);

    const filteredFamilies = useMemo(() => {
        const q = normalizeText(searchQuery).trim();
        return (families ?? []).filter((f) => {
            if (!q) return true;
            const flavorText = (f.flavors ?? []).map((fl) => `${fl.nameSuffix ?? ""} ${fl.description ?? ""}`).join(" ");
            const variantText = (f.flavors ?? []).flatMap((fl) => fl.variants ?? []).map((v) => `${v.slug ?? ""} ${v.label ?? ""}`).join(" ");
            return normalizeText(`${f.name} ${flavorText} ${variantText}`).includes(q);
        });
    }, [families, searchQuery]);

    // =========================
    // SAVE HANDLERS
    // =========================

    async function handleSaveCategory(payload) {
        try {
            if (editor?.data?.id) {
                await api.catalog.actualizarCategoria(editor.data.id, { name: payload.name, isActive: payload.isActive });
            } else {
                await api.catalog.crearCategoria({ slug: slugify(payload.name), name: payload.name, sortOrder: 0, isActive: payload.isActive });
            }
            setEditor(null);
            await refreshCatalog();
        } catch (e) {
            console.error(e);
            alert(String(e?.message ?? e));
        }
    }

    async function handleSaveProduct(family) {
        if (family.id) {
            await api.catalog.actualizarFamilia(family.id, {
                categoryId: family.categoryId,
                name: family.name?.trim(),
                imageUrl: family.imageUrl || null,
                sortOrder: Number(family.sortOrder ?? 0),
                isActive: family.isActive !== false,
                flavors: family.flavors.map((fl, fi) => ({
                    id: fl.id,
                    slug: fl.slug?.trim() || (fi === 0 ? "default" : `flavor-${fi + 1}`),
                    nameSuffix: fl.nameSuffix ?? "",
                    description: fl.description ?? "",
                    sortOrder: Number(fl.sortOrder ?? fi + 1),
                    isActive: fl.isActive !== false,
                    variants: fl.variants.map((v, vi) => ({
                        id: v.id,
                        slug: v.slug?.trim() || (fl.variants.length === 1 ? "unit" : `variant-${vi + 1}`),
                        label: v.label ?? "",
                        priceCents: Number(v.priceCents ?? 0),
                        currency: v.currency ?? "ARS",
                        imageUrl: v.imageUrl || null,
                        sortOrder: Number(v.sortOrder ?? vi + 1),
                        isActive: v.isActive !== false,
                    })),
                })),
            });
        } else {
            await api.catalog.crearFamilia({
                categoryId: family.categoryId,
                slug: family.slug?.trim() || slugify(family.name),
                name: family.name?.trim(),
                imageUrl: family.imageUrl || null,
                sortOrder: Number(family.sortOrder ?? 0),
                isActive: family.isActive !== false,
                flavors: family.flavors.map((fl, fi) => ({
                    slug: fl.slug?.trim() || (fi === 0 ? "default" : `flavor-${fi + 1}`),
                    nameSuffix: fl.nameSuffix ?? "",
                    description: fl.description ?? "",
                    sortOrder: Number(fl.sortOrder ?? fi + 1),
                    isActive: fl.isActive !== false,
                    variants: fl.variants.map((v, vi) => ({
                        slug: v.slug?.trim() || (fl.variants.length === 1 ? "unit" : `variant-${vi + 1}`),
                        label: v.label ?? "",
                        priceCents: Number(v.priceCents ?? 0),
                        currency: v.currency ?? "ARS",
                        imageUrl: v.imageUrl || null,
                        sortOrder: Number(v.sortOrder ?? vi + 1),
                        isActive: v.isActive !== false,
                    })),
                })),
            });
        }
        setEditor(null);
        await refreshCatalog();
    }

    // =========================
    // DELETE — soft
    // =========================

    const onDeleteCategory = (cat) => askDelete({
        type: "category", data: { id: cat.id },
        title: `Deshabilitar "${cat.name}"`,
        description: "Se deshabilitarán también todas sus familias, sabores y variantes.",
        onSuccess: refreshCatalog,
    });
    const onDeleteFamily = (family) => askDelete({
        type: "family", data: family,
        title: `Deshabilitar "${family.name}"`,
        description: "Se deshabilitarán también todos sus sabores y variantes.",
        onSuccess: refreshCatalog,
    });
    const onDeleteFlavor = (flavor) => askDelete({
        type: "flavor", data: flavor,
        title: `Deshabilitar sabor "${flavor.nameSuffix || "Default"}"`,
        description: "Se deshabilitarán también todas sus variantes.",
        onSuccess: refreshCatalog,
    });
    const onDeleteVariant = (variant) => askDelete({
        type: "variant", data: variant,
        title: `Deshabilitar variante "${variant.label || variant.slug}"`,
        onSuccess: refreshCatalog,
    });

    // =========================
    // DELETE — hard (definitivo)
    // =========================

    const onDeleteCategoryHard = (cat) => askDelete({
        type: "category",
        data: { id: cat.id },
        title: `Eliminar definitivamente "${cat.name}"`,
        description: "Se eliminará permanentemente con todas sus familias, sabores y variantes. Esta acción no se puede deshacer.",
        onConfirm: () => api.catalog.eliminarCategoriaHard(cat.id),
        onSuccess: refreshCatalog,
    });
    const onDeleteFamilyHard = (family) => askDelete({
        type: "family",
        data: family,
        title: `Eliminar definitivamente "${family.name}"`,
        description: "Se eliminará permanentemente con todos sus sabores y variantes. Esta acción no se puede deshacer.",
        onConfirm: () => api.catalog.eliminarFamiliaHard(family.id),
        onSuccess: refreshCatalog,
    });

    // =========================
    // RESTORE
    // =========================

    async function handleRestore(apiFn, id) {
        setRestoreError(null);
        try {
            await apiFn(id);
            await refreshCatalog();
        } catch (e) {
            setRestoreError(e?.message ?? "Error al rehabilitar");
        }
    }

    const onRestoreCategory = (cat)    => handleRestore(api.catalog.rehabilitarCategoria, cat.id);
    const onRestoreFamily   = (f)      => handleRestore(api.catalog.rehabilitarFamilia, f.id);
    const onRestoreFlavor   = (f)      => handleRestore(api.catalog.rehabilitarFlavor, f.id);
    const onRestoreVariant  = (v)      => handleRestore(api.catalog.rehabilitarVariant, v.id);

    function openProductEditor(family, initialStep = 0) {
        setEditor({ type: "product", data: family, initialStep });
    }

    const inactiveCount = families.filter((f) => !f.isActive).length;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-sm text-purple-600 font-medium">Admin</span>
                    <h1 className="text-2xl font-bold text-(--app-text)">Catálogo</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowInactive((v) => !v)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                            showInactive
                                ? "border-amber-300 bg-amber-50 text-amber-700"
                                : "border-(--app-border) text-(--app-muted) hover:border-amber-300 hover:text-amber-600"
                        }`}
                    >
                        <EyeOff size={14} />
                        <span>{showInactive ? "Ocultar deshabilitados" : "Ver deshabilitados"}</span>
                        {!showInactive && inactiveCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                                {inactiveCount}
                            </span>
                        )}
                    </button>
                    <Searcher value={searchQuery} onChange={setSearchQuery} />
                    <button
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                        onClick={() => setEditor({ type: "category" })}
                    >
                        Nueva categoría +
                    </button>
                </div>
            </div>

            {draft && (
                <DraftBanner
                    draft={draft}
                    onContinue={() => setEditor({ type: "product" })}
                    onDiscard={clearDraft}
                />
            )}

            <ErrorBanner message={restoreError} onDismiss={() => setRestoreError(null)} />

            {showInactive && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50">
                    <EyeOff size={14} className="text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                        Estás viendo elementos deshabilitados. No aparecen en el menú ni en las órdenes.
                        El ícono <strong>↺</strong> rehabilita, el 🗑 elimina definitivamente.
                    </p>
                </div>
            )}

            <CategoryExpandableTable
                categories={categories}
                families={filteredFamilies}
                showInactive={showInactive}
                onCreateFamily={(categoryId) => setEditor({ type: "product", data: { categoryId }, initialStep: 0 })}
                onEditCategory={(cat) => setEditor({ type: "category", data: { id: cat.id, name: cat.name, isActive: cat.active } })}
                onEditFamily={(family) => openProductEditor(family, 0)}
                onCreateFlavor={(familyId) => {
                    const fam = families.find((f) => f.id === familyId);
                    openProductEditor(fam, 1);
                }}
                onEditFlavor={(flavor) => {
                    const fam = families.find((f) => f.id === flavor.familyId);
                    openProductEditor(fam, 1);
                }}
                onCreateVariant={(flavorId) => {
                    const fam = families.find((f) => f.flavors?.some((fl) => fl.id === flavorId));
                    openProductEditor(fam, 2);
                }}
                onEditVariant={(variant) => {
                    const fam = families.find((f) => f.flavors?.some((fl) => fl.variants?.some((v) => v.id === variant.id)));
                    openProductEditor(fam, 2);
                }}
                onDeleteCategory={onDeleteCategory}
                onDeleteCategoryHard={onDeleteCategoryHard}
                onRestoreCategory={onRestoreCategory}
                onDeleteFamily={onDeleteFamily}
                onDeleteFamilyHard={onDeleteFamilyHard}
                onDeleteFlavor={onDeleteFlavor}
                onDeleteVariant={onDeleteVariant}
                onRestoreFamily={onRestoreFamily}
                onRestoreFlavor={onRestoreFlavor}
                onRestoreVariant={onRestoreVariant}
            />

            <CategoryModal
                open={editor?.type === "category"}
                initialData={editor?.data}
                onClose={() => setEditor(null)}
                onSave={handleSaveCategory}
            />

            <ProductWizardModal
                open={editor?.type === "product"}
                initialData={editor?.data}
                initialStep={editor?.initialStep ?? 0}
                categories={categories}
                onClose={() => setEditor(null)}
                onSave={handleSaveProduct}
            />

            <ConfirmDeleteModal
                open={!!target}
                title={target?.title}
                description={target?.description}
                loading={deleteLoading}
                onClose={cancel}
                onConfirm={confirm}
            />
        </div>
    );
}