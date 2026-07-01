import { z } from "zod";
import { availabilityRepository } from "../repositories/availabilityRepository.js";
import { barberRepository } from "../repositories/barberRepository.js";
import { blockRepository } from "../repositories/blockRepository.js";
import { appointmentRepository } from "../repositories/appointmentRepository.js";
import { serviceRepository } from "../repositories/serviceRepository.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { addMinutes, combineDateTime, dateOnly, minutesFromTime, rangesOverlap, timeFromMinutes } from "../utils/time.js";

const availabilityItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  active: z.boolean()
});

export const availabilityService = {
  list() {
    return availabilityRepository.list(barberRepository.defaultId);
  },
  async update(items) {
    const parsed = z.array(availabilityItemSchema).min(1).parse(items);
    parsed.forEach((item) => {
      if (minutesFromTime(item.startTime) >= minutesFromTime(item.endTime)) {
        throw new AppError("Horario inicial deve ser menor que o final.", 400);
      }
    });
    return availabilityRepository.replaceMany(barberRepository.defaultId, parsed);
  },
  async getAvailableSlots(dateString, serviceIds) {
    const date = dateOnly(dateString);
    if (!date) throw new AppError("Data invalida.", 400);
    if (!serviceIds?.length) throw new AppError("Selecione ao menos um servico.", 400);

    const services = await serviceRepository.findManyByIds(serviceIds, barberRepository.defaultId);
    if (services.length !== serviceIds.length) throw new AppError("Servico indisponivel.", 400);

    const totalMinutes = services.reduce((sum, service) => sum + service.estimatedMinutes, 0);
    const availability = await availabilityRepository.findByDay(barberRepository.defaultId, date.getDay());
    if (!availability?.active) return [];

    const dayStart = dateOnly(dateString);
    const appointments = await appointmentRepository.listBlockingByDate(barberRepository.defaultId, dayStart);
    const blocks = await blockRepository.listByDate(barberRepository.defaultId, dayStart);

    const open = minutesFromTime(availability.startTime);
    const close = minutesFromTime(availability.endTime);
    const slotInterval = Number.isFinite(env.slotIntervalMinutes) && env.slotIntervalMinutes > 0 ? env.slotIntervalMinutes : 45;
    const slots = [];

    for (let cursor = open; cursor + totalMinutes <= close; cursor += slotInterval) {
      const start = combineDateTime(dateString, timeFromMinutes(cursor));
      const end = addMinutes(start, totalMinutes);
      const hasAppointmentConflict = appointments.some((item) => rangesOverlap(start, end, item.startAt, item.endAt));
      const hasBlockConflict = blocks.some((block) => {
        if (!block.startTime || !block.endTime) return true;
        return rangesOverlap(cursor, cursor + totalMinutes, minutesFromTime(block.startTime), minutesFromTime(block.endTime));
      });
      if (!hasAppointmentConflict && !hasBlockConflict) slots.push(timeFromMinutes(cursor));
    }

    return slots;
  }
};
