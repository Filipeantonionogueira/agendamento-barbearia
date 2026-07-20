import React from "react";
import { money } from "../../lib/format.js";

export function ServicosShowcase({ services }) {
  if (!services.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[.22em] text-gold">Servicos</p>
        <h2 className="mt-2 text-3xl font-semibold">O que fazemos</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-lg border border-border bg-surface p-5 shadow-xs transition hover:-translate-y-1 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <strong>{service.name}</strong>
              <span className="text-sm font-semibold text-gold">{money(service.priceCents)}</span>
            </div>
            <p className="mt-2 text-sm text-text-secondary">{service.description}</p>
            <p className="mt-3 text-xs text-text-muted">{service.estimatedMinutes} min</p>
          </div>
        ))}
      </div>
    </section>
  );
}
