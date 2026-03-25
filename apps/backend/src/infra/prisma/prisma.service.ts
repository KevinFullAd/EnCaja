import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

function resolveDatabasePath() {
    const isElectron = !!process.versions.electron;

    let basePath;

    if (isElectron) { 
        basePath = (process as any).resourcesPath;
    } else {
        // Dev normal
        basePath = process.cwd();
    }

    const dbDir = join(basePath, "prisma", "data");

    if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
    }

    return `file:${join(dbDir, "dev.db")}`;
}

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            datasources: {
                db: {
                    url: resolveDatabasePath(),
                },
            },
        });
    }

    async onModuleInit() {
        await this.$connect();
 
        await this.$queryRawUnsafe(`PRAGMA journal_mode=WAL;`);

        console.log("[PRISMA] conectado");
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log("[PRISMA] desconectado");
    }
}