// src/modules/catalogo/catalogo.service.ts
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateCategoryDto } from "./dto/create-categoria.dto";
import { CreateProductFamilyDto } from "./dto/create-producto.dto";
import { UpdateProductFamilyDto } from "./dto/update-producto.dto";
import { UpdateIsActiveDto } from "./dto/update-catalogo.dto";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto";

@Injectable()
export class CatalogoService {
    constructor(private readonly prisma: PrismaService) { }

    private clean(value?: string | null) { return value?.trim() ?? ""; }
    private optionalClean(value?: string | null) { const v = value?.trim(); return v ? v : null; }
    private isUniqueError(e: unknown) { return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"; }
    private handleUniqueError(e: unknown, entity: string) {
        if (this.isUniqueError(e)) throw new BadRequestException(`Ya existe un ${entity} con esos datos únicos.`);
        throw e;
    }

    // ======================
    // CATEGORIAS
    // ======================

    async crearCategoria(dto: CreateCategoryDto) {
        const slug = this.clean(dto.slug);
        if (!slug) throw new BadRequestException("El slug es obligatorio.");
        const existing = await this.prisma.category.findUnique({ where: { slug } });
        if (existing) throw new BadRequestException(`Ya existe una categoría con slug "${slug}".`);
        try {
            return await this.prisma.category.create({
                data: { slug, name: this.clean(dto.name), sortOrder: dto.sortOrder ?? 0 },
            });
        } catch (e) { this.handleUniqueError(e, "categoría"); }
    }

    categorias(includeInactive = false) {
        return this.prisma.category.findMany({
            where: includeInactive ? undefined : { isActive: true },
            orderBy: { sortOrder: "asc" },
        });
    }

    async actualizarCategoria(id: string, dto: UpdateCategoriaDto) {
        const data: Record<string, any> = {};
        if (dto.name !== undefined) data.name = this.clean(dto.name);
        if (dto.slug !== undefined) data.slug = this.clean(dto.slug);
        if (dto.sortOrder !== undefined) data.sortOrder = Number(dto.sortOrder);
        if (dto.isActive !== undefined) data.isActive = dto.isActive;
        if (data.slug) {
            const existing = await this.prisma.category.findFirst({ where: { slug: data.slug, NOT: { id } } });
            if (existing) throw new BadRequestException(`Ya existe otra categoría con slug "${data.slug}".`);
        }
        try { return await this.prisma.category.update({ where: { id }, data }); }
        catch (e) { this.handleUniqueError(e, "categoría"); }
    }

    // Rehabilitar categoría + todas sus familias + flavors + variants en cascada
    async rehabilitarCategoria(id: string) {
        const familias = await this.prisma.productFamily.findMany({
            where: { categoryId: id },
            select: { id: true },
        });
        const familiaIds = familias.map((f) => f.id);

        const flavors = await this.prisma.productFlavor.findMany({
            where: { familyId: { in: familiaIds } },
            select: { id: true },
        });

        await this.prisma.productVariant.updateMany({
            where: { flavorId: { in: flavors.map((f) => f.id) } },
            data: { isActive: true },
        });
        await this.prisma.productFlavor.updateMany({
            where: { familyId: { in: familiaIds } },
            data: { isActive: true },
        });
        await this.prisma.productFamily.updateMany({
            where: { categoryId: id },
            data: { isActive: true },
        });
        return this.prisma.category.update({ where: { id }, data: { isActive: true } });
    }

    // ======================
    // FAMILIAS
    // ======================

    async crearFamilia(dto: CreateProductFamilyDto) {
        const familySlug = this.clean(dto.slug);
        if (!familySlug) throw new BadRequestException("El slug es obligatorio.");
        const flavorSlugs = dto.flavors.map((f) => this.clean(f.slug));
        if (new Set(flavorSlugs).size !== flavorSlugs.length) throw new BadRequestException("Hay sabores con slug duplicado.");
        for (const flavor of dto.flavors) {
            const variantSlugs = flavor.variants.map((v) => this.clean(v.slug));
            if (new Set(variantSlugs).size !== variantSlugs.length) throw new BadRequestException(`Variantes con slug duplicado en sabor "${flavor.slug}".`);
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const exists = await tx.productFamily.findUnique({ where: { slug: familySlug } });
                if (exists) throw new BadRequestException(`Ya existe una familia con slug "${familySlug}".`);
                return tx.productFamily.create({
                    data: {
                        categoryId: dto.categoryId,
                        slug: familySlug,
                        name: this.clean(dto.name),
                        imageUrl: this.optionalClean(dto.imageUrl),
                        sortOrder: dto.sortOrder ?? 0,
                        flavors: {
                            create: dto.flavors.map((f) => ({
                                slug: this.clean(f.slug),
                                nameSuffix: this.clean(f.nameSuffix ?? ""),
                                description: this.optionalClean(f.description),
                                sortOrder: f.sortOrder ?? 0,
                                variants: {
                                    create: f.variants.map((v) => ({
                                        slug: this.clean(v.slug),
                                        label: this.clean(v.label ?? ""),
                                        priceCents: Number(v.priceCents),
                                        imageUrl: this.optionalClean(v.imageUrl),
                                        sortOrder: v.sortOrder ?? 0,
                                    })),
                                },
                            })),
                        },
                    },
                    include: { flavors: { include: { variants: true } } },
                });
            });
        } catch (e) { this.handleUniqueError(e, "familia"); }
    }

    familias(includeInactive = false) {
        return this.prisma.productFamily.findMany({
            where: includeInactive ? undefined : { isActive: true },
            include: {
                flavors: {
                    where: includeInactive ? undefined : { isActive: true },
                    include: { variants: { where: includeInactive ? undefined : { isActive: true } } },
                },
            },
            orderBy: { sortOrder: "asc" },
        });
    }

    async actualizarFamilia(id: string, dto: UpdateProductFamilyDto) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                if (dto.slug) {
                    const exists = await tx.productFamily.findFirst({ where: { slug: this.clean(dto.slug), NOT: { id } } });
                    if (exists) throw new BadRequestException("Slug duplicado.");
                }
                await tx.productFamily.update({
                    where: { id },
                    data: {
                        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
                        ...(dto.name !== undefined && { name: this.clean(dto.name) }),
                        ...(dto.slug !== undefined && { slug: this.clean(dto.slug) }),
                        ...(dto.imageUrl !== undefined && { imageUrl: this.optionalClean(dto.imageUrl) }),
                        ...(dto.sortOrder !== undefined && { sortOrder: Number(dto.sortOrder) }),
                        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                    },
                });
                if (Array.isArray(dto.flavors)) {
                    for (const flavor of dto.flavors) {
                        if (flavor.id) {
                            await tx.productFlavor.update({
                                where: { id: flavor.id },
                                data: {
                                    ...(flavor.nameSuffix !== undefined && { nameSuffix: flavor.nameSuffix }),
                                    ...(flavor.description !== undefined && { description: flavor.description }),
                                    ...(flavor.slug !== undefined && { slug: flavor.slug }),
                                    ...(flavor.sortOrder !== undefined && { sortOrder: Number(flavor.sortOrder) }),
                                    ...(flavor.isActive !== undefined && { isActive: flavor.isActive }),
                                },
                            });
                        } else {
                            await tx.productFlavor.create({
                                data: { familyId: id, slug: flavor.slug ?? `flavor-${Date.now()}`, nameSuffix: flavor.nameSuffix ?? "", description: flavor.description, sortOrder: flavor.sortOrder ?? 0 },
                            });
                        }
                        if (Array.isArray(flavor.variants)) {
                            const flavorId = flavor.id ?? (await tx.productFlavor.findFirst({ where: { familyId: id, slug: flavor.slug ?? "" }, select: { id: true } }))?.id;
                            if (!flavorId) continue;
                            for (const variant of flavor.variants) {
                                if (variant.id) {
                                    await tx.productVariant.update({
                                        where: { id: variant.id },
                                        data: {
                                            ...(variant.label !== undefined && { label: variant.label }),
                                            ...(variant.slug !== undefined && { slug: variant.slug }),
                                            ...(variant.priceCents !== undefined && { priceCents: Number(variant.priceCents) }),
                                            ...(variant.imageUrl !== undefined && { imageUrl: this.optionalClean(variant.imageUrl) }),
                                            ...(variant.sortOrder !== undefined && { sortOrder: Number(variant.sortOrder) }),
                                            ...(variant.isActive !== undefined && { isActive: variant.isActive }),
                                        },
                                    });
                                } else {
                                    await tx.productVariant.create({
                                        data: { flavorId, slug: variant.slug ?? `variant-${Date.now()}`, label: variant.label ?? "", priceCents: Number(variant.priceCents ?? 0), imageUrl: this.optionalClean(variant.imageUrl), sortOrder: variant.sortOrder ?? 0 },
                                    });
                                }
                            }
                        }
                    }
                }
                return tx.productFamily.findUnique({ where: { id }, include: { flavors: { include: { variants: true } } } });
            });
        } catch (e) { this.handleUniqueError(e, "familia"); }
    }

    actualizarFamiliaIsActive(id: string, dto: UpdateIsActiveDto) {
        return this.prisma.productFamily.update({ where: { id }, data: { isActive: dto.isActive } });
    }

    // ======================
    // REHABILITAR en cascada
    // ======================

    async rehabilitarFamilia(id: string) {
        const flavors = await this.prisma.productFlavor.findMany({ where: { familyId: id }, select: { id: true } });
        await this.prisma.productVariant.updateMany({ where: { flavorId: { in: flavors.map((f) => f.id) } }, data: { isActive: true } });
        await this.prisma.productFlavor.updateMany({ where: { familyId: id }, data: { isActive: true } });
        return this.prisma.productFamily.update({ where: { id }, data: { isActive: true } });
    }

    async rehabilitarFlavor(id: string) {
        const flavor = await this.prisma.productFlavor.findUnique({ where: { id }, include: { family: { select: { isActive: true, name: true } } } });
        if (!flavor) throw new BadRequestException("Sabor no encontrado.");
        if (!flavor.family.isActive) throw new BadRequestException(`Primero rehabilitá la familia "${flavor.family.name}" antes de habilitar este sabor.`);
        await this.prisma.productVariant.updateMany({ where: { flavorId: id }, data: { isActive: true } });
        return this.prisma.productFlavor.update({ where: { id }, data: { isActive: true } });
    }

    async rehabilitarVariant(id: string) {
        const variant = await this.prisma.productVariant.findUnique({
            where: { id },
            include: { flavor: { select: { isActive: true, nameSuffix: true, family: { select: { isActive: true, name: true } } } } },
        });
        if (!variant) throw new BadRequestException("Variante no encontrada.");
        if (!variant.flavor.isActive) {
            const flavorName = variant.flavor.nameSuffix || "este sabor";
            const familyMsg = !variant.flavor.family.isActive ? ` (y antes la familia "${variant.flavor.family.name}")` : "";
            throw new BadRequestException(`Primero rehabilitá el sabor "${flavorName}"${familyMsg} antes de habilitar esta variante.`);
        }
        return this.prisma.productVariant.update({ where: { id }, data: { isActive: true } });
    }

    // ======================
    // FLAVORS / VARIANTS — isActive simple
    // ======================

    actualizarFlavor(id: string, dto: UpdateIsActiveDto) {
        return this.prisma.productFlavor.update({ where: { id }, data: { isActive: dto.isActive } });
    }

    actualizarVariant(id: string, dto: UpdateIsActiveDto) {
        return this.prisma.productVariant.update({ where: { id }, data: { isActive: dto.isActive } });
    }

    // ======================
    // SOFT DELETE
    // ======================

    async eliminarCategoria(id: string) {
        const familias = await this.prisma.productFamily.findMany({ where: { categoryId: id }, select: { id: true } });
        const familiaIds = familias.map((f) => f.id);
        const flavors = await this.prisma.productFlavor.findMany({ where: { familyId: { in: familiaIds } }, select: { id: true } });
        await this.prisma.productVariant.updateMany({ where: { flavorId: { in: flavors.map((f) => f.id) } }, data: { isActive: false } });
        await this.prisma.productFlavor.updateMany({ where: { familyId: { in: familiaIds } }, data: { isActive: false } });
        await this.prisma.productFamily.updateMany({ where: { categoryId: id }, data: { isActive: false } });
        return this.prisma.category.update({ where: { id }, data: { isActive: false } });
    }

    async eliminarFamilia(id: string) {
        const flavors = await this.prisma.productFlavor.findMany({ where: { familyId: id }, select: { id: true } });
        await this.prisma.productVariant.updateMany({ where: { flavorId: { in: flavors.map((f) => f.id) } }, data: { isActive: false } });
        await this.prisma.productFlavor.updateMany({ where: { familyId: id }, data: { isActive: false } });
        return this.prisma.productFamily.update({ where: { id }, data: { isActive: false } });
    }

    async eliminarFlavor(id: string) {
        await this.prisma.productVariant.updateMany({ where: { flavorId: id }, data: { isActive: false } });
        return this.prisma.productFlavor.update({ where: { id }, data: { isActive: false } });
    }

    eliminarVariant(id: string) {
        return this.prisma.productVariant.update({ where: { id }, data: { isActive: false } });
    }

    // ======================
    // HARD DELETE
    // ======================

    async eliminarCategoriaHard(id: string) {
        return this.prisma.$transaction(async (tx) => {
            const familias = await tx.productFamily.findMany({ where: { categoryId: id }, select: { id: true } });
            await tx.productFamily.deleteMany({ where: { id: { in: familias.map((f) => f.id) } } });
            return tx.category.delete({ where: { id } });
        });
    }

    eliminarFamiliaHard(id: string) { return this.prisma.productFamily.delete({ where: { id } }); }
    eliminarFlavorHard(id: string) { return this.prisma.productFlavor.delete({ where: { id } }); }

    async eliminarVariantHard(id: string) {
        const used = await this.prisma.orderItem.findFirst({ where: { variantId: id } });
        if (used) throw new BadRequestException("No podés eliminar esta variante porque tiene órdenes asociadas.");
        return this.prisma.productVariant.delete({ where: { id } });
    }
}