import React from "react";
import { Award } from "lucide-react";

const TIER_COLOR = {
  BRONZE: "bg-[#B87333]",
  PRATA: "bg-[#9CA3AF]",
  OURO: "bg-gold",
  BLACK: "bg-ink"
};

// Barra de progresso e nivel de fidelidade, reutilizada no dashboard e na pagina dedicada.
export function LoyaltyProgress({ summary, compact = false }) {
  if (!summary) return null;
  const { level, nextLevel, pointsToNext, progress, points } = summary;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`grid h-9 w-9 place-items-center rounded-full text-white ${TIER_COLOR[level.key] || "bg-ink"}`}>
            <Award size={18} />
          </span>
          <div>
            <strong className="block leading-tight">{level.label}</strong>
            <span className="text-xs text-text-secondary">{points} pontos</span>
          </div>
        </div>
        {nextLevel && (
          <span className="text-xs text-text-secondary">
            Faltam <strong>{pointsToNext}</strong> para {nextLevel.label}
          </span>
        )}
      </div>
      <div className="mt-3 h-2 rounded-full bg-surface-subtle">
        <div className={`h-2 rounded-full ${TIER_COLOR[level.key] || "bg-gold"}`} style={{ width: `${progress}%` }} />
      </div>
      {!compact && nextLevel && (
        <p className="mt-2 text-sm text-text-secondary">
          Continue agendando para desbloquear <strong>{nextLevel.label}</strong>: {nextLevel.benefit}
        </p>
      )}
      {!compact && !nextLevel && (
        <p className="mt-2 text-sm text-text-secondary">Voce atingiu o nivel maximo. Aproveite todos os beneficios!</p>
      )}
    </div>
  );
}
