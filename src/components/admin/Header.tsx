'use client'

import { usePathname } from 'next/navigation'
import { ShieldCheck, Bell, Sparkles } from 'lucide-react'

export function Header() {
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Visão Geral & Métricas'
    if (pathname?.includes('/usuarios')) return 'Gerenciamento de Usuários'
    if (pathname?.includes('/topicos')) return 'Controle de Tópicos'
    if (pathname?.includes('/comentarios')) return 'Moderação de Comentários'
    if (pathname?.includes('/denuncias')) return 'Fila de Denúncias'
    if (pathname?.includes('/categorias')) return 'Gestão de Categorias'
    return 'Painel Administrativo'
  }

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {getPageTitle()}
        </h1>
        <p className="text-xs text-slate-400">COMUNIDADE IAPLUS — Painel de Controle</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Moderação Ativa</span>
        </div>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 font-bold text-xs">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white">Admin Principal</span>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-[10px] text-slate-400">admin@iaplus.com.br</span>
          </div>
        </div>
      </div>
    </header>
  )
}
