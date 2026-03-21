import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { join } from "path";

// Defaults para producción — no requiere .env
process.env.DATABASE_URL   = process.env.DATABASE_URL   ?? "file:./prisma/data/dev.db";
process.env.JWT_SECRET     = process.env.JWT_SECRET     ?? "encaja_pos_secret_2026";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "10h";
process.env.PRINTER_NAME   = process.env.PRINTER_NAME   ?? "POS-80";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // CORS — necesario tanto para dev (Vite) como para Electron (localhost)
    app.enableCors({
        origin: [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });

    // Archivos estáticos del backend (uploads de imágenes)
    app.useStaticAssets(join(process.cwd(), "public"));

    // Frontend buildeado — servido como estático
    const frontendPath = join(process.cwd(), "..", "frontend", "dist");
    app.useStaticAssets(frontendPath);

    // Fallback para React Router (HashRouter no lo necesita pero por las dudas)
    app.use((req: any, res: any, next: any) => {
        if (req.method !== "GET") return next();
        if (req.path.startsWith("/api")) return next();
        if (req.path.startsWith("/uploads")) return next();
        res.sendFile(join(frontendPath, "index.html"));
    });

    await app.listen(3000);
    console.log(`Backend corriendo en http://localhost:3000`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV ?? "development"}`);
}
bootstrap();