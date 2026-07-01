import { prisma } from "../config/prisma.js";

export const serviceRepository = {
  list(where = {}) {
    return prisma.service.findMany({ where, orderBy: { name: "asc" } });
  },
  findManyByIds(ids, barberId) {
    return prisma.service.findMany({ where: { id: { in: ids }, barberId, active: true } });
  },
  create(data) {
    return prisma.service.create({ data });
  },
  update(id, data) {
    return prisma.service.update({ where: { id }, data });
  }
};
