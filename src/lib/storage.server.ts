// storage.server.ts
import fs from 'fs';
import path from 'path';
import { Tutor, Idoso, Evento } from './types';

const DB_PATH = path.join(process.cwd(), "data.json");

function loadDB(): any {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDB(data: any): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function saveTutor(tutor: Tutor) {
  const db = loadDB();
  db.tutors = db.tutors || {};
  db.tutors[tutor.id] = tutor;
  saveDB(db);
}

export function loadTutor(id: string): Tutor | null {
  const db = loadDB();
  return db.tutors?.[id] || null;
}

export function saveUserCredentials(email: string, senha: string, userId: string) {
  const db = loadDB();
  db.credentials = db.credentials || {};
  db.credentials[email] = { email, senha, userId };
  saveDB(db);
}

export function checkCredentials(email: string, senha: string): string | null {
  const db = loadDB();
  const cred = db.credentials?.[email];
  if (!cred) return null;
  return cred.senha === senha ? cred.userId : null;
}
