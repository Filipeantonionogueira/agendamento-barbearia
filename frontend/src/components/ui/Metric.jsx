import React from "react";

export function Metric({ label, value, detail, accent = false }) {
  return (
    <div
      className={`rounded-lg border p-4 shadow-sm transition-colors ${
        accent
          ? "border-gold/40 bg-gold/10 dark:border-gold/30 dark:bg-gold/10"
          : "border-border bg-surface"
      }`}
    >
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <strong
        className={`mt-2 block truncate text-2xl font-bold ${
          accent ? "text-gold-700 dark:text-gold-400" : "text-text-primary"
        }`}
      >
        {value}
      </strong>
      {detail && <span className="mt-2 block text-xs text-text-secondary">{detail}</span>}
    </div>
  );
}
