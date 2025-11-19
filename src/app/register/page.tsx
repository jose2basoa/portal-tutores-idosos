'use client'

// ============================================
// PÁGINA DE REGISTRO - Cadastro do Tutor
// ============================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ContatoEmergencia } from '@/lib/types'
import { generateId } from '@/lib/storage'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Dados básicos, 2: Endereço e contatos

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    confirmarSenha: '',
    nome: '',
    documento: '',
    idade: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    contatosEmergencia: [
      { id: generateId(), nome: '', telefone: '' },
      { id: generateId(), nome: '', telefone: '' },
      { id: generateId(), nome: '', telefone: '' }
    ] as ContatoEmergencia[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem')
      return
    }

    if (formData.senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await register(formData.email, formData.senha, {
        nome: formData.nome,
        documento: formData.documento,
        idade: parseInt(formData.idade),
        endereco: formData.endereco,
        contatosEmergencia: formData.contatosEmergencia.filter(c => c.nome && c.telefone)
      })
      toast.success('Conta criada com sucesso!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const updateContato = (index: number, field: 'nome' | 'telefone', value: string) => {
    const novosContatos = [...formData.contatosEmergencia]
    novosContatos[index] = { ...novosContatos[index], [field]: value }
    setFormData({ ...formData, contatosEmergencia: novosContatos })
  }

  const addContato = () => {
    setFormData({
      ...formData,
      contatosEmergencia: [
        ...formData.contatosEmergencia,
        { id: generateId(), nome: '', telefone: '' }
      ]
    })
  }

  const removeContato = (index: number) => {
    const novosContatos = formData.contatosEmergencia.filter((_, i) => i !== index)
    setFormData({ ...formData, contatosEmergencia: novosContatos })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-8">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white" fill="white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Passo {step} de 2 - {step === 1 ? 'Dados básicos' : 'Endereço e contatos'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      placeholder="Seu nome completo"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documento">RG/CPF *</Label>
                    <Input
                      id="documento"
                      placeholder="000.000.000-00"
                      value={formData.documento}
                      onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idade">Idade *</Label>
                    <Input
                      id="idade"
                      type="number"
                      placeholder="35"
                      value={formData.idade}
                      onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha *</Label>
                    <Input
                      id="senha"
                      type="password"
                      placeholder="••••••••"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmarSenha}
                      onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Próximo: Endereço e Contatos
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="rua">Rua</Label>
                      <Input
                        id="rua"
                        placeholder="Rua das Flores"
                        value={formData.endereco.rua}
                        onChange={(e) => setFormData({
                          ...formData,
                          endereco: { ...formData.endereco, rua: e.target.value }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        placeholder="123"
                        value={formData.endereco.numero}
                        onChange={(e) => setFormData({
                          ...formData,
                          endereco: { ...formData.endereco, numero: e.target.value }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        placeholder="Centro"
                        value={formData.endereco.bairro}
                        onChange={(e) => setFormData({
                          ...formData,
                          endereco: { ...formData.endereco, bairro: e.target.value }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        placeholder="São Paulo"
                        value={formData.endereco.cidade}
                        onChange={(e) => setFormData({
                          ...formData,
                          endereco: { ...formData.endereco, cidade: e.target.value }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        placeholder="SP"
                        maxLength={2}
                        value={formData.endereco.estado}
                        onChange={(e) => setFormData({
                          ...formData,
                          endereco: { ...formData.endereco, estado: e.target.value.toUpperCase() }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        value={formData.endereco.cep}
                        onChange={(e) => setFormData({
                          ...formData,
                          endereco: { ...formData.endereco, cep: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Contatos de Emergência */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Contatos de Emergência</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addContato}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  {formData.contatosEmergencia.map((contato, index) => (
                    <div key={contato.id} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Nome</Label>
                        <Input
                          placeholder="Nome do contato"
                          value={contato.nome}
                          onChange={(e) => updateContato(index, 'nome', e.target.value)}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          placeholder="(00) 00000-0000"
                          value={contato.telefone}
                          onChange={(e) => updateContato(index, 'telefone', e.target.value)}
                        />
                      </div>
                      {formData.contatosEmergencia.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeContato(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
