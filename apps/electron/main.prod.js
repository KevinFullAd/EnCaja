const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

let backendProcess = null;
const BACKEND_PORT = 3000;

// ====================================
// PATHS
// ====================================
function getBackendPath() {
    return app.isPackaged
        ? path.join(process.resourcesPath, "backend")
        : path.resolve(__dirname, "..", "backend");
}

function getFrontendPath() {
    return app.isPackaged
        ? path.join(process.resourcesPath, "frontend", "dist")
        : path.resolve(__dirname, "..", "frontend", "dist");
}

// ====================================
// ENV + DB
// ====================================
function setupEnv() {
    const userData = app.getPath("userData");
    const dbDir = path.join(userData, "data");
    const dbPath = path.join(dbDir, "dev.db");

    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // eliminar DB corrupta
    if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        if (stats.size === 0) {
            console.log("[DB] corrupta, eliminando...");
            fs.unlinkSync(dbPath);
        }
    }

    process.env.DATABASE_URL = `file:${dbPath}`;
    process.env.FRONTEND_PATH = getFrontendPath();
    process.env.NODE_ENV = app.isPackaged ? "production" : "development";

    console.log("[DB PATH]:", process.env.DATABASE_URL);
}

// ====================================
// BACKEND
// ====================================
function startBackend(backendPath) {
    backendProcess = spawn("node", ["dist/src/main.js"], {
        cwd: backendPath,
        env: process.env,
        stdio: "pipe"
    });

    backendProcess.stdout.on("data", (d) =>
        process.stdout.write("[BACKEND] " + d.toString())
    );

    backendProcess.stderr.on("data", (d) =>
        process.stderr.write("[BACKEND ERROR] " + d.toString())
    );

    backendProcess.on("close", (code) => {
        console.log(`[BACKEND] cerrado con código ${code}`);
    });
}

// ====================================
// WAIT BACKEND
// ====================================
function waitBackend() {
    return new Promise((resolve, reject) => {
        let retries = 0;

        function check() {
            http
                .get(`http://localhost:${BACKEND_PORT}/api/sistema/health`, () => resolve())
                .on("error", () => {
                    retries++;
                    if (retries > 50) {
                        reject(new Error("Backend no respondió"));
                    } else {
                        setTimeout(check, 300);
                    }
                });
        }

        check();
    });
}

// ====================================
// WINDOW
// ====================================
function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
    });

    win.loadURL(`http://localhost:${BACKEND_PORT}`);
}

// ====================================
// BOOTSTRAP
// ====================================
async function bootstrap() {
    try {
        const backendPath = getBackendPath();

        setupEnv();

        // 🔥 IMPORTANTE: NO correr Prisma en producción
        if (!app.isPackaged) {
            console.log("[DEV] Ejecutando prisma db push...");
            const prisma = spawn(
                process.platform === "win32" ? "npx.cmd" : "npx",
                ["prisma", "db", "push"],
                { cwd: backendPath, env: process.env }
            );

            await new Promise((res, rej) => {
                prisma.on("close", (code) => {
                    if (code === 0) res();
                    else rej(new Error("Prisma falló"));
                });
                prisma.on("error", rej);
            });
        }

        startBackend(backendPath);
        await waitBackend();

        createWindow();
    } catch (err) {
        console.error("[BOOTSTRAP ERROR]", err);
        app.quit();
    }
}

// ====================================
// APP
// ====================================
app.whenReady().then(bootstrap);

app.on("before-quit", () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});