const { app, BrowserWindow, session } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

const isDev = process.env.NODE_ENV === "development";

let mainWindow;
let backendProcess;

// ─── Levantar el backend ───────────────────────────────────────────────────

function startBackend() {
    const backendPath = path.resolve(__dirname, "..", "backend");

    backendProcess = spawn("node", ["dist/src/main.js"], {
        cwd: backendPath,
        env: { ...process.env, NODE_ENV: "production" },
        shell: true,
    });

    backendProcess.stdout.on("data", (data) => console.log(`[BACKEND]: ${data}`));
    backendProcess.stderr.on("data", (data) => console.error(`[BACKEND ERROR]: ${data}`));
    backendProcess.on("exit", (code) => console.log(`[BACKEND] terminó con código ${code}`));
}

// ─── Esperar a que el backend responda ────────────────────────────────────

function waitForBackend(url, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        function check() {
            http.get(url, (res) => {
                resolve();
            }).on("error", () => {
                if (Date.now() - start > timeout) {
                    reject(new Error("Backend no respondió a tiempo"));
                } else {
                    setTimeout(check, 500);
                }
            });
        }

        check();
    });
}

// ─── Ventana principal ────────────────────────────────────────────────────

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });

    if (isDev) {
        mainWindow.loadURL("http://127.0.0.1:5173/");
        mainWindow.webContents.openDevTools({ mode: "detach" });
    } else {
        mainWindow.loadURL("http://localhost:3000");
    }
}

// ─── Arranque ─────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy": [
                    "default-src 'self' http://localhost:3000 http://127.0.0.1:3000 'unsafe-inline' 'unsafe-eval' data: blob:",
                ],
            },
        });
    });

    if (!isDev) {
        startBackend();

        try {
            console.log("Esperando que el backend arranque...");
            await waitForBackend("http://localhost:3000/api/catalogo/categorias");
            console.log("Backend listo");
        } catch (e) {
            console.error("El backend no arrancó:", e.message);
        }
    }

    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (backendProcess) backendProcess.kill();
    if (process.platform !== "darwin") app.quit();
});