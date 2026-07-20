import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { reviewRepository } from "../repositories/reviewRepository.js";
import { notificationService } from "./notificationService.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

const createSchema = z.object({
  appointmentId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(600).optional().nullable(),
  photoUrl: z.string().trim().url().max(400).optional().nullable()
});

const replySchema = z.object({ reply: z.string().trim().min(1).max(600) });

const listQuerySchema = z.object({
  professionalId: z.string().uuid().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  order: z.enum(["asc", "desc"]).default("desc")
});

export const reviewService = {
  async create(userId, input) {
    const data = createSchema.parse(input);
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { client: true }
    });
    if (!appointment || appointment.client?.userId !== userId) throw new AppError("Agendamento nao encontrado.", 404);
    if (appointment.status !== "CONCLUIDO") throw new AppError("Só é possivel avaliar atendimentos concluidos.", 409);

    const existing = await reviewRepository.findByAppointment(data.appointmentId);
    if (existing) throw new AppError("Este atendimento ja foi avaliado.", 409);

    const review = await reviewRepository.create({
      appointmentId: data.appointmentId,
      userId,
      professionalId: appointment.professionalId,
      rating: data.rating,
      comment: data.comment || null,
      photoUrl: data.photoUrl || null
    });
    logger.info("review_created", { reviewId: review.id, rating: review.rating });
    return review;
  },

  async listPublic(query) {
    const { professionalId, rating, page, pageSize, order } = listQuerySchema.parse(query);
    const [items, total, summary] = await Promise.all([
      reviewRepository.listPublished({ professionalId, rating, skip: (page - 1) * pageSize, take: pageSize, order }),
      reviewRepository.count({ professionalId, rating }),
      reviewRepository.summary(professionalId)
    ]);
    return { items, page, pageSize, totalItems: total, totalPages: Math.ceil(total / pageSize) || 1, summary };
  },

  pending(userId) {
    return reviewRepository.pendingForUser(userId);
  },

  async reply(id, input) {
    const { reply } = replySchema.parse(input);
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) throw new AppError("Avaliacao nao encontrada.", 404);
    const review = await reviewRepository.reply(id, reply);
    await notificationService.notify(existing.userId, {
      category: "AVALIACAO",
      title: "O barbeiro respondeu sua avaliacao",
      body: reply.length > 90 ? `${reply.slice(0, 90)}...` : reply,
      link: "/conta/historico"
    });
    logger.info("review_replied", { reviewId: id });
    return review;
  },

  listAllForAdmin() {
    return prisma.review.findMany({
      include: {
        professional: { select: { name: true } },
        user: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }
};
