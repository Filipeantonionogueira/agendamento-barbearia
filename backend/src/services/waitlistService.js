import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { notificationService } from "./notificationService.js";
import { AppError } from "../utils/AppError.js";
import { dateOnly } from "../utils/time.js";
import { logger } from "../utils/logger.js";

const joinSchema = z.object({
  professionalId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceIds: z.array(z.string().uuid()).min(1)
});

export const waitlistService = {
  async join(userId, input) {
    const data = joinSchema.parse(input);
    const professional = await prisma.professional.findFirst({ where: { id: data.professionalId, active: true } });
    if (!professional) throw new AppError("Profissional indisponivel.", 404);

    const day = dateOnly(data.date);
    const existing = await prisma.waitlistEntry.findFirst({
      where: { userId, professionalId: data.professionalId, date: day, status: "WAITING" }
    });
    if (existing) return existing;

    const entry = await prisma.waitlistEntry.create({
      data: { userId, professionalId: data.professionalId, date: day, serviceIds: data.serviceIds.join(",") }
    });
    logger.info("waitlist_joined", { userId, professionalId: data.professionalId, date: data.date });
    return entry;
  },

  listMine(userId) {
    return prisma.waitlistEntry.findMany({
      where: { userId, status: { in: ["WAITING", "NOTIFIED"] } },
      include: { professional: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    });
  },

  async cancel(userId, id) {
    const result = await prisma.waitlistEntry.updateMany({ where: { id, userId }, data: { status: "CANCELED" } });
    if (!result.count) throw new AppError("Item nao encontrado.", 404);
    return { ok: true };
  },

  // Quando um horario e liberado (cancelamento), avisa quem espera aquele profissional/dia.
  async notifyFreedSlot(professionalId, date) {
    const day = dateOnly(typeof date === "string" ? date : date.toISOString().slice(0, 10));
    const waiting = await prisma.waitlistEntry.findMany({
      where: { professionalId, date: day, status: "WAITING" },
      include: { professional: { select: { name: true } } }
    });
    for (const entry of waiting) {
      await notificationService.notify(entry.userId, {
        category: "AGENDAMENTO",
        title: "Abriu uma vaga!",
        body: `Um horario ficou livre com ${entry.professional.name} em ${day.toLocaleDateString("pt-BR")}. Garanta o seu.`,
        link: `/?prof=${professionalId}&servicos=${entry.serviceIds}`
      });
    }
    if (waiting.length) {
      await prisma.waitlistEntry.updateMany({
        where: { id: { in: waiting.map((entry) => entry.id) } },
        data: { status: "NOTIFIED", notifiedAt: new Date() }
      });
      logger.info("waitlist_notified", { professionalId, count: waiting.length });
    }
    return waiting.length;
  }
};
