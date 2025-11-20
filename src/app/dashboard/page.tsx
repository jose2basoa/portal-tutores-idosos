'use client'

// ============================================
// DASHBOARD PRINCIPAL
// Visão geral com indicadores e emergência
// ============================================

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Navbar } from '@/components/custom/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  Battery,
  MapPin,
  AlertTriangle,
  Droplets,
  Pill,
  Phone,
  Loader2,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { Idoso, Evento } from '@/lib/types'
import { toast } from 'sonner'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { salvarEventosTeste } from '@/lib/test-data'

export default function DashboardPage() {
  const router = useRouter()
  const { user, tutor, loading: authLoading } = useAuth()
  const [idoso, setIdoso] = useState<Idoso | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      // Carrega idoso do localStorage
      const idosoData = localStorage.getItem('idoso_data')
      if (idosoData) {
        const idosoObj = JSON.parse(idosoData)
        setIdoso(idosoObj)
        
        // Gera eventos de teste se não existirem
        const eventosExistentes = localStorage.getItem(`eventos_tutor_${user?.id}`)
        if (!eventosExistentes && user) {
          salvarEventosTeste(user.id, idosoObj.id)
        }
      }

      // Carrega eventos
      if (user) {
        const response = await fetch(`/api/eventos?tutorId=${user.id}`)
        const data = await response.json()
        if (data.success) {
          setEventos(data.data.slice(0, 10)) // Últimos 10 eventos
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const chamarEmergencia = (numero: string, servico: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${numero}`
      toast.success(`Chamando ${servico}...`)
    }
  }

  const getEventoIcon = (tipo: string) => {
    switch (tipo) {
      case 'queda': return <AlertTriangle className="w-5 h-5" />
      case 'bateria_baixa': return <Battery className="w-5 h-5" />
      case 'localizacao': return <MapPin className="w-5 h-5" />
      case 'medicacao': return <Pill className="w-5 h-5" />
      case 'agua': return <Droplets className="w-5 h-5" />
      default: return <Heart className="w-5 h-5" />
    }
  }

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-300'
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  // Calcula estatísticas
  const eventosNaoLidos = eventos.filter(e => !e.lido).length
  const eventosCriticos = eventos.filter(e => e.severidade === 'critica' || e.severidade === 'alta').length
  const ultimoEvento = eventos[0]
  const bateria = ultimoEvento?.dados?.bateria || 0

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botões de Emergência */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => chamarEmergencia('190', 'Polícia')}
            className="h-20 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Phone className="w-6 h-6 mr-2" />
            🚓 Polícia (190)
          </Button>
          <Button
            onClick={() => chamarEmergencia('192', 'SAMU')}
            className="h-20 text-lg font-bold bg-red-600 hover:bg-red-700 shadow-lg"
          >
            <Phone className="w-6 h-6 mr-2" />
            🚑 SAMU (192)
          </Button>
          <Button
            onClick={() => chamarEmergencia('193', 'Bombeiros')}
            className="h-20 text-lg font-bold bg-orange-600 hover:bg-orange-700 shadow-lg"
          >
            <Phone className="w-6 h-6 mr-2" />
            🚒 Bombeiros (193)
          </Button>
        </div>

        {/* Informações do Idoso */}
        {idoso ? (
          <Card className="mb-8 shadow-lg p-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-[10px] pt-1">
              <CardTitle className="flex items-center gap-2">
                <User className="w-6 h-6" />
                {idoso.nome}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Idade</p>
                  <p className="text-lg font-semibold">{idoso.idade} anos</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Altura</p>
                  <p className="text-lg font-semibold">{idoso.altura} cm</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Medicações</p>
                  <p className="text-lg font-semibold">{idoso.medicacoes.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Condição</p>
                  <p className="text-lg font-semibold">{idoso.condicaoAtual || 'Normal'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 shadow-lg border-dashed border-2">
            <CardContent className="py-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Nenhum idoso cadastrado</h3>
              <p className="text-gray-600 mb-4">Cadastre os dados do idoso para começar o monitoramento</p>
              <Link href="/dashboard/idoso">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Cadastrar Idoso
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Indicadores Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Battery className="w-4 h-4" />
                Bateria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bateria}%</div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${bateria > 50 ? 'bg-green-500' : bateria > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${bateria}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Última Resposta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ultimoEvento ? formatDistanceToNow(new Date(ultimoEvento.datetime), { locale: ptBR, addSuffix: true }) : 'Sem dados'}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Eventos Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{eventosCriticos}</div>
              <p className="text-sm text-gray-600 mt-1">Últimas 24h</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Consumo de Água
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1.2L</div>
              <p className="text-sm text-gray-600 mt-1">Hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Eventos Recentes */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Eventos Recentes
              </span>
              <Link href="/dashboard/eventos">
                <Button variant="outline" size="sm">Ver Todos</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventos.length > 0 ? (
              <div className="space-y-3">
                {eventos.slice(0, 5).map((evento) => (
                  <div
                    key={evento.id}
                    className={`p-4 rounded-lg border-2 ${getSeveridadeColor(evento.severidade)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getEventoIcon(evento.tipo)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{evento.titulo}</h4>
                          <span className="text-xs">
                            {formatDistanceToNow(new Date(evento.datetime), { locale: ptBR, addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{evento.descricao}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum evento registrado ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
