import React from "react";
import { LayoutDashboard } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { Metric } from "../ui/Metric.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { api } from "../../lib/api.js";
import { money, formatDateLabel } from "../../lib/format.js";

const PERIOD_LABELS = { dia: "Hoje", semana: "Ultimos 7 dias", mes: "Ultimos 30 dias" };

export function Dashboard() {
  const [period, setPeriod] = React.useState("semana");
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    api(`/dashboard?period=${period}`).then(setData);
  }, [period]);

  const maxRevenue = Math.max(...(data?.revenueByDay || []).map((day) => day.revenueCents), 0);
  const averageTicket = data?.averageTicketCents ?? 0;
  const occupancy = data?.totalAppointments ? Math.round((data.clients / data.totalAppointments) * 100) : 0;

  return (
    <Panel title="Dashboard financeiro" icon={<LayoutDashboard />}>
      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">Periodo financeiro</p>
          <strong className="mt-1 block text-xl">{PERIOD_LABELS[period]}</strong>
        </div>
        <div className="flex rounded-lg bg-surface-subtle p-1">
          {[
            ["dia", "Dia"],
            ["semana", "Semana"],
            ["mes", "Mes"]
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                period === value ? "bg-ink text-white shadow-sm" : "text-text-secondary hover:bg-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {data && (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Clientes atendidos" value={data.clients} detail="Concluidos no periodo" />
            <Metric label="Faturamento" value={money(data.revenueCents)} detail="Servicos concluidos (liquido)" accent />
            <Metric label="Ticket medio" value={money(averageTicket)} detail="Receita por cliente" />
            <Metric label="Agendamentos" value={data.totalAppointments} detail="Todos os status no periodo" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Cancelamentos" value={data.cancellations} detail="No periodo" />
            <Metric label="Novos clientes" value={data.newClients} detail="Cadastros no periodo" />
            <Metric label="Servicos vendidos" value={data.servicesSold} detail="Itens concluidos" />
            <Metric
              label="Avaliacao media"
              value={data.averageRating ? `${data.averageRating} ★` : "-"}
              detail={`${data.reviewsCount} avaliacao(oes)`}
            />
          </div>

          {data.traffic && (
            <div className="grid gap-4 md:grid-cols-4">
              <Metric label="Visitantes" value={data.traffic.visitors} detail="Sessoes unicas no periodo" />
              <Metric label="Visualizacoes" value={data.traffic.pageViews} detail="Paginas abertas" />
              <Metric
                label="Taxa de conversao"
                value={`${data.traffic.conversionRate}%`}
                detail={`${data.traffic.bookings} agendamento(s) por visitante`}
                accent
              />
              <Metric
                label="Principal origem"
                value={data.traffic.topReferrers[0]?.source || "Direto"}
                detail={data.traffic.topReferrers[0] ? `${data.traffic.topReferrers[0].visits} visita(s)` : "Sem referencia externa"}
              />
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[1.6fr_.9fr]">
            <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Receita por dia</h3>
                  <p className="text-sm text-text-secondary">Comparativo dos agendamentos concluidos</p>
                </div>
                <span className="rounded-md bg-gold-100 px-3 py-1 text-sm font-semibold text-gold-600">Total {money(data.revenueCents)}</span>
              </div>

              {data.revenueByDay.length ? (
                <div className="grid min-h-[260px] grid-cols-[56px_1fr] gap-3">
                  <div className="flex flex-col justify-between pb-8 text-right text-xs text-text-muted">
                    <span>{money(maxRevenue)}</span>
                    <span>{money(Math.round(maxRevenue / 2))}</span>
                    <span>R$ 0</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-x-0 top-0 h-px bg-border" />
                    <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                    <div className="absolute inset-x-0 bottom-8 h-px bg-border-strong" />
                    <div className="relative z-10 flex h-full items-end gap-3 overflow-x-auto pb-8">
                      {data.revenueByDay.map((day) => {
                        const height = maxRevenue ? Math.max(10, (day.revenueCents / maxRevenue) * 100) : 0;
                        return (
                          <div key={day.date} className="flex min-w-[72px] flex-1 flex-col items-center gap-2">
                            <span className="text-xs font-semibold text-text-secondary">{money(day.revenueCents)}</span>
                            <div className="flex h-44 w-full items-end rounded-md bg-surface-subtle px-2">
                              <div
                                className="w-full rounded-t-md bg-gradient-to-t from-ink to-gold shadow-sm"
                                style={{ height: `${height}%` }}
                                title={`${day.date}: ${money(day.revenueCents)}`}
                              />
                            </div>
                            <span className="text-xs text-text-secondary">{formatDateLabel(day.date)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState title="Sem receita no periodo" text="Quando um atendimento for marcado como concluido, ele aparece aqui." />
              )}
            </section>

            <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <h3 className="text-lg font-semibold">Servicos mais feitos</h3>
              <p className="mb-5 text-sm text-text-secondary">Ranking por quantidade concluida</p>
              {data.serviceRanking.length ? (
                <div className="space-y-4">
                  {data.serviceRanking.slice(0, 6).map((service, index) => {
                    const maxCount = data.serviceRanking[0]?.count || 1;
                    return (
                      <div key={service.name}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium">
                            {index + 1}. {service.name}
                          </span>
                          <strong>{service.count}</strong>
                        </div>
                        <div className="h-2 rounded-full bg-surface-subtle">
                          <div className="h-2 rounded-full bg-gold" style={{ width: `${(service.count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Sem ranking ainda" text="Conclua atendimentos para montar o ranking." />
              )}
            </section>
          </div>
        </div>
      )}
    </Panel>
  );
}
