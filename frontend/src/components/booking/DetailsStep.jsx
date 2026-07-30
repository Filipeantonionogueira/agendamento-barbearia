import React from "react";
import { UserRound } from "lucide-react";
import { StepSection } from "./StepSection.jsx";

export function DetailsStep({ clientName, onClientNameChange, phone, onPhoneChange, notes, onNotesChange }) {
  return (
    <StepSection
      title="Seus dados"
      description="Usamos apenas para identificar e confirmar o atendimento."
      icon={<UserRound size={19} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-text-secondary">Seu nome</span>
          <input
            className="field"
            placeholder="Como podemos te chamar?"
            autoComplete="name"
            value={clientName}
            onChange={(event) => onClientNameChange(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-text-secondary">WhatsApp (opcional)</span>
          <input
            className="field"
            placeholder="(00) 00000-0000"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
          />
        </label>
      </div>

      {onNotesChange && (
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-text-secondary">Observacoes (opcional)</span>
          <textarea
            className="field min-h-[92px] resize-y"
            placeholder="Alguma preferencia ou detalhe que devemos saber?"
            value={notes || ""}
            onChange={(event) => onNotesChange(event.target.value)}
          />
        </label>
      )}
    </StepSection>
  );
}
