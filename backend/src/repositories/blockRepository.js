import { prisma } from "../config/prisma.js";

export const blockRepository = {
  list(barberId) {
    return prisma.scheduleBlock.findMany({ where: { barberId }, orderBy: { date: "asc" } });
  },
  listByDate(barberId, date) {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    return prisma.scheduleBlock.findMany({ where: { barberId, date: { gte: date, lt: next } } });
  },
  create(data) {
    return prisma.scheduleBlock.create({ data });
  },
  remove(id, barberId) {
    return prisma.scheduleBlock.deleteMany({ where: { id, barberId } });
  }
};
