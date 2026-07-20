import React from "react";
import { Settings } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { api } from "../../lib/api.js";

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

export function Config() {
  const [form, setForm] = React.useState(BLANK);
  React.useEffect(() => {
    api("/configuracoes").then((data) =>
      setForm((current) => ({
        ...current,
        ...data,
        heroImageUrl: data.heroImageUrl || "",
        aboutText: data.aboutText || "",
        addressLine: data.addressLine || "",
        openingHoursText: data.openingHoursText || ""
      }))
    );
  }, []);
  async function save() {
    await api("/configuracoes", {
      method: "PUT",
      body: JSON.stringify({
        ...form,
        heroImageUrl: form.heroImageUrl || null,
        aboutText: form.aboutText || null,
        addressLine: form.addressLine || null,
        openingHoursText: form.openingHoursText || null,
        username: form.username || undefined,
        password: form.password || undefined
      })
    });
  }
  return (
    <Panel title="Configuracoes" icon={<Settings />}>
      <div className="grid max-w-2xl gap-3">
        <input className="field" placeholder="Nome da barbearia" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
        <input className="field" placeholder="WhatsApp" value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} />
        <input className="field" placeholder="URL da imagem de destaque (hero)" value={form.heroImageUrl} onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })} />
        <textarea
          className="field"
          rows={3}
          placeholder="Sobre a barbearia"
          value={form.aboutText}
          onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
        />
        <input className="field" placeholder="Endereco" value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} />
        <input
          className="field"
          placeholder="Horario de funcionamento (ex: Seg a Sab, 9h as 19h)"
          value={form.openingHoursText}
          onChange={(e) => setForm({ ...form, openingHoursText: e.target.value })}
        />
        <input className="field" type="email" placeholder="Novo e-mail de login" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className="field" type="password" placeholder="Nova senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="rounded-lg bg-ink px-4 py-3 font-semibold text-white" onClick={save}>
          Salvar configuracoes
        </button>
      </div>
    </Panel>
  );
}
