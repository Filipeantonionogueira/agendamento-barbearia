import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { appointmentRepository } from "../repositories/appointmentRepository.js";
import { availabilityRepository } from "../repositories/availabilityRepository.js";
import { barberRepository } from "../repositories/barberRepository.js";
import { blockRepository } from "../repositories/blockRepository.js";
import { serviceRepository } from "../repositories/serviceRepository.js";
import { professionalService } from "./professionalService.js";
import { notificationService } from "./notificationService.js";
import { waitlistService } from "./waitlistService.js";
import { emailService, emailTemplates } from "./emailService.js";
import { AppError } from "../utils/AppError.js";
import { addMinutes, combineDateTime, dateOnly, minutesFromTime, rangesOverlap } from "../utils/time.js";
import { logger } from "../utils/logger.js";

const createSchema = z.object({
  clientName: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  serviceIds: z.array(z.string().uuid()).min(1),
  professionalId: z.string().uuid(),
  notes: z.string().trim().max(500).optional().nullable()
});

const cancelSchema = z.object({ reason: z.string().trim().max(300).optional().nullable() });

const rescheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  professionalId: z.string().uuid().optional()
});

/**
 * Valida se um horario pode ser reservado: nao esta no passado, cabe na
 * disponibilidade do profissional e nao colide com bloqueios.
 * Compartilhado por criacao e remarcacao (evita regra duplicada).
 */
async function assertSlotIsBookable({ professionalId, dateString, time, totalMinutes }) {
  const startAt = combineDateTime(dateString, time);
  const day = dateOnly(dateString);

  const earliestStart = addMinutes(new Date(), env.minimumBookingNoticeMinutes);
  if (startAt <= earliestStart) {
    throw new AppError("Escolha um horario futuro com a antecedencia minima.", 409);
  }

  const availability = await availabilityRepository.findByDay(professionalId, day.getDay());
  if (!availability?.active) throw new AppError("Dia indisponivel.", 409);

  const startMinutes = minutesFromTime(time);
  if (
    startMinutes < minutesFromTime(availability.startTime) ||
    startMinutes + totalMinutes > minutesFromTime(availability.endTime)
  ) {
    throw new AppError("Horario fora da disponibilidade.", 409);
  }

  const blocks = await blockRepository.listByDate(professionalId, day);
  const hasBlock = blocks.some((block) => {
    if (!block.startTime || !block.endTime) return true;
    return rangesOverlap(startMinutes, startMinutes + totalMinutes, minutesFromTime(block.startTime), minutesFromTime(block.endTime));
  });
  if (hasBlock) throw new AppError("Horario bloqueado.", 409);

  return { startAt, endAt: addMinutes(startAt, totalMinutes) };
}

