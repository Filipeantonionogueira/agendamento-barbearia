import { prisma } from "../config/prisma.js";
import { LOYALTY_TIERS, pointsForAppointment, resolveTier } from "../config/loyalty.js";
import { logger } from "../utils/logger.js";

export const loyaltyService = {
  // Concede pontos por atendimento concluido (idempotente por appointmentId).
  async awardForAppointment(appointment) {
    if (!appointment) return null;
    const client = await prisma.client.findUnique({ where: { id: appointment.clientId } });
    if (!client?.userId) return null;

    const existing = await prisma.loyaltyTransaction.findUnique({ where: { appointmentId: appointment.id } });
    if (existing) return existing;

    const netCents = appointment.totalPriceCents - (appointment.discountCents || 0);
    const points = pointsForAppointment(netCents);
    const entry = await prisma.loyaltyTransaction.create({
      data: { userId: client.userId, appointmentId: appointment.id, points, reason: "Atendimento concluido" }
    });
    logger.info("loyalty_awarded", { userId: client.userId, appointmentId: appointment.id, points });
    return entry;
  },

  async summary(userId) {
    const [entries, client, completed] = await Promise.all([
      prisma.loyaltyTransaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.client.findUnique({ where: { userId } }),
      prisma.appointment.findMany({
        where: { client: { userId }, status: "CONCLUIDO" },
        select: { totalPriceCents: true }
      })
    ]);

    const points = entries.reduce((sum, entry) => sum + entry.points, 0);
    const lifetimePoints = entries.filter((entry) => entry.points > 0).reduce((sum, entry) => sum + entry.points, 0);
    const totalSpentCents = completed.reduce((sum, appointment) => sum + appointment.totalPriceCents, 0);
    const tier = resolveTier(lifetimePoints);

    const memberUser = await prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } });

    return {
      points,
      lifetimePoints,
      cuts: completed.length,
      totalSpentCents,
      memberSince: memberUser?.createdAt || client?.createdAt || null,
      level: tier.current,
      nextLevel: tier.next,
      pointsToNext: tier.pointsToNext,
      progress: tier.progress,
      tiers: LOYALTY_TIERS,
      history: entries.slice(0, 20)
    };
  }
};
