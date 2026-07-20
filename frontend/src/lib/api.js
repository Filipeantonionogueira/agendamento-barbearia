const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

// Origem do servidor (sem o sufixo /api) — usada para arquivos estaticos enviados.
const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Erro na requisicao.");
  return data;
}

/**
 * Envia um arquivo (multipart). Nao define Content-Type: o browser precisa
 * gerar o boundary automaticamente.
 */
export async function uploadFile(path, file) {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${API_URL}${path}`, { method: "POST", credentials: "include", body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Falha no envio do arquivo.");
  return data;
}

/** Resolve uma URL de arquivo enviado (ex.: "/uploads/x.png") ou devolve URLs externas intactas. */
export function assetUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${SERVER_ORIGIN}${url}`;
}
