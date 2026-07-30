import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Barra de progresso do agendamento.
 * Etapas ja concluidas sao clicaveis para o cliente revisar o que escolheu.
 */
export function StepProgress({ steps, current, completed, onSelect }) {
  const percent = (current / (steps.length - 1)) * 100;

  return (
    <div>
      <div className="relative h-1 overflow-hidden rounded-full bg-surface-subtle">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gold"
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </div>

      <ol className="mt-4 flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isDone = completed.includes(index) && index !== current;
          const isCurrent = index === current;
          const reachable = isDone || index < current;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
              <button
                type="button"
                disabled={!reachable && !isCurrent}
                onClick={() => reachable && onSelect(index)}
                aria-current={isCurrent ? "step" : undefined}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-gold text-ink ring-4 ring-gold/20"
                    : isDone
                      ? "bg-feedback-success text-white"
                      : "bg-surface-subtle text-text-muted"
                } ${reachable && !isCurrent ? "cursor-pointer hover:brightness-95" : ""}`}
              >
                {isDone ? <Check size={15} /> : index + 1}
              </button>
              <span
                className={`hidden truncate text-xs font-medium sm:block ${
                  isCurrent ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
