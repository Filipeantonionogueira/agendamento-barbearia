import { z } from "zod";
import { favoriteRepository } from "../repositories/favoriteRepository.js";
import { AppError } from "../utils/AppError.js";

const targetSchema = z
  .object({
    serviceId: z.string().uuid().optional(),
    professionalId: z.string().uuid().optional()
  })
  .refine((data) => Boolean(data.serviceId) !== Boolean(data.professionalId), {
    message: "Informe exatamente um alvo: serviceId OU professionalId."
  });

export const favoriteService = {
  list(userId) {
    return favoriteRepository.listByUser(userId);
  },
  async add(userId, input) {
    const target = targetSchema.parse(input);
    const existing = await favoriteRepository.findExisting(userId, {
      serviceId: target.serviceId || null,
      professionalId: target.professionalId || null
    });
    if (existing) return existing;
    return favoriteRepository.add(userId, target);
  },
  async remove(userId, input) {
    const target = targetSchema.parse(input);
    const result = await favoriteRepository.remove(userId, target);
    if (!result.count) throw new AppError("Favorito nao encontrado.", 404);
    return { ok: true };
  }
};
