// src/components/admin/catalog/modals/ProductWizardModal.jsx
import { useState, useEffect } from "react";
import {
    Package, Layers, DollarSign, ChevronRight, ChevronLeft,
    Plus, Trash2, Check, BookmarkCheck, AlertTriangle,
} from "lucide-react";
import {
    normalizeFamilyForForm, validateFamilyForSave,
    addFlavor, removeFlavor, addVariant, removeVariant,
} from "../helpers/familyForm.helpers";
import { useDraftStore } from "../../../../store/draftStore";

// ─── Helpers ───────────────────────────────────────────────────────────────

function moneyDisplay(cents) {
    return (Number(cents ?? 0) / 100).toLocaleString("es-AR", {
        style: "currency", currency: "ARS", minimumFractionDigits: 0,
    });
}

function hasMeaningfulData(family) {
    if (!family) return false;
    return (
        (family.name ?? "").trim().length > 0 ||
        (family.categoryId ?? "").length > 0 ||
        (family.imageUrl ?? "").trim().length > 0 ||
        family.flavors?.some(
            (fl) =>
                (fl.nameSuffix ?? "").trim().length > 0 ||
                fl.variants?.some((v) => v.priceCents > 0 || (v.label ?? "").trim().length > 0)
        )
    );
}

function Field({ label, hint, children }) {
    return (
        <div className="space-y-1">
            <div className="flex items-baseline justify-between">
                <label className="text-xs font-medium text-(--app-muted)">{label}</label>
                {hint && <span className="text-xs text-(--app-muted) opacity-60">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

function Input({ className = "", ...props }) {
    return (
        <input
            className={`w-full px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-bg) text-(--app-text) text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all placeholder:text-(--app-muted) ${className}`}
            {...props}
        />
    );
}

function Toggle({ value, onChange, label }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
                onClick={() => onChange(!value)}
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${value ? "bg-purple-600" : "bg-(--app-border)"}`}
            >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-(--app-text)">{label}</span>
        </label>
    );
}

function DiscardConfirm({ onKeep, onDiscard, onSaveDraft, isEdit }) {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-(--app-surface)/95 backdrop-blur-sm">
            <div className="text-center space-y-4 px-8">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                    <AlertTriangle size={22} className="text-amber-500" />
                </div>
                <div className="space-y-1">
                    <p className="font-semibold text-(--app-text) text-sm">¿Descartás los cambios?</p>
                    <p className="text-xs text-(--app-muted) leading-relaxed">
                        {isEdit
                            ? "Los cambios no guardados se perderán."
                            : "Tenés cambios sin guardar. Podés guardar como borrador para continuar después."
                        }
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    {!isEdit && (
                        <button onClick={onSaveDraft} className="w-full px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                            <BookmarkCheck size={14} /> Guardar borrador y cerrar
                        </button>
                    )}
                    <button onClick={onKeep} className="w-full px-4 py-2 rounded-lg border border-(--app-border) text-sm font-medium text-(--app-text) hover:bg-(--app-bg) transition-colors">
                        Seguir editando
                    </button>
                    <button onClick={onDiscard} className="w-full px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                        Descartar y cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

const STEPS = [
    { icon: Package,    label: "Producto" },
    { icon: Layers,     label: "Sabores"  },
    { icon: DollarSign, label: "Precios"  },
];

function StepIndicator({ current, isEdit, onGoTo }) {
    return (
        <div className="flex items-center">
            {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i < current;
                const active = i === current;
                // En edición todos los pasos son navegables
                const clickable = isEdit && i !== current;
                return (
                    <div key={i} className="flex items-center">
                        <div
                            onClick={() => clickable && onGoTo(i)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                active   ? "bg-purple-600 text-white" :
                                done     ? "bg-purple-100 text-purple-600" :
                                           "text-(--app-muted)"
                            } ${clickable ? "cursor-pointer hover:bg-purple-50" : ""}`}
                        >
                            {done && !active ? <Check size={12} /> : <Icon size={12} />}
                            <span>{step.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`w-6 h-px mx-1 ${i < current ? "bg-purple-300" : "bg-(--app-border)"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Paso 1 ────────────────────────────────────────────────────────────────

function StepProducto({ family, onChange, categories }) {
    const set = (key, val) => onChange({ ...family, [key]: val });
    return (
        <div className="space-y-4">
            <p className="text-sm text-(--app-muted)">
                Empezá por lo básico: cómo se llama el producto y a qué categoría pertenece.
            </p>
            <Field label="Categoría" hint="obligatorio">
                <select
                    className="w-full px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-bg) text-(--app-text) text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
                    value={family.categoryId}
                    onChange={(e) => set("categoryId", e.target.value)}
                >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </Field>
            <Field label="Nombre del producto" hint="obligatorio">
                <Input
                    autoFocus
                    placeholder="Ej: Hamburguesa Clásica, Coca Cola..."
                    value={family.name}
                    onChange={(e) => set("name", e.target.value)}
                />
            </Field>
            <Field label="Imagen por defecto" hint="se usa si las variantes no tienen imagen propia">
                <div className="flex gap-2">
                    <Input
                        placeholder="https://..."
                        value={family.imageUrl}
                        onChange={(e) => set("imageUrl", e.target.value)}
                    />
                    {family.imageUrl && (
                        <img src={family.imageUrl} alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-(--app-border) flex-shrink-0"
                            onError={(e) => { e.target.style.display = "none"; }}
                        />
                    )}
                </div>
            </Field>
            <Toggle value={family.isActive} onChange={(v) => set("isActive", v)} label="Producto activo (visible en el menú)" />
        </div>
    );
}

// ─── Paso 2 ────────────────────────────────────────────────────────────────

function StepSabores({ family, onChange }) {
    const hasMultiple = family.flavors.length > 1;
    return (
        <div className="space-y-4">
            <p className="text-sm text-(--app-muted)">
                {hasMultiple
                    ? "Este producto tiene múltiples sabores. Podés nombrar cada uno."
                    : "Si el producto tiene un solo tipo, podés dejar el nombre vacío."
                }
            </p>
            <div className="space-y-3">
                {family.flavors.map((flavor, fi) => (
                    <div key={fi} className="rounded-xl border border-(--app-border) bg-(--app-bg) p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-(--app-muted) uppercase tracking-wide">
                                {hasMultiple ? `Sabor ${fi + 1}` : "Sabor / Tipo"}
                            </span>
                            {family.flavors.length > 1 && (
                                <button onClick={() => onChange(removeFlavor(family, fi))} className="text-(--app-muted) hover:text-red-500 transition-colors">
                                    <Trash2 size={13} />
                                </button>
                            )}
                        </div>
                        <Field label="Nombre del sabor" hint="ej: Clásica, BBQ, Sin TACC...">
                            <Input
                                placeholder={hasMultiple ? "Nombre del sabor..." : "Dejá vacío si no aplica"}
                                value={flavor.nameSuffix}
                                onChange={(e) => {
                                    const next = { ...family, flavors: [...family.flavors] };
                                    next.flavors[fi] = { ...next.flavors[fi], nameSuffix: e.target.value };
                                    onChange(next);
                                }}
                            />
                        </Field>
                        <Field label="Descripción" hint="opcional">
                            <textarea
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-surface) text-(--app-text) text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all resize-none placeholder:text-(--app-muted)"
                                placeholder="Ingredientes, info adicional..."
                                value={flavor.description}
                                onChange={(e) => {
                                    const next = { ...family, flavors: [...family.flavors] };
                                    next.flavors[fi] = { ...next.flavors[fi], description: e.target.value };
                                    onChange(next);
                                }}
                            />
                        </Field>
                    </div>
                ))}
            </div>
            <button
                onClick={() => onChange(addFlavor(family))}
                className="w-full py-2.5 rounded-xl border border-dashed border-(--app-border) text-sm text-(--app-muted) hover:border-purple-400 hover:text-purple-600 transition-all flex items-center justify-center gap-2"
            >
                <Plus size={14} /> Agregar otro sabor
            </button>
        </div>
    );
}

// ─── Paso 3 ────────────────────────────────────────────────────────────────

function StepVariantes({ family, onChange }) {
    const saboresConVariantes = family.flavors
        .map((fl, i) => ({ fl, i }))
        .filter(({ fl }) => fl.variants?.some((v) => (v.label ?? "").trim().length > 0 || v.priceCents > 0));

    function copyVariantsFrom(sourceFi, targetFi) {
        const source = family.flavors[sourceFi];
        const next = { ...family, flavors: [...family.flavors] };
        next.flavors[targetFi] = {
            ...next.flavors[targetFi],
            variants: source.variants.map((v) => ({ ...v, id: undefined, priceCents: 0 })),
        };
        onChange(next);
    }

    return (
        <div className="space-y-5">
            <p className="text-sm text-(--app-muted)">
                Cada variante tiene su precio y puede tener su propia imagen para el menú.
            </p>
            {family.flavors.map((flavor, fi) => {
                const copiables = saboresConVariantes.filter(({ i }) => i !== fi);
                return (
                    <div key={fi} className="space-y-3">
                        {family.flavors.length > 1 && (
                            <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-(--app-border)" />
                                <span className="text-xs font-semibold text-(--app-muted) uppercase tracking-wide px-2">
                                    {flavor.nameSuffix || `Sabor ${fi + 1}`}
                                </span>
                                <div className="h-px flex-1 bg-(--app-border)" />
                            </div>
                        )}
                        {copiables.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-(--app-muted)">Copiar estructura de:</span>
                                {copiables.map(({ fl, i }) => (
                                    <button key={i} onClick={() => copyVariantsFrom(i, fi)}
                                        className="px-2.5 py-1 rounded-lg border border-(--app-border) text-xs text-(--app-muted) hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all">
                                        {fl.nameSuffix || `Sabor ${i + 1}`}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="space-y-2">
                            {flavor.variants.map((variant, vi) => {
                                const updateVariant = (patch) => {
                                    const next = { ...family, flavors: [...family.flavors] };
                                    next.flavors[fi] = { ...next.flavors[fi], variants: [...next.flavors[fi].variants] };
                                    next.flavors[fi].variants[vi] = { ...variant, ...patch };
                                    onChange(next);
                                };
                                return (
                                    <div key={vi} className="rounded-xl border border-(--app-border) bg-(--app-bg) overflow-hidden">
                                        <div className="flex items-center gap-3 p-3">
                                            <div className="w-9 h-9 rounded-lg border border-(--app-border) bg-(--app-surface) flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                {variant.imageUrl ? (
                                                    <img src={variant.imageUrl} alt="" className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = "none"; }} />
                                                ) : (
                                                    <span className="text-xs text-(--app-muted) select-none">img</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Input
                                                    placeholder={flavor.variants.length === 1 ? "Presentación (opcional)" : "Ej: Simple, Doble..."}
                                                    value={variant.label}
                                                    onChange={(e) => updateVariant({ label: e.target.value })}
                                                />
                                            </div>
                                            <div className="w-32 flex-shrink-0 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-(--app-muted)">$</span>
                                                <Input type="number" min="0" className="pl-7" placeholder="0"
                                                    value={variant.priceCents === 0 ? "" : variant.priceCents / 100}
                                                    onChange={(e) => updateVariant({ priceCents: Math.round(Number(e.target.value || 0) * 100) })}
                                                />
                                            </div>
                                            {flavor.variants.length > 1 && (
                                                <button onClick={() => onChange(removeVariant(family, fi, vi))} className="text-(--app-muted) hover:text-red-500 transition-colors flex-shrink-0">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="px-3 pb-3 flex items-center gap-2">
                                            <div className="w-9 flex-shrink-0 text-center">
                                                <span className="text-xs text-(--app-muted)">🖼</span>
                                            </div>
                                            <Input
                                                placeholder="URL de imagen para esta variante (opcional)"
                                                value={variant.imageUrl ?? ""}
                                                onChange={(e) => updateVariant({ imageUrl: e.target.value || null })}
                                                className="text-xs py-1.5"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={() => onChange(addVariant(family, fi))}
                            className="w-full py-2 rounded-xl border border-dashed border-(--app-border) text-xs text-(--app-muted) hover:border-purple-400 hover:text-purple-600 transition-all flex items-center justify-center gap-1.5">
                            <Plus size={12} /> Agregar variante
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

function Resumen({ family, categories }) {
    const cat = categories.find((c) => c.id === family.categoryId);
    return (
        <div className="rounded-xl border border-(--app-border) bg-(--app-bg) p-4 space-y-3">
            <div className="flex items-center gap-3">
                {family.imageUrl && <img src={family.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                <div>
                    <p className="font-semibold text-(--app-text)">{family.name || "Sin nombre"}</p>
                    <p className="text-xs text-(--app-muted)">{cat?.name ?? "Sin categoría"}</p>
                </div>
            </div>
            <div className="space-y-1">
                {family.flavors.map((fl, fi) => (
                    <div key={fi} className="flex items-start gap-2 text-sm">
                        {fl.nameSuffix && <span className="font-medium text-(--app-text) flex-shrink-0">{fl.nameSuffix} —</span>}
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {fl.variants.map((v, vi) => (
                                <div key={vi} className="flex items-center gap-1.5">
                                    {v.imageUrl && <img src={v.imageUrl} alt="" className="w-5 h-5 rounded object-cover" />}
                                    <span className="text-(--app-muted)">{v.label || "unidad"} {moneyDisplay(v.priceCents)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Modal principal ───────────────────────────────────────────────────────

export default function ProductWizardModal({
    open,
    onClose,
    onSave,
    categories = [],
    initialData = null,
    initialStep = 0,   // ← nuevo: permite abrir directo en paso 1 (sabores) o 2 (precios)
}) {
    const isEdit = !!initialData?.id;
    const { draft, saveDraft, clearDraft } = useDraftStore();

    const [step, setStep] = useState(0);
    const [family, setFamily] = useState(() => normalizeFamilyForForm(null));
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);

    useEffect(() => {
        if (!open) return;
        setShowDiscard(false);
        setError(null);
        if (!isEdit && draft) {
            setFamily(normalizeFamilyForForm(draft.family));
            setStep(draft.step ?? 0);
        } else {
            setFamily(normalizeFamilyForForm(initialData));
            // En edición, abrir en el paso que corresponde al contexto
            setStep(isEdit ? (initialStep ?? 0) : 0);
        }
    }, [open]);

    useEffect(() => {
        if (!open || isEdit || !hasMeaningfulData(family)) return;
        saveDraft(family, step);
    }, [family, step]);

    function validateStep(s) {
        if (s === 0) {
            if (!family.name.trim()) return "El nombre del producto es obligatorio.";
            if (!family.categoryId) return "Seleccioná una categoría.";
        }
        if (s === 2) {
            const r = validateFamilyForSave(family);
            if (!r.ok) return r.message;
        }
        return null;
    }

    function handleNext() {
        const err = validateStep(step);
        if (err) return setError(err);
        setError(null);
        setStep((s) => s + 1);
    }

    function handleAttemptClose() {
        if (hasMeaningfulData(family)) {
            setShowDiscard(true);
        } else {
            if (!isEdit) clearDraft();
            onClose();
        }
    }

    function handleForceDiscard() {
        if (!isEdit) clearDraft();
        setShowDiscard(false);
        onClose();
    }

    function handleSaveDraftAndClose() {
        saveDraft(family, step);
        setShowDiscard(false);
        onClose();
    }

    async function handleSave() {
        const err = validateStep(step === STEPS.length - 1 ? 2 : step);
        if (err) return setError(err);
        // En edición podemos guardar desde cualquier paso
        if (isEdit) {
            const fullErr = validateStep(0) ?? validateStep(2);
            if (fullErr) return setError(fullErr);
        }
        setSaving(true);
        setError(null);
        try {
            await onSave(family);
            if (!isEdit) clearDraft();
        } catch (e) {
            setError(e?.message ?? "Error al guardar");
        } finally {
            setSaving(false);
        }
    }

    if (!open) return null;

    const isLastStep = step === STEPS.length - 1;
    const hasData = hasMeaningfulData(family);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleAttemptClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative z-10 bg-(--app-surface) border border-(--app-border) rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
                style={{ maxHeight: "90vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                {showDiscard && (
                    <DiscardConfirm
                        isEdit={isEdit}
                        onKeep={() => setShowDiscard(false)}
                        onDiscard={handleForceDiscard}
                        onSaveDraft={handleSaveDraftAndClose}
                    />
                )}

                <div className="px-6 pt-6 pb-4 border-b border-(--app-border) flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-semibold text-(--app-text)">
                                {isEdit ? `Editando: ${family.name || "producto"}` : "Nuevo producto"}
                            </h2>
                            {isEdit && (
                                <p className="text-xs text-(--app-muted)">
                                    Podés navegar entre pasos tocando los indicadores
                                </p>
                            )}
                        </div>
                        <button onClick={handleAttemptClose} className="text-(--app-muted) hover:text-(--app-text) transition-colors text-lg leading-none">×</button>
                    </div>
                    <StepIndicator current={step} isEdit={isEdit} onGoTo={(i) => { setError(null); setStep(i); }} />
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {step === 0 && <StepProducto family={family} onChange={setFamily} categories={categories} />}
                    {step === 1 && <StepSabores family={family} onChange={setFamily} />}
                    {step === 2 && (
                        <div className="space-y-5">
                            <StepVariantes family={family} onChange={setFamily} />
                            {!isEdit && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-(--app-muted) uppercase tracking-wide">Resumen</p>
                                    <Resumen family={family} categories={categories} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-(--app-border) flex-shrink-0 space-y-3">
                    {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                    {!isEdit && hasData && (
                        <button onClick={handleSaveDraftAndClose}
                            className="w-full py-2 rounded-lg border border-(--app-border) text-xs text-(--app-muted) hover:border-purple-400 hover:text-purple-600 transition-all flex items-center justify-center gap-1.5">
                            <BookmarkCheck size={13} /> Guardar borrador y cerrar
                        </button>
                    )}

                    <div className="flex gap-3">
                        {/* En edición: botón guardar disponible en todos los pasos */}
                        {isEdit ? (
                            <>
                                {step > 0 && (
                                    <button onClick={() => { setError(null); setStep((s) => s - 1); }} disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-(--app-border) text-sm font-medium text-(--app-muted) hover:bg-(--app-bg) transition-colors disabled:opacity-50">
                                        <ChevronLeft size={14} /> Atrás
                                    </button>
                                )}
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                                    {saving
                                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        : <><Check size={14} /> Guardar cambios</>
                                    }
                                </button>
                                {step < STEPS.length - 1 && (
                                    <button onClick={() => { setError(null); setStep((s) => s + 1); }} disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-(--app-border) text-sm font-medium text-(--app-muted) hover:bg-(--app-bg) transition-colors disabled:opacity-50">
                                        Siguiente <ChevronRight size={14} />
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                {step > 0 ? (
                                    <button onClick={() => { setError(null); setStep((s) => s - 1); }} disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-(--app-border) text-sm font-medium text-(--app-muted) hover:bg-(--app-bg) transition-colors disabled:opacity-50">
                                        <ChevronLeft size={14} /> Atrás
                                    </button>
                                ) : (
                                    <button onClick={handleAttemptClose} disabled={saving}
                                        className="px-4 py-2 rounded-lg border border-(--app-border) text-sm font-medium text-(--app-muted) hover:bg-(--app-bg) transition-colors disabled:opacity-50">
                                        Cancelar
                                    </button>
                                )}
                                <button onClick={isLastStep ? handleSave : handleNext} disabled={saving}
                                    className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                                    {saving
                                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        : isLastStep
                                            ? <><Check size={14} /> Crear producto</>
                                            : <>Siguiente <ChevronRight size={14} /></>
                                    }
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}