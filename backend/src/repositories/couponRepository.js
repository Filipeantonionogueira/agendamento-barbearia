import { prisma } from "../config/prisma.js";

export const couponRepository = {
  findByCode(code, barberId) {
    return prisma.coupon.findFirst({ where: { code: code.toUpperCase(), barberId } });
  },
  list(barberId) {
    return prisma.coupon.findMany({
      where: { barberId },
      include: { _count: { select: { usages: true } } },
      orderBy: { createdAt: "desc" }
    });
  },
  findById(id, barberId) {
    return prisma.coupon.findFirst({ where: { id, barberId } });
  },
  create(data) {
    return prisma.coupon.create({ data });
  },
  update(id, data) {
    return prisma.coupon.update({ where: { id }, data });
  },
  remove(id) {
    return prisma.coupon.delete({ where: { id } });
  }
};
