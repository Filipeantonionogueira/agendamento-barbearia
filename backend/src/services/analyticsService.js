import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { barberRepository } from "../repositories/barberRepository.js";

const visitSchema = z.object({
  sessionId: z.string().trim().min(8).max(64),
  path: z.string().trim().max(200),
  referrer: z.string().trim().max(200).optional().nullable()
});

/** Guarda apenas o dominio de origem — nunca a URL completa (pode conter dados pessoais). */
function referrerHost(referrer) {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname;
  } catch {
    return null;
  }
}

export const analyticsService = {
  async record(input) {
    const data = visitSchema.parse(input);
    await prisma.siteVisit.create({
      data: { sessionId: data.sessionId, path: data.path, referrer: referrerHost(data.referrer) }
    });
    return { ok: true };
  },

  // Metricas de trafego e conversao para o dashboard administrativo.
  async summary(start, end) {
    const [pageViews, sessions, referrers, appointments] = await Promise.all([
      prisma.siteVisit.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.siteVisit.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { sessionId: true },
        distinct: ["sessionId"]
      }),
      prisma.siteVisit.groupBy({
        by: ["referrer"],
        where: { createdAt: { gte: start, lte: end }, referrer: { not: null } },
        _count: { referrer: true },
        orderBy: { _count: { referrer: "desc" } },
        take: 5
      }),
      prisma.appointment.count({
        where: { barberId: barberRepository.defaultId, createdAt: { gte: start, lte: end } }
      })
    ]);

    const visitors = sessions.length;
    return {
      pageViews,
      visitors,
      bookings: appointments,
      // Conversao = agendamentos criados / visitantes unicos no periodo.
      conversionRate: visitors ? Number(((appointments / visitors) * 100).toFixed(1)) : 0,
      topReferrers: referrers.map((row) => ({ source: row.referrer, visits: row._count.referrer }))
    };
  }
};
