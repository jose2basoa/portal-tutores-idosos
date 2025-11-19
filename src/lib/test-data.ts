// ============================================
// UTILITÁRIO: Gerador de Eventos de Teste
// Para testar a funcionalidade de eventos
// ============================================

import { Evento, TipoEvento, SeveridadeEvento } from './types'
import { generateId } from './storage'

/**
 * Gera eventos de teste para demonstração
 */
export function gerarEventosTeste(tutorId: string, idosoId: string): Evento[] {
  const agora = new Date()
  
  const eventos: Evento[] = [
    {
      id: generateId(),
      tutorId,
      idosoId,
      tipo: 'resposta',
      severidade: 'baixa',
      titulo: 'Idoso respondeu pergunta',
      descricao: 'Respondeu que está se sentindo bem',
      dados: {
        resposta: 'Estou me sentindo bem, obrigado!',
        bateria: 85
      },
      datetime: new Date(agora.getTime() - 30 * 60000).toISOString(), // 30 min atrás
      lido: false
    },
    {
      id: generateId(),
      tutorId,
      idosoId,
      tipo: 'medicacao',
      severidade: 'media',
      titulo: 'Lembrete de medicação',
      descricao: 'Hora de tomar Losartana 50mg',
      dados: {
        bateria: 85
      },
      datetime: new Date(agora.getTime() - 2 * 3600000).toISOString(), // 2h atrás
      lido: false
    },
    {
      id: generateId(),
      tutorId,
      idosoId,
      tipo: 'agua',
      severidade: 'baixa',
      titulo: 'Consumo de água registrado',
      descricao: 'Idoso bebeu água',
      dados: {
        consumoAgua: 250,
        bateria: 82
      },
      datetime: new Date(agora.getTime() - 4 * 3600000).toISOString(), // 4h atrás
      lido: true
    },
    {
      id: generateId(),
      tutorId,
      idosoId,
      tipo: 'bateria_baixa',
      severidade: 'alta',
      titulo: 'Bateria do celular baixa',
      descricao: 'Bateria em 15% - recarregar urgente',
      dados: {
        bateria: 15
      },
      datetime: new Date(agora.getTime() - 5 * 3600000).toISOString(), // 5h atrás
      lido: false
    },
    {
      id: generateId(),
      tutorId,
      idosoId,
      tipo: 'localizacao',
      severidade: 'baixa',
      titulo: 'Localização atualizada',
      descricao: 'Nova localização registrada',
      dados: {
        localizacao: {
          latitude: -23.550520,
          longitude: -46.633308,
          precisao: 10
        },
        bateria: 78
      },
      datetime: new Date(agora.getTime() - 6 * 3600000).toISOString(), // 6h atrás
      lido: true
    },
    {
      id: generateId(),
      tutorId,
      idosoId,
      tipo: 'falta_resposta',
      severidade: 'alta',
      titulo: 'Idoso não respondeu',
      descricao: 'Não houve resposta às perguntas do dia',
      dados: {
        bateria: 75
      },
      datetime: new Date(agora.getTime() - 24 * 3600000).toISOString(), // 1 dia atrás
      lido: true
    },
    {
      id: generateId(),
      tutorId,
      idosoId,
      tipo: 'sintoma',
      severidade: 'media',
      titulo: 'Sintoma relatado',
      descricao: 'Idoso relatou dor de cabeça leve',
      dados: {
        sintomas: ['dor de cabeça'],
        bateria: 70
      },
      datetime: new Date(agora.getTime() - 36 * 3600000).toISOString(), // 1.5 dias atrás
      lido: true
    }
  ]

  return eventos
}

/**
 * Salva eventos de teste no localStorage
 */
export function salvarEventosTeste(tutorId: string, idosoId: string): void {
  const eventos = gerarEventosTeste(tutorId, idosoId)
  
  // Salva cada evento
  eventos.forEach(evento => {
    localStorage.setItem(`evento_${evento.id}`, JSON.stringify(evento))
  })
  
  // Salva lista de eventos do tutor
  localStorage.setItem(`eventos_tutor_${tutorId}`, JSON.stringify(eventos))
}
