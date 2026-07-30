import React from "react";

export function Panel({ title, description, icon, actions, children }) {
  return (
    <section>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-gold/12 text-gold-600 dark:text-gold-400">
            {React.cloneElement(icon, { size: 21 })}
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
            {description && <p className="mt-0.5 text-sm text-text-secondary">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {children}
    </section>
  );
}
