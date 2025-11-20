// ============================================
// API: Registro de novo tutor
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { generateId, saveTutor, saveUserCredentials } from "@/lib/storage.server";

export async function POST(request: NextRequest) {
  try {
    const { email, senha, tutorData } = await request.json();

    if (!email || !senha || !tutorData) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // 🔥 Agora correto: generateId() é async
    const userId = await generateId();

    // ------------------------------
    // Montagem do tutor conforme SEU modelo:
    // export interface Tutor {
    //   id: string;
    //   userId: string;
    //   nome: string;
    // }
    // ------------------------------

    const tutor = {
      id: await generateId(),
      userId: userId,
      nome: tutorData.nome || "",
    };

    // Salvar usuário (email + senha)
    await saveUserCredentials({
      id: userId,
      email,
      password: senha,
    });

    // Salvar tutor
    await saveTutor(tutor);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          email,
        },
        tutor,
        message: "Conta criada com sucesso!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar conta", detalhes: String(error) },
      { status: 500 }
    );
  }
}
