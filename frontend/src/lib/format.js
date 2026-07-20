export const money = (cents = 0) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const today = () => new Date().toISOString().slice(0, 10);

export const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export function formatDateLabel(date) {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}
