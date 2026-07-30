import React from "react";
import { motion } from "framer-motion";

/** Abas com indicador deslizante (layoutId) — usado no painel administrativo. */
export function Tabs({ tabs, active, onChange, className = "" }) {
  const groupId = React.useId();

  return (
    <nav className={`no-scrollbar flex gap-1 overflow-x-auto rounded-lg bg-surface-subtle p-1 ${className}`}>
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
              isActive ? "text-brand-fg" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={`tab-pill-${groupId}`}
                className="absolute inset-0 rounded-md bg-brand"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {Icon && <Icon size={16} />} {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
