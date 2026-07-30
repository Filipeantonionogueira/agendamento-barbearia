import React from "react";
import { Upload, Loader2, X } from "lucide-react";
import { api, assetUrl, uploadFile } from "../../lib/api.js";

/**
 * Campo de imagem do CMS: aceita upload (vai para o storage configurado)
 * ou uma URL colada manualmente.
 */
export function ImageField({ label, value, onChange, hint, aspect = "aspect-video" }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef(null);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const result = await uploadFile("/galeria/upload", file);
      onChange(result.url);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</span>}

      <div className="flex flex-wrap items-start gap-3">
        <div className={`${aspect} w-40 shrink-0 overflow-hidden rounded-md border border-border bg-surface-subtle`}>
          {value ? (
            <img src={assetUrl(value)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-text-muted">Sem imagem</div>
          )}
        </div>

        <div className="min-w-[200px] flex-1 space-y-2">
          <input
            className="field text-sm"
            placeholder="Cole uma URL ou envie um arquivo"
            value={value || ""}
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md border border-border-strong px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle disabled:opacity-50"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {busy ? "Enviando..." : "Enviar imagem"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-text-muted transition-colors hover:text-feedback-danger"
              >
                <X size={14} /> Remover
              </button>
            )}
          </div>
          {hint && <p className="text-xs text-text-muted">{hint}</p>}
          {error && <p className="text-xs text-feedback-danger">{error}</p>}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>
    </div>
  );
}

/** Campo de texto simples reutilizado pelo CMS. */
export function TextField({ label, hint, textarea = false, className = "", ...props }) {
  const Component = textarea ? "textarea" : "input";
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</span>}
      <Component className={`field ${textarea ? "min-h-[96px] resize-y" : ""}`} {...props} />
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </label>
  );
}

export { api };
