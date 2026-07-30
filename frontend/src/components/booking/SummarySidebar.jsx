import React from "react";
import { Scissors, User, CalendarDays, Clock, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { money } from "../../lib/format.js";

function Row({ icon: Icon, children, muted }) {
  return (
    <li className={`flex items-start gap-2.5 text-sm ${muted ? "text-white/35" : "text-white/80"}`}>
      <Icon size={15} className="mt-0.5 shrink-0 text-gold" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/**
 * Resumo permanente do agendamento. Concentra a navegacao entre etapas
 * e a confirmacao final — o cliente sempre ve o que ja escolheu.
 */
export function SummarySidebar({
  selectedServices,
  professionalName,
  date,
  time,
  total,
  totalMinutes,
  isLastStep,
  canAdvance,
  onBack,
  onNext,
  canGoBack,
  disabled,
  onConfirm,
  submitting,
  message,
  messageVariant = "info"
}) {
  const dateLabel = date ? new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }) : "";

  return (
    <aside className="lg:sticky lg:top-24 h-fit overflow-hidden rounded-xl bg-ink text-white shadow-soft">
      <div className="border-b border-white/8 px-6 py-5">
        <h2 className="font-display text-xl font-semibold text-white">Resumo</h2>
        <p className="mt-1 text-xs text-white/45">Confira antes de confirmar</p>
      </div>

      <ul className="space-y-3 px-6 py-5">
        <Row icon={Scissors} muted={!selectedServices.length}>
          {selectedServices.length ? selectedServices.map((item) => item.name).join(" + ") : "Nenhum servico selecionado"}
        </Row>
        <Row icon={User} muted={!professionalName}>
          {professionalName || "Profissional nao escolhido"}
        </Row>
        <Row icon={CalendarDays} muted={!date}>
          {dateLabel || "Data nao escolhida"}
        </Row>
        <Row icon={Clock} muted={!time}>
          {time ? `${time}${totalMinutes ? ` · ${totalMinutes} min` : ""}` : "Horario nao escolhido"}
        </Row>
      </ul>

      <div className="border-t border-white/8 px-6 py-5">
        <div className="flex items-end justify-between">
          <span className="text-sm text-white/55">Total</span>
          <motion.span
            key={total}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="font-display text-3xl font-semibold text-gold"
          >
            {money(total)}
          </motion.span>
        </div>
        <p className="mt-1.5 text-xs text-white/35">Pagamento presencial, na barbearia.</p>

        <div className="mt-5 flex gap-2">
          {canGoBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-white/20 px-4 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          )}

          {isLastStep ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 font-semibold text-ink transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={disabled || submitting}
              onClick={onConfirm}
            >
              {submitting ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
              {submitting ? "Confirmando..." : "Confirmar agendamento"}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 font-semibold text-ink transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!canAdvance}
              onClick={onNext}
            >
              Continuar <ArrowRight size={17} />
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 rounded-md px-3 py-2.5 text-sm ${
                messageVariant === "danger"
                  ? "bg-feedback-danger/15 text-feedback-danger"
                  : messageVariant === "success"
                    ? "bg-feedback-success/15 text-feedback-success"
                    : "bg-white/10 text-white/80"
              }`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
