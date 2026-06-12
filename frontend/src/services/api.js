const API_BASE = window.location.origin.includes("5173")
  ? ""
  : window.location.origin.includes("3000")
    ? window.location.origin
    : "http://localhost:3000";

async function parseJsonResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }
  return data;
}

export function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (data && typeof data === "object") return Object.values(data);
  return [];
}

export async function getAttendance() {
  const response = await fetch(`${API_BASE}/api/registro/registro`);
  return normalizeList(await parseJsonResponse(response));
}

export async function getUsers() {
  const response = await fetch(`${API_BASE}/api/usuarios`);
  return normalizeList(await parseJsonResponse(response));
}

export async function startRecognition() {
  const response = await fetch(`${API_BASE}/api/reconocimiento/iniciar-reconocimiento`);
  return parseJsonResponse(response);
}

export async function stopRecognition() {
  const response = await fetch(`${API_BASE}/api/reconocimiento/detener-reconocimiento`);
  return parseJsonResponse(response);
}

export async function createUser(formData) {
  const response = await fetch(`${API_BASE}/api/usuarios/crear-usuario`, {
    method: "POST",
    body: formData,
  });
  return parseJsonResponse(response);
}

export async function deleteUser(userId) {
  const response = await fetch(`${API_BASE}/api/usuarios/${userId}`, {
    method: "DELETE",
  });
  return parseJsonResponse(response);
}

export async function createReport() {
  const response = await fetch(`${API_BASE}/api/registro/reporte`);
  const data = await parseJsonResponse(response);
  if (!data.success) {
    throw new Error(data.message || "No se pudo generar el reporte");
  }
  return data;
}

export function getRecognitionStreamUrl() {
  return `${API_BASE}/api/reconocimiento/stream`;
}

export function getDocsUrl() {
  return `${API_BASE}/api/docs`;
}
