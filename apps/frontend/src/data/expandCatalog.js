
const CURRENCY = "ARS";

export function expandCatalogToProducts(catalog) {
    const out = [];

    for (const base of catalog) {
        if (base.active === false) continue;

        const baseImage = base.imageUrl;

        for (const flavor of base.flavors || []) {
            if (flavor.active === false) continue;

            for (const variant of flavor.variants || []) {
                if (variant.active === false) continue;

                const label = (variant.label || "").trim();
                const suffix = (flavor.nameSuffix || "").trim();

                out.push({
                    id: `${base.id}-${flavor.id}-${variant.id}`.replace(/-default-/g, "-"),
                    categoryId: base.categoryId,
                    name: `${base.name} ${suffix} ${label}`.replace(/\s+/g, " ").trim(),
                    description: flavor.description || "",
                    priceCents: variant.priceCents,
                    currency: CURRENCY,
                    imageUrl: variant.imageUrl || baseImage || "",
                    active: true,

                    // metadatos útiles para BD / carrito
                    baseId: base.id,
                    flavorId: flavor.id,
                    variantId: variant.id,
                });
            }
        }
    }

    return out;
}