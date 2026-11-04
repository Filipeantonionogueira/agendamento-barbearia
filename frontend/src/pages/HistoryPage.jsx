import React from "react";
import { useNavigate } from "react-router-dom";
import { ClientShell } from "../components/client/ClientShell.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { CancelAppointmentModal } from "../components/client/CancelAppointmentModal.jsx";
import { ReviewModal } from "../components/client/ReviewModal.jsx";
import { StarRating } from "../components/ui/StarRating.jsx";
import { api } from "../lib/api.js";
import { money } from "../lib/format.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { serviceNames, STATUS_VARIANT, STATUS_LABEL } from "../lib/appointment.js";

const STATUS_FILTERS = [
  ["TODOS", "Todos"],
  ["PENDENTE", "Pendentes"],
  ["CONFIRMADO", "Agendados"],
  ["CONCLUIDO", "Concluídos"],
  ["CANCELADO", "Cancelados"]
];


export function HistoryPage() {
  usePageMeta({ title: "Meu historico", noindex: true });
  const navigate = useNavigate();
  const [appointments, setAppointments] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);
  const [status, setStatus] = React.useState("TODOS");
  const [search, setSearch] = React.useState("");
  const [sortDesc, setSortDesc] = React.useState(true);
  const [toCancel, setToCancel] = React.useState(null);
  const [toReview, setToReview] = React.useState(null);

  const load = React.useCallback(() => {
    api("/agendamentos/minhas")
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoaded(true));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = appointments
    .filter((a) => (status === "TODOS" ? true : a.status === status))
    .filter((a) => (search ? serviceNames(a).toLowerCase().includes(search.toLowerCase()) : true))
    .sort((a, b) => (sortDesc ? new Date(b.startAt) - new Date(a.startAt) : new Date(a.startAt) - new Date(b.startAt)));

  function reschedule(appointment) {
    const serviceIds = appointment.appointmentServices.map((item) => item.serviceId).join(",");
    setToCancel(null);
    api(`/agendamentos/minhas/${appointment.id}/cancelar`, { method: "POST", body: JSON.stringify({ reason: "Reagendamento" }) })
      .catch(() => {})
      .finally(() => navigate(`/?servicos=${serviceIds}&prof=${appointment.professionalId}`));
  }

  const canCancel = (a) => new Date(a.startAt) > new Date() && !["CANCELADO", "CONCLUIDO"].includes(a.status);

  return (
    <ClientShell>
      <h1 className="text-2xl font-semibold md:text-3xl">Meu historico</h1>
      <p className="mt-1 text-text-secondary">Todos os seus atendimentos.</p>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                status === value ? "bg-brand text-brand-fg shadow-xs" : "bg-surface-subtle text-text-secondary hover:bg-surface hover:text-text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="field max-w-56"
            placeholder="Buscar servico"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button variant="ghost" size="sm" onClick={() => setSortDesc((current) => !current)}>
            {sortDesc ? "Mais recentes" : "Mais antigos"}
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {!loaded ? (
          <p className="text-sm text-text-secondary">Carregando...</p>
        ) : filtered.length ? (
          filtered.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-text-primary">{serviceNames(a)}</strong>
                    <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status] || a.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    {new Date(a.startAt).toLocaleString("pt-BR")} · {a.professional?.name} · {money(a.totalPriceCents)}
                  </p>
                  {a.notes && <p className="mt-1 text-sm text-text-muted">Obs: {a.notes}</p>}
                  {a.status === "CANCELADO" && a.cancelReason && (
                    <p className="mt-1 text-sm text-feedback-danger">Cancelado: {a.cancelReason}</p>
                  )}
                  {a.review && (
                    <div className="mt-2 flex items-center gap-2">
                      <StarRating value={a.review.rating} readOnly size={16} />
                      {a.review.reply && <span className="text-xs text-text-muted">Barbeiro respondeu</span>}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {a.status === "CONCLUIDO" && !a.review && (
                    <Button variant="accent" size="sm" onClick={() => setToReview(a)}>Avaliar</Button>
                  )}
                  {canCancel(a) && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => reschedule(a)}>Reagendar</Button>
                      <Button variant="danger" size="sm" onClick={() => setToCancel(a)}>Cancelar</Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState title="Nenhum atendimento" text="Nao encontramos atendimentos com esses filtros." />
        )}
      </div>

      {toCancel && (
        <CancelAppointmentModal
          appointment={toCancel}
          onClose={() => setToCancel(null)}
          onCanceled={() => {
            setToCancel(null);
            load();
          }}
        />
      )}

      {toReview && (
        <ReviewModal
          appointment={toReview}
          onClose={() => setToReview(null)}
          onSaved={() => {
            setToReview(null);
            load();
          }}
        />
      )}
    </ClientShell>
  );
}
