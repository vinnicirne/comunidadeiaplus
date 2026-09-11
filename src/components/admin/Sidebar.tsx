'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  MessageSquareText,
  MessagesSquare,
  ShieldAlert,
  FolderTree,
  ExternalLink,
  Bot,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminService } from '@/lib/services/adminService'

export function Sidebar() {
  const pathname = usePathname()
  const [pendingReports, setPendingReports] = useState(0)

  useEffect(() => {
    adminService.getKPIs().then((kpis) => {
      setPendingReports(kpis.pendingReports)
    })
  }, [pathname])

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Usuários',
      href: '/admin/usuarios',
      icon: Users,
    },
    {
      name: 'Tópicos',
      href: '/admin/topicos',
      icon: MessageSquareText,
    },
    {
      name: 'Comentários',
      href: '/admin/comentarios',
      icon: MessagesSquare,
    },
    {
      name: 'Denúncias',
      href: '/admin/denuncias',
      icon: ShieldAlert,
      badge: pendingReports > 0 ? pendingReports : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    {
      name: 'Categorias',
      href: '/admin/categorias',
      icon: FolderTree,
    },
  ]

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/70 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Logo & Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-wider text-white">IAPLUS</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Comunidade de IA</p>
          </div>
        </div>

        {/* Menu Section */}
        <div className="p-4">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Gestão & Moderação
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(`${item.href}/`)

              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold animate-pulse ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Footer link to public community */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-300 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Painel 00 MVP</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Controle ativo de usuários, tópicos e moderação ágil em tempo real.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white transition-colors"
        >
          <span>Acessar Fórum Público</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>
    </aside>
  )
}
