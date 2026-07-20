import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scissors } from "lucide-react";
import { useAuth } from "../../context/AuthProvider.jsx";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1600&q=80";

function AccountNav() {
  const { user, loading, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  if (loading) return null;

  const linkClass = "rounded-lg border border-white/30 px-3 py-2 text-sm hover:bg-white/10";

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/login" className={linkClass}>Entrar</Link>
        <Link to="/cadastro" className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-ink hover:brightness-95">Criar conta</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {hasRole("OWNER", "ADMIN") && <Link to="/admin" className={linkClass}>Painel</Link>}
      <Link to="/conta" className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-ink hover:brightness-95">Minha conta</Link>
      <button
        onClick={async () => {
          await logout();
          navigate("/");
        }}
        className={linkClass}
      >
        Sair
      </button>
    </div>
  );
}

export function Shell({ children, compact = false, shopName = "Barbearia Prime", heroImageUrl }) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div
        className="min-h-[280px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(21,21,21,.84), rgba(21,21,21,.36)), url('${heroImageUrl || DEFAULT_HERO_IMAGE}')`
        }}
      >
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 text-white">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gold text-ink">
              <Scissors size={21} />
            </div>
            <strong className="text-lg">{shopName}</strong>
          </Link>
          <AccountNav />
        </header>
        {!compact && (
          <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 text-white">
            <p className="text-sm uppercase tracking-[.22em] text-gold">Agendamento online</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">Seu horario sem espera.</h1>
            <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg">
              Escolha os servicos, veja os horarios livres e confirme pelo WhatsApp.
            </p>
          </section>
        )}
      </div>
      {children}
    </main>
  );
}
