import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function hashPin(pin: string) {
    return crypto.createHash("sha256").update(pin).digest("hex");
}

async function ensureUser(role: "ADMIN" | "OPERARIO", displayName: string, pin: string) {
    const existing = await prisma.user.findFirst({ where: { role } });
    if (existing) return existing;

    return prisma.user.create({
        data: { displayName, role, pinHash: hashPin(pin), isActive: true },
    });
}

async function ensureCategory(slug: string, name: string, sortOrder: number) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return existing;

    return prisma.category.create({
        data: { slug, name, sortOrder, isActive: true },
    });
}

async function ensureFamily(input: {
    categoryId: string;
    slug: string;
    name: string;
    imageUrl?: string;
    sortOrder?: number;
}) {
    const existing = await prisma.productFamily.findUnique({ where: { slug: input.slug } });
    if (existing) return existing;

    return prisma.productFamily.create({
        data: {
            categoryId: input.categoryId,
            slug: input.slug,
            name: input.name,
            imageUrl: input.imageUrl,
            sortOrder: input.sortOrder ?? 0,
            isActive: true,
        },
    });
}

async function ensureFlavor(input: {
    familyId: string;
    slug: string;
    nameSuffix?: string;
    description?: string;
    sortOrder?: number;
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
            description: input.description,
            sortOrder: input.sortOrder ?? 0,
            isActive: true,
        },
    });
}

async function ensureVariant(input: {
    flavorId: string;
    slug: string; // simple|doble|triple|unit
    label?: string;
    priceCents: number;
    imageUrl?: string;
    sortOrder?: number;
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
            currency: "ARS",
            imageUrl: input.imageUrl,
            sortOrder: input.sortOrder ?? 0,
            isActive: true,
        },
    });
}

async function main() {
    console.log("Seed: iniciando");

    // Usuarios
    await ensureUser("ADMIN", "Administrador", "1234");
    await ensureUser("OPERARIO", "Operario", "0000");

    // Categorías (ajustá slugs/nombres a los tuyos reales)
    const clasica = await ensureCategory("clasica", "Clásica", 1);
    const mensual = await ensureCategory("mensual", "Mensual", 2);
    const extras = await ensureCategory("extras", "Extras", 90);
    const tequenos = await ensureCategory("tequenos", "Tequeños", 91);

    // ===== Ejemplo: Familia Clásica (1 flavor default, 3 variantes) =====
    const famClasica = await ensureFamily({
        categoryId: clasica.id,
        slug: "clasica",
        name: "Clásica",
        imageUrl: "/images/burgers/clasica/simple.jpg",
        sortOrder: 1,
    });

    const flavClasica = await ensureFlavor({
        familyId: famClasica.id,
        slug: "default",
        nameSuffix: "",
        description: "Medallón de carne, cheddar, lechuga y tomate",
        sortOrder: 0,
    });

    await ensureVariant({ flavorId: flavClasica.id, slug: "simple", label: "Simple", priceCents: 1100000, imageUrl: "/images/burgers/clasica/simple.jpg", sortOrder: 1 });
    await ensureVariant({ flavorId: flavClasica.id, slug: "doble", label: "Doble", priceCents: 1400000, imageUrl: "/images/burgers/clasica/doble.jpg", sortOrder: 2 });
    await ensureVariant({ flavorId: flavClasica.id, slug: "triple", label: "Triple", priceCents: 1700000, imageUrl: "/images/burgers/clasica/triple.jpg", sortOrder: 3 });

    // ===== Ejemplo: Mensual Mexicana (2 flavors, variantes simple/doble; misma imagen en familia) =====
    const famMexicana = await ensureFamily({
        categoryId: mensual.id,
        slug: "mexicana",
        name: "Mexicana",
        imageUrl: "/images/burgers/mensual/mexicana_simple.jpg",
        sortOrder: 1,
    });

    const flavNachos = await ensureFlavor({
        familyId: famMexicana.id,
        slug: "nachos",
        nameSuffix: "con nachos",
        description: "Burger del mes (mexicana) con nachos",
        sortOrder: 1,
    });

    await ensureVariant({ flavorId: flavNachos.id, slug: "simple", label: "Simple", priceCents: 1300000, sortOrder: 1 });
    await ensureVariant({ flavorId: flavNachos.id, slug: "doble", label: "Doble", priceCents: 1600000, sortOrder: 2 });

    const flavVerdeo = await ensureFlavor({
        familyId: famMexicana.id,
        slug: "verdeo",
        nameSuffix: "con cebolla y verdeo",
        description: "Burger del mes (mexicana) con cebolla y verdeo",
        sortOrder: 2,
    });

    await ensureVariant({ flavorId: flavVerdeo.id, slug: "simple", label: "Simple", priceCents: 1300000, sortOrder: 1 });
    await ensureVariant({ flavorId: flavVerdeo.id, slug: "doble", label: "Doble", priceCents: 1600000, sortOrder: 2 });

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