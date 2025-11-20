import { Idoso, Evento, User } from "./types";

// ----------------------------
// IDOSOS
// ----------------------------
export async function saveIdoso(idoso: Idoso) {
  localStorage.setItem(`idoso_${idoso.id}`, JSON.stringify(idoso));
}

export async function loadIdoso(id: string): Promise<Idoso | null> {
  const data = localStorage.getItem(`idoso_${id}`);
  return data ? JSON.parse(data) : null;
}

export async function loadIdososByTutor(tutorId: string): Promise<Idoso[]> {
  const keys = Object.keys(localStorage);
  const idosos: Idoso[] = [];
  for (const key of keys) {
    if (key.startsWith("idoso_")) {
      const obj = JSON.parse(localStorage.getItem(key) as string);
      if (obj.tutorId === tutorId) idosos.push(obj);
    }
  }
  return idosos;
}

// ----------------------------
// IDs
// ----------------------------
export async function generateId(): Promise<string> {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2, 12);
}

// ----------------------------
// Eventos
// ----------------------------
export async function saveEvento(evento: Evento) {
  const eventos = JSON.parse(localStorage.getItem("eventos") || "[]");
  eventos.push(evento);
  localStorage.setItem("eventos", JSON.stringify(eventos));
}

export async function loadEventosByTutor(tutorId: string): Promise<Evento[]> {
  const eventos = JSON.parse(localStorage.getItem("eventos") || "[]");
  return eventos.filter((e: Evento) => e.tutorId === tutorId);
}

export async function markEventoAsRead(eventoId: string) {
  const eventos = JSON.parse(localStorage.getItem("eventos") || "[]");
  const evento = eventos.find((e: Evento) => e.id === eventoId);
  if (evento) evento.lido = true;
  localStorage.setItem("eventos", JSON.stringify(eventos));
}

// ----------------------------
// Usuários / Login
// ----------------------------
export async function saveUserCredentials(user: User) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
}
