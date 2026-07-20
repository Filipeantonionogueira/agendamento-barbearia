import { prisma } from "../config/prisma.js";

export const availabilityRepository = {
  list(professionalId) {
    return prisma.availability.findMany({ where: { professionalId }, orderBy: { dayOfWeek: "asc" } });
  },
  findByDay(professionalId, dayOfWeek) {
    return prisma.availability.findUnique({ where: { professionalId_dayOfWeek: { professionalId, dayOfWeek } } });
  },
  replaceMany(professionalId, items) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.availability.upsert({
          where: { professionalId_dayOfWeek: { professionalId, dayOfWeek: item.dayOfWeek } },
          update: item,
          create: { ...item, professionalId }
        })
      )
    );
  }
};
