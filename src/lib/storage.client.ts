// storage.client.ts
import { Tutor } from "./types";

export function saveTutor(tutor: Tutor): void {
  localStorage.setItem(`tutor_${tutor.id}`, JSON.stringify(tutor));
  localStorage.setItem("tutor_data", JSON.stringify(tutor));
}

export function loadTutor(id: string) {
  const data = localStorage.getItem(`tutor_${id}`);
  return data ? JSON.parse(data) : null;
}

export function saveUserCredentials(email: string, senha: string, userId: string) {
  localStorage.setItem(`credentials_${email}`, JSON.stringify({ email, senha, userId }));
}

export function checkCredentials(email: string, senha: string): string | null {
  const data = localStorage.getItem(`credentials_${email}`);
  if (!data) return null;
  const cred = JSON.parse(data);
  return cred.senha === senha ? cred.userId : null;
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
