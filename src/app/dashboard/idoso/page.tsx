'use client'

// ============================================
// GERENCIAMENTO DO IDOSO
// Cadastro e edição completa dos dados
// ============================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Navbar } from '@/components/custom/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Heart,
  Loader2,
  Plus,
  Trash2,
  Save,
  User,
  Pill,
  FileText,
  ArrowLeft
} from 'lucide-react'
import { Idoso, Medicacao, Exame } from '@/lib/types'
import { generateId } from '@/lib/storage'
import { toast } from 'sonner'
import Link from 'next/link'

export default function IdosoPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [idoso, setIdoso] = useState<Idoso | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    idade: '',
    altura: '',
    doencas: [] as string[],
    novaDoenca: '',
    condicaoAtual: '',
    temPlanoSaude: false,
    planoSaude: {
      nome: '',
      numeroCarteira: ''
    },
    numeroSUS: '',
    medicacoes: [] as Medicacao[],
    exames: [] as Exame[]
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Carrega dados do idoso se existir
    const idosoData = localStorage.getItem('idoso_data')
    if (idosoData) {
      const idosoExistente = JSON.parse(idosoData)
      setIdoso(idosoExistente)
      setFormData({
        nome: idosoExistente.nome,
        idade: idosoExistente.idade.toString(),
        altura: idosoExistente.altura.toString(),
        doencas: idosoExistente.doencas || [],
        novaDoenca: '',
        condicaoAtual: idosoExistente.condicaoAtual,
        temPlanoSaude: idosoExistente.temPlanoSaude,
        planoSaude: idosoExistente.planoSaude || { nome: '', numeroCarteira: '' },
        numeroSUS: idosoExistente.numeroSUS,
        medicacoes: idosoExistente.medicacoes || [],
        exames: idosoExistente.exames || []
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const idosoData: Partial<Idoso> = {
        nome: formData.nome,
        idade: parseInt(formData.idade),
        altura: parseInt(formData.altura),
        doencas: formData.doencas,
        condicaoAtual: formData.condicaoAtual,
        temPlanoSaude: formData.temPlanoSaude,
        planoSaude: formData.temPlanoSaude ? formData.planoSaude : undefined,
        numeroSUS: formData.numeroSUS,
        medicacoes: formData.medicacoes,
        exames: formData.exames
      }

      if (idoso) {
        // Atualiza idoso existente
        const response = await fetch('/api/idoso', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...idosoData, id: idoso.id })
        })

        if (response.ok) {
          toast.success('Dados atualizados com sucesso!')
          const data = await response.json()
          localStorage.setItem('idoso_data', JSON.stringify(data.data))
          setIdoso(data.data)
        }
      } else {
        // Cria novo idoso
        const response = await fetch('/api/idoso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...idosoData, tutorId: user?.id })
        })

        if (response.ok) {
          toast.success('Idoso cadastrado com sucesso!')
          const data = await response.json()
          localStorage.setItem('idoso_data', JSON.stringify(data.data))
          setIdoso(data.data)
          router.push('/dashboard')
        }
      }
    } catch (error) {
      toast.error('Erro ao salvar dados')
    } finally {
      setLoading(false)
    }
  }

  // Funções para gerenciar doenças
  const addDoenca = () => {
    if (formData.novaDoenca.trim()) {
      setFormData({
        ...formData,
        doencas: [...formData.doencas, formData.novaDoenca.trim()],
        novaDoenca: ''
      })
    }
  }

  const removeDoenca = (index: number) => {
    setFormData({
      ...formData,
      doencas: formData.doencas.filter((_, i) => i !== index)
    })
  }

  // Funções para gerenciar medicações
  const addMedicacao = () => {
    const novaMedicacao: Medicacao = {
      id: generateId(),
      nome: '',
      dosagem: '',
      frequencia: '',
      horarios: [],
      observacoes: ''
    }
    setFormData({
      ...formData,
      medicacoes: [...formData.medicacoes, novaMedicacao]
    })
  }

  const updateMedicacao = (index: number, field: keyof Medicacao, value: any) => {
    const novasMedicacoes = [...formData.medicacoes]
    novasMedicacoes[index] = { ...novasMedicacoes[index], [field]: value }
    setFormData({ ...formData, medicacoes: novasMedicacoes })
  }

  const removeMedicacao = (index: number) => {
    setFormData({
      ...formData,
      medicacoes: formData.medicacoes.filter((_, i) => i !== index)
    })
  }

  // Funções para gerenciar exames
  const addExame = () => {
    const novoExame: Exame = {
      id: generateId(),
      nome: '',
      data: new Date().toISOString().split('T')[0],
      resultado: '',
      observacoes: ''
    }
    setFormData({
      ...formData,
      exames: [...formData.exames, novoExame]
    })
  }

  const updateExame = (index: number, field: keyof Exame, value: any) => {
    const novosExames = [...formData.exames]
    novosExames[index] = { ...novosExames[index], [field]: value }
    setFormData({ ...formData, exames: novosExames })
  }

  const removeExame = (index: number) => {
    setFormData({
      ...formData,
      exames: formData.exames.filter((_, i) => i !== index)
    })
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {idoso ? 'Editar Idoso' : 'Cadastrar Idoso'}
          </h1>
          <p className="text-gray-600 mt-1">Gerencie os dados do idoso</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="dados" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">
                <User className="w-4 h-4 mr-2" />
                Dados Básicos
              </TabsTrigger>
              <TabsTrigger value="medicacoes">
                <Pill className="w-4 h-4 mr-2" />
                Medicações
              </TabsTrigger>
              <TabsTrigger value="exames">
                <FileText className="w-4 h-4 mr-2" />
                Exames
              </TabsTrigger>
            </TabsList>

            {/* Dados Básicos */}
            <TabsContent value="dados">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        placeholder="Nome do idoso"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idade">Idade *</Label>
                      <Input
                        id="idade"
                        type="number"
                        placeholder="75"
                        value={formData.idade}
                        onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="altura">Altura (cm) *</Label>
                      <Input
                        id="altura"
                        type="number"
                        placeholder="165"
                        value={formData.altura}
                        onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="condicaoAtual">Condição Atual / Disposição</Label>
                      <Textarea
                        id="condicaoAtual"
                        placeholder="Descreva a condição atual do idoso..."
                        value={formData.condicaoAtual}
                        onChange={(e) => setFormData({ ...formData, condicaoAtual: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Doenças Existentes</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite uma doença"
                          value={formData.novaDoenca}
                          onChange={(e) => setFormData({ ...formData, novaDoenca: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDoenca())}
                        />
                        <Button type="button" onClick={addDoenca} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.doencas.map((doenca, index) => (
                          <div
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                          >
                            <span>{doenca}</span>
                            <button
                              type="button"
                              onClick={() => removeDoenca(index)}
                              className="hover:text-blue-900"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-lg">Plano de Saúde</h3>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="temPlanoSaude"
                        checked={formData.temPlanoSaude}
                        onCheckedChange={(checked) => setFormData({ ...formData, temPlanoSaude: checked })}
                      />
                      <Label htmlFor="temPlanoSaude">Possui plano de saúde</Label>
                    </div>

                    {formData.temPlanoSaude && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="planoNome">Nome do Plano</Label>
                          <Input
                            id="planoNome"
                            placeholder="Ex: Unimed"
                            value={formData.planoSaude.nome}
                            onChange={(e) => setFormData({
                              ...formData,
                              planoSaude: { ...formData.planoSaude, nome: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="planoCarteira">Número da Carteira</Label>
                          <Input
                            id="planoCarteira"
                            placeholder="0000000000000"
                            value={formData.planoSaude.numeroCarteira}
                            onChange={(e) => setFormData({
                              ...formData,
                              planoSaude: { ...formData.planoSaude, numeroCarteira: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="numeroSUS">Número do Cartão SUS</Label>
                      <Input
                        id="numeroSUS"
                        placeholder="000 0000 0000 0000"
                        value={formData.numeroSUS}
                        onChange={(e) => setFormData({ ...formData, numeroSUS: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medicações */}
            <TabsContent value="medicacoes">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Medicações</CardTitle>
                    <Button type="button" onClick={addMedicacao} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Medicação
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.medicacoes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma medicação cadastrada</p>
                      <p className="text-sm">Clique em "Adicionar Medicação" para começar</p>
                    </div>
                  ) : (
                    formData.medicacoes.map((med, index) => (
                      <Card key={med.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold">Medicação {index + 1}</h4>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeMedicacao(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Nome do Medicamento</Label>
                                <Input
                                  placeholder="Ex: Losartana"
                                  value={med.nome}
                                  onChange={(e) => updateMedicacao(index, 'nome', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Dosagem</Label>
                                <Input
                                  placeholder="Ex: 50mg"
                                  value={med.dosagem}
                                  onChange={(e) => updateMedicacao(index, 'dosagem', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Frequência</Label>
                                <Input
                                  placeholder="Ex: 2x ao dia"
                                  value={med.frequencia}
                                  onChange={(e) => updateMedicacao(index, 'frequencia', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Horários</Label>
                                <Input
                                  placeholder="Ex: 08:00, 20:00"
                                  value={med.horarios.join(', ')}
                                  onChange={(e) => updateMedicacao(index, 'horarios', e.target.value.split(',').map(h => h.trim()))}
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>Observações</Label>
                                <Textarea
                                  placeholder="Observações sobre a medicação..."
                                  value={med.observacoes}
                                  onChange={(e) => updateMedicacao(index, 'observacoes', e.target.value)}
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exames */}
            <TabsContent value="exames">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Exames</CardTitle>
                    <Button type="button" onClick={addExame} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Exame
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.exames.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum exame cadastrado</p>
                      <p className="text-sm">Clique em "Adicionar Exame" para começar</p>
                    </div>
                  ) : (
                    formData.exames.map((exame, index) => (
                      <Card key={exame.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold">Exame {index + 1}</h4>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeExame(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Nome do Exame</Label>
                                <Input
                                  placeholder="Ex: Hemograma Completo"
                                  value={exame.nome}
                                  onChange={(e) => updateExame(index, 'nome', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Data</Label>
                                <Input
                                  type="date"
                                  value={exame.data}
                                  onChange={(e) => updateExame(index, 'data', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>Resultado</Label>
                                <Textarea
                                  placeholder="Resultado do exame..."
                                  value={exame.resultado}
                                  onChange={(e) => updateExame(index, 'resultado', e.target.value)}
                                  rows={2}
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>Observações</Label>
                                <Textarea
                                  placeholder="Observações sobre o exame..."
                                  value={exame.observacoes}
                                  onChange={(e) => updateExame(index, 'observacoes', e.target.value)}
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Botão Salvar */}
          <div className="mt-8 flex gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button type="button" variant="outline" className="w-full h-12">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Salvar Dados
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
