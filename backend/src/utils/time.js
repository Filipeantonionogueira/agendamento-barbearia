export function minutesFromTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function timeFromMinutes(total) {
  const hours = String(Math.floor(total / 60)).padStart(2, "0");
  const minutes = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function dateOnly(dateString) {
  const date = new Date(`${dateString}T00:00:00.000`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function combineDateTime(dateString, time) {
  return new Date(`${dateString}T${time}:00.000`);
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}
