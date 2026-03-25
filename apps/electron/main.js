const { app, BrowserWindow } = require("electron");
const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

let mainWindow;
let backendProcess;
let isQuitting = false;
let restartAttempts = 0;

const MAX_RESTARTS = 5;
const BACKEND_PORT = 3000;

// =========================
// ENV
// =========================
const isProd = app.isPackaged;

// Linux sandbox
if (process.platform === "linux") {
    app.commandLine.appendSwitch("no-sandbox");
}

// =========================
// PATHS
// =========================
const basePath = isProd
    ? process.resourcesPath
    : path.join(__dirname, "..");

const backendPath = path.join(basePath, "backend");

// 🔥 DB en userData (CORRECTO)
const userDataPath = app.getPath("userData");
const dbDir = path.join(userDataPath, "data");

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "dev.db");

// 🔥 FORZAR DATABASE_URL
process.env.DATABASE_URL = `file:${dbPath}`;

console.log("[DB PATH]:", process.env.DATABASE_URL);

// =========================
// MIGRATIONS (solo prod)
// =========================
function runMigrations() {
    if (!isProd) return;

    try {
        console.log("[DB] ejecutando migraciones...");

        execSync("npx prisma migrate deploy", {
            cwd: backendPath,
            stdio: "inherit",
            env: {
                ...process.env, // 🔥 IMPORTANTE: pasar env
            },
        });

        console.log("[DB] migraciones OK");
    } catch (err) {
        console.error("[DB] error en migraciones", err);
    }
}

// =========================
// BACKEND
// =========================
function startBackend() {
    console.log("[BACKEND] iniciando...");

    backendProcess = spawn("node", ["dist/src/main.js"], {
        cwd: backendPath,
        shell: true,
        env: {
            ...process.env, // 🔥 IMPORTANTE
        },
    });

    backendProcess.stdout.on("data", (data) => {
        console.log("[BACKEND]:", data.toString());
    });

    backendProcess.stderr.on("data", (data) => {
        console.error("[BACKEND ERROR]:", data.toString());
    });

    backendProcess.on("exit", (code) => {
        console.log("[BACKEND] murió", code);

        if (isQuitting) return;

        restartAttempts++;

        if (restartAttempts > MAX_RESTARTS) {
            console.error("[BACKEND] demasiados reinicios, abortando");
            return;
        }

        console.log("[BACKEND] reiniciando...");
        setTimeout(startBackend, 2000);
    });
}

// =========================
// BACKUP
// =========================
function backupDatabase() {
    try {
        if (!fs.existsSync(dbPath)) return;

        const backupDir = path.join(userDataPath, "backups");

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

        const backupFile = path.join(
            backupDir,
            `dev-${timestamp}.db`
        );

        fs.copyFileSync(dbPath, backupFile);

        console.log("[BACKUP] creado:", backupFile);
    } catch (err) {
        console.error("[BACKUP ERROR]:", err);
    }
}

// =========================
// STOP BACKEND
// =========================
function stopBackend() {
    if (!backendProcess) return;

    console.log("[BACKEND] cerrando...");

    try {
        backendProcess.kill("SIGTERM");

        setTimeout(() => {
            if (!backendProcess.killed) {
                backendProcess.kill("SIGKILL");
            }
        }, 3000);
    } catch (err) {
        console.error("[BACKEND STOP ERROR]:", err);
    }
}

// =========================
// WAIT BACKEND
// =========================
function waitForBackend() {
    return new Promise((resolve, reject) => {
        const http = require("http");
        const start = Date.now();

        function check() {
            http
                .get(`http://localhost:${BACKEND_PORT}/api/sistema`, () => {
                    resolve();
                })
                .on("error", () => {
                    if (Date.now() - start > 60000) {
                        return reject("Timeout backend");
                    }
                    setTimeout(check, 500);
                });
        }

        check();
    });
}

// =========================
// WINDOW
// =========================
async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
    });

    if (isProd) {
        runMigrations();
        startBackend();
    }

    try {
        await waitForBackend();
        await mainWindow.loadURL(`http://localhost:${BACKEND_PORT}`);
    } catch (err) {
        console.error("[APP] backend no está corriendo");

        mainWindow.loadURL("data:text/html,<h1>Backend no disponible</h1>");
    }
}

// =========================
// APP LIFECYCLE
// =========================
app.whenReady().then(createWindow);

app.on("before-quit", () => {
    console.log("[APP] before quit");
    isQuitting = true;

    backupDatabase();
    stopBackend();
});

app.on("window-all-closed", () => {
    app.quit();
});

app.on("will-quit", () => {
    stopBackend();
});