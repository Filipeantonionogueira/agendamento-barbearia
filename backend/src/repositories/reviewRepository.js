import { prisma } from "../config/prisma.js";

const publicInclude = {
  professional: { select: { id: true, name: true, photoUrl: true } },
  user: { select: { name: true, photoUrl: true } }
};

export const reviewRepository = {
  listPublished({ professionalId, rating, skip = 0, take = 10, order = "desc" }) {
    return prisma.review.findMany({
      where: {
        published: true,
        ...(professionalId ? { professionalId } : {}),
        ...(rating ? { rating } : {})
      },
      include: publicInclude,
      orderBy: { createdAt: order },
      skip,
      take
    });
  },
  count({ professionalId, rating }) {
    return prisma.review.count({
      where: {
        published: true,
        ...(professionalId ? { professionalId } : {}),
        ...(rating ? { rating } : {})
      }
    });
  },
  async summary(professionalId) {
    const where = { published: true, ...(professionalId ? { professionalId } : {}) };
    const grouped = await prisma.review.groupBy({ by: ["rating"], where, _count: { rating: true } });
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let sum = 0;
    for (const row of grouped) {
      distribution[row.rating] = row._count.rating;
      total += row._count.rating;
      sum += row.rating * row._count.rating;
    }
    return { average: total ? Number((sum / total).toFixed(2)) : 0, total, distribution };
  },
  findByAppointment(appointmentId) {
    return prisma.review.findUnique({ where: { appointmentId } });
  },
  create(data) {
    return prisma.review.create({ data, include: publicInclude });
  },
  reply(id, reply) {
    return prisma.review.update({ where: { id }, data: { reply, repliedAt: new Date() }, include: publicInclude });
  },
  pendingForUser(userId) {
    return prisma.appointment.findMany({
      where: { client: { userId }, status: "CONCLUIDO", review: null },
      include: { professional: { select: { id: true, name: true } }, appointmentServices: { include: { service: true } } },
      orderBy: { startAt: "desc" }
    });
  }
};
