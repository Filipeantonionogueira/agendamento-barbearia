import { prisma } from "../config/prisma.js";

export const availabilityRepository = {
  list(barberId) {
    return prisma.availability.findMany({ where: { barberId }, orderBy: { dayOfWeek: "asc" } });
  },
  findByDay(barberId, dayOfWeek) {
    return prisma.availability.findUnique({ where: { barberId_dayOfWeek: { barberId, dayOfWeek } } });
  },
  replaceMany(barberId, items) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.availability.upsert({
          where: { barberId_dayOfWeek: { barberId, dayOfWeek: item.dayOfWeek } },
          update: item,
          create: { ...item, barberId }
        })
      )
    );
  }
};
