import React from "react";

export function Metric({ label, value, detail, accent = false }) {
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${accent ? "border-gold-200 bg-gold-100" : "border-border bg-surface"}`}>
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <strong className="mt-2 block truncate text-2xl">{value}</strong>
      {detail && <span className="mt-2 block text-xs text-text-secondary">{detail}</span>}
    </div>
  );
}
