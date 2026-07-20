import React from "react";

export function Tabs({ tabs, active, onChange, className = "" }) {
  return (
    <nav className={`flex gap-2 overflow-x-auto ${className}`}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
            active === id ? "bg-ink text-white" : "bg-surface-subtle text-text-secondary hover:bg-border"
          }`}
        >
          {Icon && <Icon size={16} />} {label}
        </button>
      ))}
    </nav>
  );
}
