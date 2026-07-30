import React from "react";
import { ShieldCheck } from "lucide-react";
import { Panel } from "../ui/Panel.jsx";
import { Button } from "../ui/Button.jsx";
import { api } from "../../lib/api.js";

const ACTION_LABEL = {
  LOGIN: "Login",
  LOGIN_FAILED: "Login falhou",
  USER_REGISTERED: "Novo cadastro",
  APPOINTMENT_STATUS_CHANGED: "Status de agendamento",
  CLIENT_BLOCK_CHANGED: "Bloqueio de cliente",
  REVIEW_REPLIED: "Resposta a avaliacao",
  CONFIG_UPDATED: "Configuracoes alteradas",
  SITE_CONTENT_UPDATED: "Landing page editada",
  GALLERY_ITEM_CREATED: "Item da galeria criado",
  GALLERY_ITEM_DELETED: "Item da galeria excluido",
  FILE_UPLOADED: "Arquivo enviado"
};

export function Auditoria() {
  const [data, setData] = React.useState(null);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    api(`/auditoria?page=${page}&pageSize=30`).then(setData).catch(() => setData(null));
  }, [page]);

  return (
    <Panel title="Auditoria" icon={<ShieldCheck />}>
      <p className="mb-4 text-sm text-text-secondary">Registro das acoes sensiveis realizadas no sistema.</p>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface-subtle text-left text-text-secondary">
            <tr>
              <th className="p-3">Quando</th>
              <th className="p-3">Acao</th>
              <th className="p-3">Ator</th>
              <th className="p-3">Entidade</th>
              <th className="p-3">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {(!data || data.items.length === 0) && (
              <tr><td colSpan={5} className="p-4 text-center text-text-secondary">Nenhum registro.</td></tr>
            )}
            {data?.items.map((log) => (
              <tr key={log.id} className="border-t border-border align-top">
                <td className="p-3 text-text-secondary">{new Date(log.createdAt).toLocaleString("pt-BR")}</td>
                <td className="p-3"><strong>{ACTION_LABEL[log.action] || log.action}</strong></td>
                <td className="p-3 text-text-secondary">{log.actorName || "-"}</td>
                <td className="p-3 text-text-secondary">{log.entity || "-"}</td>
                <td className="p-3 text-xs text-text-muted">{log.metadata || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-text-secondary">Pagina {data.page} de {data.totalPages}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <Button variant="ghost" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Proxima</Button>
          </div>
        </div>
      )}
    </Panel>
  );
}
