// prisma/seed.ts
import { PrismaClient, UserRole } from "@prisma/client";
import * as crypto from "crypto";

// Importá tu CATALOG desde el JS existente (ajustá path)
import { CATALOG as CATALOG_UNTYPED } from "./data/products.js";

const prisma = new PrismaClient();

/**
 * =========================
 * TIPOS (para tipar un CATALOG que viene de JS)
 * =========================
 */
type Catalog = Array<{
    id: string;
    categoryId: string;
    name: string;
    active: boolean;
    imageUrl?: string;
    flavors: Array<{
        id: string;
        nameSuffix?: string;
        description?: string;
        active: boolean;
        variants: Array<{
            id: string; // simple|doble|triple|unit
            label?: string;
            priceCents: number;
            imageUrl?: string;
            active: boolean;
        }>;
    }>;
}>;

// Cast fuerte: el runtime es JS pero vos ya controlás la forma
const CATALOG = CATALOG_UNTYPED as unknown as Catalog;

/**
 * =========================
 * HELPERS
 * =========================
 */
function hashPin(pin: string) {
    return crypto.createHash("sha256").update(pin).digest("hex");
}

async function ensureUser(role: UserRole, displayName: string, pin: string) {
    const existing = await prisma.user.findFirst({ where: { role } });
    if (existing) return existing;

    return prisma.user.create({
        data: { displayName, role, pinHash: hashPin(pin), isActive: true },
    });
}

async function ensureCategory(input: { slug: string; name: string; sortOrder: number; isActive?: boolean }) {
    const existing = await prisma.category.findUnique({ where: { slug: input.slug } });
    if (existing) return existing;

    return prisma.category.create({
        data: {
            slug: input.slug,
            name: input.name,
            sortOrder: input.sortOrder,
            isActive: input.isActive ?? true,
        },
    });
}

async function ensureFamily(input: {
    categoryId: string;
    slug: string;
    name: string;
    imageUrl?: string | null;
    sortOrder: number;
    isActive?: boolean;
}) {
    const existing = await prisma.productFamily.findUnique({ where: { slug: input.slug } });
    if (existing) return existing;

    return prisma.productFamily.create({
        data: {
            categoryId: input.categoryId,
            slug: input.slug,
            name: input.name,
            imageUrl: input.imageUrl ?? null,
            sortOrder: input.sortOrder,
            isActive: input.isActive ?? true,
        },
    });
}

async function ensureFlavor(input: {
    familyId: string;
    slug: string;
    nameSuffix?: string;
    description?: string | null;
    sortOrder: number;
    isActive?: boolean;
}) {
    const existing = await prisma.productFlavor.findUnique({
        where: { familyId_slug: { familyId: input.familyId, slug: input.slug } },
    });
    if (existing) return existing;

    return prisma.productFlavor.create({
        data: {
            familyId: input.familyId,
            slug: input.slug,
            nameSuffix: input.nameSuffix ?? "",
            description: input.description ?? null,
            sortOrder: input.sortOrder,
            isActive: input.isActive ?? true,
        },
    });
}

async function ensureVariant(input: {
    flavorId: string;
    slug: string;
    label?: string;
    priceCents: number;
    currency?: string;
    imageUrl?: string | null;
    sortOrder: number;
    isActive?: boolean;
}) {
    const existing = await prisma.productVariant.findUnique({
        where: { flavorId_slug: { flavorId: input.flavorId, slug: input.slug } },
    });
    if (existing) return existing;

    return prisma.productVariant.create({
        data: {
            flavorId: input.flavorId,
            slug: input.slug,
            label: input.label ?? "",
            priceCents: input.priceCents,
            currency: input.currency ?? "ARS",
            imageUrl: input.imageUrl ?? null,
            sortOrder: input.sortOrder,
            isActive: input.isActive ?? true,
        },
    });
}

