import React from "react";
import { Users, Plus, User } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { Button } from "../ui/Button.jsx";
import { Badge } from "../ui/Badge.jsx";
import { ImageField, TextField } from "./ImageField.jsx";
import { api, assetUrl } from "../../lib/api.js";
import { useToast } from "../ui/Toast.jsx";

const BLANK = { name: "", photoUrl: "", bio: "", specialty: "", active: true, displayOrder: 0 };

export function Profissionais() {
  const notify = useToast();
  const [items, setItems] = React.useState([]);
  const [form, setForm] = React.useState(BLANK);

  const load = React.useCallback(() => api("/profissionais/admin").then(setItems).catch(() => setItems([])), []);
  React.useEffect(() => {
    load();
  }, [load]);

  async function save() {
    try {
      const payload = {
        ...form,
        photoUrl: form.photoUrl || null,
        bio: form.bio || null,
        specialty: form.specialty || null
      };
      await api(form.id ? `/profissionais/${form.id}` : "/profissionais", {
        method: form.id ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      setForm(BLANK);
      load();
      notify("Profissional salvo.", "success");
    } catch (error) {
      notify(error.message, "danger");
    }
  }

  return (
    <Panel
      title="Profissionais"
      description="Quem aparece no site e recebe agendamentos."
      icon={<Users />}
      actions={
        form.id && (
          <Button variant="ghost" onClick={() => setForm(BLANK)}>
            <Plus size={16} /> Novo profissional
          </Button>
        )
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-border bg-surface p-5 md:p-6">
          <h2 className="text-base font-semibold text-text-primary">
            {form.id ? `Editando: ${form.name}` : "Novo profissional"}
          </h2>

          <TextField
            label="Nome"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Nome que aparece no site"
          />
          <TextField
            label="Especialidade"
            value={form.specialty}
            onChange={(event) => setForm({ ...form, specialty: event.target.value })}
            placeholder="Ex.: Barba e navalha"
            hint="Aparece em destaque no card do profissional."
          />
          <TextField
            label="Biografia"
            textarea
            value={form.bio}
            onChange={(event) => setForm({ ...form, bio: event.target.value })}
            placeholder="Uma ou duas frases sobre o profissional."
          />
          <ImageField
            label="Foto"
            aspect="aspect-square"
            value={form.photoUrl}
            onChange={(photoUrl) => setForm({ ...form, photoUrl })}
            hint="Retrato quadrado fica melhor no card."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Ordem de exibicao"
              type="number"
              value={form.displayOrder}
              onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })}
            />
            <label className="flex items-end gap-2 pb-3 text-sm text-text-primary">
              <input
                type="checkbox"
                className="h-4 w-4 accent-gold"
                checked={form.active}
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
              />
              Ativo (aceita agendamentos)
            </label>
          </div>

          <Button onClick={save}>Salvar profissional</Button>
        </div>

        <div className="grid content-start gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setForm({ ...BLANK, ...item, photoUrl: item.photoUrl || "", bio: item.bio || "", specialty: item.specialty || "" })}
              className={`flex items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
                form.id === item.id ? "border-gold bg-gold/8" : "border-border bg-surface hover:border-border-strong"
              }`}
            >
              {item.photoUrl ? (
                <img src={assetUrl(item.photoUrl)} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface-subtle text-text-muted">
                  <User size={20} />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-text-primary">{item.name}</span>
                <span className="block truncate text-sm text-text-secondary">
                  {item.specialty || item.bio || "Sem especialidade informada"}
                </span>
              </span>
              <Badge variant={item.active ? "success" : "neutral"}>{item.active ? "Ativo" : "Inativo"}</Badge>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}
