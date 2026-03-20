// src/modules/catalogo/catalogo.service.ts
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateCategoryDto } from "./dto/create-categoria.dto";
import { CreateProductFamilyDto } from "./dto/create-producto.dto";
import { UpdateProductFamilyDto } from "./dto/update-producto.dto";
import { UpdateIsActiveDto } from "./dto/update-catalogo.dto";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto";
import { EventService } from "../events/event.service";

@Injectable()
export class CatalogoService {
    constructor(
        private readonly prisma:  PrismaService,
        private readonly events: EventService,
    ) {}

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

    async crearCategoria(dto: CreateCategoryDto, userId?: string) {
        const slug = this.clean(dto.slug);
        if (!slug) throw new BadRequestException("El slug es obligatorio.");
        const existing = await this.prisma.category.findUnique({ where: { slug } });
        if (existing) throw new BadRequestException(`Ya existe una categoría con slug "${slug}".`);
        try {
            const result = await this.prisma.category.create({
                data: { slug, name: this.clean(dto.name), sortOrder: dto.sortOrder ?? 0 },
            });
            await this.events.emit({ type: "SUCCESS", category: "CATALOG", message: `Categoría creada: "${result.name}"`, metadata: { id: result.id, name: result.name }, userId });
            return result;
        } catch (e) { this.handleUniqueError(e, "categoría"); }
    }

    categorias(includeInactive = false) {
        return this.prisma.category.findMany({
            where: includeInactive ? undefined : { isActive: true },
            orderBy: { sortOrder: "asc" },
        });
    }

    async actualizarCategoria(id: string, dto: UpdateCategoriaDto, userId?: string) {
        const data: Record<string, any> = {};
        if (dto.name !== undefined)      data.name = this.clean(dto.name);
        if (dto.slug !== undefined)      data.slug = this.clean(dto.slug);
        if (dto.sortOrder !== undefined) data.sortOrder = Number(dto.sortOrder);
        if (dto.isActive !== undefined)  data.isActive = dto.isActive;
        if (data.slug) {
            const existing = await this.prisma.category.findFirst({ where: { slug: data.slug, NOT: { id } } });
            if (existing) throw new BadRequestException(`Ya existe otra categoría con slug "${data.slug}".`);
        }
        try {
            const result = await this.prisma.category.update({ where: { id }, data });
            await this.events.emit({ type: "INFO", category: "CATALOG", message: `Categoría actualizada: "${result.name}"`, metadata: { id }, userId });
            return result;
        } catch (e) { this.handleUniqueError(e, "categoría"); }
    }

    // ======================
    // REHABILITAR en cascada
    // ======================

    async rehabilitarCategoria(id: string, userId?: string) {
        const familias = await this.prisma.productFamily.findMany({ where: { categoryId: id }, select: { id: true } });
        const familiaIds = familias.map((f) => f.id);
        const flavors = await this.prisma.productFlavor.findMany({ where: { familyId: { in: familiaIds } }, select: { id: true } });
        await this.prisma.productVariant.updateMany({ where: { flavorId: { in: flavors.map((f) => f.id) } }, data: { isActive: true } });
        await this.prisma.productFlavor.updateMany({ where: { familyId: { in: familiaIds } }, data: { isActive: true } });
        await this.prisma.productFamily.updateMany({ where: { categoryId: id }, data: { isActive: true } });
        const result = await this.prisma.category.update({ where: { id }, data: { isActive: true } });
        await this.events.emit({ type: "SUCCESS", category: "CATALOG", message: `Categoría rehabilitada en cascada: "${result.name}"`, metadata: { id, familias: familiaIds.length }, userId });
        return result;
    }

    async rehabilitarFamilia(id: string, userId?: string) {
        const flavors = await this.prisma.productFlavor.findMany({ where: { familyId: id }, select: { id: true } });
        await this.prisma.productVariant.updateMany({ where: { flavorId: { in: flavors.map((f) => f.id) } }, data: { isActive: true } });
        await this.prisma.productFlavor.updateMany({ where: { familyId: id }, data: { isActive: true } });
        const result = await this.prisma.productFamily.update({ where: { id }, data: { isActive: true } });
        await this.events.emit({ type: "SUCCESS", category: "CATALOG", message: `Familia rehabilitada en cascada: "${result.name}"`, metadata: { id, flavors: flavors.length }, userId });
        return result;
    }

    async rehabilitarFlavor(id: string, userId?: string) {
        const flavor = await this.prisma.productFlavor.findUnique({ where: { id }, include: { family: { select: { isActive: true, name: true } } } });
        if (!flavor) throw new BadRequestException("Sabor no encontrado.");
        if (!flavor.family.isActive) throw new BadRequestException(`Primero rehabilitá la familia "${flavor.family.name}" antes de habilitar este sabor.`);
        await this.prisma.productVariant.updateMany({ where: { flavorId: id }, data: { isActive: true } });
        const result = await this.prisma.productFlavor.update({ where: { id }, data: { isActive: true } });
        await this.events.emit({ type: "SUCCESS", category: "CATALOG", message: `Sabor rehabilitado: "${flavor.nameSuffix || "Default"}" (familia: ${flavor.family.name})`, metadata: { id }, userId });
        return result;
    }

