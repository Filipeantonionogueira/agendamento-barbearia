import React from "react";
import { ArrowRight, CalendarPlus, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { assetUrl } from "../../lib/api.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1900&q=80";

/** Conta de 0 ate o numero do texto preservando prefixo/sufixo ("4.9", "+1.2k", "2min"). */
function AnimatedStat({ value, label, delay }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = React.useState(reduce ? value : null);

  React.useEffect(() => {
    if (reduce) return undefined;
    const match = String(value).match(/^(\D*)([\d.,]+)(.*)$/);
    if (!match) {
      setDisplay(value);
      return undefined;
    }
    const [, prefix, rawNumber, suffix] = match;
    const decimals = (rawNumber.split(/[.,]/)[1] || "").length;
    const target = Number(rawNumber.replace(",", "."));
    if (Number.isNaN(target)) {
      setDisplay(value);
      return undefined;
    }

    const duration = 1100;
    const startedAt = performance.now() + delay * 1000;
    let frame;
    const tick = (now) => {
      const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, delay, reduce]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + delay, duration: 0.5 }}
      className="min-w-[92px]"
    >
      <p className="font-display text-3xl font-semibold text-white md:text-4xl">{display ?? value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/60">{label}</p>
    </motion.div>
  );
}

export function Hero({ hero, shopName }) {
  const reduce = useReducedMotion();
  const backgroundUrl = assetUrl(hero?.backgroundUrl) || FALLBACK_IMAGE;
  const videoUrl = assetUrl(hero?.videoUrl);
  const overlay = Math.min(95, Math.max(20, hero?.overlayOpacity ?? 72)) / 100;
  const stats = (hero?.stats || []).filter((stat) => stat.value && stat.label);

  const primary = hero?.primaryCta?.label ? hero.primaryCta : { label: "Agendar agora", url: "#agendamento" };
  const secondary = hero?.secondaryCta?.label ? hero.secondaryCta : null;

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      {/* Fundo: video quando configurado, imagem caso contrario. */}
      <div className="absolute inset-0 -z-10">
        {videoUrl ? (
          <video
            className="h-full w-full object-cover"
            src={videoUrl}
            poster={backgroundUrl}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        ) : (
          <motion.img
            src={backgroundUrl}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            initial={reduce ? false : { scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 12, ease: "easeOut" }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(105deg, rgba(8,8,10,${overlay + 0.16}) 0%, rgba(8,8,10,${overlay}) 45%, rgba(8,8,10,${Math.max(
              0.28,
              overlay - 0.3
            )}) 100%)`
          }}
        />
        {/* Emenda suave com a proxima secao. */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-paper" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-32">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-gold-200 backdrop-blur-md"
        >
          {hero?.eyebrow || "Agendamento online"}
        </motion.p>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-6 max-w-3xl font-display text-display-sm font-semibold text-white md:text-display-lg"
        >
          {hero?.title || "Seu horario, sem espera."}
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="mt-5 max-w-xl text-lg leading-relaxed text-white/75"
        >
          {hero?.subtitle || `Escolha o servico, o profissional e o melhor horario na ${shopName}.`}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <motion.a
            href={primary.url || "#agendamento"}
            whileHover={reduce ? undefined : { y: -2 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3.5 text-base font-semibold text-ink shadow-lg transition-all hover:brightness-105"
          >
            <CalendarPlus size={18} />
            {primary.label}
          </motion.a>
          {secondary && (
            <motion.a
              href={secondary.url || "#servicos"}
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              {secondary.label}
              <ArrowRight size={18} />
            </motion.a>
          )}
        </motion.div>

        {stats.length > 0 && (
          <div className="mt-14 flex flex-wrap gap-10 border-t border-white/10 pt-8">
            {stats.map((stat, index) => (
              <AnimatedStat key={`${stat.label}-${index}`} value={stat.value} label={stat.label} delay={index * 0.12} />
            ))}
          </div>
        )}
      </div>

      {!reduce && (
        <motion.a
          href="#agendamento"
          aria-label="Ir para o agendamento"
          className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 text-white/50 hover:text-white md:block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={26} />
        </motion.a>
      )}
    </section>
  );
}
