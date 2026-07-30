import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const NOTIFICATION_CATEGORIES = ["AGENDAMENTO", "CANCELAMENTO", "FIDELIDADE", "AVALIACAO", "SISTEMA"];

export const notificationService = {
  // Cria uma notificacao. Nunca lanca erro para nao quebrar o fluxo que a dispara.
  async notify(userId, { category, title, body = null, link = null }) {
    if (!userId) return null;
    try {
      return await prisma.notification.create({ data: { userId, category, title, body, link } });
    } catch {
      return null;
    }
  },

  list(userId, { archived = false } = {}) {
    return prisma.notification.findMany({
      where: { userId, archived },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  },

  unreadCount(userId) {
    return prisma.notification.count({ where: { userId, read: false, archived: false } });
  },

  async markRead(userId, id) {
    const result = await prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
    if (!result.count) throw new AppError("Notificacao nao encontrada.", 404);
    return { ok: true };
  },

  async markAllRead(userId) {
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return { ok: true };
  },

  async archive(userId, id) {
    const result = await prisma.notification.updateMany({ where: { id, userId }, data: { archived: true, read: true } });
    if (!result.count) throw new AppError("Notificacao nao encontrada.", 404);
    return { ok: true };
  }
};
