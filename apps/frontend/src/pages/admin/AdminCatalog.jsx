import { useState, useEffect, useMemo } from "react";
import Searcher from "../../components/items/Searcher";
import { useUIStore } from "../../store/uiStore";
import CategoryExpandableTable from "../../components/admin/catalog/CategoryExpandableTable";
import slugify from "slugify";
import CategoryModal from "../../components/admin/catalog/modals/CategoryModal";
import FamilyModal from "../../components/admin/catalog/modals/FamilyModal";
import FlavorModal from "../../components/admin/catalog/modals/FlavorModal";
import VariantModal from "../../components/admin/catalog/modals/VariantModal";

import { api } from "../../lib/api";

const normalizeText = (text) =>
    (text ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function tmpId(prefix = "tmp") {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}


export default function AdminCatalog() {
    const { activeCategoryId, searchQuery, setSearchQuery } = useUIStore();

    const [categories, setCategories] = useState([]);
    const [families, setFamilies] = useState([]);

    // Editor centralizado
    const [editor, setEditor] = useState(null);
    /*
      editor:
      null
      { type: "category", data? }
      { type: "family", data? }                      // data puede venir con categoryId
      { type: "flavor", familyId, data? }
      { type: "variant", flavorId, data? }
    */


    function slugify(text) {
        return (text ?? "")
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }

    async function refreshCatalog() {
        const [cats, fams] = await Promise.all([
            api.catalog.categorias(),
            api.catalog.familias(),
        ]);
        setCategories(cats);
        setFamilies(fams);
    }

    useEffect(() => {
        refreshCatalog().catch(console.error);
    }, []);

    const filteredFamilies = useMemo(() => {
        const q = normalizeText(searchQuery).trim();

        return (families ?? [])
            .filter((f) => f.isActive !== false)
            .filter((f) => (activeCategoryId === "all" ? true : f.categoryId === activeCategoryId))
            .filter((f) => {
                if (!q) return true;

                const flavorText = (f.flavors ?? [])
                    .map((fl) => `${fl.nameSuffix ?? ""} ${fl.description ?? ""}`)
                    .join(" ");

                const variantText = (f.flavors ?? [])
                    .flatMap((fl) => fl.variants ?? [])
                    .map((v) => `${v.slug ?? ""} ${v.label ?? ""}`)
                    .join(" ");

                const hay = normalizeText(`${f.name} ${flavorText} ${variantText}`);
                return hay.includes(q);
            });
    }, [families, activeCategoryId, searchQuery]);

    // =========================
    // SAVE HANDLERS
    // =========================

    async function handleSaveCategory(payload) {
        try {
            const dto = {
                slug: payload.slug?.trim() || slugify(payload.name),
                name: payload.name?.trim(),
                sortOrder: Number(payload.sortOrder ?? 0),
                isActive: payload.isActive !== false,
            };

            console.log("POST /categorias payload:", dto);
            await api.catalog.crearCategoria(dto);

            setEditor(null);
            await refreshCatalog();
        } catch (e) {
            console.error("crearCategoria error:", e);
            alert(String(e?.message ?? e));
        }
    }

    async function handleSaveFamily(payload) {
        try {
            const dto = {
                categoryId: payload.categoryId,
                slug: payload.slug?.trim() || slugify(payload.name),
                name: payload.name?.trim(),
                imageUrl: payload.imageUrl || null,
                sortOrder: Number(payload.sortOrder ?? 0),
                isActive: payload.isActive !== false,

                // 👇 payload mínimo para que NO falle si el DTO exige flavors/variants
                flavors: [
                    {
                        slug: "default",
                        nameSuffix: "",
                        description: "",
                        sortOrder: 1,
                        isActive: true,
                        variants: [
                            {
                                slug: "unit",
                                label: "",
                                priceCents: Number(payload.basePriceCents ?? 0),
                                currency: "ARS",
                                imageUrl: payload.imageUrl || null,
                                sortOrder: 1,
                                isActive: true,
                            },
                        ],
                    },
                ],
            };

            console.log("POST /api/catalogo/familias", dto);
            await api.catalog.crearFamilia(dto);

            setEditor(null);
            await refreshCatalog();
        } catch (e) {
            console.error("crearFamilia error:", e);
            alert(String(e?.message ?? e));
        }
    }

    async function handleSaveFlavor(payload) {
        // No hay endpoint de crear/edit flavor.
        // Reflejo local en UI (NO persiste en BD)
        const { familyId, nameSuffix, description } = payload;

        setFamilies((prev) =>
            (prev ?? []).map((fam) => {
                if (fam.id !== familyId) return fam;

                const flavors = Array.isArray(fam.flavors) ? fam.flavors : [];
                const newFlavor = {
                    id: tmpId("flavor"),
                    familyId,
                    slug: tmpId("slug"),
                    nameSuffix: nameSuffix ?? "",
                    description: description ?? "",
                    isActive: true,
                    sortOrder: flavors.length + 1,
                    variants: [],
                };

                return { ...fam, flavors: [...flavors, newFlavor] };
            })
        );

        setEditor(null);
    }

    async function handleSaveVariant(payload) {
        // No hay endpoint de crear/edit variant.
        // Reflejo local en UI (NO persiste en BD)
        const { flavorId, label, priceCents, imageUrl } = payload;

        setFamilies((prev) =>
            (prev ?? []).map((fam) => {
                const flavors = Array.isArray(fam.flavors) ? fam.flavors : [];
                let touched = false;

                const nextFlavors = flavors.map((fl) => {
                    if (fl.id !== flavorId) return fl;

                    touched = true;
                    const variants = Array.isArray(fl.variants) ? fl.variants : [];
                    const newVariant = {
                        id: tmpId("variant"),
                        flavorId,
                        slug: tmpId("slug"),
                        label: label ?? "",
                        priceCents: Number(priceCents ?? 0),
                        currency: "ARS",
                        imageUrl: imageUrl ?? "",
                        isActive: true,
                        sortOrder: variants.length + 1,
                    };

                    return { ...fl, variants: [...variants, newVariant] };
                });

                return touched ? { ...fam, flavors: nextFlavors } : fam;
            })
        );

        setEditor(null);
    }

    // =========================
    // Modal props helpers
    // =========================

    const selectedFamilyForModal =
        editor?.type === "family" ? editor.data ?? null : null;

    const flavorsForFamilyModal =
        selectedFamilyForModal?.flavors ?? [];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-sm text-purple-600 font-medium">Admin</span>
                    <h1 className="text-2xl font-bold text-(--app-text)">Catálogo</h1>
                </div>

                <div className="flex items-center gap-3">
                    <Searcher value={searchQuery} onChange={setSearchQuery} />
                    <button
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                        onClick={() => setEditor({ type: "category" })}
                    >
                        Nueva categoría +
                    </button>
                </div>
            </div>

            {/* Tabla */}
            <CategoryExpandableTable
                categories={categories}
                families={filteredFamilies}
                onCreateFamily={(categoryId) =>
                    setEditor({ type: "family", data: { categoryId } })
                }
                onEditFamily={(family) =>
                    setEditor({ type: "family", data: family })
                }
                onCreateFlavor={(familyId) =>
                    setEditor({ type: "flavor", familyId })
                }
                onEditFlavor={(flavor) =>
                    setEditor({ type: "flavor", data: flavor, familyId: flavor.familyId })
                }
                onCreateVariant={(flavorId) =>
                    setEditor({ type: "variant", flavorId })
                }
                onEditVariant={(variant) =>
                    setEditor({ type: "variant", data: variant, flavorId: variant.flavorId })
                }
            />

            {/* Modales */}
            {editor?.type === "category" && (
                <CategoryModal
                    open
                    initialData={editor.data}
                    onClose={() => setEditor(null)}
                    onSave={handleSaveCategory}
                />
            )}

            {editor?.type === "family" && (
                <FamilyModal
                    open
                    categories={categories}
                    initialData={editor.data}
                    flavors={flavorsForFamilyModal}
                    onClose={() => setEditor(null)}
                    onSave={handleSaveFamily}
                />
            )}

            {editor?.type === "flavor" && (
                <FlavorModal
                    open
                    familyId={editor.familyId}
                    initialData={editor.data}
                    onClose={() => setEditor(null)}
                    onSave={handleSaveFlavor}
                />
            )}

            {editor?.type === "variant" && (
                <VariantModal
                    open
                    flavorId={editor.flavorId}
                    initialData={editor.data}
                    onClose={() => setEditor(null)}
                    onSave={handleSaveVariant}
                />
            )}
        </div>
    );
}