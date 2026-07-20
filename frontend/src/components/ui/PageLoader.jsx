import React from "react";

// Fallback de carregamento entre chunks (code splitting) e guards de rota.
export function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-gold" aria-hidden="true" />
        <span className="text-sm text-text-secondary">Carregando...</span>
      </div>
    </div>
  );
}
