// src/modules/printer/printer.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execAsync = promisify(exec);

export type PrintResult = {
    success: boolean;
    printerName: string;
    error: string | null;
};

// ESC/POS — corte completo de papel
const ESC_POS_CUT = "\x1d\x56\x00";

@Injectable()
export class PrinterService {
    private readonly logger = new Logger(PrinterService.name);

    get printerName(): string {
        return process.env.PRINTER_NAME ?? "POS-80";
    }

    /**
     * Imprime texto plano con corte automático al final.
     * Escribe a un archivo temporal para preservar los bytes ESC/POS exactos.
     */
    async printText(text: string): Promise<PrintResult> {
        const printer = this.printerName;
        const content = text + "\n\n\n\n" + ESC_POS_CUT;

        // Usamos archivo temporal para no perder bytes de control con printf/echo
        const tmpFile = join(tmpdir(), `encaja-ticket-${Date.now()}.bin`);

        try {
            await writeFile(tmpFile, content, "binary");
            await execAsync(`lp -d ${printer} -o raw "${tmpFile}"`);
            this.logger.log(`Impresión exitosa en ${printer}`);
            return { success: true, printerName: printer, error: null };
        } catch (err: any) {
            const errorMsg = err?.stderr ?? err?.message ?? "Error desconocido";
            this.logger.error(`Error al imprimir en ${printer}: ${errorMsg}`);
            return { success: false, printerName: printer, error: errorMsg };
        } finally {
            // Limpiar archivo temporal
            unlink(tmpFile).catch(() => {});
        }
    }

    async checkStatus(): Promise<{ available: boolean; printerName: string; raw: string }> {
        const printer = this.printerName;
        try {
            const { stdout } = await execAsync(`lpstat -p ${printer}`);
            const available = stdout.includes("habilitada") || stdout.includes("enabled");
            return { available, printerName: printer, raw: stdout.trim() };
        } catch (err: any) {
            return {
                available: false,
                printerName: printer,
                raw: err?.stderr ?? err?.message ?? "No disponible",
            };
        }
    }
}