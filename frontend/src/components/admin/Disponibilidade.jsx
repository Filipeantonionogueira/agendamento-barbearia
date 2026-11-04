import React from "react";
import { Clock } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { api } from "../../lib/api.js";
import { today } from "../../lib/format.js";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function Disponibilidade() {
  const [professionals, setProfessionals] = React.useState([]);
  const [professionalId, setProfessionalId] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [blocks, setBlocks] = React.useState([]);
  const [block, setBlock] = React.useState({ date: today(), startTime: "", endTime: "", reason: "" });

  React.useEffect(() => {
    api("/profissionais/admin").then((list) => {
      setProfessionals(list);
      if (list.length) setProfessionalId(list[0].id);
    });
  }, []);

  React.useEffect(() => {
    if (!professionalId) return;
    api(`/disponibilidade?professionalId=${professionalId}`).then(setItems);
    api(`/bloqueios?professionalId=${professionalId}`).then(setBlocks);
  }, [professionalId]);

  async function save() {
    await api("/disponibilidade", { method: "PUT", body: JSON.stringify({ professionalId, items }) });
  }
  async function addBlock() {
    await api("/bloqueios", {
      method: "POST",
      body: JSON.stringify({ ...block, professionalId, startTime: block.startTime || null, endTime: block.endTime || null })
    });
    setBlocks(await api(`/bloqueios?professionalId=${professionalId}`));
  }

  return (
    <Panel title="Disponibilidade" icon={<Clock />}>
      <label className="mb-4 block max-w-sm">
        <span className="mb-1.5 block text-sm font-medium text-text-secondary">Profissional</span>
        <select className="field" value={professionalId} onChange={(e) => setProfessionalId(e.target.value)}>
          {professionals.map((professional) => (
            <option key={professional.id} value={professional.id}>
              {professional.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <div key={item.dayOfWeek} className="grid grid-cols-[70px_1fr_1fr_80px] items-center gap-2 rounded-lg border border-border bg-surface p-3">
            <strong>{DAYS[item.dayOfWeek]}</strong>
            <input
              className="field"
              type="time"
              value={item.startTime}
              onChange={(e) => setItems(items.map((v, i) => (i === index ? { ...v, startTime: e.target.value } : v)))}
            />
            <input
              className="field"
              type="time"
              value={item.endTime}
              onChange={(e) => setItems(items.map((v, i) => (i === index ? { ...v, endTime: e.target.value } : v)))}
            />
            <label className="text-sm">
              <input
                type="checkbox"
                checked={item.active}
                onChange={(e) => setItems(items.map((v, i) => (i === index ? { ...v, active: e.target.checked } : v)))}
              />{" "}
              Ativo
            </label>
          </div>
        ))}
      </div>
      <button className="mt-4 rounded-lg bg-brand px-4 py-2 font-semibold text-brand-fg transition hover:opacity-90 disabled:opacity-50" onClick={save} disabled={!professionalId}>
        Salvar disponibilidade
      </button>
      <div className="mt-8 rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-3 font-semibold">Bloqueios</h3>
        <div className="grid gap-2 md:grid-cols-5">
          <input className="field" type="date" value={block.date} onChange={(e) => setBlock({ ...block, date: e.target.value })} />
          <input className="field" type="time" value={block.startTime} onChange={(e) => setBlock({ ...block, startTime: e.target.value })} />
          <input className="field" type="time" value={block.endTime} onChange={(e) => setBlock({ ...block, endTime: e.target.value })} />
          <input className="field" placeholder="Motivo" value={block.reason} onChange={(e) => setBlock({ ...block, reason: e.target.value })} />
          <button className="rounded-lg bg-gold px-4 py-2 font-semibold" onClick={addBlock} disabled={!professionalId}>
            Adicionar
          </button>
        </div>
        <div className="mt-3 text-sm text-text-secondary">
          {blocks.map((item) => (
            <p key={item.id}>
              {new Date(item.date).toLocaleDateString("pt-BR")} {item.startTime || "dia todo"} {item.reason}
            </p>
          ))}
        </div>
      </div>
    </Panel>
  );
}
