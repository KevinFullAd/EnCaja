// src/main.ts
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { join } from "path";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Servir archivos estáticos desde /public
    // → /uploads/abc.jpg es accesible como http://localhost:3000/uploads/abc.jpg
    app.useStaticAssets(join(process.cwd(), "public"));

    app.enableCors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });

    await app.listen(3000);
}
bootstrap();