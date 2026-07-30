import React from "react";
import {
  Layout,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { Button } from "../ui/Button.jsx";
import { ImageField, TextField } from "./ImageField.jsx";
import { api } from "../../lib/api.js";
import { useToast } from "../ui/Toast.jsx";

const SECTION_LABEL = {
  agendamento: "Agendamento",
  sobre: "Sobre",
  servicos: "Servicos",
  profissionais: "Equipe",
  galeria: "Galeria",
  depoimentos: "Depoimentos",
  instagram: "Instagram",
  faq: "Perguntas frequentes",
  localizacao: "Localizacao"
};

const GROUPS = [
  { id: "identidade", label: "Identidade" },
  { id: "hero", label: "Hero" },
  { id: "secoes", label: "Secoes" },
  { id: "instagram", label: "Instagram" },
  { id: "faq", label: "FAQ" },
  { id: "contato", label: "Contato e rodape" }
];

function Fieldset({ title, hint, children }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 md:p-6">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {hint && <p className="mt-1 text-sm text-text-secondary">{hint}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

/** Lista editavel generica (estatisticas, posts, FAQ). */
function RepeatableList({ items, onChange, onAdd, addLabel, max, renderItem, emptyText }) {
  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-text-muted">{emptyText}</p>}

      {items.map((item, index) => (
        <div key={index} className="rounded-md border border-border bg-surface-subtle p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Item {index + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => index > 0 && onChange(swap(items, index, index - 1))}
                disabled={index === 0}
                className="rounded p-1.5 text-text-muted transition-colors hover:text-text-primary disabled:opacity-30"
                aria-label="Mover para cima"
              >
                <ChevronUp size={15} />
              </button>
              <button
                type="button"
                onClick={() => index < items.length - 1 && onChange(swap(items, index, index + 1))}
                disabled={index === items.length - 1}
                className="rounded p-1.5 text-text-muted transition-colors hover:text-text-primary disabled:opacity-30"
                aria-label="Mover para baixo"
              >
                <ChevronDown size={15} />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="rounded p-1.5 text-text-muted transition-colors hover:text-feedback-danger"
                aria-label="Remover item"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          {renderItem(item, (patch) => onChange(items.map((current, i) => (i === index ? { ...current, ...patch } : current))))}
        </div>
      ))}

      {(!max || items.length < max) && (
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <Plus size={15} /> {addLabel}
        </Button>
      )}
    </div>
  );
}

function swap(list, from, to) {
  const copy = [...list];
  [copy[from], copy[to]] = [copy[to], copy[from]];
  return copy;
}

export function LandingCms() {
  const notify = useToast();
  const [group, setGroup] = React.useState("identidade");
  const [content, setContent] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    api("/configuracoes/conteudo")
      .then(setContent)
      .catch(() => setContent(null));
  }, []);

  if (!content) {
    return (
      <Panel title="Landing page" icon={<Layout />}>
        <p className="text-sm text-text-secondary">Carregando conteudo...</p>
      </Panel>
    );
  }

  const patch = (partial) => setContent((current) => ({ ...current, ...partial }));
  const patchHero = (partial) => patch({ hero: { ...content.hero, ...partial } });

  async function save() {
    setSaving(true);
    try {
      const saved = await api("/configuracoes/conteudo", { method: "PUT", body: JSON.stringify(content) });
      setContent(saved);
      notify("Landing page atualizada. As mudancas ja estao no ar.", "success");
    } catch (error) {
      notify(error.message, "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel
      title="Landing page"
      description="Edite o site publico sem mexer no codigo. Tudo reflete imediatamente."
      icon={<Layout />}
      actions={
        <>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border-strong px-3.5 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle"
          >
            <ExternalLink size={15} /> Ver site
          </a>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Salvando..." : "Salvar alteracoes"}
          </Button>
        </>
      }
    >
      <div className="no-scrollbar mb-6 flex gap-1 overflow-x-auto rounded-lg bg-surface-subtle p-1">
        {GROUPS.map((item) => (
          <button
            key={item.id}
            onClick={() => setGroup(item.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              group === item.id ? "bg-brand text-brand-fg" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {group === "identidade" && (
          <Fieldset title="Marca" hint="Logo e assinatura exibidos na navbar e no rodape.">
            <ImageField
              label="Logo"
              aspect="aspect-square"
              value={content.brand.logoUrl}
              onChange={(logoUrl) => patch({ brand: { ...content.brand, logoUrl } })}
              hint="Quadrada, de preferencia PNG com fundo transparente."
            />
            <TextField
              label="Assinatura curta"
              value={content.brand.tagline}
              onChange={(event) => patch({ brand: { ...content.brand, tagline: event.target.value } })}
              placeholder="Ex.: Barbearia classica desde 2015"
            />
            <p className="rounded-md bg-surface-subtle p-3 text-xs text-text-secondary">
              O nome da barbearia, WhatsApp, endereco, horario e o texto &quot;sobre&quot; ficam na aba{" "}
              <strong>Config</strong>.
            </p>
          </Fieldset>
        )}

        {group === "hero" && (
          <>
            <Fieldset title="Textos do topo" hint="Primeira coisa que o visitante le.">
              <TextField
                label="Etiqueta"
                value={content.hero.eyebrow}
                onChange={(event) => patchHero({ eyebrow: event.target.value })}
                placeholder="Agendamento online"
              />
              <TextField
                label="Titulo principal"
                value={content.hero.title}
                onChange={(event) => patchHero({ title: event.target.value })}
                placeholder="Seu horario, sem espera."
              />
              <TextField
                label="Subtitulo"
                textarea
                value={content.hero.subtitle}
                onChange={(event) => patchHero({ subtitle: event.target.value })}
              />
            </Fieldset>

            <Fieldset title="Fundo" hint="Se houver video, ele substitui a imagem. A imagem vira o poster.">
              <ImageField
                label="Imagem de fundo"
                value={content.hero.backgroundUrl}
                onChange={(backgroundUrl) => patchHero({ backgroundUrl })}
                hint="Ideal: 1920x1080, horizontal."
              />
              <TextField
                label="URL do video (mp4)"
                value={content.hero.videoUrl}
                onChange={(event) => patchHero({ videoUrl: event.target.value })}
                placeholder="https://.../video.mp4"
                hint="Opcional. Roda mudo e em loop."
              />
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Escurecimento do fundo: {content.hero.overlayOpacity}%
                </span>
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={content.hero.overlayOpacity}
                  onChange={(event) => patchHero({ overlayOpacity: Number(event.target.value) })}
                  className="w-full accent-gold"
                />
                <span className="mt-1 block text-xs text-text-muted">
                  Quanto maior, mais legivel fica o texto sobre a imagem.
                </span>
              </label>
            </Fieldset>

            <Fieldset title="Botoes">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Botao principal - texto"
                  value={content.hero.primaryCta.label}
                  onChange={(event) => patchHero({ primaryCta: { ...content.hero.primaryCta, label: event.target.value } })}
                />
                <TextField
                  label="Botao principal - link"
                  value={content.hero.primaryCta.url}
                  onChange={(event) => patchHero({ primaryCta: { ...content.hero.primaryCta, url: event.target.value } })}
                  placeholder="#agendamento"
                />
                <TextField
                  label="Botao secundario - texto"
                  value={content.hero.secondaryCta.label}
                  onChange={(event) =>
                    patchHero({ secondaryCta: { ...content.hero.secondaryCta, label: event.target.value } })
                  }
                  hint="Deixe vazio para esconder."
                />
                <TextField
                  label="Botao secundario - link"
                  value={content.hero.secondaryCta.url}
                  onChange={(event) => patchHero({ secondaryCta: { ...content.hero.secondaryCta, url: event.target.value } })}
                  placeholder="#servicos"
                />
              </div>
            </Fieldset>

            <Fieldset title="Numeros em destaque" hint="Ate 3 numeros com animacao de contagem.">
              <RepeatableList
                items={content.hero.stats}
                max={4}
                emptyText="Nenhum numero configurado."
                addLabel="Adicionar numero"
                onAdd={() => patchHero({ stats: [...content.hero.stats, { value: "", label: "" }] })}
                onChange={(stats) => patchHero({ stats })}
                renderItem={(item, update) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Valor"
                      value={item.value}
                      onChange={(event) => update({ value: event.target.value })}
                      placeholder="4.9"
                    />
                    <TextField
                      label="Legenda"
                      value={item.label}
                      onChange={(event) => update({ label: event.target.value })}
                      placeholder="Nota media"
                    />
                  </div>
                )}
              />
            </Fieldset>
          </>
        )}

        {group === "secoes" && (
          <Fieldset title="Ordem e visibilidade" hint="Arraste com as setas, ligue/desligue e edite os titulos.">
            <div className="space-y-3">
              {content.sections.map((section, index) => (
                <div key={section.key} className="rounded-md border border-border bg-surface-subtle p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-semibold text-text-primary">{SECTION_LABEL[section.key] || section.key}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          patch({ sections: section.enabled ? toggle(content.sections, index, false) : toggle(content.sections, index, true) })
                        }
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          section.enabled
                            ? "bg-feedback-success-bg text-feedback-success"
                            : "bg-surface text-text-muted"
                        }`}
                      >
                        {section.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                        {section.enabled ? "Visivel" : "Oculta"}
                      </button>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => patch({ sections: swap(content.sections, index, index - 1) })}
                        className="rounded p-1.5 text-text-muted transition-colors hover:text-text-primary disabled:opacity-30"
                        aria-label="Subir secao"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={index === content.sections.length - 1}
                        onClick={() => patch({ sections: swap(content.sections, index, index + 1) })}
                        className="rounded p-1.5 text-text-muted transition-colors hover:text-text-primary disabled:opacity-30"
                        aria-label="Descer secao"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Titulo"
                      value={section.title}
                      onChange={(event) => patch({ sections: patchAt(content.sections, index, { title: event.target.value }) })}
                    />
                    <TextField
                      label="Subtitulo"
                      value={section.subtitle}
                      onChange={(event) => patch({ sections: patchAt(content.sections, index, { subtitle: event.target.value }) })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Fieldset>
        )}

        {group === "instagram" && (
          <Fieldset title="Instagram" hint="Publique manualmente os trabalhos que quer destacar.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Perfil (@)"
                value={content.instagram.handle}
                onChange={(event) => patch({ instagram: { ...content.instagram, handle: event.target.value } })}
                placeholder="barbeariaprime"
              />
              <TextField
                label="Link do perfil"
                value={content.instagram.profileUrl}
                onChange={(event) => patch({ instagram: { ...content.instagram, profileUrl: event.target.value } })}
                placeholder="https://instagram.com/barbeariaprime"
              />
            </div>

            <RepeatableList
              items={content.instagram.posts}
              max={12}
              emptyText="Nenhuma publicacao adicionada."
              addLabel="Adicionar publicacao"
              onAdd={() =>
                patch({
                  instagram: { ...content.instagram, posts: [...content.instagram.posts, { imageUrl: "", link: "", caption: "" }] }
                })
              }
              onChange={(posts) => patch({ instagram: { ...content.instagram, posts } })}
              renderItem={(item, update) => (
                <div className="space-y-3">
                  <ImageField
                    label="Imagem"
                    aspect="aspect-square"
                    value={item.imageUrl}
                    onChange={(imageUrl) => update({ imageUrl })}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Link do post"
                      value={item.link}
                      onChange={(event) => update({ link: event.target.value })}
                      placeholder="https://instagram.com/p/..."
                    />
                    <TextField
                      label="Legenda"
                      value={item.caption}
                      onChange={(event) => update({ caption: event.target.value })}
                    />
                  </div>
                </div>
              )}
            />
          </Fieldset>
        )}

        {group === "faq" && (
          <Fieldset title="Perguntas frequentes" hint="Aparecem em acordeao na landing page.">
            <RepeatableList
              items={content.faq}
              max={20}
              emptyText="Nenhuma pergunta cadastrada."
              addLabel="Adicionar pergunta"
              onAdd={() => patch({ faq: [...content.faq, { question: "", answer: "" }] })}
              onChange={(faq) => patch({ faq })}
              renderItem={(item, update) => (
                <div className="space-y-3">
                  <TextField
                    label="Pergunta"
                    value={item.question}
                    onChange={(event) => update({ question: event.target.value })}
                  />
                  <TextField
                    label="Resposta"
                    textarea
                    value={item.answer}
                    onChange={(event) => update({ answer: event.target.value })}
                  />
                </div>
              )}
            />
          </Fieldset>
        )}

        {group === "contato" && (
          <>
            <Fieldset title="Redes sociais" hint="Aparecem no rodape. Deixe vazio para esconder.">
              <div className="grid gap-4 sm:grid-cols-2">
                {["instagram", "facebook", "tiktok", "youtube"].map((key) => (
                  <TextField
                    key={key}
                    label={key[0].toUpperCase() + key.slice(1)}
                    value={content.socials[key]}
                    onChange={(event) => patch({ socials: { ...content.socials, [key]: event.target.value } })}
                    placeholder={`https://${key}.com/...`}
                  />
                ))}
              </div>
            </Fieldset>

            <Fieldset title="Contato">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="E-mail"
                  value={content.contact.email}
                  onChange={(event) => patch({ contact: { ...content.contact, email: event.target.value } })}
                />
                <TextField
                  label="Telefone"
                  value={content.contact.phone}
                  onChange={(event) => patch({ contact: { ...content.contact, phone: event.target.value } })}
                />
              </div>
              <TextField
                label="Mapa incorporado (URL do embed)"
                value={content.contact.mapEmbedUrl}
                onChange={(event) => patch({ contact: { ...content.contact, mapEmbedUrl: event.target.value } })}
                hint="Google Maps > Compartilhar > Incorporar um mapa > copie apenas o endereco do src."
              />
            </Fieldset>

            <Fieldset title="Rodape">
              <TextField
                label="Texto do rodape"
                textarea
                value={content.footer.note}
                onChange={(event) => patch({ footer: { ...content.footer, note: event.target.value } })}
              />
              <TextField
                label="Aviso legal"
                value={content.footer.legal}
                onChange={(event) => patch({ footer: { ...content.footer, legal: event.target.value } })}
                placeholder="Todos os direitos reservados."
              />
            </Fieldset>
          </>
        )}
      </div>
    </Panel>
  );
}

function patchAt(list, index, partial) {
  return list.map((item, i) => (i === index ? { ...item, ...partial } : item));
}

function toggle(list, index, enabled) {
  return patchAt(list, index, { enabled });
}
