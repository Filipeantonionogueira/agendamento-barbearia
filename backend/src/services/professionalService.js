import { z } from "zod";
import { professionalRepository } from "../repositories/professionalRepository.js";
import { barberRepository } from "../repositories/barberRepository.js";
import { AppError } from "../utils/AppError.js";

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  photoUrl: z.string().trim().max(600).optional().nullable(),
  bio: z.string().trim().max(400).optional().nullable(),
  specialty: z.string().trim().max(60).optional().nullable(),
  active: z.boolean().optional(),
  displayOrder: z.number().int().optional()
});

export const professionalService = {
  // Expoe a nota media e o total de avaliacoes, sem vazar as avaliacoes cruas.
  async listPublic() {
    const professionals = await professionalRepository.listActive(barberRepository.defaultId);
    return professionals.map(({ reviews, ...professional }) => {
      const total = reviews.length;
      const average = total ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;
      return { ...professional, rating: Number(average.toFixed(2)), reviewsCount: total };
    });
  },
  listAdmin() {
    return professionalRepository.list(barberRepository.defaultId);
  },
  create(input) {
    const data = createSchema.parse(input);
    return professionalRepository.create({ ...data, barberId: barberRepository.defaultId });
  },
  async update(id, input) {
    const data = createSchema.partial().parse(input);
    const existing = await professionalRepository.findById(id, barberRepository.defaultId);
    if (!existing) throw new AppError("Profissional nao encontrado.", 404);
    return professionalRepository.update(id, data);
  },
  async getActiveOrThrow(id) {
    const professional = await professionalRepository.findById(id, barberRepository.defaultId);
    if (!professional || !professional.active) throw new AppError("Profissional indisponivel.", 400);
    return professional;
  }
};
