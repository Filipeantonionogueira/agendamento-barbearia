import { prisma } from "../config/prisma.js";

const withRoles = { roles: true };

export const userRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email }, include: withRoles });
  },
  findById(id) {
    return prisma.user.findUnique({ where: { id }, include: withRoles });
  },
  create(data, roles) {
    return prisma.user.create({
      data: { ...data, roles: { create: roles.map((role) => ({ role })) } },
      include: withRoles
    });
  },
  update(id, data) {
    return prisma.user.update({ where: { id }, data, include: withRoles });
  },
  addRole(userId, role) {
    return prisma.userRole.upsert({
      where: { userId_role: { userId, role } },
      update: {},
      create: { userId, role }
    });
  },
  removeRole(userId, role) {
    return prisma.userRole.deleteMany({ where: { userId, role } });
  }
};
