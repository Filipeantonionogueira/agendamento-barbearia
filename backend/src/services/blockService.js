import { z } from "zod";
import { blockRepository } from "../repositories/blockRepository.js";
import { professionalService } from "./professionalService.js";
import { dateOnly, minutesFromTime } from "../utils/time.js";
import { AppError } from "../utils/AppError.js";

const professionalIdSchema = z.string().uuid();

const schema = z.object({
  professionalId: professionalIdSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  reason: z.string().trim().max(160).optional().nullable()
});

export const blockService = {
  async list(professionalId) {
    const id = professionalIdSchema.parse(professionalId);
    await professionalService.getActiveOrThrow(id);
    return blockRepository.list(id);
  },
  async create(input) {
    const data = schema.parse(input);
    await professionalService.getActiveOrThrow(data.professionalId);
    if ((data.startTime && !data.endTime) || (!data.startTime && data.endTime)) {
      throw new AppError("Informe inicio e fim do bloqueio.", 400);
    }
    if (data.startTime && minutesFromTime(data.startTime) >= minutesFromTime(data.endTime)) {
      throw new AppError("Horario inicial deve ser menor que o final.", 400);
    }
    return blockRepository.create({
      date: dateOnly(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason,
      professionalId: data.professionalId
    });
  },
  async remove(id, professionalId) {
    const parsedProfessionalId = professionalIdSchema.parse(professionalId);
    return blockRepository.remove(id, parsedProfessionalId);
  }
};
