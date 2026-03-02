// src/features/catalog/helpers/familyForm.helpers.js

/**
 * Shape editable (MVP)
 * - Mantiene el mismo árbol que Prisma/API: Family -> Flavors -> Variants
 * - Los ids son opcionales: si existen => edición; si no existen => creación
 */

/** @returns {EditableVariant} */
export function createEmptyVariant() {
    return {
        id: undefined,
        slug: "unit", 
        label: "",
        priceCents: 0,
        currency: "ARS",
        imageUrl: "",
        isActive: true,
        sortOrder: 1,
    };
}

/** @returns {EditableFlavor} */
export function createEmptyFlavor() {
    return {
        id: undefined,
        slug: "default",
        nameSuffix: "",
        description: "",
        isActive: true,
        sortOrder: 1,
        variants: [createEmptyVariant()],
    };
}

/** @returns {EditableFamily} */
export function createEmptyFamily() {
    return {
        id: undefined,
        categoryId: "",
        slug: "",
        name: "",
        imageUrl: "",
        isActive: true,
        sortOrder: 1,
        flavors: [createEmptyFlavor()],
    };
}

/**
 * Map API -> Editable (evita null/undefined en inputs)
 * @param {any} family
 * @returns {EditableFamily}
 */
export function mapFamilyFromApi(family) {
    return {
        id: family?.id,
        categoryId: family?.categoryId ?? "",
        slug: family?.slug ?? "",
        name: family?.name ?? "",
        imageUrl: family?.imageUrl ?? "",
        isActive: family?.isActive !== false,
        sortOrder: Number(family?.sortOrder ?? 1),
        flavors: (family?.flavors ?? []).map((fl, i) => ({
            id: fl?.id,
            slug: fl?.slug ?? `flavor-${i + 1}`,
            nameSuffix: fl?.nameSuffix ?? "",
            description: fl?.description ?? "",
            isActive: fl?.isActive !== false,
            sortOrder: Number(fl?.sortOrder ?? i + 1),
            variants: (fl?.variants ?? []).map((v, j) => ({
                id: v?.id,
                slug: v?.slug ?? `variant-${j + 1}`,
                label: v?.label ?? "",
                priceCents: Number(v?.priceCents ?? 0),
                currency: v?.currency ?? "ARS",
                imageUrl: v?.imageUrl ?? "",
                isActive: v?.isActive !== false,
                sortOrder: Number(v?.sortOrder ?? j + 1),
            })),
        })),
    };
}

/**
 * Asegura invariantes mínimas para no romper el UI:
 * - Al menos 1 flavor
 * - Cada flavor al menos 1 variant
 * - sortOrder consistente
 * @param {EditableFamily} family
 * @returns {EditableFamily}
 */
export function normalizeFamilyForForm(family) {
    const f = family ? structuredCloneSafe(family) : createEmptyFamily();

    if (!Array.isArray(f.flavors) || f.flavors.length === 0) {
        f.flavors = [createEmptyFlavor()];
    }

    f.flavors = f.flavors.map((fl, i) => {
        const nfl = { ...fl };
        nfl.slug = (nfl.slug ?? "").trim() || (i === 0 ? "default" : `flavor-${i + 1}`);
        nfl.nameSuffix = nfl.nameSuffix ?? "";
        nfl.description = nfl.description ?? "";
        nfl.isActive = nfl.isActive !== false;
        nfl.sortOrder = Number(nfl.sortOrder ?? i + 1);

        if (!Array.isArray(nfl.variants) || nfl.variants.length === 0) {
            nfl.variants = [createEmptyVariant()];
        }

        nfl.variants = nfl.variants.map((v, j) => {
            const nv = { ...v };
            nv.slug = (nv.slug ?? "").trim() || (nfl.variants.length === 1 ? "unit" : `variant-${j + 1}`);
            nv.label = nv.label ?? "";
            nv.priceCents = Number(nv.priceCents ?? 0);
            nv.currency = (nv.currency ?? "ARS") || "ARS";
            nv.imageUrl = nv.imageUrl ?? "";
            nv.isActive = nv.isActive !== false;
            nv.sortOrder = Number(nv.sortOrder ?? j + 1);
            return nv;
        });

        return nfl;
    });

    f.categoryId = f.categoryId ?? "";
    f.slug = f.slug ?? "";
    f.name = f.name ?? "";
    f.imageUrl = f.imageUrl ?? "";
    f.isActive = f.isActive !== false;
    f.sortOrder = Number(f.sortOrder ?? 1);

    return f;
}

