import React from "react";

export function StepSection({ title, icon, children }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-gold">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
