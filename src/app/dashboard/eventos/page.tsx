'use client'

// ============================================
// PÁGINA DE EVENTOS DIÁRIOS
// Lista todos os eventos recebidos do app mobile
// ============================================

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Navbar } from '@/components/custom/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Heart,
  AlertTriangle,
  Battery,
  MapPin,
  Droplets,
  Pill,
  MessageSquare,
  Activity,
  Loader2,
  Filter,
  Search,
  Calendar
} from 'lucide-react'
import { Evento, TipoEvento, SeveridadeEvento } from '@/lib/types'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function EventosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventosFiltrados, setEventosFiltrados] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadEventos()
    }
  }, [user])

  useEffect(() => {
    aplicarFiltros()
  }, [eventos, filtroTipo, filtroSeveridade, busca])

  const loadEventos = async () => {
    try {
      const response = await fetch(`/api/eventos?tutorId=${user?.id}`)
      const data = await response.json()
      if (data.success) {
        setEventos(data.data)
      }
    } catch (error) {
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

    // Busca por texto
    if (busca) {
      const buscaLower = busca.toLowerCase()
      filtrados = filtrados.filter(e =>
        e.titulo.toLowerCase().includes(buscaLower) ||
        e.descricao.toLowerCase().includes(buscaLower)
      )
    }

    setEventosFiltrados(filtrados)
  }

  const marcarComoLido = async (eventoId: string) => {
    try {
      await fetch('/api/eventos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId, tutorId: user?.id })
      })

      // Atualiza localmente
      setEventos(eventos.map(e =>
        e.id === eventoId ? { ...e, lido: true } : e
      ))
    } catch (error) {
      console.error('Erro ao marcar evento:', error)
    }
  }

  const getEventoIcon = (tipo: TipoEvento) => {
    const iconClass = "w-6 h-6"
    switch (tipo) {
      case 'queda': return <AlertTriangle className={iconClass} />
      case 'bateria_baixa': return <Battery className={iconClass} />
      case 'localizacao': return <MapPin className={iconClass} />
      case 'medicacao': return <Pill className={iconClass} />
      case 'agua': return <Droplets className={iconClass} />
      case 'resposta': return <MessageSquare className={iconClass} />
      case 'sintoma': return <Activity className={iconClass} />
      default: return <Heart className={iconClass} />
    }
  }

  const getSeveridadeColor = (severidade: SeveridadeEvento) => {
    switch (severidade) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-300'
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  const getSeveridadeBadge = (severidade: SeveridadeEvento) => {
    const colors = {
      critica: 'bg-red-500',
      alta: 'bg-orange-500',
      media: 'bg-yellow-500',
      baixa: 'bg-blue-500'
    }
    return (
      <Badge className={`${colors[severidade]} text-white`}>
        {severidade.toUpperCase()}
      </Badge>
    )
  }

  const getTipoLabel = (tipo: TipoEvento) => {
    const labels: Record<TipoEvento, string> = {
      resposta: 'Resposta',
      falta_resposta: 'Falta de Resposta',
      queda: 'Queda Detectada',
      imobilidade: 'Imobilidade',
      bateria_baixa: 'Bateria Baixa',
      localizacao: 'Localização',
      medicacao: 'Medicação',
      agua: 'Consumo de Água',
      sintoma: 'Sintoma',
      outro: 'Outro'
    }
    return labels[tipo] || tipo
  }

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Eventos Diários</h1>
          <p className="text-gray-600 mt-1">
            {eventosFiltrados.length} evento(s) encontrado(s)
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar eventos..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Evento</label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="queda">Queda</SelectItem>
                    <SelectItem value="bateria_baixa">Bateria Baixa</SelectItem>
                    <SelectItem value="resposta">Resposta</SelectItem>
                    <SelectItem value="falta_resposta">Falta de Resposta</SelectItem>
                    <SelectItem value="medicacao">Medicação</SelectItem>
                    <SelectItem value="agua">Água</SelectItem>
                    <SelectItem value="sintoma">Sintoma</SelectItem>
                    <SelectItem value="localizacao">Localização</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Severidade</label>
                <Select value={filtroSeveridade} onValueChange={setFiltroSeveridade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Eventos */}
        <div className="space-y-4">
          {eventosFiltrados.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="py-16 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h3>
                <p className="text-gray-600">
                  {eventos.length === 0
                    ? 'Ainda não há eventos registrados'
                    : 'Tente ajustar os filtros de busca'}
                </p>
              </CardContent>
            </Card>
          ) : (
            eventosFiltrados.map((evento) => (
              <Card
                key={evento.id}
                className={`shadow-lg border-l-4 transition-all hover:shadow-xl ${
                  !evento.lido ? 'bg-blue-50' : ''
                } ${getSeveridadeColor(evento.severidade).split(' ')[2]}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Ícone */}
                    <div className={`p-3 rounded-xl ${getSeveridadeColor(evento.severidade)}`}>
                      {getEventoIcon(evento.tipo)}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{evento.titulo}</h3>
                            {!evento.lido && (
                              <Badge className="bg-blue-500 text-white">Novo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{getTipoLabel(evento.tipo)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getSeveridadeBadge(evento.severidade)}
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(evento.datetime), {
                              locale: ptBR,
                              addSuffix: true
                            })}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{evento.descricao}</p>

                      {/* Dados Adicionais */}
                      {evento.dados && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                          {evento.dados.bateria !== undefined && (
                            <div className="flex items-center gap-2 text-sm">
                              <Battery className="w-4 h-4" />
                              <span>Bateria: {evento.dados.bateria}%</span>
                            </div>
                          )}
                          {evento.dados.localizacao && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4" />
                              <span>
                                Localização: {evento.dados.localizacao.latitude.toFixed(6)}, {evento.dados.localizacao.longitude.toFixed(6)}
                              </span>
                            </div>
                          )}
                          {evento.dados.resposta && (
                            <div className="flex items-center gap-2 text-sm">
                              <MessageSquare className="w-4 h-4" />
                              <span>Resposta: {evento.dados.resposta}</span>
                            </div>
                          )}
                          {evento.dados.consumoAgua && (
                            <div className="flex items-center gap-2 text-sm">
                              <Droplets className="w-4 h-4" />
                              <span>Água: {evento.dados.consumoAgua}ml</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {format(new Date(evento.datetime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {!evento.lido && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => marcarComoLido(evento.id)}
                          >
                            Marcar como lido
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
