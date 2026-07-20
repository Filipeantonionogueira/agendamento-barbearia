import { prisma } from "../config/prisma.js";

export const blockRepository = {
  list(professionalId) {
    return prisma.scheduleBlock.findMany({ where: { professionalId }, orderBy: { date: "asc" } });
  },
  listByDate(professionalId, date) {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    return prisma.scheduleBlock.findMany({ where: { professionalId, date: { gte: date, lt: next } } });
  },
  create(data) {
    return prisma.scheduleBlock.create({ data });
  },
  remove(id, professionalId) {
    return prisma.scheduleBlock.deleteMany({ where: { id, professionalId } });
  }
};
