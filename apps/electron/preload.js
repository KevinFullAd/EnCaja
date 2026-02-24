const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    getApiBaseUrl: () => "http://127.0.0.1:3000",
});