"use server";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// ----------------------------
// Paths e DB
// ----------------------------
const DB_PATH = path.join(process.cwd(), "data.json");

interface DB {
  idosos: Idoso[];
  eventos: Evento[];
  users: User[];
  tutores: Tutor[];
}

// ----------------------------
// Tipos
// ----------------------------
export interface Idoso {
  id: string;
  nome: string;
  tutorId: string;
  [key: string]: any;
}

export interface Evento {
  id: string;
  tutorId: string;
  titulo: string;
  descricao?: string;
  lido?: boolean;
  [key: string]: any;
}

export interface User {
  id: string;
  email: string;
  password: string;
  [key: string]: any;
}

export interface Tutor {
  id: string;
  userId: string; // relacionamento com User
  nome: string;
  [key: string]: any;
}

// ----------------------------
// Helpers
// ----------------------------
function normalizeDB(db: Partial<DB>): DB {
  return {
    idosos: db.idosos || [],
    eventos: db.eventos || [],
    users: db.users || [],
    tutores: db.tutores || []
  };
}

async function loadDB(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return normalizeDB(JSON.parse(raw));
  } catch {
    return normalizeDB({});
  }
}

async function saveDB(db: DB) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

// ----------------------------
// IDs
// ----------------------------
export async function generateId(): Promise<string> {
  return randomUUID();
}

// ----------------------------
// IDOSOS
// ----------------------------
export async function saveIdoso(idoso: Idoso) {
  const db = await loadDB();
  db.idosos.push(idoso);
  await saveDB(db);
}

export async function loadIdoso(id: string): Promise<Idoso | null> {
  const db = await loadDB();
  return db.idosos.find(i => i.id === id) || null;
}

export async function loadIdososByTutor(tutorId: string): Promise<Idoso[]> {
  const db = await loadDB();
  return db.idosos.filter(i => i.tutorId === tutorId);
}

// ----------------------------
// Eventos
// ----------------------------
export async function saveEvento(evento: Evento) {
  const db = await loadDB();
  db.eventos.push(evento);
  await saveDB(db);
}

export async function loadEventosByTutor(tutorId: string): Promise<Evento[]> {
  const db = await loadDB();
  return db.eventos.filter(e => e.tutorId === tutorId);
}

export async function markEventoAsRead(eventoId: string) {
  const db = await loadDB();
  const evento = db.eventos.find(e => e.id === eventoId);
  if (evento) evento.lido = true;
  await saveDB(db);
}

// ----------------------------
// Usuários / Login
// ----------------------------
export async function saveUserCredentials(user: User) {
  const db = await loadDB();
  db.users.push(user);
  await saveDB(db);
}

export async function checkCredentials(email: string, password: string): Promise<User | null> {
  const db = await loadDB();
  return db.users.find(u => u.email === email && u.password === password) || null;
}

// ----------------------------
// Tutores
// ----------------------------
export async function saveTutor(tutor: Tutor) {
  const db = await loadDB();
  db.tutores.push(tutor);
  await saveDB(db);
}

export async function loadTutor(userId: string) {
  const db = await loadDB();
  return db.tutores.find(t => t.userId === userId) || null;
}
