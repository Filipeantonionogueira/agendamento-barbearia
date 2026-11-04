// Helpers compartilhados de agendamento — evitam duplicacao entre paginas e modais.

/** Nomes dos servicos de um agendamento, ex.: "Corte de cabelo + Barba". */
export function serviceNames(appointment) {
  return (appointment?.appointmentServices || []).map((item) => item.service.name).join(" + ");
}

/** Variante visual do Badge para cada status de agendamento. */
export const STATUS_VARIANT = {
  PENDENTE: "warning",
  CONFIRMADO: "info",
  CONCLUIDO: "success",
  CANCELADO: "danger"
};

/** Rotulos exibidos na interface para os status de agendamento. */
export const STATUS_LABEL = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Agendado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado"
};
