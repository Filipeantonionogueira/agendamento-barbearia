import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";

const listQuerySchema = z.object({
  action: z.string().trim().max(60).optional(),
  entity: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30)
});

export const auditService = {
  // Registra uma acao. Fire-and-forget: nunca lanca erro para nao afetar o fluxo principal.
  async record({ req = null, userId = null, actorName = null, action, entity = null, entityId = null, metadata = null }) {
    try {
      const auth = req?.auth || null;
      await prisma.auditLog.create({
        data: {
          userId: userId || auth?.sub || null,
          actorName: actorName || auth?.name || null,
          action,
          entity,
          entityId,
          metadata: metadata ? JSON.stringify(metadata).slice(0, 2000) : null,
          ip: req?.ip || null
        }
      });
    } catch (error) {
      logger.warn("audit_record_failed", { action, message: error.message });
    }
  },

  async list(query) {
    const { action, entity, page, pageSize } = listQuerySchema.parse(query);
    const where = { ...(action ? { action } : {}), ...(entity ? { entity } : {}) };
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.auditLog.count({ where })
    ]);
    return { items, page, pageSize, totalItems: total, totalPages: Math.ceil(total / pageSize) || 1 };
  }
};
