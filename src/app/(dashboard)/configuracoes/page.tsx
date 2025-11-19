'use client'

// Página de configurações do tutor
import { useEffect, useState } from 'react'
import { supabase, Tutor } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, Upload, UserCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ConfiguracoesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [tutor, setTutor] = useState<Tutor | null>(null)

  const [formData, setFormData] = useState({
    nome_completo: '',
    documento: '',
    idade: '',
    endereco_rua: '',
    endereco_numero: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_estado: '',
    endereco_cep: '',
    contato_emergencia_1_nome: '',
    contato_emergencia_1_telefone: '',
    contato_emergencia_2_nome: '',
    contato_emergencia_2_telefone: '',
    contato_emergencia_3_nome: '',
    contato_emergencia_3_telefone: '',
    foto_url: '',
  })

  useEffect(() => {
    if (user) {
      loadTutorData()
    }
  }, [user])

  const loadTutorData = async () => {
    try {
      const { data, error } = await supabase
        .from('tutores')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      setTutor(data)
      setFormData({
        nome_completo: data.nome_completo || '',
        documento: data.documento || '',
        idade: data.idade?.toString() || '',
        endereco_rua: data.endereco_rua || '',
        endereco_numero: data.endereco_numero || '',
        endereco_bairro: data.endereco_bairro || '',
        endereco_cidade: data.endereco_cidade || '',
        endereco_estado: data.endereco_estado || '',
        endereco_cep: data.endereco_cep || '',
        contato_emergencia_1_nome: data.contato_emergencia_1_nome || '',
        contato_emergencia_1_telefone: data.contato_emergencia_1_telefone || '',
        contato_emergencia_2_nome: data.contato_emergencia_2_nome || '',
        contato_emergencia_2_telefone: data.contato_emergencia_2_telefone || '',
        contato_emergencia_3_nome: data.contato_emergencia_3_nome || '',
        contato_emergencia_3_telefone: data.contato_emergencia_3_telefone || '',
        foto_url: data.foto_url || '',
      })
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `tutores/${fileName}`

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('tutores')
        .update({
          ...formData,
          idade: parseInt(formData.idade),
        })
        .eq('id', user?.id)

      if (error) throw error

      toast.success('Dados atualizados com sucesso!')
      loadTutorData()
    } catch (error: any) {
      toast.error('Erro ao atualizar dados')
      console.error(error)
    } finally {
      setSaving(false)
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie suas informações pessoais e contatos de emergência
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Tutor</CardTitle>
          <CardDescription>Mantenha suas informações atualizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {formData.foto_url ? (
                  <img
                    src={formData.foto_url}
                    alt="Foto do tutor"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                  />
                ) : (
                  <UserCircle className="w-32 h-32 text-gray-300" />
                )}
              </div>
              <Label htmlFor="foto" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Enviando...' : 'Alterar Foto'}
                </div>
                <Input
                  id="foto"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </Label>
            </div>

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_completo">Nome Completo</Label>
                  <Input
                    id="nome_completo"
                    name="nome_completo"
                    value={formData.nome_completo}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento">RG/CPF</Label>
                  <Input
                    id="documento"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idade">Idade</Label>
                  <Input
                    id="idade"
                    name="idade"
                    type="number"
                    value={formData.idade}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco_rua">Rua</Label>
                  <Input
                    id="endereco_rua"
                    name="endereco_rua"
                    value={formData.endereco_rua}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco_numero">Número</Label>
                  <Input
                    id="endereco_numero"
                    name="endereco_numero"
                    value={formData.endereco_numero}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco_bairro">Bairro</Label>
                  <Input
                    id="endereco_bairro"
                    name="endereco_bairro"
                    value={formData.endereco_bairro}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco_cidade">Cidade</Label>
                  <Input
                    id="endereco_cidade"
                    name="endereco_cidade"
                    value={formData.endereco_cidade}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco_estado">Estado</Label>
                  <Input
                    id="endereco_estado"
                    name="endereco_estado"
                    value={formData.endereco_estado}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco_cep">CEP</Label>
                  <Input
                    id="endereco_cep"
                    name="endereco_cep"
                    value={formData.endereco_cep}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contatos de Emergência */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Contatos de Emergência</h3>

              {/* Contato 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="contato_emergencia_1_nome">Nome do Contato 1</Label>
                  <Input
                    id="contato_emergencia_1_nome"
                    name="contato_emergencia_1_nome"
                    value={formData.contato_emergencia_1_nome}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contato_emergencia_1_telefone">Telefone 1</Label>
                  <Input
                    id="contato_emergencia_1_telefone"
                    name="contato_emergencia_1_telefone"
                    value={formData.contato_emergencia_1_telefone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Contato 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="contato_emergencia_2_nome">Nome do Contato 2</Label>
                  <Input
                    id="contato_emergencia_2_nome"
                    name="contato_emergencia_2_nome"
                    value={formData.contato_emergencia_2_nome}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contato_emergencia_2_telefone">Telefone 2</Label>
                  <Input
                    id="contato_emergencia_2_telefone"
                    name="contato_emergencia_2_telefone"
                    value={formData.contato_emergencia_2_telefone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Contato 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="contato_emergencia_3_nome">Nome do Contato 3</Label>
                  <Input
                    id="contato_emergencia_3_nome"
                    name="contato_emergencia_3_nome"
                    value={formData.contato_emergencia_3_nome}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contato_emergencia_3_telefone">Telefone 3</Label>
                  <Input
                    id="contato_emergencia_3_telefone"
                    name="contato_emergencia_3_telefone"
                    value={formData.contato_emergencia_3_telefone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
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
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
