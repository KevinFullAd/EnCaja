const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let backendProcess;

function startBackend() {
    const backendPath = path.join(__dirname, "../backend");

    backendProcess = spawn("node", ["dist/main.js"], {
        cwd: backendPath,
        env: {
            ...process.env,
            NODE_ENV: "production",
        },
        shell: true,
    });

    backendProcess.stdout.on("data", (data) => {
        console.log(`[BACKEND]: ${data}`);
    });

    backendProcess.stderr.on("data", (data) => {
        console.error(`[BACKEND ERROR]: ${data}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });

    const indexPath = path.join(
        __dirname,
        "../frontend/dist/index.html"
    );

    mainWindow.loadFile(indexPath);
}

app.whenReady().then(async () => {
    startBackend();

    // Espera a que backend levante
    await new Promise((resolve) => setTimeout(resolve, 2000));

    createWindow();
});

app.on("window-all-closed", () => {
    if (backendProcess) backendProcess.kill();
    if (process.platform !== "darwin") app.quit();
});