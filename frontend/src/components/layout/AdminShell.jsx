import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, LogOut, ExternalLink } from "lucide-react";
import { Tabs } from "../ui/Tabs.jsx";
import { ThemeToggle } from "../ui/ThemeToggle.jsx";
import { useAuth } from "../../context/AuthProvider.jsx";

export function AdminShell({ tabs, active, onChange, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-paper text-text-primary">
      <header className="sticky top-0 z-30 border-b border-border bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-brand text-brand-fg">
                <Shield size={19} />
              </span>
              <div>
                <strong className="block leading-tight">Painel administrativo</strong>
                <p className="text-sm text-text-secondary">{user?.name || "Agenda, equipe e conteudo"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-md border border-border px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                <ExternalLink size={15} /> <span className="hidden sm:inline">Ver site</span>
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-feedback-danger"
              >
                <LogOut size={15} /> <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>

          <Tabs tabs={tabs} active={active} onChange={onChange} />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">{children}</section>
    </main>
  );
}
