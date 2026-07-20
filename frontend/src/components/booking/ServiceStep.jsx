import React from "react";
import { Scissors, Heart } from "lucide-react";
import { StepSection } from "./StepSection.jsx";
import { money } from "../../lib/format.js";

export function ServiceStep({ services, selected, onToggle, favoriteIds, onToggleFavorite }) {
  return (
    <StepSection title="1. Servicos" icon={<Scissors size={18} />}>
      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.id}
            className={`relative rounded-lg border p-4 transition ${
              selected.includes(service.id) ? "border-gold bg-gold-100" : "border-border hover:border-gold"
            }`}
          >
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite({ serviceId: service.id })}
                className="absolute right-3 top-3 rounded-full p-1 text-text-muted transition hover:text-gold"
                aria-label="Favoritar servico"
              >
                <Heart size={18} className={favoriteIds?.has(service.id) ? "fill-gold text-gold" : ""} />
              </button>
            )}
            <button onClick={() => onToggle(service.id)} className="block w-full text-left">
              <div className="flex items-start justify-between gap-3 pr-6">
                <strong>{service.name}</strong>
                <span className="text-sm font-semibold text-gold">{money(service.priceCents)}</span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{service.description}</p>
              <p className="mt-3 text-xs text-text-muted">{service.estimatedMinutes} min</p>
            </button>
          </div>
        ))}
      </div>
    </StepSection>
  );
}
