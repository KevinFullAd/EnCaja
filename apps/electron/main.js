const { app, BrowserWindow } = require("electron");
const { spawn, exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

let backendProcess;
let isQuitting = false;

const BACKEND_PORT = 3000;

// =========================
// PATHS
// =========================
const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, "backend")
    : path.resolve(__dirname, "..", "backend");

// =========================
// DATABASE
// =========================
const userDataPath = app.getPath("userData");
const dbDir = path.join(userDataPath, "data");

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "dev.db");
process.env.DATABASE_URL = `file:${dbPath}`;

console.log("[DB PATH]:", process.env.DATABASE_URL);

// =========================
// KILL PORT
// =========================
function killPort(port) {
    return new Promise((resolve) => {
        console.log(`[PORT] liberando ${port}...`);

        if (process.platform === "win32") {
            exec(
                `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /PID %a /F`,
                () => resolve()
            );
        } else {
            exec(`lsof -ti:${port} | xargs kill -9`, () => resolve());
        }
    });
}

// =========================
// PRISMA INIT
// =========================
function initDatabase() {
    return new Promise((resolve) => {
        console.log("[DB] inicializando...");

        const prismaBin = path.join(
            backendPath,
            "node_modules",
            ".bin",
            process.platform === "win32" ? "prisma.cmd" : "prisma"
        );

        const prisma = spawn(prismaBin, ["db", "push"], {
            cwd: backendPath,
            env: { ...process.env },
        });

        prisma.stdout.on("data", (d) => console.log("[PRISMA]:", d.toString()));
        prisma.stderr.on("data", (d) => console.error("[PRISMA ERROR]:", d.toString()));

        prisma.on("close", () => {
            console.log("[DB] listo");
            resolve();
        });

        prisma.on("error", () => resolve());
    });
}

// =========================
// START BACKEND
// =========================
function startBackend() {
    console.log("[BACKEND] iniciando...");

    backendProcess = spawn("node", ["dist/src/main.js"], {
        cwd: backendPath,
        env: { ...process.env },
    });

    backendProcess.stdout.on("data", (d) => console.log("[BACKEND]:", d.toString()));
    backendProcess.stderr.on("data", (d) => console.error("[BACKEND ERROR]:", d.toString()));

    backendProcess.on("exit", (code) => {
        console.log("[BACKEND] murió", code);

        if (!isQuitting) {
            console.error("[BACKEND] cayó inesperadamente");
        }
    });
}

// =========================
// WAIT BACKEND
// =========================
function waitForBackend() {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        function check() {
            http
                .get(`http://localhost:${BACKEND_PORT}/api/sistema/health`, (res) => {
                    if (res.statusCode === 200) {
                        console.log("[BACKEND] listo");
                        return resolve();
                    }
                    setTimeout(check, 300);
                })
                .on("error", () => {
                    if (Date.now() - start > 60000) {
                        return reject("timeout backend");
                    }
                    setTimeout(check, 300);
                });
        }

        check();
    });
}

// =========================
// CREATE WINDOW
// =========================
function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
    });

    win.loadURL(`http://localhost:${BACKEND_PORT}`);
}

// =========================
// BOOTSTRAP (🔥 CLAVE)
// =========================
async function bootstrap() {
    await initDatabase();

    await killPort(BACKEND_PORT);

    startBackend();

    await waitForBackend();

    createWindow();
}

// =========================
// STOP BACKEND
// =========================
function stopBackend() {
    if (!backendProcess) return;

    try {
        backendProcess.kill();
    } catch {}
}

// =========================
// APP
// =========================
app.whenReady().then(bootstrap);

app.on("before-quit", () => {
    isQuitting = true;
    stopBackend();
});

app.on("window-all-closed", () => {
    app.quit();
});