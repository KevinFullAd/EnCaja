import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-categoria.dto";
import { CreateProductFamilyDto } from "./dto/create-producto.dto";

@Injectable()
export class CatalogoService {
    constructor(private readonly prisma: PrismaService) { }

    // ======================
    // CATEGORIAS
    // ======================

    crearCategoria(dto: CreateCategoryDto) {
        return this.prisma.category.create({
            data: {
                slug: dto.slug,
                name: dto.name,
                sortOrder: dto.sortOrder ?? 0,
            },
        });
    }

    categorias() {
        return this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
        });
    }

    // ======================
    // PRODUCTOS (familias)
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
            include: {
                flavors: {
                    include: {
                        variants: true,
                    },
                },
            },
        });
    }

    familias() {
        return this.prisma.productFamily.findMany({
            where: { isActive: true },
            include: {
                flavors: {
                    where: { isActive: true },
                    include: {
                        variants: {
                            where: { isActive: true },
                        },
                    },
                },
            },
            orderBy: { sortOrder: "asc" },
        });
    }
}