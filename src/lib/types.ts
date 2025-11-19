// ============================================
// TIPOS DO SISTEMA - Portal do Tutor
// ============================================

/**
 * Representa um tutor (responsável pelo idoso)
 */
export interface Tutor {
  id: string
  email: string
  nome: string
  documento: string // RG/CPF
  idade: number
  endereco: {
    rua: string
    numero: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  contatosEmergencia: ContatoEmergencia[]
  foto?: string // URL da foto
  createdAt: string
  updatedAt: string
}

/**
 * Contato de emergência do tutor
 */
export interface ContatoEmergencia {
  id: string
  nome: string
  telefone: string
}

/**
 * Representa um idoso sob cuidado
 */
export interface Idoso {
  id: string
  tutorId: string
  nome: string
  idade: number
  altura: number // em cm
  doencas: string[] // lista de doenças
  condicaoAtual: string // disposição atual
  temPlanoSaude: boolean
  planoSaude?: {
    nome: string
    numeroCarteira: string
  }
  numeroSUS: string
  medicacoes: Medicacao[]
  exames: Exame[]
  foto?: string // URL da foto
  createdAt: string
  updatedAt: string
}

/**
 * Medicação do idoso
 */
export interface Medicacao {
  id: string
  nome: string
  dosagem: string
  frequencia: string // ex: "2x ao dia"
  horarios: string[] // ex: ["08:00", "20:00"]
  observacoes?: string
}

/**
 * Exame do idoso
 */
export interface Exame {
  id: string
  nome: string
  data: string
  resultado?: string
  observacoes?: string
  arquivo?: string // URL do arquivo
}

/**
 * Evento enviado pelo app mobile do idoso
 */
export interface Evento {
  id: string
  tutorId: string
  idosoId: string
  tipo: TipoEvento
  severidade: SeveridadeEvento
  titulo: string
  descricao: string
  dados?: EventoDados
  datetime: string
  lido: boolean
}

/**
 * Tipos de eventos possíveis
 */
export type TipoEvento =
  | 'resposta' // Idoso respondeu pergunta
  | 'falta_resposta' // Idoso não respondeu
  | 'queda' // Queda detectada
  | 'imobilidade' // Falta de movimento
  | 'bateria_baixa' // Bateria do celular baixa
  | 'localizacao' // Atualização de localização
  | 'medicacao' // Lembrete de medicação
  | 'agua' // Consumo de água
  | 'sintoma' // Sintoma relatado
  | 'outro'

/**
 * Severidade do evento
 */
export type SeveridadeEvento = 'baixa' | 'media' | 'alta' | 'critica'

/**
 * Dados adicionais do evento
 */
export interface EventoDados {
  bateria?: number // 0-100
  localizacao?: {
    latitude: number
    longitude: number
    precisao?: number
  }
  acelerometro?: {
    x: number
    y: number
    z: number
  }
  resposta?: string
  sintomas?: string[]
  consumoAgua?: number // em ml
  [key: string]: any // permite dados extras
}

/**
 * Estatísticas do dashboard
 */
export interface DashboardStats {
  ultimaResposta?: {
    datetime: string
    resposta: string
  }
  bateria?: number
  localizacao?: {
    latitude: number
    longitude: number
    datetime: string
  }
  eventosRecentes: Evento[]
  medicacoesHoje: Medicacao[]
  consumoAguaHoje: number // em ml
  statusGeral: 'normal' | 'atencao' | 'critico'
}

/**
 * Dados de autenticação
 */
export interface AuthUser {
  id: string
  email: string
  tutor?: Tutor
}

/**
 * Resposta padrão da API
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
