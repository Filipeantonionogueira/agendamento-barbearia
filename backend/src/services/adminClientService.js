import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export const adminClientService = {
  async list(search) {
    const term = z.string().trim().max(80).optional().parse(search);
    const users = await prisma.user.findMany({
      where: {
        roles: { some: { role: "CLIENT" } },
        ...(term
          ? { OR: [{ name: { contains: term, mode: "insensitive" } }, { email: { contains: term, mode: "insensitive" } }] }
          : {})
      },
      include: {
        client: {
          include: {
            appointments: {
              select: { status: true, startAt: true, totalPriceCents: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return users.map((user) => {
      const appts = user.client?.appointments || [];
      const done = appts.filter((a) => a.status === "CONCLUIDO");
      const totalSpent = done.reduce((sum, a) => sum + (a.totalPriceCents), 0);
      const lastVisit = done.map((a) => a.startAt).sort((a, b) => new Date(b) - new Date(a))[0] || null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        active: user.active,
        memberSince: user.createdAt,
        appointmentsCount: appts.length,
        completedCount: done.length,
        totalSpentCents: totalSpent,
        lastVisit
      };
    });
  },

  async setBlocked(id, blocked) {
    const value = z.boolean().parse(blocked);
    const user = await prisma.user.findUnique({ where: { id }, include: { roles: true } });
    if (!user) throw new AppError("Cliente nao encontrado.", 404);
    if (user.roles.some((r) => ["OWNER", "ADMIN"].includes(r.role))) {
      throw new AppError("Nao e possivel bloquear administradores.", 403);
    }
    await prisma.user.update({ where: { id }, data: { active: !value } });
    // Ao bloquear, revoga sessoes ativas.
    if (value) await prisma.refreshToken.deleteMany({ where: { userId: id } });
    logger.info("client_block_changed", { userId: id, blocked: value });
    return { ok: true, active: !value };
  }
};
