// src/modules/catalogo/catalogo.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-categoria.dto";
import { CreateProductFamilyDto } from "./dto/create-producto.dto";
import { UpdateProductFamilyDto } from "./dto/update-producto.dto";
import { UpdateIsActiveDto } from "./dto/update-catalogo.dto";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto";

@Injectable()
export class CatalogoService {
    constructor(private readonly prisma: PrismaService) { }

    // ======================
    // CATEGORIAS
    // ======================

    crearCategoria(dto: CreateCategoryDto) {
        return this.prisma.category.create({
            data: { slug: dto.slug, name: dto.name, sortOrder: dto.sortOrder ?? 0 },
        });
    }

    categorias(includeInactive = false) {
        return this.prisma.category.findMany({
            where: includeInactive ? undefined : { isActive: true },
            orderBy: { sortOrder: "asc" },
        });
    }

    actualizarCategoria(id: string, dto: UpdateCategoriaDto) {
        const data: Record<string, any> = {};
        if (dto.name !== undefined)      data.name = dto.name.trim();
        if (dto.slug !== undefined)      data.slug = dto.slug.trim();
        if (dto.sortOrder !== undefined) data.sortOrder = Number(dto.sortOrder);
        if (dto.isActive !== undefined)  data.isActive = dto.isActive;
        return this.prisma.category.update({ where: { id }, data });
    }

    // ======================
    // FAMILIAS
    // ======================

    crearFamilia(dto: CreateProductFamilyDto) {
        return this.prisma.productFamily.create({
            data: {
                categoryId: dto.categoryId,
                slug: dto.slug,
                name: dto.name,
                imageUrl: dto.imageUrl,
                sortOrder: dto.sortOrder ?? 0,
                flavors: {
                    create: dto.flavors.map((flavor) => ({
                        slug: flavor.slug,
                        nameSuffix: flavor.nameSuffix ?? "",
                        description: flavor.description,
                        sortOrder: flavor.sortOrder ?? 0,
                        variants: {
                            create: flavor.variants.map((variant) => ({
                                slug: variant.slug,
                                label: variant.label ?? "",
                                priceCents: variant.priceCents,
                                imageUrl: variant.imageUrl,
                                sortOrder: variant.sortOrder ?? 0,
                            })),
                        },
                    })),
                },
            },
            include: { flavors: { include: { variants: true } } },
        });
    }

    familias(includeInactive = false) {
        return this.prisma.productFamily.findMany({
            where: includeInactive ? undefined : { isActive: true },
            include: {
                flavors: {
                    where: includeInactive ? undefined : { isActive: true },
                    include: {
                        variants: {
                            where: includeInactive ? undefined : { isActive: true },
                        },
                    },
                },
            },
            orderBy: { sortOrder: "asc" },
        });
    }

