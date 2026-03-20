import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { join } from "path";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Archivos estáticos del backend (uploads)
    app.useStaticAssets(join(process.cwd(), "public"));

    // Build del frontend
    const frontendPath = join(process.cwd(), "../frontend/dist");
    app.useStaticAssets(frontendPath);

    // CORS solo en desarrollo
    if (process.env.NODE_ENV !== "production") {
        app.enableCors({
            origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
        });
    }

    // Fallback para React Router
    app.use((req, res, next) => {
        if (req.method !== "GET") return next();
        if (req.path.startsWith("/api")) return next();
        if (req.path.startsWith("/uploads")) return next();

        res.sendFile(join(frontendPath, "index.html"));
    });

    await app.listen(3000);
}
bootstrap();