import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { join } from "path";
import { existsSync } from "fs";

// Defaults para producción — no requiere .env
process.env.DATABASE_URL   ??= "file:./prisma/data/dev.db";
process.env.JWT_SECRET     ??= "encaja_pos_secret_2026";
process.env.JWT_EXPIRES_IN ??= "10h";
process.env.PRINTER_NAME   ??= "POS-80";

async function bootstrap() {
    const isProd = process.env.NODE_ENV === "production";

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bufferLogs: true,
    });

    // =========================
    // CORS
    // =========================
    app.enableCors({
        origin: true, // más flexible para Electron
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    });

    // =========================
    // Paths robustos (clave en Electron build)
    // =========================
    const rootPath = process.cwd();

    const uploadsPath = join(rootPath, "public");
    const frontendPath = isProd
        ? join(rootPath, "..", "frontend", "dist")
        : join(rootPath, "..", "frontend", "dist");

    // =========================
    // Validaciones (evita errores silenciosos)
    // =========================
    if (!existsSync(frontendPath)) {
        console.warn("[WARN] Frontend build no encontrado:", frontendPath);
    }

    if (!existsSync(uploadsPath)) {
        console.warn("[WARN] Carpeta uploads no encontrada:", uploadsPath);
    }

    // =========================
    // Estáticos
    // =========================
    app.useStaticAssets(uploadsPath, {
        prefix: "/uploads",
    });

    app.useStaticAssets(frontendPath);

    // =========================
    // Fallback SPA
    // =========================
    app.use((req: any, res: any, next: any) => {
        if (req.method !== "GET") return next();
        if (req.path.startsWith("/api")) return next();
        if (req.path.startsWith("/uploads")) return next();

        const indexPath = join(frontendPath, "index.html");

        if (!existsSync(indexPath)) {
            return res.status(500).send("Frontend no encontrado");
        }

        res.sendFile(indexPath);
    });
 

    // =========================
    // Puerto dinámico (por si falla 3000)
    // =========================
    const PORT = 3000;

    await app.listen(PORT);

    console.log("====================================");
    console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
    console.log(`📦 Entorno: ${process.env.NODE_ENV ?? "development"}`);
    console.log(`🗄️ DB: ${process.env.DATABASE_URL}`);
    console.log(`🖨️ Impresora: ${process.env.PRINTER_NAME}`);
    console.log("====================================");
}

bootstrap();