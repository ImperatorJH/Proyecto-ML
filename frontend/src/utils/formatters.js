export function getRecordTime(record) {
  const date = String(record.fecha ?? "").slice(0, 10);
  const time = String(record.hora ?? "00:00:00").slice(0, 8);
  const timestamp = Date.parse(`${date}T${time}`);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function sortRecentFirst(records) {
  return [...records].sort((a, b) => {
    const dateDiff = getRecordTime(b) - getRecordTime(a);
    if (dateDiff !== 0) return dateDiff;
    return Number(b.id ?? 0) - Number(a.id ?? 0);
  });
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTime(value) {
  if (!value) return "-";
  return String(value).slice(0, 8);
}

export function getInitial(user) {
  return String(user.nombre ?? "?").trim().charAt(0).toUpperCase() || "?";
}
