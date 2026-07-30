import React from "react";
import { Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader.jsx";
import { Reveal } from "../ui/Reveal.jsx";

/** Acordeao de perguntas frequentes — itens totalmente editaveis pelo painel. */
export function Faq({ items = [], section }) {
  const reduce = useReducedMotion();
  const [openIndex, setOpenIndex] = React.useState(0);
  const questions = items.filter((item) => item.question && item.answer);

  if (!questions.length) return null;

  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-20 md:py-24">
      <SectionHeader
        eyebrow="Duvidas"
        title={section?.title || "Perguntas frequentes"}
        subtitle={section?.subtitle}
        align="center"
      />

      <div className="mt-12 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {questions.map((item, index) => {
          const open = openIndex === index;
          return (
            <Reveal key={`${item.question}-${index}`} delay={index * 0.04} y={10}>
              <h3>
                <button
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface-subtle"
                >
                  <span className="text-[15px] font-semibold text-text-primary md:text-base">{item.question}</span>
                  <motion.span
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.22 }}
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
                      open ? "bg-gold text-ink" : "bg-surface-subtle text-text-secondary"
                    }`}
                  >
                    <Plus size={16} />
                  </motion.span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="whitespace-pre-line px-6 pb-6 text-[15px] leading-relaxed text-text-secondary">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
