'use client'

// ============================================
// PÁGINA INICIAL
// Redireciona para login ou dashboard
// ============================================

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      <p className="text-xl text-gray-600">
        Carregando Portal do Tutor...
      </p>
    </div>
  )
}
