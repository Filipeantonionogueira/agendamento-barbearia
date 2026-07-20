import React from "react";
import { Star } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { StarRating } from "../ui/StarRating.jsx";
import { api } from "../../lib/api.js";

export function Avaliacoes() {
  const [items, setItems] = React.useState([]);
  const [replyFor, setReplyFor] = React.useState(null);
  const [replyText, setReplyText] = React.useState("");

  const load = () => api("/avaliacoes/admin").then(setItems).catch(() => setItems([]));
  React.useEffect(() => {
    load();
  }, []);

  async function sendReply(id) {
    if (!replyText.trim()) return;
    await api(`/avaliacoes/${id}/resposta`, { method: "PUT", body: JSON.stringify({ reply: replyText }) }).catch(() => {});
    setReplyFor(null);
    setReplyText("");
    load();
  }

  return (
    <Panel title="Avaliacoes" icon={<Star />}>
      <div className="grid gap-3">
        {items.length === 0 && <p className="text-sm text-text-secondary">Nenhuma avaliacao ainda.</p>}
        {items.map((review) => (
          <div key={review.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarRating value={review.rating} readOnly size={16} />
                <span className="text-sm font-medium">{review.user?.name}</span>
                <span className="text-xs text-text-muted">· {review.professional?.name}</span>
              </div>
              <span className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
            {review.comment && <p className="mt-2 text-sm text-text-secondary">"{review.comment}"</p>}

            {review.reply ? (
              <div className="mt-3 rounded-lg bg-surface-subtle p-3 text-sm">
                <strong className="text-xs uppercase tracking-wide text-gold">Sua resposta</strong>
                <p className="mt-1 text-text-secondary">{review.reply}</p>
              </div>
            ) : replyFor === review.id ? (
              <div className="mt-3">
                <textarea
                  className="field min-h-[64px] resize-y"
                  placeholder="Escreva sua resposta"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="mt-2 flex gap-2">
                  <button className="rounded-lg bg-ink px-3 py-1.5 text-sm font-semibold text-white" onClick={() => sendReply(review.id)}>Enviar</button>
                  <button className="rounded-lg border border-border px-3 py-1.5 text-sm" onClick={() => setReplyFor(null)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button className="mt-3 text-sm font-semibold text-gold hover:underline" onClick={() => { setReplyFor(review.id); setReplyText(""); }}>
                Responder
              </button>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
