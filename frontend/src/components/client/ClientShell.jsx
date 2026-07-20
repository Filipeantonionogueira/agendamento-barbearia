import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Scissors, LayoutDashboard, User, LogOut, CalendarPlus, History, Award, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthProvider.jsx";
import { api } from "../../lib/api.js";

const NAV = [
  { to: "/conta", label: "Painel", icon: LayoutDashboard },
  { to: "/conta/historico", label: "Historico", icon: History },
  { to: "/conta/fidelidade", label: "Fidelidade", icon: Award },
  { to: "/conta/notificacoes", label: "Notificacoes", icon: Bell, badge: true },
  { to: "/conta/perfil", label: "Perfil", icon: User }
];

export function ClientShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    api("/notificacoes/nao-lidas").then((data) => setUnread(data.count)).catch(() => setUnread(0));
  }, [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold text-ink">
              <Scissors size={18} />
            </span>
            <strong>Minha conta</strong>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon, badge }) => (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  location.pathname === to ? "bg-ink text-white" : "text-text-secondary hover:bg-surface-subtle"
                }`}
              >
                <span className="relative">
                  <Icon size={16} />
                  {badge && unread > 0 && (
                    <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-feedback-danger px-1 text-[10px] font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-subtle">
              <CalendarPlus size={16} /> <span className="hidden sm:inline">Agendar</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-subtle">
              <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
            </button>
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-4 py-8">
        {user && (
          <p className="mb-1 text-sm text-text-secondary">
            {user.email}
          </p>
        )}
        {children}
      </section>
    </main>
  );
}
