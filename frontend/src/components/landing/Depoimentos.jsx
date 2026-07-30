import React from "react";
import { Quote, CornerDownRight, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { StarRating } from "../ui/StarRating.jsx";
import { SectionHeader } from "./SectionHeader.jsx";
import { RevealGroup, RevealItem, Reveal } from "../ui/Reveal.jsx";
import { api, assetUrl } from "../../lib/api.js";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export function Depoimentos({ section }) {
  const reduce = useReducedMotion();
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    api("/avaliacoes?pageSize=6").then(setData).catch(() => setData(null));
  }, []);

  if (!data || !data.summary.total) return null;
  const { summary, items } = data;
  const maxBar = Math.max(...Object.values(summary.distribution), 1);

  return (
    <section id="depoimentos" className="mx-auto max-w-6xl px-4 py-20 md:py-24">
      <SectionHeader
        eyebrow="Depoimentos"
        title={section?.title || "O que dizem os clientes"}
        subtitle={section?.subtitle}
        align="center"
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[320px_1fr]">
        <Reveal>
          <div className="sticky top-24 rounded-xl border border-border bg-surface p-7">
            <div className="flex items-end gap-2">
              <strong className="font-display text-6xl leading-none text-text-primary">
                {summary.average.toFixed(1)}
              </strong>
              <span className="mb-1.5 text-text-muted">/ 5</span>
            </div>
            <div className="mt-3">
              <StarRating value={Math.round(summary.average)} readOnly />
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              {summary.total} {summary.total === 1 ? "avaliacao" : "avaliacoes"} de clientes reais
            </p>

            <div className="mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2.5 text-xs">
                  <span className="flex w-6 items-center gap-0.5 text-text-secondary">
                    {star}
                    <Star size={11} className="fill-gold text-gold" />
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-subtle">
                    <motion.div
                      className="h-full rounded-full bg-gold"
                      initial={reduce ? false : { width: 0 }}
                      whileInView={{ width: `${(summary.distribution[star] / maxBar) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                  </div>
                  <span className="w-6 text-right text-text-muted">{summary.distribution[star]}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <RevealGroup className="grid gap-5 sm:grid-cols-2">
          {items.map((review) => {
            const photo = assetUrl(review.user?.photoUrl);
            return (
              <RevealItem key={review.id}>
                <motion.article
                  whileHover={reduce ? undefined : { y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="relative flex h-full flex-col rounded-xl border border-border bg-surface p-6"
                >
                  <Quote size={40} className="absolute right-5 top-5 text-gold/12" strokeWidth={1.5} />

                  <StarRating value={review.rating} readOnly size={16} />

                  {review.comment && (
                    <p className="relative mt-4 flex-1 text-[15px] leading-relaxed text-text-secondary">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}

                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                    {photo ? (
                      <img
                        src={photo}
                        alt={review.user?.name}
                        loading="lazy"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-sm font-semibold text-gold-600 dark:text-gold-400">
                        {initials(review.user?.name) || "?"}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">{review.user?.name}</p>
                      <p className="truncate text-xs text-text-muted">
                        com {review.professional?.name} ·{" "}
                        {new Date(review.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {review.reply && (
                    <div className="mt-4 rounded-lg border border-border bg-surface-subtle p-4">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-600 dark:text-gold-400">
                        <CornerDownRight size={13} /> Resposta da barbearia
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{review.reply}</p>
                    </div>
                  )}
                </motion.article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