/**
 * =========================
 * CONFIG: categorías (slug -> name/sort)
 * =========================
 */
const CATEGORY_META: Record<string, { name: string; sortOrder: number }> = {
    all : { name: "Todas", sortOrder: 0 },
    clasica: { name: "Clásica", sortOrder: 1 },
    crispy: { name: "Crispy", sortOrder: 2 },
    cheese: { name: "Cheese", sortOrder: 3 },
    cheese_bacon: { name: "Cheese Bacon", sortOrder: 4 },
    barbacoa: { name: "Barbacoa", sortOrder: 5 },
    aros: { name: "Aros Burger", sortOrder: 6 },
    mensual: { name: "Mensual", sortOrder: 10 },
    "pollo-crispy": { name: "Pollo Crispy", sortOrder: 20 },
    premium: { name: "Premium", sortOrder: 30 },
    veggie: { name: "Veggie", sortOrder: 40 },
    extras: { name: "Extras", sortOrder: 90 },
    tequenos: { name: "Tequeños", sortOrder: 91 },
};

async function main() {
    console.log("Seed: iniciando");

    // ===== Usuarios =====
    await ensureUser("ADMIN", "Administrador", "1234");
    await ensureUser("OPERARIO", "Operario", "0000");

    // ===== Categorías (union de meta + lo que venga en el CATALOG) =====
    // Crear categorías SOLO desde el catálogo
    const allSlugs: string[] = Array.from(
        new Set(CATALOG.map((f) => f.categoryId))
    );
    const categoryIdBySlug = new Map<string, string>();

    for (const slug of allSlugs) {
        const meta = CATEGORY_META[slug] ?? { name: slug, sortOrder: 999 };
        const cat = await ensureCategory({ slug, name: meta.name, sortOrder: meta.sortOrder, isActive: true });
        categoryIdBySlug.set(slug, cat.id);
    }

    // ===== Catálogo: familias -> sabores -> variantes =====
    for (let famIndex = 0; famIndex < CATALOG.length; famIndex++) {
        const fam = CATALOG[famIndex];
        if (!fam.active) continue;

        const categoryId = categoryIdBySlug.get(fam.categoryId);
        if (!categoryId) throw new Error(`No existe categoría para slug "${fam.categoryId}" (family "${fam.id}")`);

        const familyImageUrl: string | null =
            fam.imageUrl ??
            fam.flavors.flatMap((fl) => fl.variants).find((v) => !!v.imageUrl)?.imageUrl ??
            null;

        const family = await ensureFamily({
            categoryId,
            slug: fam.id,
            name: fam.name,
            imageUrl: familyImageUrl,
            sortOrder: famIndex + 1,
            isActive: true,
        });

        for (let flavorIndex = 0; flavorIndex < fam.flavors.length; flavorIndex++) {
            const fl = fam.flavors[flavorIndex];
            if (!fl.active) continue;

            const flavor = await ensureFlavor({
                familyId: family.id,
                slug: fl.id,
                nameSuffix: fl.nameSuffix ?? "",
                description: fl.description ?? null,
                sortOrder: flavorIndex + 1,
                isActive: true,
            });

            for (let variantIndex = 0; variantIndex < fl.variants.length; variantIndex++) {
                const v = fl.variants[variantIndex];
                if (!v.active) continue;

                await ensureVariant({
                    flavorId: flavor.id,
                    slug: v.id,
                    label: v.label ?? "",
                    priceCents: v.priceCents,
                    currency: "ARS",
                    imageUrl: v.imageUrl ?? family.imageUrl ?? null,
                    sortOrder: variantIndex + 1,
                    isActive: true,
                });
            }
        }
    }

    // ===== Otros seeds viejos (si tenías configs/parametros/etc) =====
    // pegá acá lo otro que existía en tu seed anterior, separado del catálogo.

    console.log("Seed: finalizado correctamente");
}

main()
    .catch((e) => {
        console.error("Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });