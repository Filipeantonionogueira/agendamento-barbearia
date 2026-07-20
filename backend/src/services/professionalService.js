import { z } from "zod";
import { professionalRepository } from "../repositories/professionalRepository.js";
import { barberRepository } from "../repositories/barberRepository.js";
import { AppError } from "../utils/AppError.js";

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  photoUrl: z.string().trim().url().max(300).optional().nullable(),
  bio: z.string().trim().max(400).optional().nullable(),
  active: z.boolean().optional(),
  displayOrder: z.number().int().optional()
});

export const professionalService = {
  listPublic() {
    return professionalRepository.listActive(barberRepository.defaultId);
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
