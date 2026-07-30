import React from "react";
import { CalendarDays, BellRing, CheckCircle2, CalendarX } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { StepSection } from "./StepSection.jsx";
import { today, addDays } from "../../lib/format.js";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

/** Proximos 14 dias em trilho horizontal — mais rapido que abrir o date picker. */
function quickDays(count = 14) {
  const list = [];
  const base = new Date();
  for (let index = 0; index < count; index += 1) {
    const date = new Date(base);
    date.setDate(base.getDate() + index);
    list.push({
      value: date.toISOString().slice(0, 10),
      weekday: WEEKDAYS[date.getDay()],
      day: String(date.getDate()).padStart(2, "0"),
      isToday: index === 0
    });
  }
  return list;
}

export function DateTimeStep({
  date,
  onDateChange,
  slots,
  time,
  onTimeChange,
  canWaitlist,
  onJoinWaitlist,
  waitlistMessage,
  loading,
  ready
}) {
  const reduce = useReducedMotion();
  const days = React.useMemo(() => quickDays(), []);

  return (
    <StepSection
      title="Escolha o dia e o horario"
      description="Mostramos apenas os horarios realmente livres."
      icon={<CalendarDays size={19} />}
    >
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {days.map((item) => {
          const active = date === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onDateChange(item.value)}
              className={`flex min-w-[62px] flex-col items-center gap-0.5 rounded-md border px-3 py-2.5 transition-all ${
                active
                  ? "border-gold bg-gold text-ink"
                  : "border-border bg-surface text-text-secondary hover:border-gold/60"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wide opacity-80">{item.weekday}</span>
              <span className="text-lg font-bold leading-none">{item.day}</span>
              {item.isToday && <span className="text-[10px] font-semibold opacity-80">hoje</span>}
            </button>
          );
        })}
      </div>

      <label className="mt-3 block">
        <span className="mb-1.5 block text-xs font-medium text-text-muted">Ou escolha outra data</span>
        <input
          className="field max-w-xs"
          type="date"
          aria-label="Data do agendamento"
          min={today()}
          max={addDays(60)}
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />
      </label>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-text-primary">Horarios disponiveis</p>

        {!ready ? (
          <p className="rounded-lg border border-dashed border-border-strong bg-surface-subtle p-5 text-sm text-text-secondary">
            Selecione os servicos e o profissional para ver os horarios.
          </p>
        ) : loading ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[46px] animate-pulse rounded-md bg-surface-subtle" />
            ))}
          </div>
        ) : slots.length ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot, index) => (
              <motion.button
                key={slot}
                onClick={() => onTimeChange(slot)}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.25 }}
                className={`slot ${time === slot ? "slot-active" : ""}`}
              >
                {slot}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface-subtle p-5 text-sm text-text-secondary">
            <CalendarX size={20} className="shrink-0 text-text-muted" />
            Nenhum horario livre neste dia. Tente outra data.
          </div>
        )}
      </div>

      {canWaitlist && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-subtle p-4 text-sm">
          <BellRing size={18} className="shrink-0 text-gold" />
          <span className="text-text-secondary">Nao encontrou um horario bom?</span>
          <button
            onClick={onJoinWaitlist}
            className="font-semibold text-gold-600 underline-offset-4 hover:underline dark:text-gold-400"
          >
            Entrar na lista de espera deste dia
          </button>
          {waitlistMessage && (
            <span className="inline-flex w-full items-center gap-1.5 text-feedback-success">
              <CheckCircle2 size={15} /> {waitlistMessage}
            </span>
          )}
        </div>
      )}
    </StepSection>
  );
}
