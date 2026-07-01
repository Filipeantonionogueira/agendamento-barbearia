import { prisma } from "../config/prisma.js";

const DEFAULT_BARBER_ID = "00000000-0000-0000-0000-000000000001";

export const barberRepository = {
  defaultId: DEFAULT_BARBER_ID,
  findDefault() {
    return prisma.barber.findUnique({ where: { id: DEFAULT_BARBER_ID } });
  },
  updateDefault(data) {
    return prisma.barber.update({ where: { id: DEFAULT_BARBER_ID }, data });
  }
};
