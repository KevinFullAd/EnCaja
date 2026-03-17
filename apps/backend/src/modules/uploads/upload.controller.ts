// src/modules/uploads/uploads.controller.ts
import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import { v4 as uuid } from "uuid";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

// Asegurar que el directorio existe al arrancar
if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 5;

@Controller("api/uploads")
export class UploadsController {
    @Post("imagen")
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({
                destination: UPLOAD_DIR,
                filename: (_req, file, cb) => {
                    const ext = extname(file.originalname).toLowerCase();
                    cb(null, `${uuid()}${ext}`);
                },
            }),
            limits: {
                fileSize: MAX_SIZE_MB * 1024 * 1024,
            },
            fileFilter: (_req, file, cb) => {
                if (!ALLOWED_TYPES.includes(file.mimetype)) {
                    return cb(
                        new BadRequestException(
                            `Tipo de archivo no permitido. Usá: ${ALLOWED_TYPES.join(", ")}`
                        ),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    uploadImagen(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException("No se recibió ningún archivo.");

        return {
            url: `/uploads/${file.filename}`,
            originalName: file.originalname,
            size: file.size,
        };
    }
}