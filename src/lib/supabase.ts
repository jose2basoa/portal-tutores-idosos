// Cliente Supabase para autenticação e banco de dados
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos do banco de dados
export interface Tutor {
  id: string
  email: string
  nome_completo: string
  documento: string
  idade: number
  endereco_rua: string
  endereco_numero: string
  endereco_bairro: string
  endereco_cidade: string
  endereco_estado: string
  endereco_cep: string
  contato_emergencia_1_nome: string
  contato_emergencia_1_telefone: string
  contato_emergencia_2_nome: string
  contato_emergencia_2_telefone: string
  contato_emergencia_3_nome: string
  contato_emergencia_3_telefone: string
  foto_url?: string
  created_at: string
}

export interface Idoso {
  id: string
  tutor_id: string
  nome: string
  idade: number
  altura: number
  doencas: string
  condicao_atual: string
  tem_plano_saude: boolean
  plano_saude_nome?: string
  plano_saude_numero?: string
  cartao_sus: string
  foto_url?: string
  created_at: string
  updated_at: string
}

export interface Medicacao {
  id: string
  idoso_id: string
  nome: string
  dosagem: string
  horarios: string
  observacoes?: string
  created_at: string
}

export interface Exame {
  id: string
  idoso_id: string
  nome: string
  data_realizacao: string
  resultado?: string
  observacoes?: string
  created_at: string
}

export interface Evento {
  id: string
  tutor_id: string
  idoso_id: string
  tipo: 'resposta' | 'falta_resposta' | 'queda' | 'imobilidade' | 'bateria_baixa' | 'alerta'
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  descricao: string
  dados_extras?: any
  localizacao?: string
  created_at: string
}
