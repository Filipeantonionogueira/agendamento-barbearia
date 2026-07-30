import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scissors, Menu, X, CalendarPlus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../context/AuthProvider.jsx";
import { ThemeToggle } from "../ui/ThemeToggle.jsx";
import { assetUrl } from "../../lib/api.js";

const LINKS = [
  { href: "#servicos", label: "Servicos" },
  { href: "#profissionais", label: "Equipe" },
  { href: "#galeria", label: "Galeria" },
  { href: "#depoimentos", label: "Avaliacoes" },
  { href: "#faq", label: "Duvidas" }
];

function AccountArea({ solid, onNavigate }) {
  const { user, loading, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  if (loading) return null;

  const ghost = solid
    ? "border-border text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
    : "border-white/25 text-white hover:bg-white/15";

  if (!user) {
    return (
      <>
        <Link
          to="/login"
          onClick={onNavigate}
          className={`rounded-md border px-3.5 py-2 text-sm font-medium transition-colors ${ghost}`}
        >
          Entrar
        </Link>
        <Link
          to="/cadastro"
          onClick={onNavigate}
          className="rounded-md bg-gold px-3.5 py-2 text-sm font-semibold text-ink transition-all hover:brightness-105"
        >
          Criar conta
        </Link>
      </>
    );
  }

  return (
    <>
      {hasRole("OWNER", "ADMIN") && (
        <Link
          to="/admin"
          onClick={onNavigate}
          className={`rounded-md border px-3.5 py-2 text-sm font-medium transition-colors ${ghost}`}
        >
          Painel
        </Link>
      )}
      <Link
        to="/conta"
        onClick={onNavigate}
        className="rounded-md bg-gold px-3.5 py-2 text-sm font-semibold text-ink transition-all hover:brightness-105"
      >
        Minha conta
      </Link>
      <button
        onClick={async () => {
          onNavigate?.();
          await logout();
          navigate("/");
        }}
        className={`rounded-md border px-3.5 py-2 text-sm font-medium transition-colors ${ghost}`}
      >
        Sair
      </button>
    </>
  );
}

/**
 * Navbar dinamica: transparente sobre o hero e solida (com blur) apos rolar.
 * As ancoras so aparecem na landing, onde as secoes existem.
 */
export function Navbar({ shopName = "Barbearia Prime", logoUrl, showAnchors = true }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !showAnchors;

  return (
    <motion.header
      initial={reduce ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        solid ? "border-b border-border bg-paper/85 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <Link to="/" className="flex items-center gap-3">
          {logoUrl ? (
            <img src={assetUrl(logoUrl)} alt={shopName} className="h-10 w-10 rounded-md object-cover" />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-md bg-gold text-ink">
              <Scissors size={20} />
            </span>
          )}
          <strong className={`font-display text-lg tracking-tight ${solid ? "text-text-primary" : "text-white"}`}>
            {shopName}
          </strong>
        </Link>

        {showAnchors && (
          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  solid ? "text-text-secondary hover:text-text-primary" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle tone={solid ? "surface" : "onDark"} />
          <AccountArea solid={solid} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle tone={solid ? "surface" : "onDark"} />
          <button
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className={`grid h-10 w-10 place-items-center rounded-md border transition-colors ${
              solid ? "border-border text-text-primary" : "border-white/25 text-white"
            }`}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden border-t border-border bg-paper md:hidden"
          >
            <div className="mx-auto grid max-w-6xl gap-1 px-4 py-4">
              {showAnchors &&
                LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                  >
                    {link.label}
                  </a>
                ))}
              {showAnchors && (
                <a
                  href="#agendamento"
                  onClick={() => setOpen(false)}
                  className="mt-1 flex items-center justify-center gap-2 rounded-md bg-brand px-3 py-2.5 text-sm font-semibold text-brand-fg"
                >
                  <CalendarPlus size={16} /> Agendar horario
                </a>
              )}
              <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-3">
                <AccountArea solid onNavigate={() => setOpen(false)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
