import { adminClientService } from "../services/adminClientService.js";
import { auditService } from "../services/auditService.js";

export const adminClientController = {
  async list(req, res, next) {
    try {
      res.json(await adminClientService.list(req.query.search));
    } catch (error) {
      next(error);
    }
  },
  // Exportacao em CSV para uso em planilha/CRM.
  async exportCsv(req, res, next) {
    try {
      const clients = await adminClientService.list(req.query.search);
      const header = ["Nome", "Email", "Telefone", "Situacao", "Atendimentos", "Concluidos", "Total gasto (R$)", "Pontos", "Cliente desde", "Ultima visita"];
      const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
      const rows = clients.map((c) =>
        [
          c.name,
          c.email,
          c.phone || "",
          c.active ? "Ativo" : "Bloqueado",
          c.appointmentsCount,
          c.completedCount,
          (c.totalSpentCents / 100).toFixed(2).replace(".", ","),
          c.points,
          new Date(c.memberSince).toLocaleDateString("pt-BR"),
          c.lastVisit ? new Date(c.lastVisit).toLocaleDateString("pt-BR") : ""
        ]
          .map(escape)
          .join(";")
      );
      // BOM para o Excel reconhecer acentuacao em UTF-8.
      const csv = `﻿${[header.map(escape).join(";"), ...rows].join("\r\n")}`;
      auditService.record({ action: "CLIENTS_EXPORTED", entity: "User", metadata: { total: clients.length }, req });
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="clientes-${new Date().toISOString().slice(0, 10)}.csv"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },
  async setBlocked(req, res, next) {
    try {
      const result = await adminClientService.setBlocked(req.params.id, req.body.blocked);
      auditService.record({ action: "CLIENT_BLOCK_CHANGED", entity: "User", entityId: req.params.id, metadata: { blocked: req.body.blocked }, req });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
