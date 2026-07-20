import React from "react";
import { Users } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { api } from "../../lib/api.js";

const BLANK = { name: "", photoUrl: "", bio: "", active: true, displayOrder: 0 };

export function Profissionais() {
  const [items, setItems] = React.useState([]);
  const [form, setForm] = React.useState(BLANK);
  const load = () => api("/profissionais/admin").then(setItems);
  React.useEffect(() => {
    load();
  }, []);

  async function save() {
    const payload = { ...form, photoUrl: form.photoUrl || null, bio: form.bio || null };
    await api(form.id ? `/profissionais/${form.id}` : "/profissionais", { method: form.id ? "PUT" : "POST", body: JSON.stringify(payload) });
    setForm(BLANK);
    load();
  }

  return (
    <Panel title="Profissionais" icon={<Users />}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <input className="field mb-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="field mb-2" placeholder="URL da foto" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
          <input className="field mb-2" placeholder="Especialidade / bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <input
            className="field mb-2"
            type="number"
            placeholder="Ordem de exibicao"
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
          />
          <label className="mb-3 block text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Ativo
          </label>
          <button className="rounded-lg bg-ink px-4 py-2 font-semibold text-white" onClick={save}>
            Salvar
          </button>
        </div>
        <div className="grid gap-2">
          {items.map((item) => (
            <button key={item.id} onClick={() => setForm({ ...BLANK, ...item, photoUrl: item.photoUrl || "", bio: item.bio || "" })} className="rounded-lg border border-border bg-surface p-3 text-left">
              <strong>{item.name}</strong>
              <p className="text-sm text-text-secondary">{item.bio || "Sem especialidade informada"} - {item.active ? "ativo" : "inativo"}</p>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}
