'use client'

// Dashboard principal com indicadores e botões de emergência
import { useEffect, useState } from 'react'
import { supabase, Idoso, Evento } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  AlertTriangle, 
  Battery, 
  Droplets, 
  MapPin, 
  Pill,
  Phone,
  Ambulance,
  Shield,
  Flame,
  Clock,
  TrendingUp,
  UserCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user } = useAuth()
  const [idoso, setIdoso] = useState<Idoso | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Buscar dados do idoso
      const { data: idosoData, error: idosoError } = await supabase
        .from('idosos')
        .select('*')
        .eq('tutor_id', user?.id)
        .single()

      if (idosoError && idosoError.code !== 'PGRST116') throw idosoError
      setIdoso(idosoData)

      // Buscar últimos eventos
      if (idosoData) {
        const { data: eventosData, error: eventosError } = await supabase
          .from('eventos')
          .select('*')
          .eq('idoso_id', idosoData.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (eventosError) throw eventosError
        setEventos(eventosData || [])
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmergencyCall = (number: string, service: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${number}`
      toast.success(`Discando para ${service}...`)
    }
  }

  // Calcular estatísticas dos eventos
  const eventosHoje = eventos.filter(e => {
    const hoje = new Date().toDateString()
    const eventoData = new Date(e.created_at).toDateString()
    return hoje === eventoData
  })

  const eventosCriticos = eventos.filter(e => e.severidade === 'critica' || e.severidade === 'alta')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!idoso) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <CardHeader>
            <UserCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <CardTitle className="text-2xl">Nenhum idoso cadastrado</CardTitle>
            <CardDescription className="text-base">
              Você ainda não cadastrou um idoso. Comece agora para acompanhar o bem-estar dele.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/gerenciar-idoso">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                Cadastrar Idoso
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhamento em tempo real de {idoso.nome}
        </p>
      </div>

      {/* Botões de Emergência */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => handleEmergencyCall('190', 'Polícia')}
          className="h-24 text-lg font-semibold bg-blue-600 hover:bg-blue-700 flex flex-col gap-2"
        >
          <Shield className="w-8 h-8" />
          <span>Polícia - 190</span>
        </Button>
        <Button
          onClick={() => handleEmergencyCall('192', 'SAMU')}
          className="h-24 text-lg font-semibold bg-red-600 hover:bg-red-700 flex flex-col gap-2"
        >
          <Ambulance className="w-8 h-8" />
          <span>SAMU - 192</span>
        </Button>
        <Button
          onClick={() => handleEmergencyCall('193', 'Bombeiros')}
          className="h-24 text-lg font-semibold bg-orange-600 hover:bg-orange-700 flex flex-col gap-2"
        >
          <Flame className="w-8 h-8" />
          <span>Bombeiros - 193</span>
        </Button>
      </div>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Hoje</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventosHoje.length}</div>
            <p className="text-xs text-muted-foreground">
              {eventosHoje.length > 0 ? 'Atividade registrada' : 'Nenhuma atividade'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventosCriticos.length}</div>
            <p className="text-xs text-muted-foreground">
              {eventosCriticos.length > 0 ? 'Requer atenção' : 'Tudo normal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Resposta</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eventos.length > 0 ? 'Hoje' : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {eventos.length > 0 ? 'Respondeu recentemente' : 'Sem dados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eventosCriticos.length === 0 ? 'Bom' : 'Atenção'}
            </div>
            <p className="text-xs text-muted-foreground">
              {eventosCriticos.length === 0 ? 'Tudo sob controle' : 'Verificar alertas'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Idoso */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Idoso</CardTitle>
          <CardDescription>Dados cadastrais e condição atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              {idoso.foto_url ? (
                <img
                  src={idoso.foto_url}
                  alt={idoso.nome}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <UserCircle className="w-16 h-16 text-gray-400" />
              )}
              <div>
                <p className="font-semibold text-lg">{idoso.nome}</p>
                <p className="text-sm text-gray-600">{idoso.idade} anos</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Condição Atual</p>
              <p className="font-medium">{idoso.condicao_atual || 'Não informado'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Plano de Saúde</p>
              <Badge variant={idoso.tem_plano_saude ? 'default' : 'secondary'}>
                {idoso.tem_plano_saude ? idoso.plano_saude_nome : 'Não possui'}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Altura</p>
              <p className="font-medium">{idoso.altura} cm</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Cartão SUS</p>
              <p className="font-medium">{idoso.cartao_sus || 'Não informado'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Doenças</p>
              <p className="font-medium">{idoso.doencas || 'Nenhuma registrada'}</p>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/gerenciar-idoso">
              <Button variant="outline">
                Editar Informações
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Últimos Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Eventos</CardTitle>
          <CardDescription>Atividades recentes registradas pelo aplicativo</CardDescription>
        </CardHeader>
        <CardContent>
          {eventos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum evento registrado ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventos.slice(0, 5).map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    evento.severidade === 'critica' ? 'bg-red-100 text-red-600' :
                    evento.severidade === 'alta' ? 'bg-orange-100 text-orange-600' :
                    evento.severidade === 'media' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {evento.tipo === 'queda' && <AlertTriangle className="w-5 h-5" />}
                    {evento.tipo === 'resposta' && <Activity className="w-5 h-5" />}
                    {evento.tipo === 'bateria_baixa' && <Battery className="w-5 h-5" />}
                    {evento.tipo === 'imobilidade' && <Clock className="w-5 h-5" />}
                    {evento.tipo === 'falta_resposta' && <AlertTriangle className="w-5 h-5" />}
                    {evento.tipo === 'alerta' && <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{evento.descricao}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(evento.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant={
                    evento.severidade === 'critica' ? 'destructive' :
                    evento.severidade === 'alta' ? 'destructive' :
                    evento.severidade === 'media' ? 'default' :
                    'secondary'
                  }>
                    {evento.severidade}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {eventos.length > 5 && (
            <div className="mt-4 text-center">
              <Link href="/eventos">
                <Button variant="outline">Ver Todos os Eventos</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
