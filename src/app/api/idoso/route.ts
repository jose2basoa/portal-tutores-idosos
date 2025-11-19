// ============================================
// API: Gerenciamento de Idoso
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { generateId, saveIdoso, loadIdoso, loadIdososByTutor } from '@/lib/storage'
import { Idoso } from '@/lib/types'

/**
 * GET: Busca idoso(s)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idosoId = searchParams.get('id')
    const tutorId = searchParams.get('tutorId')

    if (idosoId) {
      // Busca idoso específico
      const idoso = loadIdoso(idosoId)
      if (!idoso) {
        return NextResponse.json(
          { success: false, error: 'Idoso não encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: idoso })
    }

    if (tutorId) {
      // Busca todos os idosos do tutor
      const idosos = loadIdososByTutor(tutorId)
      return NextResponse.json({ success: true, data: idosos })
    }

    return NextResponse.json(
      { success: false, error: 'Parâmetros inválidos' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao buscar idoso:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados' },
      { status: 500 }
    )
  }
}

/**
 * POST: Cria novo idoso
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.tutorId || !data.nome) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const idoso: Idoso = {
      id: generateId(),
      tutorId: data.tutorId,
      nome: data.nome,
      idade: data.idade || 0,
      altura: data.altura || 0,
      doencas: data.doencas || [],
      condicaoAtual: data.condicaoAtual || '',
      temPlanoSaude: data.temPlanoSaude || false,
      planoSaude: data.planoSaude,
      numeroSUS: data.numeroSUS || '',
      medicacoes: data.medicacoes || [],
      exames: data.exames || [],
      foto: data.foto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    saveIdoso(idoso)

    return NextResponse.json({
      success: true,
      data: idoso,
      message: 'Idoso cadastrado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao criar idoso:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao cadastrar idoso' },
      { status: 500 }
    )
  }
}

/**
 * PUT: Atualiza idoso existente
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json(
        { success: false, error: 'ID do idoso é obrigatório' },
        { status: 400 }
      )
    }

    const idosoExistente = loadIdoso(data.id)
    if (!idosoExistente) {
      return NextResponse.json(
        { success: false, error: 'Idoso não encontrado' },
        { status: 404 }
      )
    }

    const idosoAtualizado: Idoso = {
      ...idosoExistente,
      ...data,
      updatedAt: new Date().toISOString()
    }

    saveIdoso(idosoAtualizado)

    return NextResponse.json({
      success: true,
      data: idosoAtualizado,
      message: 'Dados atualizados com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao atualizar idoso:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar dados' },
      { status: 500 }
    )
  }
}
