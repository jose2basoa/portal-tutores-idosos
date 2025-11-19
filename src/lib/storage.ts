// ============================================
// STORAGE - Gerenciamento de dados locais
// Simula banco de dados usando localStorage
// ============================================

import { Tutor, Idoso, Evento, AuthUser } from './types'

/**
 * Salva tutor no localStorage
 */
export function saveTutor(tutor: Tutor): void {
  localStorage.setItem(`tutor_${tutor.id}`, JSON.stringify(tutor))
  localStorage.setItem('tutor_data', JSON.stringify(tutor))
}

/**
 * Carrega tutor do localStorage
 */
export function loadTutor(tutorId: string): Tutor | null {
  const data = localStorage.getItem(`tutor_${tutorId}`)
  return data ? JSON.parse(data) : null
}

/**
 * Salva idoso no localStorage
 */
export function saveIdoso(idoso: Idoso): void {
  localStorage.setItem(`idoso_${idoso.id}`, JSON.stringify(idoso))
  localStorage.setItem('idoso_data', JSON.stringify(idoso))
  
  // Mantém lista de idosos por tutor
  const idososList = loadIdososByTutor(idoso.tutorId)
  const exists = idososList.find(i => i.id === idoso.id)
  if (!exists) {
    idososList.push(idoso)
    localStorage.setItem(`idosos_tutor_${idoso.tutorId}`, JSON.stringify(idososList))
  }
}

/**
 * Carrega idoso do localStorage
 */
export function loadIdoso(idosoId: string): Idoso | null {
  const data = localStorage.getItem(`idoso_${idosoId}`)
  return data ? JSON.parse(data) : null
}

/**
 * Carrega todos os idosos de um tutor
 */
export function loadIdososByTutor(tutorId: string): Idoso[] {
  const data = localStorage.getItem(`idosos_tutor_${tutorId}`)
  return data ? JSON.parse(data) : []
}

/**
 * Salva evento no localStorage
 */
export function saveEvento(evento: Evento): void {
  // Salva evento individual
  localStorage.setItem(`evento_${evento.id}`, JSON.stringify(evento))
  
  // Adiciona à lista de eventos do tutor
  const eventos = loadEventosByTutor(evento.tutorId)
  eventos.unshift(evento) // Adiciona no início
  
  // Mantém apenas os últimos 100 eventos
  const eventosLimitados = eventos.slice(0, 100)
  localStorage.setItem(`eventos_tutor_${evento.tutorId}`, JSON.stringify(eventosLimitados))
}

/**
 * Carrega eventos de um tutor
 */
export function loadEventosByTutor(tutorId: string): Evento[] {
  const data = localStorage.getItem(`eventos_tutor_${tutorId}`)
  return data ? JSON.parse(data) : []
}

/**
 * Marca evento como lido
 */
export function markEventoAsRead(eventoId: string, tutorId: string): void {
  const evento = localStorage.getItem(`evento_${eventoId}`)
  if (evento) {
    const eventoData = JSON.parse(evento)
    eventoData.lido = true
    localStorage.setItem(`evento_${eventoId}`, JSON.stringify(eventoData))
    
    // Atualiza na lista também
    const eventos = loadEventosByTutor(tutorId)
    const index = eventos.findIndex(e => e.id === eventoId)
    if (index !== -1) {
      eventos[index].lido = true
      localStorage.setItem(`eventos_tutor_${tutorId}`, JSON.stringify(eventos))
    }
  }
}

/**
 * Gera ID único
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Salva credenciais de usuário
 */
export function saveUserCredentials(email: string, senha: string, userId: string): void {
  const credentials = {
    email,
    senha, // Em produção, NUNCA salvar senha em texto plano!
    userId
  }
  localStorage.setItem(`credentials_${email}`, JSON.stringify(credentials))
}

/**
 * Verifica credenciais de login
 */
export function checkCredentials(email: string, senha: string): string | null {
  const data = localStorage.getItem(`credentials_${email}`)
  if (!data) return null
  
  const credentials = JSON.parse(data)
  if (credentials.senha === senha) {
    return credentials.userId
  }
  
  return null
}