    /**
     * Actualiza una familia existente de forma inteligente:
     * - Flavors/variants con id => update
     * - Flavors/variants sin id => create
     * No borra nada — el soft delete ya existe por separado.
     */
    async actualizarFamilia(id: string, dto: UpdateProductFamilyDto) {
        // 1. Actualizar campos de la familia
        await this.prisma.productFamily.update({
            where: { id },
            data: {
                ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
                ...(dto.name       !== undefined && { name: dto.name.trim() }),
                ...(dto.slug       !== undefined && { slug: dto.slug.trim() }),
                ...(dto.imageUrl   !== undefined && { imageUrl: dto.imageUrl || null }),
                ...(dto.sortOrder  !== undefined && { sortOrder: Number(dto.sortOrder) }),
                ...(dto.isActive   !== undefined && { isActive: dto.isActive }),
            },
        });

        // 2. Procesar flavors si vienen en el DTO
        if (Array.isArray(dto.flavors)) {
            for (const flavor of dto.flavors) {
                if (flavor.id) {
                    // Update flavor existente
                    await this.prisma.productFlavor.update({
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
                    // Crear nuevo flavor
                    await this.prisma.productFlavor.create({
                        data: {
                            familyId: id,
                            slug: flavor.slug ?? `flavor-${Date.now()}`,
                            nameSuffix: flavor.nameSuffix ?? "",
                            description: flavor.description,
                            sortOrder: flavor.sortOrder ?? 0,
                        },
                    });
                }

                // 3. Procesar variants de este flavor
                if (Array.isArray(flavor.variants)) {
                    // Necesitamos el id del flavor — si era nuevo, buscarlo por slug+familyId
                    const flavorId = flavor.id ?? (
                        await this.prisma.productFlavor.findFirst({
                            where: { familyId: id, slug: flavor.slug ?? "" },
                            select: { id: true },
                        })
                    )?.id;

                    if (!flavorId) continue;

                    for (const variant of flavor.variants) {
                        if (variant.id) {
                            // Update variant existente
                            await this.prisma.productVariant.update({
                                where: { id: variant.id },
                                data: {
                                    ...(variant.label      !== undefined && { label: variant.label }),
                                    ...(variant.slug       !== undefined && { slug: variant.slug }),
                                    ...(variant.priceCents !== undefined && { priceCents: Number(variant.priceCents) }),
                                    ...(variant.imageUrl   !== undefined && { imageUrl: variant.imageUrl || null }),
                                    ...(variant.sortOrder  !== undefined && { sortOrder: Number(variant.sortOrder) }),
                                    ...(variant.isActive   !== undefined && { isActive: variant.isActive }),
                                },
                            });
                        } else {
                            // Crear nueva variant
                            await this.prisma.productVariant.create({
                                data: {
                                    flavorId,
                                    slug: variant.slug ?? `variant-${Date.now()}`,
                                    label: variant.label ?? "",
                                    priceCents: Number(variant.priceCents ?? 0),
                                    imageUrl: variant.imageUrl,
                                    sortOrder: variant.sortOrder ?? 0,
                                },
                            });
                        }
                    }
                }
            }
        }

        // Devolver la familia actualizada completa
        return this.prisma.productFamily.findUnique({
            where: { id },
            include: { flavors: { include: { variants: true } } },
        });
    }

    actualizarFamiliaIsActive(id: string, dto: UpdateIsActiveDto) {
        return this.prisma.productFamily.update({
            where: { id },
            data: { isActive: dto.isActive },
        });
    }

    // ======================
    // FLAVORS
    // ======================

    actualizarFlavor(id: string, dto: UpdateIsActiveDto) {
        return this.prisma.productFlavor.update({
            where: { id },
            data: { isActive: dto.isActive },
        });
    }

    // ======================
    // VARIANTS
    // ======================

    actualizarVariant(id: string, dto: UpdateIsActiveDto) {
        return this.prisma.productVariant.update({
            where: { id },
            data: { isActive: dto.isActive },
        });
    }

    // ======================
    // DELETE (soft)
    // ======================

    async eliminarCategoria(id: string) {
        const familias = await this.prisma.productFamily.findMany({
            where: { categoryId: id }, select: { id: true },
        });
        const familiaIds = familias.map((f) => f.id);
        const flavors = await this.prisma.productFlavor.findMany({
            where: { familyId: { in: familiaIds } }, select: { id: true },
        });
        await this.prisma.productVariant.updateMany({
            where: { flavorId: { in: flavors.map((f) => f.id) } },
            data: { isActive: false },
        });
        await this.prisma.productFlavor.updateMany({
            where: { familyId: { in: familiaIds } }, data: { isActive: false },
        });
        await this.prisma.productFamily.updateMany({
            where: { categoryId: id }, data: { isActive: false },
        });
        return this.prisma.category.update({ where: { id }, data: { isActive: false } });
    }

    async eliminarFamilia(id: string) {
        const flavors = await this.prisma.productFlavor.findMany({
            where: { familyId: id }, select: { id: true },
        });
        await this.prisma.productVariant.updateMany({
            where: { flavorId: { in: flavors.map((f) => f.id) } },
            data: { isActive: false },
        });
        await this.prisma.productFlavor.updateMany({
            where: { familyId: id }, data: { isActive: false },
        });
        return this.prisma.productFamily.update({ where: { id }, data: { isActive: false } });
    }

    async eliminarFlavor(id: string) {
        await this.prisma.productVariant.updateMany({
            where: { flavorId: id }, data: { isActive: false },
        });
        return this.prisma.productFlavor.update({ where: { id }, data: { isActive: false } });
    }

    eliminarVariant(id: string) {
        return this.prisma.productVariant.update({ where: { id }, data: { isActive: false } });
    }
}