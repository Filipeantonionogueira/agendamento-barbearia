import React from "react";
import { Images, Trash2, Upload } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { api, uploadFile, assetUrl } from "../../lib/api.js";

export function GaleriaAdmin() {
  const [items, setItems] = React.useState([]);
  const [category, setCategory] = React.useState("GERAL");
  const [title, setTitle] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef(null);

  const load = () => api("/galeria/admin").then(setItems).catch(() => setItems([]));
  React.useEffect(() => {
    load();
  }, []);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { url } = await uploadFile("/galeria/upload", file);
      await api("/galeria", {
        method: "POST",
        body: JSON.stringify({ url, title: title || null, category: category || "GERAL" })
      });
      setTitle("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function toggleActive(item) {
    await api(`/galeria/${item.id}`, { method: "PUT", body: JSON.stringify({ active: !item.active }) }).catch(() => {});
    load();
  }

  async function remove(id) {
    await api(`/galeria/${id}`, { method: "DELETE" }).catch(() => {});
    load();
  }

  return (
    <Panel title="Galeria" icon={<Images />}>
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input className="field" placeholder="Titulo (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input
            className="field"
            placeholder="Categoria (ex: CORTES)"
            value={category}
            onChange={(e) => setCategory(e.target.value.toUpperCase())}
          />
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 font-semibold text-white">
            <Upload size={16} />
            {busy ? "Enviando..." : "Enviar foto"}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} disabled={busy} />
          </label>
        </div>
        <p className="mt-2 text-xs text-text-muted">JPG, PNG ou WEBP · maximo 5 MB</p>
        {error && <p className="mt-2 text-sm text-feedback-danger">{error}</p>}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.length === 0 && <p className="text-sm text-text-secondary">Nenhuma foto na galeria ainda.</p>}
        {items.map((item) => (
          <div key={item.id} className={`overflow-hidden rounded-lg border ${item.active ? "border-border" : "border-dashed border-border-strong opacity-60"}`}>
            <img src={assetUrl(item.url)} alt={item.title || "Foto da galeria"} loading="lazy" className="aspect-square w-full object-cover" />
            <div className="p-2">
              <p className="truncate text-sm font-medium">{item.title || "Sem titulo"}</p>
              <p className="text-xs text-text-muted">{item.category}</p>
              <div className="mt-2 flex items-center justify-between">
                <button onClick={() => toggleActive(item)} className="text-xs font-semibold text-gold hover:underline">
                  {item.active ? "Ocultar" : "Mostrar"}
                </button>
                <button onClick={() => remove(item.id)} className="text-feedback-danger hover:opacity-80" aria-label="Excluir foto">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
