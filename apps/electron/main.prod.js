const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

let backendProcess = null;

const BACKEND_PORT = 3000;

if (process.platform === "linux") {
    app.commandLine.appendSwitch("disable-dev-shm-usage");
}

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
// DB SETUP (ÚNICO LUGAR)
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
// PRISMA INIT
// ====================================
function initDatabase(backendPath) {
    return new Promise((resolve, reject) => {
        const prisma = spawn(
            process.platform === "win32" ? "npx.cmd" : "npx",
            ["prisma", "db", "push"],
            { cwd: backendPath, env: process.env }
        );

        prisma.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error("Prisma falló"));
        });

        prisma.on("error", reject);
    });
}

// ====================================
// BACKEND
// ====================================
function startBackend(backendPath) {
    backendProcess = spawn("node", ["dist/src/main.js"], {
        cwd: backendPath,
        env: process.env,
    });

    backendProcess.stdout.on("data", (d) =>
        process.stdout.write("[BACKEND] " + d.toString())
    );

    backendProcess.stderr.on("data", (d) =>
        process.stderr.write("[BACKEND ERROR] " + d.toString())
    );
}

// ====================================
// WAIT BACKEND
// ====================================
function waitBackend() {
    return new Promise((resolve) => {
        function check() {
            http
                .get(`http://localhost:${BACKEND_PORT}/api/sistema/health`, () => resolve())
                .on("error", () => setTimeout(check, 300));
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
    const backendPath = getBackendPath();

    setupEnv();

    await initDatabase(backendPath);
    startBackend(backendPath);
    await waitBackend();

    createWindow();
}

// ====================================
// APP
// ====================================
app.whenReady().then(bootstrap);

app.on("before-quit", () => {
    if (backendProcess) backendProcess.kill();
});