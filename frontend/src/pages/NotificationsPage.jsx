import React from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, XCircle, Star, Bell, Archive, Check } from "lucide-react";
import { ClientShell } from "../components/client/ClientShell.jsx";
import { Button } from "../components/ui/Button.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { api } from "../lib/api.js";
import { usePageMeta } from "../hooks/usePageMeta.js";

const CATEGORY_ICON = {
  AGENDAMENTO: CalendarPlus,
  CANCELAMENTO: XCircle,
  AVALIACAO: Star,
  SISTEMA: Bell
};

export function NotificationsPage() {
  usePageMeta({ title: "Notificacoes", noindex: true });
  const [items, setItems] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);

  const load = React.useCallback(() => {
    api("/notificacoes")
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function markRead(id) {
    await api(`/notificacoes/${id}/lida`, { method: "PUT" }).catch(() => {});
    load();
  }
  async function archive(id) {
    await api(`/notificacoes/${id}/arquivar`, { method: "PUT" }).catch(() => {});
    load();
  }
  async function markAll() {
    await api("/notificacoes/lidas", { method: "PUT" }).catch(() => {});
    load();
  }

  const hasUnread = items.some((item) => !item.read);

  return (
    <ClientShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Notificacoes</h1>
          <p className="mt-1 text-text-secondary">Acompanhe tudo que acontece na sua conta.</p>
        </div>
        {hasUnread && <Button variant="ghost" size="sm" onClick={markAll}>Marcar todas como lidas</Button>}
      </div>

      <div className="mt-6 grid gap-2">
        {!loaded ? (
          <p className="text-sm text-text-secondary">Carregando...</p>
        ) : items.length ? (
          items.map((item) => {
            const Icon = CATEGORY_ICON[item.category] || Bell;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-lg border p-4 ${item.read ? "border-border bg-surface" : "border-gold bg-gold-100"}`}
              >
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-gold">
                  <Icon size={16} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <strong>{item.title}</strong>
                    {!item.read && <span className="h-2 w-2 rounded-full bg-gold" />}
                  </div>
                  {item.body && <p className="mt-1 text-sm text-text-secondary">{item.body}</p>}
                  <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                    <span>{new Date(item.createdAt).toLocaleString("pt-BR")}</span>
                    {item.link && <Link to={item.link} className="font-medium text-gold hover:underline">Abrir</Link>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!item.read && (
                    <button onClick={() => markRead(item.id)} className="rounded p-1 text-text-muted hover:text-ink" title="Marcar como lida">
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => archive(item.id)} className="rounded p-1 text-text-muted hover:text-ink" title="Arquivar">
                    <Archive size={16} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState title="Sem notificacoes" text="Quando algo acontecer na sua conta, aparece aqui." />
        )}
      </div>
    </ClientShell>
  );
}
