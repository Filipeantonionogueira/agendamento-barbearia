import React from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { api, assetUrl } from "../../lib/api.js";

// Galeria do site: filtro por categoria, lazy loading e lightbox com zoom e navegacao.
export function Galeria() {
  const [items, setItems] = React.useState([]);
  const [category, setCategory] = React.useState("TODAS");
  const [openIndex, setOpenIndex] = React.useState(null);
  const [zoomed, setZoomed] = React.useState(false);

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
    setZoomed(false);
  }, []);

  const go = React.useCallback(
    (step) => {
      setZoomed(false);
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
    const onKey = (event) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, go]);

  if (!items.length) return null;
  const current = openIndex !== null ? filtered[openIndex] : null;

  return (
    <section className="bg-paper py-16" id="galeria">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm uppercase tracking-[.22em] text-gold">Galeria</p>
        <h2 className="mt-2 text-3xl font-semibold">Nosso trabalho</h2>

        {categories.length > 2 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === item ? "bg-ink text-white" : "bg-surface text-text-secondary hover:bg-surface-subtle"
                }`}
              >
                {item === "TODAS" ? "Todas" : item}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setOpenIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-lg bg-surface-subtle"
              aria-label={`Ampliar imagem${item.title ? `: ${item.title}` : ""}`}
            >
              <img
                src={assetUrl(item.url)}
                alt={item.title || "Trabalho da barbearia"}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-0 grid place-items-center bg-ink/0 text-white opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
                <ZoomIn size={22} />
              </span>
              {item.title && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-2 text-left text-xs text-white">
                  {item.title}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Visualizacao ampliada"
        >
          <button onClick={close} className="absolute right-4 top-4 rounded-lg p-2 text-white hover:bg-white/10" aria-label="Fechar">
            <X size={24} />
          </button>

          {filtered.length > 1 && (
            <>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  go(-1);
                }}
                className="absolute left-2 rounded-full p-3 text-white hover:bg-white/10 sm:left-6"
                aria-label="Imagem anterior"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  go(1);
                }}
                className="absolute right-2 rounded-full p-3 text-white hover:bg-white/10 sm:right-6"
                aria-label="Proxima imagem"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          <figure className="max-h-full max-w-4xl overflow-auto" onClick={(event) => event.stopPropagation()}>
            <img
              src={assetUrl(current.url)}
              alt={current.title || "Trabalho da barbearia"}
              onClick={() => setZoomed((value) => !value)}
              className={`mx-auto rounded-lg transition-transform duration-300 ${
                zoomed ? "max-w-none scale-150 cursor-zoom-out" : "max-h-[80vh] cursor-zoom-in"
              }`}
            />
            {current.title && <figcaption className="mt-3 text-center text-sm text-white/80">{current.title}</figcaption>}
          </figure>
        </div>
      )}
    </section>
  );
}
