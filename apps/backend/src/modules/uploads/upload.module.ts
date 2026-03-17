// src/modules/uploads/uploads.module.ts
import { Module } from "@nestjs/common";
import { UploadsController } from "./upload.controller";

@Module({
    controllers: [UploadsController],
})
export class UploadsModule {}