// src/main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./app/App"
import { AuthProvider } from "@/app/providers/AuthProviders"
import { BrowserRouter } from "react-router-dom"
import "@/app/styles/globals.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>

  </React.StrictMode>
)
