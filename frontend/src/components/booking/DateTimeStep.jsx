import React from "react";
import { CalendarDays } from "lucide-react";
import { StepSection } from "./StepSection.jsx";
import { today, addDays } from "../../lib/format.js";

export function DateTimeStep({ date, onDateChange, slots, time, onTimeChange, canWaitlist, onJoinWaitlist, waitlistMessage }) {
  return (
    <StepSection title="3. Dia e horario" icon={<CalendarDays size={18} />}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="field"
          type="date"
          aria-label="Data do agendamento"
          min={today()}
          max={addDays(30)}
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />
        <div className="grid grid-cols-3 gap-2">
          {slots.length ? (
            slots.map((slot) => (
              <button key={slot} onClick={() => onTimeChange(slot)} className={`slot ${time === slot ? "slot-active" : ""}`}>
                {slot}
              </button>
            ))
          ) : (
            <p className="col-span-3 rounded-lg bg-surface-subtle p-3 text-sm text-text-secondary">Selecione servicos para ver horarios.</p>
          )}
        </div>
      </div>
      {canWaitlist && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border bg-surface-subtle p-3 text-sm">
          <span className="text-text-secondary">Nao encontrou um horario bom?</span>
          <button onClick={onJoinWaitlist} className="font-semibold text-gold hover:underline">
            Entrar na lista de espera deste dia
          </button>
          {waitlistMessage && <span className="text-feedback-success">{waitlistMessage}</span>}
        </div>
      )}
    </StepSection>
  );
}
