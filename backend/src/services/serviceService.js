import { z } from "zod";
import { barberRepository } from "../repositories/barberRepository.js";
import { serviceRepository } from "../repositories/serviceRepository.js";
import { AppError } from "../utils/AppError.js";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(2).max(240),
  priceCents: z.coerce.number().int().min(0),
  estimatedMinutes: z.coerce.number().int().min(5).max(480),
  active: z.boolean().optional()
});

export const serviceService = {
  listPublic() {
    return serviceRepository.list({ barberId: barberRepository.defaultId, active: true });
  },
  listAdmin() {
    return serviceRepository.list({ barberId: barberRepository.defaultId });
  },
  async create(input) {
    const data = schema.parse(input);
    return serviceRepository.create({ ...data, barberId: barberRepository.defaultId });
  },
  async update(id, input) {
    const data = schema.partial().parse(input);
    if (!id) throw new AppError("Servico invalido.", 400);
    return serviceRepository.update(id, data);
  },
  async deactivate(id) {
    return serviceRepository.update(id, { active: false });
  }
};
