'use client'

// Página completa de gerenciamento do idoso
import { useEffect, useState } from 'react'
import { supabase, Idoso, Medicacao, Exame } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, 
  Upload, 
  UserCircle, 
  Plus, 
  Trash2, 
  Save,
  Pill,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

export default function GerenciarIdosoPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [idoso, setIdoso] = useState<Idoso | null>(null)
  const [medicacoes, setMedicacoes] = useState<Medicacao[]>([])
  const [exames, setExames] = useState<Exame[]>([])

  // Form data do idoso
  const [formData, setFormData] = useState({
    nome: '',
    idade: '',
    altura: '',
    doencas: '',
    condicao_atual: '',
    tem_plano_saude: false,
    plano_saude_nome: '',
    plano_saude_numero: '',
    cartao_sus: '',
    foto_url: '',
  })

  // Nova medicação
  const [novaMedicacao, setNovaMedicacao] = useState({
    nome: '',
    dosagem: '',
    horarios: '',
    observacoes: '',
  })

  // Novo exame
  const [novoExame, setNovoExame] = useState({
    nome: '',
    data_realizacao: '',
    resultado: '',
    observacoes: '',
  })

  useEffect(() => {
    if (user) {
      loadIdosoData()
    }
  }, [user])

  const loadIdosoData = async () => {
    try {
      // Buscar idoso
      const { data: idosoData, error: idosoError } = await supabase
        .from('idosos')
        .select('*')
        .eq('tutor_id', user?.id)
        .single()

      if (idosoError && idosoError.code !== 'PGRST116') throw idosoError

      if (idosoData) {
        setIdoso(idosoData)
        setFormData({
          nome: idosoData.nome || '',
          idade: idosoData.idade?.toString() || '',
          altura: idosoData.altura?.toString() || '',
          doencas: idosoData.doencas || '',
          condicao_atual: idosoData.condicao_atual || '',
          tem_plano_saude: idosoData.tem_plano_saude || false,
          plano_saude_nome: idosoData.plano_saude_nome || '',
          plano_saude_numero: idosoData.plano_saude_numero || '',
          cartao_sus: idosoData.cartao_sus || '',
          foto_url: idosoData.foto_url || '',
        })

        // Buscar medicações
        const { data: medicacoesData } = await supabase
          .from('medicacoes')
          .select('*')
          .eq('idoso_id', idosoData.id)
          .order('created_at', { ascending: false })

        setMedicacoes(medicacoesData || [])

        // Buscar exames
        const { data: examesData } = await supabase
          .from('exames')
          .select('*')
          .eq('idoso_id', idosoData.id)
          .order('data_realizacao', { ascending: false })

        setExames(examesData || [])
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do idoso')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `idosos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('fotos').getPublicUrl(filePath)

      setFormData({ ...formData, foto_url: data.publicUrl })
      toast.success('Foto enviada com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao enviar foto')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveIdoso = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const idosoData = {
        tutor_id: user?.id,
        nome: formData.nome,
        idade: parseInt(formData.idade),
        altura: parseFloat(formData.altura),
        doencas: formData.doencas,
        condicao_atual: formData.condicao_atual,
        tem_plano_saude: formData.tem_plano_saude,
        plano_saude_nome: formData.plano_saude_nome,
        plano_saude_numero: formData.plano_saude_numero,
        cartao_sus: formData.cartao_sus,
        foto_url: formData.foto_url,
        updated_at: new Date().toISOString(),
      }

      if (idoso) {
        // Atualizar
        const { error } = await supabase
          .from('idosos')
          .update(idosoData)
          .eq('id', idoso.id)

        if (error) throw error
        toast.success('Dados atualizados com sucesso!')
      } else {
        // Criar
        const { data, error } = await supabase
          .from('idosos')
          .insert([idosoData])
          .select()
          .single()

        if (error) throw error
        setIdoso(data)
        toast.success('Idoso cadastrado com sucesso!')
      }

      loadIdosoData()
    } catch (error: any) {
      toast.error('Erro ao salvar dados')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddMedicacao = async () => {
    if (!idoso || !novaMedicacao.nome) {
      toast.error('Preencha o nome da medicação')
      return
    }

    try {
      const { error } = await supabase.from('medicacoes').insert([
        {
          idoso_id: idoso.id,
          ...novaMedicacao,
        },
      ])

      if (error) throw error

      toast.success('Medicação adicionada!')
      setNovaMedicacao({ nome: '', dosagem: '', horarios: '', observacoes: '' })
      loadIdosoData()
    } catch (error: any) {
      toast.error('Erro ao adicionar medicação')
    }
  }

  const handleRemoveMedicacao = async (id: string) => {
    try {
      const { error } = await supabase.from('medicacoes').delete().eq('id', id)
      if (error) throw error
      toast.success('Medicação removida!')
      loadIdosoData()
    } catch (error: any) {
      toast.error('Erro ao remover medicação')
    }
  }

  const handleAddExame = async () => {
    if (!idoso || !novoExame.nome) {
      toast.error('Preencha o nome do exame')
      return
    }

    try {
      const { error } = await supabase.from('exames').insert([
        {
          idoso_id: idoso.id,
          ...novoExame,
        },
      ])

      if (error) throw error

      toast.success('Exame adicionado!')
      setNovoExame({ nome: '', data_realizacao: '', resultado: '', observacoes: '' })
      loadIdosoData()
    } catch (error: any) {
      toast.error('Erro ao adicionar exame')
    }
  }

  const handleRemoveExame = async (id: string) => {
    try {
      const { error } = await supabase.from('exames').delete().eq('id', id)
      if (error) throw error
      toast.success('Exame removido!')
      loadIdosoData()
    } catch (error: any) {
      toast.error('Erro ao remover exame')
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerenciar Idoso</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {idoso ? 'Edite os dados do idoso' : 'Cadastre o idoso que você cuida'}
        </p>
      </div>

      <Tabs defaultValue="dados" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dados">Dados Cadastrais</TabsTrigger>
          <TabsTrigger value="medicacoes">Medicações</TabsTrigger>
          <TabsTrigger value="exames">Exames</TabsTrigger>
        </TabsList>

        {/* Tab Dados Cadastrais */}
        <TabsContent value="dados">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Idoso</CardTitle>
              <CardDescription>Informações pessoais e de saúde</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveIdoso} className="space-y-6">
                {/* Foto */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {formData.foto_url ? (
                      <img
                        src={formData.foto_url}
                        alt="Foto do idoso"
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                      />
                    ) : (
                      <UserCircle className="w-32 h-32 text-gray-300" />
                    )}
                  </div>
                  <Label htmlFor="foto-idoso" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Enviando...' : 'Enviar Foto'}
                    </div>
                    <Input
                      id="foto-idoso"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </Label>
                </div>

                {/* Dados Básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idade">Idade *</Label>
                    <Input
                      id="idade"
                      name="idade"
                      type="number"
                      value={formData.idade}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="altura">Altura (cm) *</Label>
                    <Input
                      id="altura"
                      name="altura"
                      type="number"
                      step="0.01"
                      value={formData.altura}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cartao_sus">Cartão SUS</Label>
                    <Input
                      id="cartao_sus"
                      name="cartao_sus"
                      value={formData.cartao_sus}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Condição de Saúde */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doencas">Doenças Existentes</Label>
                    <Textarea
                      id="doencas"
                      name="doencas"
                      value={formData.doencas}
                      onChange={handleChange}
                      placeholder="Liste as doenças conhecidas..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condicao_atual">Condição Atual / Disposição</Label>
                    <Textarea
                      id="condicao_atual"
                      name="condicao_atual"
                      value={formData.condicao_atual}
                      onChange={handleChange}
                      placeholder="Descreva a condição atual..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Plano de Saúde */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tem_plano_saude"
                      checked={formData.tem_plano_saude}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, tem_plano_saude: checked })
                      }
                    />
                    <Label htmlFor="tem_plano_saude">Possui Plano de Saúde</Label>
                  </div>

                  {formData.tem_plano_saude && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="plano_saude_nome">Nome do Plano</Label>
                        <Input
                          id="plano_saude_nome"
                          name="plano_saude_nome"
                          value={formData.plano_saude_nome}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="plano_saude_numero">Número da Carteira</Label>
                        <Input
                          id="plano_saude_numero"
                          name="plano_saude_numero"
                          value={formData.plano_saude_numero}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Dados
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Medicações */}
        <TabsContent value="medicacoes">
          <Card>
            <CardHeader>
              <CardTitle>Medicações</CardTitle>
              <CardDescription>Gerencie as medicações do idoso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lista de Medicações */}
              {medicacoes.length > 0 && (
                <div className="space-y-3">
                  {medicacoes.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <Pill className="w-5 h-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{med.nome}</h4>
                        {med.dosagem && <p className="text-sm text-gray-600">Dosagem: {med.dosagem}</p>}
                        {med.horarios && <p className="text-sm text-gray-600">Horários: {med.horarios}</p>}
                        {med.observacoes && <p className="text-sm text-gray-600">{med.observacoes}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMedicacao(med.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar Nova Medicação */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold">Adicionar Medicação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-nome">Nome da Medicação *</Label>
                    <Input
                      id="med-nome"
                      value={novaMedicacao.nome}
                      onChange={(e) =>
                        setNovaMedicacao({ ...novaMedicacao, nome: e.target.value })
                      }
                      placeholder="Ex: Losartana"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-dosagem">Dosagem</Label>
                    <Input
                      id="med-dosagem"
                      value={novaMedicacao.dosagem}
                      onChange={(e) =>
                        setNovaMedicacao({ ...novaMedicacao, dosagem: e.target.value })
                      }
                      placeholder="Ex: 50mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-horarios">Horários</Label>
                    <Input
                      id="med-horarios"
                      value={novaMedicacao.horarios}
                      onChange={(e) =>
                        setNovaMedicacao({ ...novaMedicacao, horarios: e.target.value })
                      }
                      placeholder="Ex: 8h, 20h"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-obs">Observações</Label>
                    <Input
                      id="med-obs"
                      value={novaMedicacao.observacoes}
                      onChange={(e) =>
                        setNovaMedicacao({ ...novaMedicacao, observacoes: e.target.value })
                      }
                      placeholder="Observações adicionais"
                    />
                  </div>
                </div>
                <Button onClick={handleAddMedicacao} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Medicação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Exames */}
        <TabsContent value="exames">
          <Card>
            <CardHeader>
              <CardTitle>Exames</CardTitle>
              <CardDescription>Histórico de exames realizados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lista de Exames */}
              {exames.length > 0 && (
                <div className="space-y-3">
                  {exames.map((exame) => (
                    <div
                      key={exame.id}
                      className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <FileText className="w-5 h-5 text-green-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{exame.nome}</h4>
                        <p className="text-sm text-gray-600">
                          Data: {new Date(exame.data_realizacao).toLocaleDateString('pt-BR')}
                        </p>
                        {exame.resultado && <p className="text-sm text-gray-600">Resultado: {exame.resultado}</p>}
                        {exame.observacoes && <p className="text-sm text-gray-600">{exame.observacoes}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExame(exame.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar Novo Exame */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold">Adicionar Exame</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exame-nome">Nome do Exame *</Label>
                    <Input
                      id="exame-nome"
                      value={novoExame.nome}
                      onChange={(e) =>
                        setNovoExame({ ...novoExame, nome: e.target.value })
                      }
                      placeholder="Ex: Hemograma"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exame-data">Data de Realização</Label>
                    <Input
                      id="exame-data"
                      type="date"
                      value={novoExame.data_realizacao}
                      onChange={(e) =>
                        setNovoExame({ ...novoExame, data_realizacao: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exame-resultado">Resultado</Label>
                    <Input
                      id="exame-resultado"
                      value={novoExame.resultado}
                      onChange={(e) =>
                        setNovoExame({ ...novoExame, resultado: e.target.value })
                      }
                      placeholder="Resumo do resultado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exame-obs">Observações</Label>
                    <Input
                      id="exame-obs"
                      value={novoExame.observacoes}
                      onChange={(e) =>
                        setNovoExame({ ...novoExame, observacoes: e.target.value })
                      }
                      placeholder="Observações adicionais"
                    />
                  </div>
                </div>
                <Button onClick={handleAddExame} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Exame
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
