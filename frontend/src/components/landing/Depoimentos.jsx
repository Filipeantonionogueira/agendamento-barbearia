import React from "react";
import { StarRating } from "../ui/StarRating.jsx";
import { api } from "../../lib/api.js";

export function Depoimentos() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    api("/avaliacoes?pageSize=6").then(setData).catch(() => setData(null));
  }, []);

  if (!data || !data.summary.total) return null;
  const { summary, items } = data;
  const maxBar = Math.max(...Object.values(summary.distribution), 1);

  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm uppercase tracking-[.22em] text-gold">Depoimentos</p>
        <h2 className="mt-2 text-3xl font-semibold">O que dizem nossos clientes</h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
          <div className="rounded-lg border border-border bg-paper p-6">
            <div className="flex items-end gap-2">
              <strong className="text-5xl">{summary.average.toFixed(1)}</strong>
              <span className="mb-1 text-text-secondary">/ 5</span>
            </div>
            <div className="mt-2"><StarRating value={Math.round(summary.average)} readOnly /></div>
            <p className="mt-1 text-sm text-text-secondary">{summary.total} avaliacao(oes)</p>
            <div className="mt-4 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-text-secondary">{star}</span>
                  <div className="h-2 flex-1 rounded-full bg-surface-subtle">
                    <div className="h-2 rounded-full bg-gold" style={{ width: `${(summary.distribution[star] / maxBar) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right text-text-muted">{summary.distribution[star]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((review) => (
              <div key={review.id} className="rounded-lg border border-border bg-paper p-5">
                <div className="flex items-center justify-between">
                  <StarRating value={review.rating} readOnly size={16} />
                  <span className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                {review.comment && <p className="mt-3 text-sm text-text-secondary">"{review.comment}"</p>}
                <p className="mt-3 text-sm font-medium">{review.user?.name} · <span className="text-text-muted">{review.professional?.name}</span></p>
                {review.reply && (
                  <div className="mt-3 rounded-lg bg-surface-subtle p-3 text-sm">
                    <strong className="text-xs uppercase tracking-wide text-gold">Resposta</strong>
                    <p className="mt-1 text-text-secondary">{review.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
