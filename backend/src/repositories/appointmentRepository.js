import { prisma } from "../config/prisma.js";

export const appointmentRepository = {
  list(barberId, where = {}) {
    return prisma.appointment.findMany({
      where: { barberId, ...where },
      include: { client: true, professional: true, appointmentServices: { include: { service: true } } },
      orderBy: { startAt: "asc" }
    });
  },
  listByUser(userId) {
    return prisma.appointment.findMany({
      where: { client: { userId } },
      include: { professional: true, appointmentServices: { include: { service: true } }, review: true },
      orderBy: { startAt: "desc" }
    });
  },
  listBlockingByDate(professionalId, dayStart) {
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return prisma.appointment.findMany({
      where: {
        professionalId,
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
    return prisma.appointment.update({
      where: { id },
      data: { status },
      include: { client: true, professional: true, appointmentServices: { include: { service: true } } }
    });
  }
};
