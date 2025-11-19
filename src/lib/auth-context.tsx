'use client'

// ============================================
// CONTEXTO DE AUTENTICAÇÃO
// Gerencia estado do usuário logado
// ============================================

import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthUser, Tutor } from './types'

interface AuthContextType {
  user: AuthUser | null
  tutor: Tutor | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  register: (email: string, senha: string, tutorData: Partial<Tutor>) => Promise<void>
  logout: () => void
  updateTutor: (tutorData: Partial<Tutor>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [loading, setLoading] = useState(true)

  // Carrega usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('auth_user')
        const storedTutor = localStorage.getItem('tutor_data')
        
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
        if (storedTutor) {
          setTutor(JSON.parse(storedTutor))
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  /**
   * Faz login do usuário
   */
  const login = async (email: string, senha: string) => {
    try {
      // Simula chamada à API
      // Em produção, substituir por chamada real
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      })

      if (!response.ok) {
        throw new Error('Credenciais inválidas')
      }

      const data = await response.json()
      
      setUser(data.user)
      setTutor(data.tutor)
      
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      localStorage.setItem('tutor_data', JSON.stringify(data.tutor))
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  /**
   * Registra novo usuário
   */
  const register = async (email: string, senha: string, tutorData: Partial<Tutor>) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha, tutorData })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar conta')
      }

      const data = await response.json()
      
      setUser(data.user)
      setTutor(data.tutor)
      
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      localStorage.setItem('tutor_data', JSON.stringify(data.tutor))
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    }
  }

  /**
   * Faz logout do usuário
   */
  const logout = () => {
    setUser(null)
    setTutor(null)
    localStorage.removeItem('auth_user')
    localStorage.removeItem('tutor_data')
    localStorage.removeItem('idoso_data')
  }

  /**
   * Atualiza dados do tutor
   */
  const updateTutor = (tutorData: Partial<Tutor>) => {
    if (tutor) {
      const updatedTutor = { ...tutor, ...tutorData }
      setTutor(updatedTutor)
      localStorage.setItem('tutor_data', JSON.stringify(updatedTutor))
    }
  }

  return (
    <AuthContext.Provider value={{ user, tutor, loading, login, register, logout, updateTutor }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
