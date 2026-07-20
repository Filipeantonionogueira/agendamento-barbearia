import React from "react";
import { Ticket } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { api } from "../../lib/api.js";
import { money } from "../../lib/format.js";

const BLANK = { code: "", description: "", type: "PERCENT", value: 10, minPriceCents: 0, maxUses: "", active: true };

export function Cupons() {
  const [items, setItems] = React.useState([]);
  const [form, setForm] = React.useState(BLANK);
  const [error, setError] = React.useState("");

  const load = () => api("/cupons").then(setItems).catch(() => setItems([]));
  React.useEffect(() => {
    load();
  }, []);

  async function save() {
    setError("");
    try {
      const payload = {
        code: form.code,
        description: form.description || null,
        type: form.type,
        value: Number(form.value),
        minPriceCents: Number(form.minPriceCents) || 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        active: form.active
      };
      await api(form.id ? `/cupons/${form.id}` : "/cupons", { method: form.id ? "PUT" : "POST", body: JSON.stringify(payload) });
      setForm(BLANK);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    await api(`/cupons/${id}`, { method: "DELETE" }).catch(() => {});
    if (form.id === id) setForm(BLANK);
    load();
  }

  return (
    <Panel title="Cupons" icon={<Ticket />}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <input className="field mb-2 uppercase" placeholder="Codigo (ex: BEMVINDO10)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <input className="field mb-2" placeholder="Descricao" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="mb-2 grid grid-cols-2 gap-2">
            <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="PERCENT">Percentual (%)</option>
              <option value="FIXED">Valor fixo (centavos)</option>
            </select>
            <input className="field" type="number" placeholder={form.type === "PERCENT" ? "% desconto" : "centavos"} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          </div>
          <div className="mb-2 grid grid-cols-2 gap-2">
            <input className="field" type="number" placeholder="Valor minimo (centavos)" value={form.minPriceCents} onChange={(e) => setForm({ ...form, minPriceCents: e.target.value })} />
            <input className="field" type="number" placeholder="Usos maximos (vazio = ilimitado)" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          </div>
          <label className="mb-3 block text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Ativo
          </label>
          {error && <p className="mb-2 text-sm text-feedback-danger">{error}</p>}
          <div className="flex gap-2">
            <button className="rounded-lg bg-ink px-4 py-2 font-semibold text-white" onClick={save}>{form.id ? "Atualizar" : "Criar cupom"}</button>
            {form.id && <button className="rounded-lg border border-border px-4 py-2 text-sm" onClick={() => setForm(BLANK)}>Novo</button>}
          </div>
        </div>
        <div className="grid gap-2">
          {items.length === 0 && <p className="text-sm text-text-secondary">Nenhum cupom cadastrado.</p>}
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-surface p-3">
              <div className="flex items-center justify-between">
                <button onClick={() => setForm({ ...item, maxUses: item.maxUses ?? "", description: item.description ?? "" })} className="text-left">
                  <strong>{item.code}</strong>
                  <p className="text-sm text-text-secondary">
                    {item.type === "PERCENT" ? `${item.value}%` : money(item.value)} · usos: {item._count?.usages ?? 0}
                    {item.maxUses ? `/${item.maxUses}` : ""} · {item.active ? "ativo" : "inativo"}
                  </p>
                </button>
                <button onClick={() => remove(item.id)} className="text-sm text-feedback-danger hover:underline">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
