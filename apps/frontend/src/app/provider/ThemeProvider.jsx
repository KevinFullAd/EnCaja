import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const THEME_KEY = "encaja.theme";
const THEMES = ["light", "dark", "system"];

function getSystemTheme() {
    if (typeof window === "undefined") return "light";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeToDom(theme) {
    document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem(THEME_KEY);
        return THEMES.includes(saved) ? saved : "system";
    });

    const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

    // Aplicar al DOM + persistir preferencia
    useEffect(() => {
        localStorage.setItem(THEME_KEY, theme);
        applyThemeToDom(resolvedTheme);
    }, [theme, resolvedTheme]);

    // Si está en "system", reaccionar a cambios del SO
    useEffect(() => {
        if (theme !== "system") return;

        const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
        if (!mq) return;

        const handler = () => applyThemeToDom(getSystemTheme());

        // compat: addEventListener vs addListener
        if (mq.addEventListener) mq.addEventListener("change", handler);
        else mq.addListener(handler);

        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", handler);
            else mq.removeListener(handler);
        };
    }, [theme]);

    const value = useMemo(() => {
        return {
            theme,                 // "light" | "dark" | "system"
            resolvedTheme,         // "light" | "dark" (lo que realmente se aplica)
            setTheme,
            toggleTheme: () =>
                setTheme((t) => {
                    const base = t === "system" ? getSystemTheme() : t;
                    return base === "light" ? "dark" : "light";
                }),
        };
    }, [theme, resolvedTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider />");
    return ctx;
}