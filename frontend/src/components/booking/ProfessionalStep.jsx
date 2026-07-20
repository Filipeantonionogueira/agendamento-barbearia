import React from "react";
import { Users, Heart } from "lucide-react";
import { StepSection } from "./StepSection.jsx";

export function ProfessionalStep({ professionals, professionalId, onSelect, favoriteIds, onToggleFavorite }) {
  return (
    <StepSection title="2. Profissional" icon={<Users size={18} />}>
      <div className="grid gap-3 sm:grid-cols-2">
        {professionals.map((professional) => (
          <div
            key={professional.id}
            className={`relative flex items-center gap-3 rounded-lg border p-4 transition ${
              professionalId === professional.id ? "border-gold bg-gold-100" : "border-border hover:border-gold"
            }`}
          >
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite({ professionalId: professional.id })}
                className="absolute right-3 top-3 rounded-full p-1 text-text-muted transition hover:text-gold"
                aria-label="Favoritar profissional"
              >
                <Heart size={18} className={favoriteIds?.has(professional.id) ? "fill-gold text-gold" : ""} />
              </button>
            )}
            <button onClick={() => onSelect(professional.id)} className="flex flex-1 items-center gap-3 text-left">
              {professional.photoUrl ? (
                <img src={professional.photoUrl} alt={professional.name} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-full bg-ink text-gold">
                  <Users size={20} />
                </div>
              )}
              <div className="pr-6">
                <strong>{professional.name}</strong>
                {professional.bio && <p className="mt-1 text-sm text-text-secondary">{professional.bio}</p>}
              </div>
            </button>
          </div>
        ))}
      </div>
    </StepSection>
  );
}
