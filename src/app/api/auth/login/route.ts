// ============================================
// API: Login
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { checkCredentials, loadTutor } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const userId = checkCredentials(email, senha)

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    const tutor = loadTutor(userId)

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email
      },
      tutor
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
