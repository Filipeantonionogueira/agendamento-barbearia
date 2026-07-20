import React from "react";
import { Award, Scissors, Wallet, CalendarClock } from "lucide-react";
import { ClientShell } from "../components/client/ClientShell.jsx";
import { Card } from "../components/ui/Card.jsx";
import { LoyaltyProgress } from "../components/client/LoyaltyProgress.jsx";
import { api } from "../lib/api.js";
import { money } from "../lib/format.js";
import { usePageMeta } from "../hooks/usePageMeta.js";

function Stat({ icon: Icon, label, value }) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Icon size={16} className="text-gold" /> {label}
      </div>
      <strong className="mt-2 block text-2xl">{value}</strong>
    </Card>
  );
}

export function LoyaltyPage() {
  usePageMeta({ title: "Fidelidade", noindex: true });
  const [summary, setSummary] = React.useState(null);

  React.useEffect(() => {
    api("/fidelidade").then(setSummary).catch(() => setSummary(null));
  }, []);

  const monthsAsClient = summary?.memberSince
    ? Math.max(1, Math.round((Date.now() - new Date(summary.memberSince)) / (1000 * 60 * 60 * 24 * 30)))
    : 0;

  return (
    <ClientShell>
      <h1 className="text-2xl font-semibold md:text-3xl">Programa de fidelidade</h1>
      <p className="mt-1 text-text-secondary">Acumule pontos a cada atendimento concluido.</p>

      {summary && (
        <>
          <Card className="mt-6">
            <LoyaltyProgress summary={summary} />
          </Card>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Award} label="Pontos" value={summary.points} />
            <Stat icon={Scissors} label="Cortes concluidos" value={summary.cuts} />
            <Stat icon={Wallet} label="Total investido" value={money(summary.totalSpentCents)} />
            <Stat icon={CalendarClock} label="Tempo como cliente" value={`${monthsAsClient} mes(es)`} />
          </div>

          <h2 className="mt-8 text-lg font-semibold">Niveis e beneficios</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {summary.tiers.map((tier) => (
              <div
                key={tier.key}
                className={`rounded-lg border p-4 ${tier.key === summary.level.key ? "border-gold bg-gold-100" : "border-border bg-surface"}`}
              >
                <div className="flex items-center justify-between">
                  <strong>{tier.label}</strong>
                  <span className="text-sm text-text-secondary">{tier.minPoints}+ pts</span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{tier.benefit}</p>
              </div>
            ))}
          </div>

          {summary.history.length > 0 && (
            <>
              <h2 className="mt-8 text-lg font-semibold">Extrato de pontos</h2>
              <div className="mt-3 grid gap-2">
                {summary.history.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 text-sm">
                    <span>{entry.reason}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted">{new Date(entry.createdAt).toLocaleDateString("pt-BR")}</span>
                      <strong className={entry.points >= 0 ? "text-feedback-success" : "text-feedback-danger"}>
                        {entry.points >= 0 ? "+" : ""}{entry.points}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </ClientShell>
  );
}
