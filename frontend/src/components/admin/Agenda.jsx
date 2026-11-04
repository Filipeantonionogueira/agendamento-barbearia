import React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { Badge } from "../ui/Badge.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { api } from "../../lib/api.js";
import { money } from "../../lib/format.js";
import { serviceNames, STATUS_VARIANT, STATUS_LABEL } from "../../lib/appointment.js";
import { RescheduleModal } from "./RescheduleModal.jsx";

const VIEWS = [
  ["dia", "Dia"],
  ["semana", "Semana"],
  ["mes", "Mes"],
  ["lista", "Lista"]
];

const STATUS_OPTIONS = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "CONFIRMADO", label: "Agendado" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Cancelado" }
];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
const sameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

/** Início da semana (domingo) da data informada. */
function startOfWeek(date) {
  const d = startOfDay(date);
  return addDays(d, -d.getDay());
}

/** Grade do mês: sempre 6 semanas para o layout não "pular" entre meses. */
function monthGrid(reference) {
  const first = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function AppointmentCard({ item, onStatusChange, onReschedule, compact = false }) {
  const canReschedule = !["CANCELADO", "CONCLUIDO"].includes(item.status);
  return (
    <div className={`rounded-lg border border-border bg-surface ${compact ? "p-2" : "p-4"}`}>
      <div className={`flex gap-3 ${compact ? "flex-col" : "flex-col sm:flex-row sm:items-center sm:justify-between"}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <strong className={compact ? "truncate text-sm" : ""}>{item.client?.name}</strong>
            <Badge variant={STATUS_VARIANT[item.status]}>{STATUS_LABEL[item.status] || item.status}</Badge>
          </div>
          <p className={`text-text-secondary ${compact ? "truncate text-xs" : "text-sm"}`}>
            {new Date(item.startAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ·{" "}
            {serviceNames(item)}
            {item.professional && ` · ${item.professional.name}`}
            {!compact && ` · ${money(item.totalPriceCents - (item.discountCents || 0))}`}
          </p>
        </div>
        <div className={`flex items-center gap-2 ${compact ? "flex-col items-stretch" : ""}`}>
          {canReschedule && onReschedule && (
            <button
              onClick={() => onReschedule(item)}
              className="rounded-lg border border-border-strong px-3 py-2 text-xs font-semibold hover:bg-surface-subtle"
            >
              Remarcar
            </button>
          )}
          <select
            className="field max-w-48 text-sm"
            value={item.status}
            onChange={(event) => onStatusChange(item.id, event.target.value)}
            aria-label={`Status do agendamento de ${item.client?.name}`}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export function Agenda() {
  const [items, setItems] = React.useState([]);
  const [view, setView] = React.useState("dia");
  const [reference, setReference] = React.useState(() => startOfDay(new Date()));
  const [loaded, setLoaded] = React.useState(false);
  const [toReschedule, setToReschedule] = React.useState(null);

  const load = React.useCallback(
    () =>
      api("/agendamentos")
        .then(setItems)
        .catch(() => setItems([]))
        .finally(() => setLoaded(true)),
    []
  );

  React.useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id, status) {
    await api(`/agendamentos/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }).catch(() => {});
    load();
  }

  const byDay = React.useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const key = startOfDay(new Date(item.startAt)).getTime();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    for (const list of map.values()) list.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    return map;
  }, [items]);

  const dayItems = (date) => byDay.get(startOfDay(date).getTime()) || [];

  function move(step) {
    if (view === "dia") setReference((d) => addDays(d, step));
    else if (view === "semana") setReference((d) => addDays(d, step * 7));
    else if (view === "mes") setReference((d) => new Date(d.getFullYear(), d.getMonth() + step, 1));
  }

  const periodLabel = () => {
    if (view === "dia") return reference.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    if (view === "semana") {
      const start = startOfWeek(reference);
      const end = addDays(start, 6);
      return `${start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} a ${end.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
    }
    if (view === "mes") return reference.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return "Todos os agendamentos";
  };

  const weekDays = React.useMemo(() => {
    const start = startOfWeek(reference);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [reference]);

  const monthDays = React.useMemo(() => monthGrid(reference), [reference]);

  return (
    <Panel title="Agenda" icon={<CalendarDays />}>
      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          {view !== "lista" && (
            <>
              <button onClick={() => move(-1)} className="rounded-lg border border-border p-2 hover:bg-surface-subtle" aria-label="Periodo anterior">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => move(1)} className="rounded-lg border border-border p-2 hover:bg-surface-subtle" aria-label="Proximo periodo">
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setReference(startOfDay(new Date()))}
                className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-subtle"
              >
                Hoje
              </button>
            </>
          )}
          <strong className="ml-1 capitalize">{periodLabel()}</strong>
        </div>
        <div className="flex overflow-x-auto no-scrollbar rounded-lg bg-surface-subtle p-1">
          {VIEWS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setView(value)}
              aria-pressed={view === value}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                view === value ? "bg-brand text-brand-fg shadow-xs" : "text-text-secondary hover:bg-surface hover:text-text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!loaded ? (
        <p className="text-sm text-text-secondary">Carregando...</p>
      ) : view === "dia" ? (
        <div className="grid gap-3">
          {dayItems(reference).length ? (
            dayItems(reference).map((item) => <AppointmentCard key={item.id} item={item} onStatusChange={setStatus} onReschedule={setToReschedule} />)
          ) : (
            <EmptyState title="Nenhum agendamento neste dia" text="Escolha outro dia ou aguarde novas reservas." />
          )}
        </div>
      ) : view === "semana" ? (
        <div className="grid gap-3 md:grid-cols-7">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className={`rounded-lg border p-2 ${sameDay(day, new Date()) ? "border-gold/60 bg-gold/10" : "border-border bg-surface"}`}>
              <p className="mb-2 text-center text-xs font-semibold text-text-secondary">
                {WEEKDAYS[day.getDay()]} {day.getDate()}
              </p>
              <div className="grid gap-2">
                {dayItems(day).map((item) => (
                  <AppointmentCard key={item.id} item={item} onStatusChange={setStatus} onReschedule={setToReschedule} compact />
                ))}
                {!dayItems(day).length && <p className="text-center text-xs text-text-muted">—</p>}
              </div>
            </div>
          ))}
        </div>
      ) : view === "mes" ? (
        <div>
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-text-secondary">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const list = dayItems(day);
              const isCurrentMonth = day.getMonth() === reference.getMonth();
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    setReference(day);
                    setView("dia");
                  }}
                  className={`min-h-[58px] sm:min-h-[76px] rounded-lg border p-1 text-left transition hover:border-gold ${
                    sameDay(day, new Date()) ? "border-gold/60 bg-gold/10" : "border-border"
                  } ${isCurrentMonth ? "bg-surface" : "bg-surface-subtle opacity-50"}`}
                >
                  <span className="text-xs font-semibold text-text-primary">{day.getDate()}</span>
                  {list.length > 0 && (
                    <span className="mt-1 block rounded bg-gold/20 px-1 py-0.5 text-center text-[10px] font-bold text-gold-600 dark:text-gold-400">
                      {list.length} agend.
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.length ? (
            items.map((item) => <AppointmentCard key={item.id} item={item} onStatusChange={setStatus} onReschedule={setToReschedule} />)
          ) : (
            <EmptyState title="Nenhum agendamento" text="Assim que houver reservas, elas aparecem aqui." />
          )}
        </div>
      )}

      {toReschedule && (
        <RescheduleModal
          appointment={toReschedule}
          onClose={() => setToReschedule(null)}
          onSaved={() => {
            setToReschedule(null);
            load();
          }}
        />
      )}
    </Panel>
  );
}
