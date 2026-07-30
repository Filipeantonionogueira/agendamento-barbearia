import React from "react";
import { User, Star, CalendarPlus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader.jsx";
import { RevealGroup, RevealItem } from "../ui/Reveal.jsx";
import { assetUrl } from "../../lib/api.js";

export function ProfissionaisShowcase({ professionals, section, onSelect }) {
  const reduce = useReducedMotion();
  if (!professionals.length) return null;

  return (
    <section id="profissionais" className="mx-auto max-w-6xl px-4 py-20 md:py-24">
      <SectionHeader
        eyebrow="Equipe"
        title={section?.title || "Quem vai te atender"}
        subtitle={section?.subtitle}
        align="center"
      />

      <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {professionals.map((professional) => {
          const photo = assetUrl(professional.photoUrl);
          return (
            <RevealItem key={professional.id}>
              <motion.article
                whileHover={reduce ? undefined : { y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-subtle">
                  {photo ? (
                    <img
                      src={photo}
                      alt={professional.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-text-muted">
                      <User size={56} strokeWidth={1.2} />
                    </div>
                  )}

                  {professional.reviewsCount > 0 && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      <Star size={13} className="fill-gold text-gold" />
                      {professional.rating.toFixed(1)}
                      <span className="font-normal text-white/60">({professional.reviewsCount})</span>
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent p-4">
                    <h3 className="font-display text-xl font-semibold text-white">{professional.name}</h3>
                    {professional.specialty && (
                      <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.16em] text-gold-200">
                        {professional.specialty}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  {professional.bio && (
                    <p className="flex-1 text-sm leading-relaxed text-text-secondary">{professional.bio}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelect?.(professional.id)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border-strong px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-gold hover:bg-gold hover:text-ink"
                  >
                    <CalendarPlus size={16} /> Agendar com {professional.name.split(" ")[0]}
                  </button>
                </div>
              </motion.article>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