    async rehabilitarVariant(id: string, userId?: string) {
        const variant = await this.prisma.productVariant.findUnique({
            where: { id },
            include: { flavor: { select: { isActive: true, nameSuffix: true, family: { select: { isActive: true, name: true } } } } },
        });
        if (!variant) throw new BadRequestException("Variante no encontrada.");
        if (!variant.flavor.isActive) {
            const flavorName = variant.flavor.nameSuffix || "este sabor";
            const familyMsg  = !variant.flavor.family.isActive ? ` (y antes la familia "${variant.flavor.family.name}")` : "";
            throw new BadRequestException(`Primero rehabilitá el sabor "${flavorName}"${familyMsg} antes de habilitar esta variante.`);
        }
        const result = await this.prisma.productVariant.update({ where: { id }, data: { isActive: true } });
        await this.events.emit({ type: "SUCCESS", category: "CATALOG", message: `Variante rehabilitada: "${variant.label || variant.slug}"`, metadata: { id }, userId });
        return result;
    }

    // ======================
    // FAMILIAS
    // ======================

    async crearFamilia(dto: CreateProductFamilyDto, userId?: string) {
        const familySlug = this.clean(dto.slug);
        if (!familySlug) throw new BadRequestException("El slug es obligatorio.");
        const flavorSlugs = dto.flavors.map((f) => this.clean(f.slug));
        if (new Set(flavorSlugs).size !== flavorSlugs.length) throw new BadRequestException("Hay sabores con slug duplicado.");
        for (const flavor of dto.flavors) {
            const variantSlugs = flavor.variants.map((v) => this.clean(v.slug));
            if (new Set(variantSlugs).size !== variantSlugs.length) throw new BadRequestException(`Variantes con slug duplicado en sabor "${flavor.slug}".`);
        }
        try {
            const result = await this.prisma.$transaction(async (tx) => {
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
            await this.events.emit({ type: "SUCCESS", category: "CATALOG", message: `Familia creada: "${result.name}"`, metadata: { id: result.id, name: result.name, flavors: result.flavors.length }, userId });
            return result;
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

    async actualizarFamilia(id: string, dto: UpdateProductFamilyDto, userId?: string) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                if (dto.slug) {
                    const exists = await tx.productFamily.findFirst({ where: { slug: this.clean(dto.slug), NOT: { id } } });
                    if (exists) throw new BadRequestException("Slug duplicado.");
                }
                await tx.productFamily.update({
                    where: { id },
                    data: {
                        ...(dto.categoryId  !== undefined && { categoryId: dto.categoryId }),
                        ...(dto.name        !== undefined && { name: this.clean(dto.name) }),
                        ...(dto.slug        !== undefined && { slug: this.clean(dto.slug) }),
                        ...(dto.imageUrl    !== undefined && { imageUrl: this.optionalClean(dto.imageUrl) }),
                        ...(dto.sortOrder   !== undefined && { sortOrder: Number(dto.sortOrder) }),
                        ...(dto.isActive    !== undefined && { isActive: dto.isActive }),
                    },
                });
                if (Array.isArray(dto.flavors)) {
                    for (const flavor of dto.flavors) {
                        if (flavor.id) {
                            await tx.productFlavor.update({
                                where: { id: flavor.id },
                                data: {
                                    ...(flavor.nameSuffix  !== undefined && { nameSuffix: flavor.nameSuffix }),
                                    ...(flavor.description !== undefined && { description: flavor.description }),
                                    ...(flavor.slug        !== undefined && { slug: flavor.slug }),
                                    ...(flavor.sortOrder   !== undefined && { sortOrder: Number(flavor.sortOrder) }),
                                    ...(flavor.isActive    !== undefined && { isActive: flavor.isActive }),
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
                                            ...(variant.label      !== undefined && { label: variant.label }),
                                            ...(variant.slug       !== undefined && { slug: variant.slug }),
                                            ...(variant.priceCents !== undefined && { priceCents: Number(variant.priceCents) }),
                                            ...(variant.imageUrl   !== undefined && { imageUrl: this.optionalClean(variant.imageUrl) }),
                                            ...(variant.sortOrder  !== undefined && { sortOrder: Number(variant.sortOrder) }),
                                            ...(variant.isActive   !== undefined && { isActive: variant.isActive }),
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
            await this.events.emit({ type: "INFO", category: "CATALOG", message: `Familia actualizada: "${result?.name}"`, metadata: { id }, userId });
            return result;
        } catch (e) { this.handleUniqueError(e, "familia"); }
    }

    actualizarFamiliaIsActive(id: string, dto: UpdateIsActiveDto) {
        return this.prisma.productFamily.update({ where: { id }, data: { isActive: dto.isActive } });
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
    // SOFT DELETE — con cascada completa
    // ======================

    async eliminarCategoria(id: string, userId?: string) {
        const familias = await this.prisma.productFamily.findMany({ where: { categoryId: id }, select: { id: true } });
        const familiaIds = familias.map((f) => f.id);
        const flavors = await this.prisma.productFlavor.findMany({ where: { familyId: { in: familiaIds } }, select: { id: true } });
        await this.prisma.productVariant.updateMany({ where: { flavorId: { in: flavors.map((f) => f.id) } }, data: { isActive: false } });
        await this.prisma.productFlavor.updateMany({ where: { familyId: { in: familiaIds } }, data: { isActive: false } });
        await this.prisma.productFamily.updateMany({ where: { categoryId: id }, data: { isActive: false } });
        const result = await this.prisma.category.update({ where: { id }, data: { isActive: false } });
        await this.events.emit({ type: "WARNING", category: "CATALOG", message: `Categoría deshabilitada en cascada: "${result.name}"`, metadata: { id, familias: familiaIds.length }, userId });
        return result;
    }

    async eliminarFamilia(id: string, userId?: string) {
        const flavors = await this.prisma.productFlavor.findMany({ where: { familyId: id }, select: { id: true } });
        await this.prisma.productVariant.updateMany({ where: { flavorId: { in: flavors.map((f) => f.id) } }, data: { isActive: false } });
        await this.prisma.productFlavor.updateMany({ where: { familyId: id }, data: { isActive: false } });
        const result = await this.prisma.productFamily.update({ where: { id }, data: { isActive: false } });
        await this.events.emit({ type: "WARNING", category: "CATALOG", message: `Familia deshabilitada en cascada: "${result.name}"`, metadata: { id, flavors: flavors.length }, userId });
        return result;
    }

    async eliminarFlavor(id: string, userId?: string) {
        await this.prisma.productVariant.updateMany({ where: { flavorId: id }, data: { isActive: false } });
        const result = await this.prisma.productFlavor.update({ where: { id }, data: { isActive: false } });
        await this.events.emit({ type: "WARNING", category: "CATALOG", message: `Sabor deshabilitado: "${result.nameSuffix || "Default"}"`, metadata: { id }, userId });
        return result;
    }

    async eliminarVariant(id: string, userId?: string) {
        const result = await this.prisma.productVariant.update({ where: { id }, data: { isActive: false } });
        await this.events.emit({ type: "WARNING", category: "CATALOG", message: `Variante deshabilitada: "${result.label || result.slug}"`, metadata: { id }, userId });
        return result;
    }

    // ======================
    // HARD DELETE
    // ======================

    async eliminarCategoriaHard(id: string, userId?: string) {
        const cat = await this.prisma.category.findUnique({ where: { id }, select: { name: true } });
        const result = await this.prisma.$transaction(async (tx) => {
            const familias = await tx.productFamily.findMany({ where: { categoryId: id }, select: { id: true } });
            await tx.productFamily.deleteMany({ where: { id: { in: familias.map((f) => f.id) } } });
            return tx.category.delete({ where: { id } });
        });
        await this.events.emit({ type: "ERROR", category: "CATALOG", message: `Categoría eliminada definitivamente: "${cat?.name}"`, metadata: { id }, userId });
        return result;
    }

    async eliminarFamiliaHard(id: string, userId?: string) {
        const fam = await this.prisma.productFamily.findUnique({ where: { id }, select: { name: true } });
        const result = await this.prisma.productFamily.delete({ where: { id } });
        await this.events.emit({ type: "ERROR", category: "CATALOG", message: `Familia eliminada definitivamente: "${fam?.name}"`, metadata: { id }, userId });
        return result;
    }

    async eliminarFlavorHard(id: string, userId?: string) {
        const flavor = await this.prisma.productFlavor.findUnique({ where: { id }, select: { nameSuffix: true } });
        const result = await this.prisma.productFlavor.delete({ where: { id } });
        await this.events.emit({ type: "ERROR", category: "CATALOG", message: `Sabor eliminado definitivamente: "${flavor?.nameSuffix || "Default"}"`, metadata: { id }, userId });
        return result;
    }

    async eliminarVariantHard(id: string, userId?: string) {
        const used = await this.prisma.orderItem.findFirst({ where: { variantId: id } });
        if (used) throw new BadRequestException("No podés eliminar esta variante porque tiene órdenes asociadas.");
        const variant = await this.prisma.productVariant.findUnique({ where: { id }, select: { label: true, slug: true } });
        const result = await this.prisma.productVariant.delete({ where: { id } });
        await this.events.emit({ type: "ERROR", category: "CATALOG", message: `Variante eliminada definitivamente: "${variant?.label || variant?.slug}"`, metadata: { id }, userId });
        return result;
    }
}