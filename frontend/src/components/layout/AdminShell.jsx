import React from "react";
import { Shield } from "lucide-react";
import { Tabs } from "../ui/Tabs.jsx";

export function AdminShell({ tabs, active, onChange, children }) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-gold">
              <Shield size={20} />
            </div>
            <div>
              <strong>Painel do barbeiro</strong>
              <p className="text-sm text-text-secondary">Agenda, servicos e financeiro</p>
            </div>
          </div>
          <Tabs tabs={tabs} active={active} onChange={onChange} />
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-6">{children}</section>
    </main>
  );
}
