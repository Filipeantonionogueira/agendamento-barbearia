import { prisma } from "../config/prisma.js";

export const favoriteRepository = {
  listByUser(userId) {
    return prisma.favorite.findMany({
      where: { userId },
      include: { service: true, professional: true },
      orderBy: { createdAt: "desc" }
    });
  },
  add(userId, { serviceId = null, professionalId = null }) {
    return prisma.favorite.create({ data: { userId, serviceId, professionalId } });
  },
  remove(userId, { serviceId = null, professionalId = null }) {
    return prisma.favorite.deleteMany({
      where: { userId, ...(serviceId ? { serviceId } : {}), ...(professionalId ? { professionalId } : {}) }
    });
  },
  findExisting(userId, { serviceId = null, professionalId = null }) {
    return prisma.favorite.findFirst({ where: { userId, serviceId, professionalId } });
  }
};
