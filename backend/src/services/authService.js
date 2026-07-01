import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

const loginSchema = z.object({
  username: z.string().trim().min(2),
  password: z.string().min(6)
});

function signAccess(admin) {
  return jwt.sign({ sub: admin.id, barberId: admin.barberId, username: admin.username }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn
  });
}

function signRefresh(admin) {
  return jwt.sign({ sub: admin.id, tokenId: crypto.randomUUID() }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });
}

export const authService = {
  async login(input) {
    const { username, password } = loginSchema.parse(input);
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      logger.info("login_failed", { username });
      throw new AppError("Usuario ou senha invalidos.", 401);
    }

    const accessToken = signAccess(admin);
    const refreshToken = signRefresh(admin);
    await prisma.refreshToken.create({
      data: {
        adminId: admin.id,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    logger.info("login_success", { adminId: admin.id });
    return { accessToken, refreshToken, admin: { username: admin.username } };
  },
  async refresh(refreshToken) {
    if (!refreshToken) throw new AppError("Refresh token ausente.", 401);
    let payload;
    try {
      payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
    } catch {
      throw new AppError("Refresh token invalido.", 401);
    }
    const admin = await prisma.admin.findUnique({ where: { id: payload.sub } });
    if (!admin) throw new AppError("Usuario nao encontrado.", 401);
    const storedTokens = await prisma.refreshToken.findMany({
      where: { adminId: admin.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 10
    });
    const tokenMatches = await Promise.any(
      storedTokens.map(async (item) => ((await bcrypt.compare(refreshToken, item.tokenHash)) ? item : Promise.reject()))
    ).catch(() => null);
    if (!tokenMatches) throw new AppError("Refresh token revogado.", 401);
    return { accessToken: signAccess(admin) };
  },
  async updateCredentials({ username, password }) {
    const data = {};
    if (username) data.username = z.string().trim().min(2).parse(username);
    if (password) data.passwordHash = await bcrypt.hash(z.string().min(6).parse(password), 12);
    return prisma.admin.updateMany({ where: { barberId: "00000000-0000-0000-0000-000000000001" }, data });
  }
};
