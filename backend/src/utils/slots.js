import { addMinutes, combineDateTime, minutesFromTime, rangesOverlap, timeFromMinutes } from "./time.js";

/**
 * Calcula os horarios livres de um dia. Funcao pura: nao acessa banco.
 * Separada do service para permitir teste isolado da regra de negocio.
 *
 * @param {object} params
 * @param {string} params.dateString  data no formato YYYY-MM-DD
 * @param {string} params.openTime    abertura "HH:MM"
 * @param {string} params.closeTime   fechamento "HH:MM"
 * @param {number} params.totalMinutes duracao total dos servicos escolhidos
 * @param {number} params.slotInterval intervalo entre inicios de atendimento
 * @param {Array<{startAt: Date, endAt: Date}>} params.appointments agendamentos que bloqueiam
 * @param {Array<{startTime: string|null, endTime: string|null}>} params.blocks bloqueios manuais
 * @param {Date} [params.now] momento atual (injetavel para teste)
 * @param {number} [params.minimumNoticeMinutes] antecedencia minima para agendar
 * @returns {string[]} horarios livres ("HH:MM")
 */
export function computeAvailableSlots({
  dateString,
  openTime,
  closeTime,
  totalMinutes,
  slotInterval,
  appointments = [],
  blocks = [],
  now = new Date(),
  minimumNoticeMinutes = 0
}) {
  const open = minutesFromTime(openTime);
  const close = minutesFromTime(closeTime);
  const interval = Number.isFinite(slotInterval) && slotInterval > 0 ? slotInterval : 45;
  // Nao se agenda no passado: o horario precisa comecar depois de agora + antecedencia minima.
  const earliestStart = addMinutes(now, minimumNoticeMinutes);
  const slots = [];

  for (let cursor = open; cursor + totalMinutes <= close; cursor += interval) {
    const start = combineDateTime(dateString, timeFromMinutes(cursor));
    const end = addMinutes(start, totalMinutes);

    if (start <= earliestStart) continue;

    const hasAppointmentConflict = appointments.some((item) => rangesOverlap(start, end, item.startAt, item.endAt));
    const hasBlockConflict = blocks.some((block) => {
      // Bloqueio sem horario = dia inteiro.
      if (!block.startTime || !block.endTime) return true;
      return rangesOverlap(cursor, cursor + totalMinutes, minutesFromTime(block.startTime), minutesFromTime(block.endTime));
    });

    if (!hasAppointmentConflict && !hasBlockConflict) slots.push(timeFromMinutes(cursor));
  }

  return slots;
}
