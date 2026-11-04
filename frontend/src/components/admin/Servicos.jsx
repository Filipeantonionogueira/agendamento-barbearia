import React from "react";
import { Scissors } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { api } from "../../lib/api.js";
import { money } from "../../lib/format.js";

const BLANK = { name: "", description: "", priceCents: 0, estimatedMinutes: 30, active: true };

export function Servicos() {
  const [items, setItems] = React.useState([]);
  const [form, setForm] = React.useState(BLANK);
  const load = () => api("/servicos/admin").then(setItems);
  React.useEffect(() => {
    load();
  }, []);

  async function save() {
    await api(form.id ? `/servicos/${form.id}` : "/servicos", { method: form.id ? "PUT" : "POST", body: JSON.stringify(form) });
    setForm(BLANK);
    load();
  }

  return (
    <Panel title="Servicos" icon={<Scissors />}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <input className="field mb-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="field mb-2" placeholder="Descricao" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input
            className="field mb-2"
            type="number"
            placeholder="Preco em centavos"
            value={form.priceCents}
            onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) })}
          />
          <input
            className="field mb-2"
            type="number"
            placeholder="Minutos"
            value={form.estimatedMinutes}
            onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
          />
          <label className="mb-3 block text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Ativo
          </label>
          <button className="rounded-lg bg-brand px-4 py-2 font-semibold text-brand-fg transition hover:opacity-90" onClick={save}>
            Salvar
          </button>
        </div>
        <div className="grid gap-2">
          {items.map((item) => (
            <button key={item.id} onClick={() => setForm(item)} className="rounded-lg border border-border bg-surface p-3 text-left">
              <strong>{item.name}</strong>
              <p className="text-sm text-text-secondary">
                {money(item.priceCents)} - {item.estimatedMinutes} min - {item.active ? "ativo" : "inativo"}
              </p>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}
