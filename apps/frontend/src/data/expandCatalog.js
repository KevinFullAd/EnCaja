export function expandFamiliesToProducts(families) {
    const out = [];

    for (const fam of families ?? []) {
        if (fam.isActive === false) continue;

        for (const flavor of fam.flavors ?? []) {
            if (flavor.isActive === false) continue;

            for (const variant of flavor.variants ?? []) {
                if (variant.isActive === false) continue;

                const suffix = (flavor.nameSuffix ?? "").trim();
                const label = (variant.label ?? "").trim();

                const name = `${fam.name} ${suffix} ${label}`.replace(/\s+/g, " ").trim();

                out.push({
                    id: variant.id, 
                    categoryId: fam.categoryId,
                    name,
                    description: flavor.description ?? "",
                    priceCents: variant.priceCents,
                    currency: variant.currency ?? "ARS",
                    imageUrl: variant.imageUrl ?? fam.imageUrl ?? undefined,
                    active: variant.isActive !== false,
                    kind: "burger",
                });
            }
        }
    }

    return out;
}

export function groupFamiliesByFlavor(families) {
  const out = [];

  for (const fam of families ?? []) {
    if (fam.isActive === false) continue;

    for (const flavor of fam.flavors ?? []) {
      if (flavor.isActive === false) continue;

      const suffix = (flavor.nameSuffix ?? "").trim();

      const variants = (flavor.variants ?? [])
        .filter((v) => v.isActive !== false)
        .map((variant) => ({
          id: variant.id,
          label: (variant.label ?? "").trim(),
          priceCents: variant.priceCents,
          currency: variant.currency ?? "ARS",
          imageUrl: variant.imageUrl ?? flavor.imageUrl ?? fam.imageUrl,
        }));

      if (variants.length === 0) continue;

      const baseName = `${fam.name} ${suffix}`.replace(/\s+/g, " ").trim();

      out.push({
        id: `${fam.id}-${flavor.id}`,
        familyId: fam.id,
        flavorId: flavor.id,
        categoryId: fam.categoryId,
        name: baseName,
        description: flavor.description ?? "",
        imageUrl:
          flavor.imageUrl ??
          variants[0]?.imageUrl ??
          fam.imageUrl ??
          undefined,
        variants,
        kind: "burger",
      });
    }
  }

  return out;
}