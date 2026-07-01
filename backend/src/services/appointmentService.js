import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { appointmentRepository } from "../repositories/appointmentRepository.js";
import { availabilityRepository } from "../repositories/availabilityRepository.js";
import { barberRepository } from "../repositories/barberRepository.js";
import { blockRepository } from "../repositories/blockRepository.js";
import { serviceRepository } from "../repositories/serviceRepository.js";
import { AppError } from "../utils/AppError.js";
import { addMinutes, combineDateTime, dateOnly, minutesFromTime, rangesOverlap } from "../utils/time.js";
import { logger } from "../utils/logger.js";

const createSchema = z.object({
  clientName: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  serviceIds: z.array(z.string().uuid()).min(1)
});

export const appointmentService = {
  list() {
    return appointmentRepository.list(barberRepository.defaultId);
  },
  async create(input) {
    const data = createSchema.parse(input);
    const barberId = barberRepository.defaultId;
    const services = await serviceRepository.findManyByIds(data.serviceIds, barberId);
    if (services.length !== data.serviceIds.length) throw new AppError("Servico indisponivel.", 400);

    const totalMinutes = services.reduce((sum, service) => sum + service.estimatedMinutes, 0);
    const totalPriceCents = services.reduce((sum, service) => sum + service.priceCents, 0);
    const startAt = combineDateTime(data.date, data.time);
    const endAt = addMinutes(startAt, totalMinutes);
    const day = dateOnly(data.date);
    const availability = await availabilityRepository.findByDay(barberId, day.getDay());

    if (!availability?.active) throw new AppError("Dia indisponivel.", 409);
    const startMinutes = minutesFromTime(data.time);
    if (startMinutes < minutesFromTime(availability.startTime) || startMinutes + totalMinutes > minutesFromTime(availability.endTime)) {
      throw new AppError("Horario fora da disponibilidade.", 409);
    }

    const blocks = await blockRepository.listByDate(barberId, day);
    const hasBlock = blocks.some((block) => {
      if (!block.startTime || !block.endTime) return true;
      return rangesOverlap(startMinutes, startMinutes + totalMinutes, minutesFromTime(block.startTime), minutesFromTime(block.endTime));
    });
    if (hasBlock) throw new AppError("Horario bloqueado.", 409);

    return prisma.$transaction(async (tx) => {
      const conflicts = await tx.appointment.findMany({
        where: {
          barberId,
          status: { in: ["PENDENTE", "CONFIRMADO"] },
          startAt: { lt: endAt },
          endAt: { gt: startAt }
        },
        select: { id: true }
      });
      if (conflicts.length) throw new AppError("Horario ja ocupado.", 409);

      const client = await tx.client.create({ data: { name: data.clientName, phone: data.phone || null } });
      const appointment = await tx.appointment.create({
        data: {
          barberId,
          clientId: client.id,
          startAt,
          endAt,
          totalMinutes,
          totalPriceCents,
          appointmentServices: {
            create: services.map((service) => ({
              serviceId: service.id,
              priceCents: service.priceCents,
              minutes: service.estimatedMinutes
            }))
          }
        },
        include: { client: true, appointmentServices: { include: { service: true } }, barber: true }
      });
      logger.info("appointment_created", { appointmentId: appointment.id, client: client.name });
      return appointment;
    });
  },
  async updateStatus(id, status) {
    const parsed = z.enum(["PENDENTE", "CONFIRMADO", "CONCLUIDO", "CANCELADO"]).parse(status);
    const appointment = await appointmentRepository.updateStatus(id, barberRepository.defaultId, parsed);
    if (!appointment) throw new AppError("Agendamento nao encontrado.", 404);
    logger.info("appointment_status_changed", { appointmentId: id, status: parsed });
    return appointment;
  }
};
