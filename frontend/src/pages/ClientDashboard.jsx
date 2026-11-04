import React from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, History, Scissors, User, Heart } from "lucide-react";
import { ClientShell } from "../components/client/ClientShell.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import { useFavorites } from "../hooks/useFavorites.js";
import { api } from "../lib/api.js";
import { money } from "../lib/format.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { serviceNames, STATUS_VARIANT, STATUS_LABEL } from "../lib/appointment.js";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}


export function ClientDashboard() {
  usePageMeta({ title: "Minha conta", noindex: true });
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [appointments, setAppointments] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    api("/agendamentos/minhas")
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoaded(true));
  }, []);

  const now = new Date();
  const next = appointments
    .filter((a) => new Date(a.startAt) >= now && a.status !== "CANCELADO")
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))[0];
  const lastDone = appointments.find((a) => a.status === "CONCLUIDO");
  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <ClientShell>
      <h1 className="text-2xl font-semibold md:text-3xl">
        {greeting()}, {firstName}
      </h1>
      <p className="mt-1 text-text-secondary">Bem-vindo a sua area.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <CalendarPlus size={16} className="text-gold" /> Proximo agendamento
          </div>
          {next ? (
            <div className="mt-3">
              <strong className="text-lg">{serviceNames(next)}</strong>
              <p className="mt-1 text-sm text-text-secondary">
                {new Date(next.startAt).toLocaleString("pt-BR")} · {next.professional?.name}
              </p>
              <div className="mt-2"><Badge variant={STATUS_VARIANT[next.status]}>{STATUS_LABEL[next.status] || next.status}</Badge></div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-secondary">Voce nao tem agendamentos futuros.</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <Scissors size={16} className="text-gold" /> Ultimo corte
          </div>
          {lastDone ? (
            <div className="mt-3">
              <strong className="text-lg">{serviceNames(lastDone)}</strong>
              <p className="mt-1 text-sm text-text-secondary">
                {new Date(lastDone.startAt).toLocaleDateString("pt-BR")} · {lastDone.professional?.name}
              </p>
              <p className="mt-1 text-sm font-semibold text-gold">{money(lastDone.totalPriceCents)}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-secondary">Nenhum atendimento concluido ainda.</p>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link to="/" className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition hover:border-gold">
          <CalendarPlus size={18} className="text-gold" /> <span className="font-medium">Novo agendamento</span>
        </Link>
        <Link to="/conta/perfil" className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition hover:border-gold">
          <User size={18} className="text-gold" /> <span className="font-medium">Editar perfil</span>
        </Link>
        <Link to="/conta/historico" className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition hover:border-gold">
          <History size={18} className="text-gold" /> <span className="font-medium">Ver historico completo</span>
        </Link>
      </div>

      {favorites.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Heart size={18} className="text-gold" /> Favoritos
          </h2>
          <div className="flex flex-wrap gap-2">
            {favorites.map((fav) => {
              const label = fav.service?.name || fav.professional?.name;
              const query = fav.serviceId ? `servicos=${fav.serviceId}` : `prof=${fav.professionalId}`;
              return (
                <Link
                  key={fav.id}
                  to={`/?${query}`}
                  className="rounded-full border border-border bg-surface px-4 py-2 text-sm transition hover:border-gold"
                >
                  {fav.serviceId ? "Servico" : "Profissional"}: <strong>{label}</strong>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Atendimentos recentes</h2>
        {!loaded ? (
          <p className="text-sm text-text-secondary">Carregando...</p>
        ) : appointments.length ? (
          <div className="grid gap-2">
            {appointments.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
                <div>
                  <strong>{serviceNames(a)}</strong>
                  <p className="text-sm text-text-secondary">
                    {new Date(a.startAt).toLocaleString("pt-BR")} · {a.professional?.name}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status] || a.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sem atendimentos ainda" text="Assim que voce agendar, seus atendimentos aparecem aqui." />
        )}
      </div>
    </ClientShell>
  );
}
