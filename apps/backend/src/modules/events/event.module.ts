// src/modules/events/event.module.ts
import { Module, Global } from "@nestjs/common";
import { EventService } from "./event.service";

// Global — disponible en todos los módulos sin importar explícitamente
@Global()
@Module({
    providers: [EventService],
    exports:   [EventService],
})
export class EventModule {}