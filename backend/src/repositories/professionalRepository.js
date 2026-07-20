import { prisma } from "../config/prisma.js";

export const professionalRepository = {
  list(barberId) {
    return prisma.professional.findMany({ where: { barberId }, orderBy: [{ displayOrder: "asc" }, { name: "asc" }] });
  },
  listActive(barberId) {
    return prisma.professional.findMany({ where: { barberId, active: true }, orderBy: [{ displayOrder: "asc" }, { name: "asc" }] });
  },
  findById(id, barberId) {
    return prisma.professional.findFirst({ where: { id, barberId } });
  },
  create(data) {
    return prisma.professional.create({ data });
  },
  update(id, data) {
    return prisma.professional.update({ where: { id }, data });
  }
};
