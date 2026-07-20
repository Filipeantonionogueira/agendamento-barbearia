import React from "react";
import { Users, Download } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { api } from "../../lib/api.js";
import { money } from "../../lib/format.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

export function Clientes() {
  const [items, setItems] = React.useState([]);
  const [search, setSearch] = React.useState("");

  const load = React.useCallback((term = "") => {
    api(`/clientes${term ? `?search=${encodeURIComponent(term)}` : ""}`).then(setItems).catch(() => setItems([]));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    const timer = setTimeout(() => load(search), 300);
    return () => clearTimeout(timer);
  }, [search, load]);

  async function toggleBlock(client) {
    await api(`/clientes/${client.id}/bloqueio`, { method: "PUT", body: JSON.stringify({ blocked: client.active }) }).catch(() => {});
    load(search);
  }

  async function exportarCsv() {
    // Download autenticado: usa o cookie de sessao e gera o arquivo no navegador.
    const response = await fetch(`${API_URL}/clientes/exportar${search ? `?search=${encodeURIComponent(search)}` : ""}`, {
      credentials: "include"
    });
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Panel title="Clientes" icon={<Users />}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input className="field max-w-sm" placeholder="Buscar por nome ou e-mail" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button
          onClick={exportarCsv}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-strong px-4 py-2 text-sm font-semibold hover:bg-surface-subtle"
        >
          <Download size={16} /> Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface-subtle text-left text-text-secondary">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Contato</th>
              <th className="p-3">Atend.</th>
              <th className="p-3">Total gasto</th>
              <th className="p-3">Pontos</th>
              <th className="p-3">Ultima visita</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={8} className="p-4 text-center text-text-secondary">Nenhum cliente encontrado.</td></tr>
            )}
            {items.map((client) => (
              <tr key={client.id} className="border-t border-border">
                <td className="p-3">
                  <strong>{client.name}</strong>
                  <div className="text-xs text-text-muted">Desde {new Date(client.memberSince).toLocaleDateString("pt-BR")}</div>
                </td>
                <td className="p-3 text-text-secondary">
                  <div>{client.email}</div>
                  {client.phone && <div className="text-xs">{client.phone}</div>}
                </td>
                <td className="p-3">{client.completedCount}/{client.appointmentsCount}</td>
                <td className="p-3">{money(client.totalSpentCents)}</td>
                <td className="p-3">{client.points}</td>
                <td className="p-3 text-text-secondary">{client.lastVisit ? new Date(client.lastVisit).toLocaleDateString("pt-BR") : "-"}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${client.active ? "bg-feedback-success-bg text-feedback-success" : "bg-feedback-danger-bg text-feedback-danger"}`}>
                    {client.active ? "Ativo" : "Bloqueado"}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleBlock(client)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${client.active ? "border border-feedback-danger text-feedback-danger" : "bg-ink text-white"}`}
                  >
                    {client.active ? "Bloquear" : "Desbloquear"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
