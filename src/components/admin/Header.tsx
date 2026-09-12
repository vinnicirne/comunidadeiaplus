'use client'

import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { Profile } from '@/types/database'

interface HeaderProps {
  profile?: Profile | null
}

export function Header({ profile }: HeaderProps) {
  const displayName = profile?.full_name || profile?.username || 'Administrador'
  const username = profile?.username || 'admin'
  const roleLabel = profile?.role === 'admin' ? 'Superadmin' : 'Moderador'

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-surface-container-lowest/95 border-b border-outline-variant/30 backdrop-blur-md shadow-sm">
      <div className="h-16 w-full px-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 min-w-[240px]">
          <Link href="/admin" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo className="w-7 h-7 text-primary shrink-0" />
            <span className="text-[15px] text-on-surface font-semibold tracking-tight">Comunidade IA PLUS</span>
          </Link>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
            Painel Admin
          </span>
        </div>
        
        <form action="/admin/topicos" method="GET" className="flex-1 max-w-xl mx-4">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
              search
            </span>
            <input 
              name="search"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container/60 border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 text-[13px] focus:outline-none focus:bg-surface-container focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
              placeholder="Buscar tópicos ou moderações no fórum..." 
              type="text"
            />
          </div>
        </form>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">Sistemas Operacionais</span>
          </div>

          <Link 
            href="/" 
            className="hidden md:flex items-center gap-1 text-[13px] text-on-surface-variant hover:text-primary transition-colors font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Voltar ao Fórum
          </Link>

          <Link
            href="/admin/denuncias"
            className="relative p-2 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="Ver Denúncias"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </Link>

          {/* Perfil Real do Administrador Logado */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-outline-variant/30">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-outline-variant/40" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-[13px] uppercase">
                {displayName.charAt(0)}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[13px] text-on-surface font-semibold leading-tight line-clamp-1">
                {displayName}
              </span>
              <span className="text-[11px] text-on-surface-variant leading-none">
                @{username} • {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
