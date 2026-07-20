import React from "react";
import { Clock } from "lucide-react";
import { StepSection } from "./StepSection.jsx";

export function DetailsStep({ clientName, onClientNameChange, phone, onPhoneChange, notes, onNotesChange }) {
  return (
    <StepSection title="4. Seus dados" icon={<Clock size={18} />}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="field" placeholder="Seu nome" value={clientName} onChange={(event) => onClientNameChange(event.target.value)} />
        <input className="field" placeholder="WhatsApp opcional" value={phone} onChange={(event) => onPhoneChange(event.target.value)} />
      </div>
      {onNotesChange && (
        <textarea
          className="field mt-3 min-h-[72px] resize-y"
          placeholder="Observacoes (opcional)"
          value={notes || ""}
          onChange={(event) => onNotesChange(event.target.value)}
        />
      )}
    </StepSection>
  );
}
