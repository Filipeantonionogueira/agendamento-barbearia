import React from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { api, assetUrl } from "../../lib/api.js";
import { SectionHeader } from "./SectionHeader.jsx";
import { RevealGroup, RevealItem } from "../ui/Reveal.jsx";

const ZOOM_STEPS = [1, 1.6, 2.4];

/** Portfolio com filtro por categoria, layout em mosaico e lightbox com zoom. */
export function Galeria({ section }) {
  const reduce = useReducedMotion();
  const [items, setItems] = React.useState([]);
  const [category, setCategory] = React.useState("TODAS");
  const [openIndex, setOpenIndex] = React.useState(null);
  const [zoom, setZoom] = React.useState(0);

  React.useEffect(() => {
    api("/galeria").then(setItems).catch(() => setItems([]));
  }, []);

  const categories = React.useMemo(
    () => ["TODAS", ...Array.from(new Set(items.map((item) => item.category)))],
    [items]
  );

  const filtered = React.useMemo(
    () => (category === "TODAS" ? items : items.filter((item) => item.category === category)),
    [items, category]
  );

  const close = React.useCallback(() => {
    setOpenIndex(null);
    setZoom(0);
  }, []);

  const go = React.useCallback(
    (step) => {
      setZoom(0);
      setOpenIndex((current) => {
        if (current === null) return current;
        const next = current + step;
        if (next < 0) return filtered.length - 1;
        if (next >= filtered.length) return 0;
        return next;
      });
    },
    [filtered.length]
  );

  // Acessibilidade: teclado controla o lightbox (Esc fecha, setas navegam).
  React.useEffect(() => {
    if (openIndex === null) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "+" || event.key === "=") setZoom((z) => Math.min(ZOOM_STEPS.length - 1, z + 1));
      if (event.key === "-") setZoom((z) => Math.max(0, z - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, go]);

  if (!items.length) return null;
  const current = openIndex !== null ? filtered[openIndex] : null;

  return (
    <section id="galeria" className="border-y border-border bg-surface py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Portfolio"
          title={section?.title || "Nosso trabalho"}
          subtitle={section?.subtitle}
          align="center"
        />

        {categories.length > 2 && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  category === item
                    ? "bg-brand text-brand-fg"
                    : "border border-border text-text-secondary hover:border-gold hover:text-text-primary"
                }`}
              >
                {item === "TODAS" ? "Todas" : item}
              </button>
            ))}
          </div>
        )}

        <RevealGroup key={category} className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4" stagger={0.05}>
          {filtered.map((item, index) => (
            <RevealItem key={item.id} className={index % 7 === 0 ? "col-span-2 row-span-2" : ""}>
              <motion.button
                onClick={() => setOpenIndex(index)}
                whileHover={reduce ? undefined : { scale: 1.01 }}
                className={`group relative h-full w-full overflow-hidden rounded-lg bg-surface-subtle ${
                  index % 7 === 0 ? "aspect-square md:aspect-auto md:h-full" : "aspect-square"
                }`}
                aria-label={`Ampliar imagem${item.title ? `: ${item.title}` : ""}`}
              >
                <img
                  src={assetUrl(item.url)}
                  alt={item.title || "Trabalho da barbearia"}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/80 via-ink/0 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex w-full items-center justify-between gap-2 text-left text-xs font-medium text-white">
                    <span className="line-clamp-1">{item.title || "Ver imagem"}</span>
                    <ZoomIn size={16} className="shrink-0" />
                  </span>
                </span>
              </motion.button>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-ink/95 p-4 backdrop-blur-sm"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Visualizacao ampliada"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>

            <div
              className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-md"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={() => setZoom((z) => Math.max(0, z - 1))}
                disabled={zoom === 0}
                className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 disabled:opacity-35"
                aria-label="Reduzir zoom"
              >
                <Minus size={16} />
              </button>
              <span className="w-14 text-center text-xs font-semibold text-white/80">
                {Math.round(ZOOM_STEPS[zoom] * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(ZOOM_STEPS.length - 1, z + 1))}
                disabled={zoom === ZOOM_STEPS.length - 1}
                className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 disabled:opacity-35"
                aria-label="Aumentar zoom"
              >
                <Plus size={16} />
              </button>
            </div>

            {filtered.length > 1 && (
              <>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    go(-1);
                  }}
                  className="absolute left-2 rounded-full p-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:left-6"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft size={30} />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    go(1);
                  }}
                  className="absolute right-2 rounded-full p-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:right-6"
                  aria-label="Proxima imagem"
                >
                  <ChevronRight size={30} />
                </button>
              </>
            )}

            <figure
              className="max-h-[86vh] max-w-5xl overflow-auto"
              onClick={(event) => event.stopPropagation()}
            >
              <motion.img
                key={current.id}
                src={assetUrl(current.url)}
                alt={current.title || "Trabalho da barbearia"}
                onClick={() => setZoom((z) => (z + 1) % ZOOM_STEPS.length)}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: ZOOM_STEPS[zoom] }}
                transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                className={`mx-auto max-h-[80vh] origin-center rounded-lg ${
                  zoom === ZOOM_STEPS.length - 1 ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
              />
              {current.title && (
                <figcaption className="mt-4 text-center text-sm text-white/70">{current.title}</figcaption>
              )}
            </figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
