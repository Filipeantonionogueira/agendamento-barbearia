import React from "react";
import { Clock, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { money } from "../../lib/format.js";
import { SectionHeader } from "./SectionHeader.jsx";
import { RevealGroup, RevealItem } from "../ui/Reveal.jsx";

export function ServicosShowcase({ services, section, onSelect }) {
  const reduce = useReducedMotion();
  if (!services.length) return null;

  return (
    <section id="servicos" className="border-y border-border bg-surface py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Servicos"
          title={section?.title || "O que fazemos"}
          subtitle={section?.subtitle}
          align="center"
        />

        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <RevealItem key={service.id}>
              <motion.button
                type="button"
                onClick={() => onSelect?.(service.id)}
                whileHover={reduce ? undefined : { y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group flex h-full w-full flex-col rounded-lg border border-border bg-paper p-6 text-left transition-colors hover:border-gold/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-text-primary">{service.name}</h3>
                  <span className="shrink-0 rounded-full bg-gold/12 px-3 py-1 text-sm font-semibold text-gold-600 dark:text-gold-400">
                    {money(service.priceCents)}
                  </span>
                </div>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">{service.description}</p>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted">
                    <Clock size={14} /> {service.estimatedMinutes} min
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Agendar <ArrowUpRight size={15} />
                  </span>
                </div>
              </motion.button>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
