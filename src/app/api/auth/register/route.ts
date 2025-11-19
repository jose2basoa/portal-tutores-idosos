// ============================================
// API: Registro de novo tutor
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { generateId, saveTutor, saveUserCredentials } from '@/lib/storage'
import { Tutor } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { email, senha, tutorData } = await request.json()

    if (!email || !senha || !tutorData) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const userId = generateId()

    const tutor: Tutor = {
      id: userId,
      email,
      nome: tutorData.nome || '',
      documento: tutorData.documento || '',
      idade: tutorData.idade || 0,
      endereco: tutorData.endereco || {
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      },
      contatosEmergencia: tutorData.contatosEmergencia || [],
      foto: tutorData.foto || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    saveTutor(tutor)
    saveUserCredentials(email, senha, userId)

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email
      },
      tutor,
      message: 'Conta criada com sucesso!'
    })
    } catch (error: any) {
    console.error('Erro no registro (detalhes):', error?.message || error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar conta', detalhes: String(error) },
      { status: 500 }
    )
  }
}