/**
 * Validación MVP (objetiva y mínima)
 * @param {EditableFamily} family
 * @returns {{ok: true} | {ok:false, message:string}}
 */
export function validateFamilyForSave(family) {
    const name = (family?.name ?? "").trim();
    if (!name) return { ok: false, message: "El nombre del producto es obligatorio." };

    const categoryId = (family?.categoryId ?? "").trim();
    if (!categoryId) return { ok: false, message: "Debe seleccionar una categoría." };

    const flavors = family?.flavors ?? [];
    if (!flavors.length) return { ok: false, message: "Debe existir al menos un sabor." };

    for (let i = 0; i < flavors.length; i++) {
        const fl = flavors[i];
        const variants = fl?.variants ?? [];
        if (!variants.length) {
            return { ok: false, message: `El sabor #${i + 1} debe tener al menos una variante.` };
        }

        // evita duplicados de slug en un mismo flavor (unique [flavorId, slug])
        const seen = new Set();
        for (let j = 0; j < variants.length; j++) {
            const v = variants[j];
            const slug = (v?.slug ?? "").trim();
            if (!slug) return { ok: false, message: `Variante #${j + 1} del sabor #${i + 1} requiere slug.` };
            if (seen.has(slug)) {
                return { ok: false, message: `Slug duplicado "${slug}" en el sabor #${i + 1}.` };
            }
            seen.add(slug);

            const price = Number(v?.priceCents ?? 0);
            if (!(price > 0)) {
                return { ok: false, message: `Precio inválido en variante "${v?.label || v?.slug}" (sabor #${i + 1}).` };
            }
        }
    }

    return { ok: true };
}

/**
 * Mutators puros (para usar con setState)
 * Devuelven un nuevo objeto family listo para setFamily(...)
 */

export function addFlavor(family) {
    const f = normalizeFamilyForForm(family);
    const next = structuredCloneSafe(f);
    next.flavors.push({
        ...createEmptyFlavor(),
        sortOrder: next.flavors.length + 1,
        slug: `flavor-${next.flavors.length + 1}`,
    });
    return next;
}

export function removeFlavor(family, flavorIndex) {
    const f = normalizeFamilyForForm(family);
    const next = structuredCloneSafe(f);

    // MVP: no permitir 0 sabores
    if (next.flavors.length <= 1) return next;

    next.flavors.splice(flavorIndex, 1);
    next.flavors = next.flavors.map((fl, i) => ({ ...fl, sortOrder: i + 1 }));
    return next;
}

export function addVariant(family, flavorIndex) {
    const f = normalizeFamilyForForm(family);
    const next = structuredCloneSafe(f);

    const fl = next.flavors[flavorIndex];
    if (!fl) return next;

    fl.variants.push({
        ...createEmptyVariant(),
        sortOrder: fl.variants.length + 1,
        slug: `variant-${fl.variants.length + 1}`,
    });

    return next;
}

export function removeVariant(family, flavorIndex, variantIndex) {
    const f = normalizeFamilyForForm(family);
    const next = structuredCloneSafe(f);

    const fl = next.flavors[flavorIndex];
    if (!fl) return next;

    // MVP: no permitir 0 variantes
    if (fl.variants.length <= 1) return next;

    fl.variants.splice(variantIndex, 1);
    fl.variants = fl.variants.map((v, i) => ({ ...v, sortOrder: i + 1 }));
    return next;
}

/**
 * Utils
 */

function structuredCloneSafe(obj) {
    if (typeof structuredClone === "function") return structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
}

/**
 * @typedef {Object} EditableFamily
 * @property {string=} id
 * @property {string} categoryId
 * @property {string} slug
 * @property {string} name
 * @property {string} imageUrl
 * @property {boolean} isActive
 * @property {number} sortOrder
 * @property {EditableFlavor[]} flavors
 *
 * @typedef {Object} EditableFlavor
 * @property {string=} id
 * @property {string} slug
 * @property {string} nameSuffix
 * @property {string} description
 * @property {boolean} isActive
 * @property {number} sortOrder
 * @property {EditableVariant[]} variants
 *
 * @typedef {Object} EditableVariant
 * @property {string=} id
 * @property {string} slug
 * @property {string} label
 * @property {number} priceCents
 * @property {string} currency
 * @property {string} imageUrl
 * @property {boolean} isActive
 * @property {number} sortOrder
 */