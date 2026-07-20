import React from "react";

export function EmptyState({ title, text }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-border bg-surface-subtle p-6 text-center">
      <div>
        <strong className="block text-text-secondary">{title}</strong>
        <p className="mt-2 max-w-xs text-sm text-text-muted">{text}</p>
      </div>
    </div>
  );
}
