import React from "react";
import { Settings, Save, Loader2 } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { Button } from "../ui/Button.jsx";
import { ImageField, TextField } from "./ImageField.jsx";
import { api } from "../../lib/api.js";
import { useToast } from "../ui/Toast.jsx";

const BLANK = {
  shopName: "",
  whatsappNumber: "",
  heroImageUrl: "",
  aboutText: "",
  addressLine: "",
  openingHoursText: "",
  username: "",
  password: ""
};

function Fieldset({ title, hint, children }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 md:p-6">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {hint && <p className="mt-1 text-sm text-text-secondary">{hint}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function Config() {
  const notify = useToast();
  const [form, setForm] = React.useState(BLANK);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    api("/configuracoes").then((data) =>
      setForm((current) => ({
        ...current,
        shopName: data.shopName || "",
        whatsappNumber: data.whatsappNumber || "",
        heroImageUrl: data.heroImageUrl || "",
        aboutText: data.aboutText || "",
        addressLine: data.addressLine || "",
        openingHoursText: data.openingHoursText || ""
      }))
    );
  }, []);

  const set = (partial) => setForm((current) => ({ ...current, ...partial }));

  async function save() {
    setSaving(true);
    try {
      await api("/configuracoes", {
        method: "PUT",
        body: JSON.stringify({
          shopName: form.shopName,
          whatsappNumber: form.whatsappNumber,
          heroImageUrl: form.heroImageUrl || null,
          aboutText: form.aboutText || null,
          addressLine: form.addressLine || null,
          openingHoursText: form.openingHoursText || null,
          username: form.username || undefined,
          password: form.password || undefined
        })
      });
      set({ username: "", password: "" });
      notify("Configuracoes salvas.", "success");
    } catch (error) {
      notify(error.message, "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel
      title="Configuracoes"
      description="Dados da barbearia e credenciais de acesso."
      icon={<Settings />}
      actions={
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      }
    >
      <div className="grid max-w-4xl gap-5">
        <Fieldset title="Identificacao" hint="Aparece na navbar, no rodape e nos e-mails.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Nome da barbearia"
              value={form.shopName}
              onChange={(event) => set({ shopName: event.target.value })}
            />
            <TextField
              label="WhatsApp"
              value={form.whatsappNumber}
              onChange={(event) => set({ whatsappNumber: event.target.value })}
              placeholder="5511999999999"
              hint="Com codigo do pais e DDD, apenas numeros."
            />
          </div>
          <TextField
            label="Sobre a barbearia"
            textarea
            value={form.aboutText}
            onChange={(event) => set({ aboutText: event.target.value })}
          />
          <ImageField
            label="Imagem de destaque"
            value={form.heroImageUrl}
            onChange={(heroImageUrl) => set({ heroImageUrl })}
            hint="Usada na secao Sobre quando o hero tiver outra imagem."
          />
        </Fieldset>

        <Fieldset title="Atendimento">
          <TextField
            label="Endereco"
            value={form.addressLine}
            onChange={(event) => set({ addressLine: event.target.value })}
          />
          <TextField
            label="Horario de funcionamento"
            value={form.openingHoursText}
            onChange={(event) => set({ openingHoursText: event.target.value })}
            placeholder="Seg a Sab, 9h as 19h"
          />
        </Fieldset>

        <Fieldset title="Acesso administrativo" hint="Preencha apenas se quiser trocar. Campos vazios sao ignorados.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Novo e-mail de login"
              type="email"
              autoComplete="off"
              value={form.username}
              onChange={(event) => set({ username: event.target.value })}
            />
            <TextField
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => set({ password: event.target.value })}
              hint="Minimo de 6 caracteres."
            />
          </div>
        </Fieldset>
      </div>
    </Panel>
  );
}
