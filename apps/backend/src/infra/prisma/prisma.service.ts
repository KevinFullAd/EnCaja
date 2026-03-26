import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";

function resolveDatabasePath() {
    const isElectron = !!process.versions.electron;

    let basePath: string;

    if (isElectron) {
        // ✔ ubicación correcta cross-platform
        basePath = join(homedir(), ".config", "encaja-app");
    } else {
        // dev
        basePath = process.cwd();
    }

    const dbDir = join(basePath, "data");

    if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = join(dbDir, "dev.db");

    return `file:${dbPath}`;
}

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {

    async onModuleInit() {
        await this.$connect();

        await this.$queryRawUnsafe(`PRAGMA journal_mode = WAL;`);
        await this.$executeRawUnsafe(`PRAGMA synchronous = NORMAL;`);

        // =========================
        // seed
        // =========================
        const userCount = await this.user.count();

        if (userCount === 0) {
            await this.user.create({
                data: {
                    displayName: "Admin",
                    role: "ADMIN",
                    pinHash: "1234",
                },
            });

            console.log("[SEED] Usuario admin creado");
        }


        console.log("[PRISMA] conectado");
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}