import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPin(pin: string) {
    return crypto.createHash('sha256').update(pin).digest('hex');
}

async function ensureUser(role: 'ADMIN' | 'OPERARIO', displayName: string, pin: string) {
    const existing = await prisma.user.findFirst({ where: { role } });
    if (existing) return existing;

    return prisma.user.create({
        data: {
            displayName,
            role,
            pinHash: hashPin(pin),
            isActive: true,
        },
    });
}

async function ensureCategory(name: string, sortOrder: number) {
    const existing = await prisma.category.findFirst({ where: { name } });
    if (existing) return existing;

    return prisma.category.create({
        data: { name, sortOrder, isActive: true },
    });
}

async function ensureProduct(categoryId: string, name: string, basePrice: number) {
    const existing = await prisma.product.findFirst({
        where: { categoryId, name },
    });
    if (existing) return existing;

    return prisma.product.create({
        data: { categoryId, name, basePrice, isActive: true },
    });
}

async function main() {
    console.log('Seed: iniciando');

    // Usuarios
    await ensureUser('ADMIN', 'Administrador', '1234');
    await ensureUser('OPERARIO', 'Operario', '0000');

    // Categorías
    const comidas = await ensureCategory('Comidas', 1);
    const bebidas = await ensureCategory('Bebidas', 2);
    const postres = await ensureCategory('Postres', 3);

    // Productos (Comidas)
    await ensureProduct(comidas.id, 'Hamburguesa completa', 450000);
    await ensureProduct(comidas.id, 'Hamburguesa simple', 350000);
    await ensureProduct(comidas.id, 'Papas fritas', 200000);

    // Productos (Bebidas)
    await ensureProduct(bebidas.id, 'Coca Cola 500ml', 180000);
    await ensureProduct(bebidas.id, 'Sprite 500ml', 180000);
    await ensureProduct(bebidas.id, 'Agua sin gas', 120000);

    // Productos (Postres)
    await ensureProduct(postres.id, 'Flan', 220000);
    await ensureProduct(postres.id, 'Helado', 250000);

    console.log('Seed: finalizado correctamente');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
