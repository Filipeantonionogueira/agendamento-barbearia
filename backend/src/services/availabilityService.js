import { z } from "zod";
import { availabilityRepository } from "../repositories/availabilityRepository.js";
import { blockRepository } from "../repositories/blockRepository.js";
import { appointmentRepository } from "../repositories/appointmentRepository.js";
import { serviceRepository } from "../repositories/serviceRepository.js";
import { professionalService } from "./professionalService.js";
import { barberRepository } from "../repositories/barberRepository.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { dateOnly, minutesFromTime } from "../utils/time.js";
import { computeAvailableSlots } from "../utils/slots.js";

const availabilityItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  active: z.boolean()
});

const professionalIdSchema = z.string().uuid();

export const availabilityService = {
  async list(professionalId) {
    const id = professionalIdSchema.parse(professionalId);
    await professionalService.getActiveOrThrow(id);
    return availabilityRepository.list(id);
  },
  async update(professionalId, items) {
    const id = professionalIdSchema.parse(professionalId);
    await professionalService.getActiveOrThrow(id);
    const parsed = z.array(availabilityItemSchema).min(1).parse(items);
    parsed.forEach((item) => {
      if (minutesFromTime(item.startTime) >= minutesFromTime(item.endTime)) {
        throw new AppError("Horario inicial deve ser menor que o final.", 400);
      }
    });
    return availabilityRepository.replaceMany(id, parsed);
  },
  async getAvailableSlots(dateString, serviceIds, professionalId) {
    const id = professionalIdSchema.parse(professionalId);
    await professionalService.getActiveOrThrow(id);

    const date = dateOnly(dateString);
    if (!date) throw new AppError("Data invalida.", 400);
    if (!serviceIds?.length) throw new AppError("Selecione ao menos um servico.", 400);

    // Consultas independentes em paralelo (hot path do agendamento).
    const [services, availability] = await Promise.all([
      serviceRepository.findManyByIds(serviceIds, barberRepository.defaultId),
      availabilityRepository.findByDay(id, date.getDay())
    ]);
    if (services.length !== serviceIds.length) throw new AppError("Servico indisponivel.", 400);

    const totalMinutes = services.reduce((sum, service) => sum + service.estimatedMinutes, 0);
    // Dia fechado: evita consultas desnecessarias de agenda/bloqueios.
    if (!availability?.active) return [];

    const dayStart = dateOnly(dateString);
    const [appointments, blocks] = await Promise.all([
      appointmentRepository.listBlockingByDate(id, dayStart),
      blockRepository.listByDate(id, dayStart)
    ]);

    return computeAvailableSlots({
      dateString,
      openTime: availability.startTime,
      closeTime: availability.endTime,
      totalMinutes,
      slotInterval: env.slotIntervalMinutes,
      appointments,
      blocks,
      minimumNoticeMinutes: env.minimumBookingNoticeMinutes
    });
  }
};
