'use client'

// ============================================
// COMPONENTE: Navbar de Navegação
// ============================================

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heart, LayoutDashboard, User, Calendar, LogOut, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { tutor, logout } = useAuth()
  const [eventosNaoLidos, setEventosNaoLidos] = useState(0)

  useEffect(() => {
    // Carrega eventos não lidos
    if (tutor) {
      const eventosData = localStorage.getItem(`eventos_tutor_${tutor.id}`)
      if (eventosData) {
        const eventos = JSON.parse(eventosData)
        const naoLidos = eventos.filter((e: any) => !e.lido).length
        setEventosNaoLidos(naoLidos)
      }
    }
  }, [tutor, pathname])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">Portal do Tutor</h1>
              <p className="text-xs text-gray-600">Cuidando com amor</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/dashboard">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                className={isActive('/dashboard') ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/idoso">
              <Button
                variant={isActive('/dashboard/idoso') ? 'default' : 'ghost'}
                className={isActive('/dashboard/idoso') ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
              >
                <User className="w-4 h-4 mr-2" />
                Gerenciar Idoso
              </Button>
            </Link>
            <Link href="/dashboard/eventos">
              <Button
                variant={isActive('/dashboard/eventos') ? 'default' : 'ghost'}
                className={`relative ${isActive('/dashboard/eventos') ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Eventos
                {eventosNaoLidos > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">{eventosNaoLidos}</Badge>
                )}
              </Button>
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Menu</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/idoso" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Gerenciar Idoso
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/eventos" className="cursor-pointer">
                      <Calendar className="w-4 h-4 mr-2" />
                      Eventos
                      {eventosNaoLidos > 0 && (
                        <Badge className="ml-2 bg-red-500 text-white text-xs">{eventosNaoLidos}</Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {tutor?.nome?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <span className="hidden lg:inline">{tutor?.nome || 'Tutor'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-semibold">{tutor?.nome}</p>
                      <p className="text-xs text-gray-500">{tutor?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
