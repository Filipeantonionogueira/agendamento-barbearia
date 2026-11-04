import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { userRepository } from "../repositories/userRepository.js";
import { barberRepository } from "../repositories/barberRepository.js";
import { emailService, emailTemplates } from "./emailService.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(30).optional().nullable(),
  photoUrl: z.string().trim().url().max(400).optional().nullable()
});

const resetRequestSchema = z.object({ email: z.string().trim().email() });
const resetConfirmSchema = z.object({ token: z.string().min(10), password: z.string().min(6).max(72) });

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(6).max(72),
  phone: z.string().trim().max(30).optional().nullable()
});

function rolesOf(user) {
  return (user.roles || []).map((entry) => entry.role);
}

function signAccess(user) {
  return jwt.sign(
    { sub: user.id, barberId: user.barberId, roles: rolesOf(user), email: user.email, name: user.name },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );
}

function signRefresh(user) {
  return jwt.sign({ sub: user.id, tokenId: crypto.randomUUID() }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });
}

async function issueRefreshToken(user, refreshToken) {
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, 12),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    photoUrl: user.photoUrl ?? null,
    roles: rolesOf(user)
  };
}

export const authService = {
  async register(input) {
    const data = registerSchema.parse(input);
    const email = data.email.toLowerCase();
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError("Ja existe uma conta com este e-mail.", 409);

    const user = await userRepository.create(
      {
        barberId: barberRepository.defaultId,
        email,
        name: data.name,
        phone: data.phone || null,
        passwordHash: await bcrypt.hash(data.password, 12),
        authProvider: "local"
      },
      ["CLIENT"]
    );

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    await issueRefreshToken(user, refreshToken);
    await emailService.send(user.email, emailTemplates.welcome({ name: user.name })).catch(() => {});
    logger.info("user_registered", { userId: user.id });
    return { accessToken, refreshToken, user: publicUser(user) };
  },

  async login(input) {
    const { email, password } = loginSchema.parse(input);
    const user = await userRepository.findByEmail(email.toLowerCase());
    if (!user || !user.active || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      logger.info("login_failed", { email });
      throw new AppError("E-mail ou senha invalidos.", 401);
    }

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    await issueRefreshToken(user, refreshToken);
    logger.info("login_success", { userId: user.id });
    return { accessToken, refreshToken, user: publicUser(user) };
  },

  async refresh(refreshToken) {
    if (!refreshToken) throw new AppError("Refresh token ausente.", 401);
    let payload;
    try {
      payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
    } catch {
      throw new AppError("Refresh token invalido.", 401);
    }
    const user = await userRepository.findById(payload.sub);
    if (!user || !user.active) throw new AppError("Usuario nao encontrado.", 401);

    const storedTokens = await prisma.refreshToken.findMany({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 10
    });
    const tokenMatches = await Promise.any(
      storedTokens.map(async (item) => ((await bcrypt.compare(refreshToken, item.tokenHash)) ? item : Promise.reject()))
    ).catch(() => null);
    if (!tokenMatches) throw new AppError("Refresh token revogado.", 401);

    return { accessToken: signAccess(user), user: publicUser(user) };
  },

  async me(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("Usuario nao encontrado.", 404);
    return publicUser(user);
  },

  async updateProfile(userId, input) {
    const data = profileSchema.parse(input);
    const clean = {};
    if (data.name !== undefined) clean.name = data.name;
    if (data.phone !== undefined) clean.phone = data.phone || null;
    if (data.photoUrl !== undefined) clean.photoUrl = data.photoUrl || null;
    const user = await userRepository.update(userId, clean);
    // Mantem o registro Client (agendamento) em sincronia com o perfil.
    await prisma.client.updateMany({
      where: { userId },
      data: { name: user.name, phone: user.phone }
    });
    return publicUser(user);
  },

  async requestPasswordReset(input, buildResetUrl) {
    const { email } = resetRequestSchema.parse(input);
    const user = await userRepository.findByEmail(email.toLowerCase());
    // Resposta sempre generica para nao revelar quais e-mails existem.
    if (!user) return { ok: true };

    const rawToken = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(rawToken, 12),
        expiresAt: new Date(Date.now() + env.passwordResetExpiresMinutes * 60 * 1000)
      }
    });
    const resetUrl = buildResetUrl(rawToken);
    await emailService.send(user.email, emailTemplates.passwordReset({ name: user.name, resetUrl })).catch(() => {});
    // Em dev nao ha e-mail real: expor a URL no log facilita testes e uso local.
    if (env.nodeEnv !== "production") logger.info("password_reset_dev_url", { resetUrl });
    logger.info("password_reset_requested", { userId: user.id });
    return { ok: true };
  },

  async resetPassword(input) {
    const { token, password } = resetConfirmSchema.parse(input);
    const candidates = await prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    let matched = null;
    for (const candidate of candidates) {
      if (await bcrypt.compare(token, candidate.tokenHash)) {
        matched = candidate;
        break;
      }
    }
    if (!matched) throw new AppError("Token invalido ou expirado.", 400);

    await prisma.$transaction([
      prisma.user.update({ where: { id: matched.userId }, data: { passwordHash: await bcrypt.hash(password, 12) } }),
      prisma.passwordResetToken.update({ where: { id: matched.id }, data: { usedAt: new Date() } }),
      prisma.refreshToken.deleteMany({ where: { userId: matched.userId } })
    ]);
    logger.info("password_reset_done", { userId: matched.userId });
    return { ok: true };
  },

  // Compat: painel admin (aba Config) altera credenciais do Owner.
  async updateCredentials({ username, password }) {
    const owner = await prisma.user.findFirst({
      where: { barberId: barberRepository.defaultId, roles: { some: { role: "OWNER" } } }
    });
    if (!owner) return null;
    const data = {};
    if (username) data.email = z.string().trim().email().parse(username).toLowerCase();
    if (password) data.passwordHash = await bcrypt.hash(z.string().min(6).parse(password), 12);
    if (!Object.keys(data).length) return owner;
    return prisma.user.update({ where: { id: owner.id }, data });
  },

  async googleLogin(input) {
    const { credential } = z
      .object({
        credential: z.string({ required_error: "Credencial do Google obrigatoria." }).min(1, "Credencial do Google obrigatoria.")
      })
      .parse(input);

    let payload;
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!response.ok) {
        throw new Error("Tokeninfo do Google retornou erro.");
      }
      payload = await response.json();
    } catch (err) {
      logger.warn("google_token_verification_failed", { error: err.message });
      throw new AppError("Nao foi possivel validar as credenciais com o Google.", 401);
    }

    if (!payload?.sub || !payload?.email) {
      throw new AppError("Dados de usuario incompletos no token do Google.", 401);
    }

    const emailVerified = payload.email_verified === "true" || payload.email_verified === true;
    if (!emailVerified) {
      throw new AppError("O e-mail da conta Google nao esta verificado.", 401);
    }

    if (env.googleClientId && payload.aud !== env.googleClientId) {
      logger.warn("google_client_id_mismatch", { aud: payload.aud, expected: env.googleClientId });
      throw new AppError("Token emitido para um cliente Google diferente do configurado.", 401);
    }

    const email = payload.email.toLowerCase();
    let user = await userRepository.findByGoogleId(payload.sub);

    if (!user) {
      const existingByEmail = await userRepository.findByEmail(email);
      if (existingByEmail) {
        user = await userRepository.update(existingByEmail.id, {
          googleId: payload.sub,
          photoUrl: existingByEmail.photoUrl || payload.picture || null
        });
        logger.info("google_account_linked", { userId: user.id });
      } else {
        user = await userRepository.create(
          {
            barberId: barberRepository.defaultId,
            email,
            name: payload.name || email.split("@")[0],
            photoUrl: payload.picture || null,
            googleId: payload.sub,
            authProvider: "google",
            active: true
          },
          ["CLIENT"]
        );
        logger.info("google_user_registered", { userId: user.id });
      }
    }

    if (!user.active) {
      throw new AppError("Esta conta esta desativada. Entre em contato com a barbearia.", 403);
    }

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    await issueRefreshToken(user, refreshToken);
    logger.info("google_login_success", { userId: user.id });
    return { accessToken, refreshToken, user: publicUser(user) };
  }
};
