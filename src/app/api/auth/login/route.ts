import { NextRequest, NextResponse } from 'next/server'
import { checkCredentials, loadTutor } from '@/lib/storage.server'

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await checkCredentials(email, senha) // await porque é async

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    const tutor = await loadTutor(user.id)

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
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
