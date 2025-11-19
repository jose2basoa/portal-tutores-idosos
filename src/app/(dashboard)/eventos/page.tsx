'use client'

// Página de eventos diários com filtros e visualização detalhada
import { useEffect, useState } from 'react'
import { supabase, Evento } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Activity, 
  AlertTriangle, 
  Battery, 
  Clock, 
  MapPin,
  Filter,
  Calendar,
  Loader2
} from 'lucide-react'

export default function EventosPage() {
  const { user } = useAuth()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventosFiltrados, setEventosFiltrados] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>('todos')
  const [filtroBusca, setFiltroBusca] = useState('')

  useEffect(() => {
    if (user) {
      loadEventos()
    }
  }, [user])

  useEffect(() => {
    aplicarFiltros()
  }, [eventos, filtroTipo, filtroSeveridade, filtroBusca])

  const loadEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('tutor_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEventos(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => {
    let filtrados = [...eventos]

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      filtrados = filtrados.filter(e => e.tipo === filtroTipo)
    }

    // Filtro por severidade
    if (filtroSeveridade !== 'todos') {
      filtrados = filtrados.filter(e => e.severidade === filtroSeveridade)
    }

    // Filtro por busca
    if (filtroBusca) {
      filtrados = filtrados.filter(e =>
        e.descricao.toLowerCase().includes(filtroBusca.toLowerCase())
      )
    }

    setEventosFiltrados(filtrados)
  }

  const getIconeEvento = (tipo: string) => {
    switch (tipo) {
      case 'queda':
        return <AlertTriangle className="w-5 h-5" />
      case 'resposta':
        return <Activity className="w-5 h-5" />
      case 'bateria_baixa':
        return <Battery className="w-5 h-5" />
      case 'imobilidade':
        return <Clock className="w-5 h-5" />
      case 'falta_resposta':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getCorSeveridade = (severidade: string) => {
    switch (severidade) {
      case 'critica':
        return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
      case 'alta':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300'
      case 'media':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
      case 'baixa':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getBadgeVariant = (severidade: string) => {
    switch (severidade) {
      case 'critica':
      case 'alta':
        return 'destructive'
      case 'media':
        return 'default'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Eventos Diários</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Histórico completo de eventos recebidos do aplicativo
        </p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {eventos.filter(e => e.severidade === 'critica').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {eventos.filter(e => e.severidade === 'alta').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {eventos.filter(e => {
                const hoje = new Date().toDateString()
                const eventoData = new Date(e.created_at).toDateString()
                return hoje === eventoData
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Evento</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="resposta">Resposta</SelectItem>
                  <SelectItem value="falta_resposta">Falta de Resposta</SelectItem>
                  <SelectItem value="queda">Queda</SelectItem>
                  <SelectItem value="imobilidade">Imobilidade</SelectItem>
                  <SelectItem value="bateria_baixa">Bateria Baixa</SelectItem>
                  <SelectItem value="alerta">Alerta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severidade</label>
              <Select value={filtroSeveridade} onValueChange={setFiltroSeveridade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as severidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as severidades</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Buscar na descrição..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos ({eventosFiltrados.length})</CardTitle>
          <CardDescription>
            {eventosFiltrados.length === 0
              ? 'Nenhum evento encontrado com os filtros aplicados'
              : 'Lista de eventos ordenados por data'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum evento registrado</p>
              <p className="text-sm">Os eventos do aplicativo aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventosFiltrados.map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Ícone */}
                  <div className={`p-3 rounded-lg ${getCorSeveridade(evento.severidade)}`}>
                    {getIconeEvento(evento.tipo)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{evento.descricao}</h4>
                      <Badge variant={getBadgeVariant(evento.severidade)}>
                        {evento.severidade}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(evento.created_at).toLocaleString('pt-BR')}
                      </div>

                      {evento.localizacao && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {evento.localizacao}
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        {evento.tipo.replace('_', ' ')}
                      </div>
                    </div>

                    {/* Dados Extras */}
                    {evento.dados_extras && (
                      <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(evento.dados_extras, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
