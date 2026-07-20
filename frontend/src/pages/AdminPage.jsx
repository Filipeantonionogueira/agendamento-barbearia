import React from "react";
import { CalendarDays, Clock, Scissors, Settings, Users, Wallet, Ticket, Star, UserCircle, ShieldCheck, Images } from "lucide-react";
import { AdminShell } from "../components/layout/AdminShell.jsx";
import { Agenda } from "../components/admin/Agenda.jsx";
import { Disponibilidade } from "../components/admin/Disponibilidade.jsx";
import { Servicos } from "../components/admin/Servicos.jsx";
import { Profissionais } from "../components/admin/Profissionais.jsx";
import { Clientes } from "../components/admin/Clientes.jsx";
import { Cupons } from "../components/admin/Cupons.jsx";
import { Avaliacoes } from "../components/admin/Avaliacoes.jsx";
import { Dashboard } from "../components/admin/Dashboard.jsx";
import { GaleriaAdmin } from "../components/admin/Galeria.jsx";
import { Auditoria } from "../components/admin/Auditoria.jsx";
import { Config } from "../components/admin/Config.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

const TABS = [
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "disponibilidade", label: "Disponibilidade", icon: Clock },
  { id: "servicos", label: "Servicos", icon: Scissors },
  { id: "profissionais", label: "Profissionais", icon: Users },
  { id: "clientes", label: "Clientes", icon: UserCircle },
  { id: "cupons", label: "Cupons", icon: Ticket },
  { id: "avaliacoes", label: "Avaliacoes", icon: Star },
  { id: "galeria", label: "Galeria", icon: Images },
  { id: "dashboard", label: "Dashboard", icon: Wallet },
  { id: "auditoria", label: "Auditoria", icon: ShieldCheck },
  { id: "config", label: "Config", icon: Settings }
];

export function AdminPage() {
  usePageMeta({ title: "Painel administrativo", noindex: true });
  const [tab, setTab] = React.useState("agenda");

  return (
    <AdminShell tabs={TABS} active={tab} onChange={setTab}>
      {tab === "agenda" && <Agenda />}
      {tab === "disponibilidade" && <Disponibilidade />}
      {tab === "servicos" && <Servicos />}
      {tab === "profissionais" && <Profissionais />}
      {tab === "clientes" && <Clientes />}
      {tab === "cupons" && <Cupons />}
      {tab === "avaliacoes" && <Avaliacoes />}
      {tab === "galeria" && <GaleriaAdmin />}
      {tab === "dashboard" && <Dashboard />}
      {tab === "auditoria" && <Auditoria />}
      {tab === "config" && <Config />}
    </AdminShell>
  );
}
