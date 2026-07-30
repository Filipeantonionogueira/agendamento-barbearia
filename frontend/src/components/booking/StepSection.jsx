import React from "react";

/** Cabecalho + corpo de uma etapa do agendamento. A animacao fica na pagina. */
export function StepSection({ title, description, icon, children }) {
  return (
    <section>
      <header className="mb-6 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-gold/12 text-gold-600 dark:text-gold-400">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-text-secondary">{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}
