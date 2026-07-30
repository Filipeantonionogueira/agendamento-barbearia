import React from "react";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../context/ThemeProvider.jsx";

/**
 * Alternador de tema. `tone="onDark"` para uso sobre a imagem do hero,
 * onde o fundo e sempre escuro independentemente do tema.
 */
export function ThemeToggle({ tone = "surface", className = "" }) {
  const { theme, toggle, isDark } = useTheme();

  const tones = {
    surface: "border-border bg-surface text-text-secondary hover:text-text-primary",
    onDark: "border-white/20 bg-white/10 text-white hover:bg-white/20"
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
      className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-md border transition-colors ${tones[tone]} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 12, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -12, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.2 }}
          className="grid place-items-center"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
