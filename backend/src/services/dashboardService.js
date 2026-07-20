import { prisma } from "../config/prisma.js";
import { barberRepository } from "../repositories/barberRepository.js";
import { analyticsService } from "./analyticsService.js";

function periodRange(period) {
  const now = new Date();
  const start = new Date(now);
  if (period === "dia") start.setHours(0, 0, 0, 0);
  else if (period === "semana") start.setDate(now.getDate() - 6);
  else start.setMonth(now.getMonth() - 1);
  return { start, end: now };
}

export const dashboardService = {
  async summary(period = "semana") {
    const { start, end } = periodRange(period);
    const barberId = barberRepository.defaultId;

    const [completed, allInPeriod, newClients, reviewAgg, traffic] = await Promise.all([
      prisma.appointment.findMany({
        where: { barberId, status: "CONCLUIDO", startAt: { gte: start, lte: end } },
        include: { appointmentServices: { include: { service: true } } }
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        where: { barberId, startAt: { gte: start, lte: end } },
        _count: { status: true }
      }),
      prisma.client.count({ where: { userId: { not: null }, createdAt: { gte: start, lte: end } } }),
      prisma.review.aggregate({ where: { published: true, createdAt: { gte: start, lte: end } }, _avg: { rating: true }, _count: true }),
      analyticsService.summary(start, end)
    ]);

    const revenueByDay = {};
    const serviceRanking = {};
    let revenueCents = 0;
    for (const appointment of completed) {
      const net = appointment.totalPriceCents - (appointment.discountCents || 0);
      revenueCents += net;
      const key = appointment.startAt.toISOString().slice(0, 10);
      revenueByDay[key] = (revenueByDay[key] || 0) + net;
      for (const item of appointment.appointmentServices) {
        serviceRanking[item.service.name] = (serviceRanking[item.service.name] || 0) + 1;
      }
    }

    const statusCount = Object.fromEntries(allInPeriod.map((row) => [row.status, row._count.status]));
    const totalAppointments = allInPeriod.reduce((sum, row) => sum + row._count.status, 0);
    const servicesSold = Object.values(serviceRanking).reduce((sum, count) => sum + count, 0);

    return {
      period,
      clients: completed.length,
      revenueCents,
      averageTicketCents: completed.length ? Math.round(revenueCents / completed.length) : 0,
      totalAppointments,
      cancellations: statusCount.CANCELADO || 0,
      pending: statusCount.PENDENTE || 0,
      confirmed: statusCount.CONFIRMADO || 0,
      servicesSold,
      newClients,
      averageRating: reviewAgg._avg.rating ? Number(reviewAgg._avg.rating.toFixed(2)) : 0,
      reviewsCount: reviewAgg._count,
      traffic,
      serviceRanking: Object.entries(serviceRanking).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      revenueByDay: Object.entries(revenueByDay).map(([date, revenueCents]) => ({ date, revenueCents }))
    };
  }
};
