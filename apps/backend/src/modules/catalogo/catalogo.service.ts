import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class CatalogoService {
    constructor(private readonly prisma: PrismaService) { }

    categorias() {
        return this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, name: true, sortOrder: true },
        });
    }

    productos(categoriaId?: string) {
        return this.prisma.product.findMany({
            where: {
                isActive: true,
                ...(categoriaId ? { categoryId: categoriaId } : {}),
            },
            orderBy: { name: 'asc' },
            select: { id: true, categoryId: true, name: true, basePrice: true },
        });
    }
}
