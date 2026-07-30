import React from "react";

const STORAGE_KEY = "bp_theme";
const ThemeContext = React.createContext(null);

/** Preferencia salva > preferencia do sistema. Lido antes do 1o paint via main.jsx. */
function readInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // storage bloqueado: cai na preferencia do sistema
  }
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0A0A0C" : "#F7F6F3");
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(readInitialTheme);

  React.useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // sem persistencia: o tema vale apenas para a sessao atual
    }
  }, [theme]);

  const value = React.useMemo(
    () => ({ theme, isDark: theme === "dark", setTheme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider.");
  return ctx;
}
