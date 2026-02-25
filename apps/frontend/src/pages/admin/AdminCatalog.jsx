import { useEffect, useMemo, useState } from "react";

function slugify(str) {
    return String(str || "")
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export default function AdminCatalog() {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(false);

    // Forms
    const [catName, setCatName] = useState("");
    const [catSlug, setCatSlug] = useState("");

    const [familyCategoryId, setFamilyCategoryId] = useState("");
    const [familyName, setFamilyName] = useState("");
    const [familySlug, setFamilySlug] = useState("");
    const [familyImageUrl, setFamilyImageUrl] = useState("");

    const [flavorFamilyId, setFlavorFamilyId] = useState("");
    const [flavorSlug, setFlavorSlug] = useState("default");
    const [flavorSuffix, setFlavorSuffix] = useState("");
    const [flavorDesc, setFlavorDesc] = useState("");

    const [variantFlavorId, setVariantFlavorId] = useState("");
    const [variantSlug, setVariantSlug] = useState("unit");
    const [variantLabel, setVariantLabel] = useState("");
    const [variantPriceCents, setVariantPriceCents] = useState("");
    const [variantImageUrl, setVariantImageUrl] = useState("");

    async function refresh() {
        setLoading(true);
        try {
            const res = await fetch("/admin/catalog");
            const data = await res.json();
            setTree(data);
            // set defaults convenientes
            if (!familyCategoryId && data?.[0]?.id) setFamilyCategoryId(data[0].id);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const categories = tree;

    const families = useMemo(() => {
        return categories.flatMap((c) =>
            (c.families || []).map((f) => ({ ...f, _category: c }))
        );
    }, [categories]);

    const flavors = useMemo(() => {
        return families.flatMap((f) =>
            (f.flavors || []).map((fl) => ({ ...fl, _family: f }))
        );
    }, [families]);

    async function postJson(url, body) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Request failed");
        }
        return res.json();
    }

    async function onCreateCategory(e) {
        e.preventDefault();
        await postJson("/admin/catalog/category", {
            slug: catSlug || slugify(catName),
            name: catName,
            sortOrder: 0,
            isActive: true,
        });
        setCatName("");
        setCatSlug("");
        await refresh();
    }

    async function onCreateFamily(e) {
        e.preventDefault();
        await postJson("/admin/catalog/family", {
            categoryId: familyCategoryId,
            slug: familySlug || slugify(familyName),
            name: familyName,
            imageUrl: familyImageUrl || undefined,
            sortOrder: 0,
            isActive: true,
        });
        setFamilyName("");
        setFamilySlug("");
        setFamilyImageUrl("");
        await refresh();
    }

    async function onCreateFlavor(e) {
        e.preventDefault();
        await postJson("/admin/catalog/flavor", {
            familyId: flavorFamilyId,
            slug: flavorSlug,
            nameSuffix: flavorSuffix,
            description: flavorDesc || undefined,
            sortOrder: 0,
            isActive: true,
        });
        setFlavorSuffix("");
        setFlavorDesc("");
        await refresh();
    }

    async function onCreateVariant(e) {
        e.preventDefault();
        await postJson("/admin/catalog/variant", {
            flavorId: variantFlavorId,
            slug: variantSlug,
            label: variantLabel,
            priceCents: Number(variantPriceCents),
            currency: "ARS",
            imageUrl: variantImageUrl || undefined,
            sortOrder: 0,
            isActive: true,
        });
        setVariantLabel("");
        setVariantPriceCents("");
        setVariantImageUrl("");
        await refresh();
    }

    return (
        <div className="p-4 border space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Admin · Catálogo</h1>
                <button
                    onClick={refresh}
                    className="px-3 py-2 rounded border border-(--app-border)"
                >
                    {loading ? "Actualizando..." : "Refrescar"}
                </button>
            </div>

            {/* Vista rápida del árbol */}
            <div className="rounded border border-(--app-border) p-3">
                <div className="text-sm font-semibold mb-2">Actual</div>
                <div className="text-sm space-y-2">
                    {categories.map((c) => (
                        <div key={c.id}>
                            <div className="font-medium">{c.name} <span className="opacity-60">({c.slug})</span></div>
                            <div className="pl-4 space-y-1">
                                {(c.families || []).map((f) => (
                                    <div key={f.id}>
                                        <div>• {f.name} <span className="opacity-60">({f.slug})</span></div>
                                        <div className="pl-4">
                                            {(f.flavors || []).map((fl) => (
                                                <div key={fl.id}>
                                                    – {fl.slug} <span className="opacity-60">{fl.nameSuffix}</span>
                                                    <div className="pl-4 opacity-80">
                                                        {(fl.variants || []).map((v) => (
                                                            <div key={v.id}>· {v.slug} {v.label ? `(${v.label})` : ""} — ${v.priceCents}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Crear Category */}
            <form onSubmit={onCreateCategory} className="rounded border border-(--app-border) p-3 space-y-2">
                <div className="font-semibold text-sm">Crear Categoría</div>
                <div className="flex gap-2">
                    <input className="flex-1 border rounded px-3 py-2" placeholder="Nombre (ej: Clásica)" value={catName} onChange={(e) => { setCatName(e.target.value); if (!catSlug) setCatSlug(slugify(e.target.value)); }} />
                    <input className="w-64 border rounded px-3 py-2" placeholder="Slug (ej: clasica)" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
                    <button className="px-4 py-2 rounded bg-(--app-text) text-(--app-surface)">Crear</button>
                </div>
            </form>

            {/* Crear Family */}
            <form onSubmit={onCreateFamily} className="rounded border border-(--app-border) p-3 space-y-2">
                <div className="font-semibold text-sm">Crear Familia</div>
                <div className="flex gap-2">
                    <select className="w-64 border rounded px-3 py-2" value={familyCategoryId} onChange={(e) => setFamilyCategoryId(e.target.value)}>
                        <option value="" disabled>Elegí categoría</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <input className="flex-1 border rounded px-3 py-2" placeholder="Nombre (ej: Clásica)" value={familyName} onChange={(e) => { setFamilyName(e.target.value); if (!familySlug) setFamilySlug(slugify(e.target.value)); }} />
                    <input className="w-64 border rounded px-3 py-2" placeholder="Slug (ej: clasica)" value={familySlug} onChange={(e) => setFamilySlug(e.target.value)} />
                    <button className="px-4 py-2 rounded bg-(--app-text) text-(--app-surface)">Crear</button>
                </div>
                <input className="w-full border rounded px-3 py-2" placeholder="Imagen URL (opcional)" value={familyImageUrl} onChange={(e) => setFamilyImageUrl(e.target.value)} />
            </form>

            {/* Crear Flavor */}
            <form onSubmit={onCreateFlavor} className="rounded border border-(--app-border) p-3 space-y-2">
                <div className="font-semibold text-sm">Crear Sabor (Flavor)</div>
                <div className="flex gap-2">
                    <select className="w-96 border rounded px-3 py-2" value={flavorFamilyId} onChange={(e) => setFlavorFamilyId(e.target.value)}>
                        <option value="" disabled>Elegí familia</option>
                        {families.map((f) => (
                            <option key={f.id} value={f.id}>{f._category?.name} → {f.name}</option>
                        ))}
                    </select>
                    <input className="w-64 border rounded px-3 py-2" placeholder="slug (ej: default / nachos)" value={flavorSlug} onChange={(e) => setFlavorSlug(e.target.value)} />
                    <button className="px-4 py-2 rounded bg-(--app-text) text-(--app-surface)">Crear</button>
                </div>
                <div className="flex gap-2">
                    <input className="flex-1 border rounded px-3 py-2" placeholder='nameSuffix (ej: "con nachos")' value={flavorSuffix} onChange={(e) => setFlavorSuffix(e.target.value)} />
                    <input className="flex-1 border rounded px-3 py-2" placeholder="Descripción (opcional)" value={flavorDesc} onChange={(e) => setFlavorDesc(e.target.value)} />
                </div>
            </form>

            {/* Crear Variant */}
            <form onSubmit={onCreateVariant} className="rounded border border-(--app-border) p-3 space-y-2">
                <div className="font-semibold text-sm">Crear Variante (vendible)</div>
                <div className="flex gap-2">
                    <select className="w-[520px] border rounded px-3 py-2" value={variantFlavorId} onChange={(e) => setVariantFlavorId(e.target.value)}>
                        <option value="" disabled>Elegí flavor</option>
                        {flavors.map((fl) => (
                            <option key={fl.id} value={fl.id}>
                                {fl._family?._category?.name} → {fl._family?.name} → {fl.slug} {fl.nameSuffix ? `(${fl.nameSuffix})` : ""}
                            </option>
                        ))}
                    </select>
                    <input className="w-40 border rounded px-3 py-2" placeholder="slug (unit/simple)" value={variantSlug} onChange={(e) => setVariantSlug(e.target.value)} />
                    <input className="w-40 border rounded px-3 py-2" placeholder="label (Simple)" value={variantLabel} onChange={(e) => setVariantLabel(e.target.value)} />
                    <input className="w-40 border rounded px-3 py-2" placeholder="priceCents" value={variantPriceCents} onChange={(e) => setVariantPriceCents(e.target.value)} />
                    <button className="px-4 py-2 rounded bg-(--app-text) text-(--app-surface)">Crear</button>
                </div>
                <input className="w-full border rounded px-3 py-2" placeholder="Imagen URL (opcional)" value={variantImageUrl} onChange={(e) => setVariantImageUrl(e.target.value)} />
            </form>
        </div>
    );
}