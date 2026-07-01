import { z } from "zod";
import { barberRepository } from "../repositories/barberRepository.js";
import { blockRepository } from "../repositories/blockRepository.js";
import { dateOnly, minutesFromTime } from "../utils/time.js";
import { AppError } from "../utils/AppError.js";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  reason: z.string().trim().max(160).optional().nullable()
});

export const blockService = {
  list() {
    return blockRepository.list(barberRepository.defaultId);
  },
  create(input) {
    const data = schema.parse(input);
    if ((data.startTime && !data.endTime) || (!data.startTime && data.endTime)) {
      throw new AppError("Informe inicio e fim do bloqueio.", 400);
    }
    if (data.startTime && minutesFromTime(data.startTime) >= minutesFromTime(data.endTime)) {
      throw new AppError("Horario inicial deve ser menor que o final.", 400);
    }
    return blockRepository.create({ ...data, date: dateOnly(data.date), barberId: barberRepository.defaultId });
  },
  remove(id) {
    return blockRepository.remove(id, barberRepository.defaultId);
  }
};
