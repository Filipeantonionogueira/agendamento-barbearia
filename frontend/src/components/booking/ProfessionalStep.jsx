import React from "react";
import { Users, Heart, User, Star, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { StepSection } from "./StepSection.jsx";
import { assetUrl } from "../../lib/api.js";

export function ProfessionalStep({ professionals, professionalId, onSelect, favoriteIds, onToggleFavorite }) {
  const reduce = useReducedMotion();

  return (
    <StepSection
      title="Escolha o profissional"
      description="Cada profissional tem a propria agenda."
      icon={<Users size={19} />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {professionals.map((professional) => {
          const isSelected = professionalId === professional.id;
          const photo = assetUrl(professional.photoUrl);
          return (
            <motion.div
              key={professional.id}
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className={`relative rounded-lg border transition-colors ${
                isSelected ? "border-gold bg-gold/8" : "border-border bg-surface hover:border-border-strong"
              }`}
            >
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite({ professionalId: professional.id })}
                  className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-text-muted transition-colors hover:text-gold"
                  aria-label="Favoritar profissional"
                >
                  <Heart size={17} className={favoriteIds?.has(professional.id) ? "fill-gold text-gold" : ""} />
                </button>
              )}

              <button onClick={() => onSelect(professional.id)} className="flex w-full items-center gap-4 p-5 text-left">
                <span className="relative shrink-0">
                  {photo ? (
                    <img src={photo} alt={professional.name} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-subtle text-text-muted">
                      <User size={24} />
                    </span>
                  )}
                  {isSelected && (
                    <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-gold text-ink ring-2 ring-surface">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1 pr-6">
                  <span className="block font-semibold text-text-primary">{professional.name}</span>
                  {professional.specialty && (
                    <span className="mt-0.5 block text-xs font-medium uppercase tracking-[0.14em] text-gold-600 dark:text-gold-400">
                      {professional.specialty}
                    </span>
                  )}
                  {professional.reviewsCount > 0 && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-text-secondary">
                      <Star size={12} className="fill-gold text-gold" />
                      {professional.rating.toFixed(1)} · {professional.reviewsCount} avaliacoes
                    </span>
                  )}
                  {professional.bio && (
                    <span className="mt-1.5 line-clamp-2 block text-sm text-text-secondary">{professional.bio}</span>
                  )}
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </StepSection>
  );
}
