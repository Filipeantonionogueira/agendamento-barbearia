import { prisma } from "../config/prisma.js";
import { barberRepository } from "../repositories/barberRepository.js";

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
    const appointments = await prisma.appointment.findMany({
      where: { barberId: barberRepository.defaultId, status: "CONCLUIDO", startAt: { gte: start, lte: end } },
      include: { appointmentServices: { include: { service: true } } }
    });

    const revenueByDay = {};
    const serviceRanking = {};
    for (const appointment of appointments) {
      const key = appointment.startAt.toISOString().slice(0, 10);
      revenueByDay[key] = (revenueByDay[key] || 0) + appointment.totalPriceCents;
      for (const item of appointment.appointmentServices) {
        serviceRanking[item.service.name] = (serviceRanking[item.service.name] || 0) + 1;
      }
    }

    return {
      period,
      clients: appointments.length,
      revenueCents: appointments.reduce((sum, item) => sum + item.totalPriceCents, 0),
      serviceRanking: Object.entries(serviceRanking).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      revenueByDay: Object.entries(revenueByDay).map(([date, revenueCents]) => ({ date, revenueCents }))
    };
  }
};
