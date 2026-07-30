import React from "react";
import { Scissors, Heart, Check, Clock } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { StepSection } from "./StepSection.jsx";
import { money } from "../../lib/format.js";

export function ServiceStep({ services, selected, onToggle, favoriteIds, onToggleFavorite }) {
  const reduce = useReducedMotion();

  return (
    <StepSection
      title="Escolha os servicos"
      description="Pode selecionar mais de um — somamos preco e duracao."
      icon={<Scissors size={19} />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => {
          const isSelected = selected.includes(service.id);
          return (
            <motion.div
              key={service.id}
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className={`relative overflow-hidden rounded-lg border transition-colors ${
                isSelected ? "border-gold bg-gold/8" : "border-border bg-surface hover:border-border-strong"
              }`}
            >
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite({ serviceId: service.id })}
                  className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-text-muted transition-colors hover:text-gold"
                  aria-label="Favoritar servico"
                >
                  <Heart size={17} className={favoriteIds?.has(service.id) ? "fill-gold text-gold" : ""} />
                </button>
              )}

              <button onClick={() => onToggle(service.id)} className="block w-full p-5 text-left">
                <div className="flex items-start gap-3 pr-8">
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all ${
                      isSelected ? "border-gold bg-gold text-ink" : "border-border-strong"
                    }`}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-text-primary">{service.name}</span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-text-secondary">
                      {service.description}
                    </span>
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 pl-8">
                  <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                    <Clock size={13} /> {service.estimatedMinutes} min
                  </span>
                  <span className="text-sm font-semibold text-gold-600 dark:text-gold-400">
                    {money(service.priceCents)}
                  </span>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </StepSection>
  );
}
