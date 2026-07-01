import { prisma } from "../config/prisma.js";

export const appointmentRepository = {
  list(barberId, where = {}) {
    return prisma.appointment.findMany({
      where: { barberId, ...where },
      include: { client: true, appointmentServices: { include: { service: true } } },
      orderBy: { startAt: "asc" }
    });
  },
  listBlockingByDate(barberId, dayStart) {
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return prisma.appointment.findMany({
      where: {
        barberId,
        status: { in: ["PENDENTE", "CONFIRMADO"] },
        startAt: { lt: dayEnd },
        endAt: { gt: dayStart }
      },
      orderBy: { startAt: "asc" }
    });
  },
  async updateStatus(id, barberId, status) {
    const appointment = await prisma.appointment.findFirst({ where: { id, barberId } });
    if (!appointment) return null;
    return prisma.appointment.update({ where: { id }, data: { status } });
  }
};
