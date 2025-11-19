// ============================================
// API: Gerenciamento de Eventos
// Recebe eventos do app mobile do idoso
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { generateId, saveEvento, loadEventosByTutor, markEventoAsRead } from '@/lib/storage'
import { Evento } from '@/lib/types'

/**
 * GET: Busca eventos de um tutor
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tutorId = searchParams.get('tutorId')

    if (!tutorId) {
      return NextResponse.json(
        { success: false, error: 'tutorId é obrigatório' },
        { status: 400 }
      )
    }

    const eventos = loadEventosByTutor(tutorId)

    return NextResponse.json({
      success: true,
      data: eventos
    })
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar eventos' },
      { status: 500 }
    )
  }
}

/**
 * POST: Cria novo evento (enviado pelo app mobile)
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Valida campos obrigatórios
    if (!data.tutorId || !data.idosoId || !data.tipo) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const evento: Evento = {
      id: generateId(),
      tutorId: data.tutorId,
      idosoId: data.idosoId,
      tipo: data.tipo,
      severidade: data.severidade || 'baixa',
      titulo: data.titulo || 'Novo evento',
      descricao: data.descricao || '',
      dados: data.dados,
      datetime: data.datetime || new Date().toISOString(),
      lido: false
    }

    saveEvento(evento)

    return NextResponse.json({
      success: true,
      data: evento,
      message: 'Evento registrado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao criar evento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao registrar evento' },
      { status: 500 }
    )
  }
}

/**
 * PATCH: Marca evento como lido
 */
export async function PATCH(request: NextRequest) {
  try {
    const { eventoId, tutorId } = await request.json()

    if (!eventoId || !tutorId) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    markEventoAsRead(eventoId, tutorId)

    return NextResponse.json({
      success: true,
      message: 'Evento marcado como lido'
    })
  } catch (error) {
    console.error('Erro ao marcar evento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar evento' },
      { status: 500 }
    )
  }
}
