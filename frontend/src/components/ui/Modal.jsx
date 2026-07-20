import React from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 animate-fadeIn" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-surface p-6 shadow-lg animate-slideUp"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-text-muted hover:bg-surface-subtle" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