export const appointmentService = {
  list() {
    return appointmentRepository.list(barberRepository.defaultId);
  },
  listMine(userId) {
    return appointmentRepository.listByUser(userId);
  },
  async create(input, authUser = null) {
    const data = createSchema.parse(input);
    const barberId = barberRepository.defaultId;
    const professional = await professionalService.getActiveOrThrow(data.professionalId);
    const services = await serviceRepository.findManyByIds(data.serviceIds, barberId);
    if (services.length !== data.serviceIds.length) throw new AppError("Servico indisponivel.", 400);

    const totalMinutes = services.reduce((sum, service) => sum + service.estimatedMinutes, 0);
    const totalPriceCents = services.reduce((sum, service) => sum + service.priceCents, 0);

    const { startAt, endAt } = await assertSlotIsBookable({
      professionalId: professional.id,
      dateString: data.date,
      time: data.time,
      totalMinutes
    });

    const created = await prisma.$transaction(async (tx) => {
      const conflicts = await tx.appointment.findMany({
        where: {
          professionalId: professional.id,
          status: { in: ["PENDENTE", "CONFIRMADO"] },
          startAt: { lt: endAt },
          endAt: { gt: startAt }
        },
        select: { id: true }
      });
      if (conflicts.length) throw new AppError("Horario ja ocupado.", 409);

      // Agendamento hibrido: cliente logado reaproveita seu proprio registro Client.
      let client;
      if (authUser?.sub) {
        client = await tx.client.findUnique({ where: { userId: authUser.sub } });
        if (client) {
          client = await tx.client.update({
            where: { id: client.id },
            data: { name: data.clientName || client.name, phone: data.phone || client.phone }
          });
        } else {
          client = await tx.client.create({ data: { name: data.clientName, phone: data.phone || null, userId: authUser.sub } });
        }
      } else {
        client = await tx.client.create({ data: { name: data.clientName, phone: data.phone || null } });
      }
      const appointment = await tx.appointment.create({
        data: {
          barberId,
          professionalId: professional.id,
          clientId: client.id,
          startAt,
          endAt,
          totalMinutes,
          totalPriceCents,
          notes: data.notes || null,
          appointmentServices: {
            create: services.map((service) => ({
              serviceId: service.id,
              priceCents: service.priceCents,
              minutes: service.estimatedMinutes
            }))
          }
        },
        include: { client: true, professional: true, appointmentServices: { include: { service: true } }, barber: true }
      });

      logger.info("appointment_created", { appointmentId: appointment.id, client: client.name });
      return appointment;
    });

    // Eventos automaticos (fora da transacao): notificacao in-app + e-mail (stub).
    if (authUser?.sub) {
      const serviceNames = created.appointmentServices.map((item) => item.service.name).join(" + ");
      const when = new Date(created.startAt).toLocaleString("pt-BR");
      await notificationService.notify(authUser.sub, {
        category: "AGENDAMENTO",
        title: "Solicitacao de agendamento recebida",
        body: `${serviceNames} com ${created.professional.name} em ${when}. Aguardando confirmacao da barbearia.`,
        link: "/conta/historico"
      });
      if (authUser.email) {
        await emailService
          .send(authUser.email, emailTemplates.appointmentConfirmed({ name: created.client.name, serviceNames, professionalName: created.professional.name, when }))
          .catch(() => {});
      }
    }
    return created;
  },
  async cancelMine(userId, id, input) {
    const { reason } = cancelSchema.parse(input || {});
    const appointment = await prisma.appointment.findUnique({ where: { id }, include: { client: true } });
    if (!appointment || appointment.client?.userId !== userId) throw new AppError("Agendamento nao encontrado.", 404);
    if (["CANCELADO", "CONCLUIDO"].includes(appointment.status)) {
      throw new AppError("Este agendamento nao pode ser cancelado.", 409);
    }
    if (new Date(appointment.startAt) <= new Date()) {
      throw new AppError("Nao e possivel cancelar um horario que ja passou.", 409);
    }
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELADO", cancelReason: reason || null, canceledAt: new Date() },
      include: { professional: true, appointmentServices: { include: { service: true } } }
    });
    logger.info("appointment_canceled_by_client", { appointmentId: id, userId });

    const serviceNames = updated.appointmentServices.map((item) => item.service.name).join(" + ");
    await notificationService.notify(userId, {
      category: "CANCELAMENTO",
      title: "Agendamento cancelado",
      body: `Seu horario de ${serviceNames} foi cancelado.`,
      link: "/conta/historico"
    });
    // Horario liberado: avisa a lista de espera daquele profissional/dia.
    await waitlistService.notifyFreedSlot(updated.professionalId, updated.startAt).catch(() => {});
    return updated;
  },
  // Remarcacao pelo staff: move o atendimento para outro horario/profissional.
  async rescheduleByStaff(id, input) {
    const data = rescheduleSchema.parse(input);
    const existing = await prisma.appointment.findFirst({
      where: { id, barberId: barberRepository.defaultId },
      include: { client: true, appointmentServices: true }
    });
    if (!existing) throw new AppError("Agendamento nao encontrado.", 404);
    if (["CANCELADO", "CONCLUIDO"].includes(existing.status)) {
      throw new AppError("Este agendamento nao pode ser remarcado.", 409);
    }

    const professionalId = data.professionalId || existing.professionalId;
    const professional = await professionalService.getActiveOrThrow(professionalId);
    const totalMinutes = existing.totalMinutes;

    const { startAt, endAt } = await assertSlotIsBookable({
      professionalId: professional.id,
      dateString: data.date,
      time: data.time,
      totalMinutes
    });

    const updated = await prisma.$transaction(async (tx) => {
      // O proprio agendamento nao conta como conflito consigo mesmo.
      const conflicts = await tx.appointment.findMany({
        where: {
          id: { not: id },
          professionalId: professional.id,
          status: { in: ["PENDENTE", "CONFIRMADO"] },
          startAt: { lt: endAt },
          endAt: { gt: startAt }
        },
        select: { id: true }
      });
      if (conflicts.length) throw new AppError("Horario ja ocupado.", 409);

      return tx.appointment.update({
        where: { id },
        data: { startAt, endAt, professionalId: professional.id },
        include: { client: true, professional: true, appointmentServices: { include: { service: true } } }
      });
    });

    // Avisa o cliente (se tiver conta) e libera a lista de espera do horario antigo.
    if (existing.client?.userId) {
      await notificationService.notify(existing.client.userId, {
        category: "AGENDAMENTO",
        title: "Seu horario foi remarcado",
        body: `Novo horario: ${startAt.toLocaleString("pt-BR")} com ${professional.name}.`,
        link: "/conta/historico"
      });
    }
    await waitlistService.notifyFreedSlot(existing.professionalId, existing.startAt).catch(() => {});

    logger.info("appointment_rescheduled_by_staff", { appointmentId: id });
    return updated;
  },
  async updateStatus(id, status) {
    const parsed = z.enum(["PENDENTE", "CONFIRMADO", "CONCLUIDO", "CANCELADO"]).parse(status);
    const appointment = await appointmentRepository.updateStatus(id, barberRepository.defaultId, parsed);
    if (!appointment) throw new AppError("Agendamento nao encontrado.", 404);
    logger.info("appointment_status_changed", { appointmentId: id, status: parsed });
    await this.emitStatusEvents(appointment, parsed).catch(() => {});
    return appointment;
  },
  // Eventos automaticos por mudanca de status (notificacao/e-mail/lista de espera).
  async emitStatusEvents(appointment, status) {
    const userId = appointment.client?.userId;
    const serviceNames = (appointment.appointmentServices || []).map((item) => item.service.name).join(" + ");
    if (status === "CONCLUIDO") {
      if (userId) {
        await notificationService.notify(userId, {
          category: "AVALIACAO",
          title: "Avalie seu atendimento",
          body: `Conte como foi seu atendimento de ${serviceNames}.`,
          link: "/conta/historico"
        });
      }
    }
    if (status === "CONFIRMADO" && userId) {
      await notificationService.notify(userId, {
        category: "AGENDAMENTO",
        title: "Agendamento confirmado",
        body: `Seu horario de ${serviceNames} foi confirmado pela barbearia.`,
        link: "/conta/historico"
      });
    }
    if (status === "CANCELADO") {
      if (userId) {
        await notificationService.notify(userId, {
          category: "CANCELAMENTO",
          title: "Agendamento cancelado",
          body: `Seu horario de ${serviceNames} foi cancelado.`,
          link: "/conta/historico"
        });
      }
      await waitlistService.notifyFreedSlot(appointment.professionalId, appointment.startAt).catch(() => {});
    }
  }
};
