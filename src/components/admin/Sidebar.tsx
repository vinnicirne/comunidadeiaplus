'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { adminService } from '@/lib/services/adminService'
import { signOut } from '@/lib/actions/auth'

export function Sidebar() {
  const pathname = usePathname()
  const [stats, setStats] = useState<{ pendingReports: number; totalUsers: number }>({
    pendingReports: 0,
    totalUsers: 0,
  })

  useEffect(() => {
    adminService.getKPIs().then((kpis) => {
      setStats({
        pendingReports: kpis.pendingReports,
        totalUsers: kpis.totalUsers,
      })
    }).catch((err) => {
      console.error('Falha ao carregar métricas na Sidebar:', err)
    })
  }, [pathname])

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: 'dashboard',
      exact: true,
    },
    {
      name: 'Usuários',
      href: '/admin/usuarios',
      icon: 'group',
      badge: stats.totalUsers > 0 ? stats.totalUsers.toString() : null,
    },
    {
      name: 'Tópicos / Discussões',
      href: '/admin/topicos',
      icon: 'forum',
    },
    {
      name: 'Comentários',
      href: '/admin/comentarios',
      icon: 'chat_bubble',
    },
    {
      name: 'Denúncias',
      href: '/admin/denuncias',
      icon: 'report',
      badge: stats.pendingReports > 0 ? stats.pendingReports.toString() : null,
      isDanger: true,
    },
    {
      name: 'Categorias',
      href: '/admin/categorias',
      icon: 'category',
    },
  ]

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-lowest border-r border-outline-variant/30 shadow-sm z-40 flex flex-col justify-between py-4">
      <div className="flex flex-col gap-1 px-3">
        <span className="px-3 py-1.5 text-[11px] text-on-surface-variant/70 uppercase tracking-wider font-semibold">
          Moderação & Controle
        </span>
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2 transition-all rounded-xl text-[13px] ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold border border-primary/25 shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-[20px] ${
                    isActive 
                      ? (item.isDanger ? 'text-error' : 'text-primary') 
                      : (item.isDanger && stats.pendingReports > 0 ? 'text-error' : '')
                  }`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      item.isDanger
                        ? 'bg-error/10 text-error border border-error/25 font-semibold'
                        : 'bg-surface-container border border-outline-variant/40 text-on-surface-variant'
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

      <div className="flex flex-col gap-1 px-3 pt-4 border-t border-outline-variant/30">
        <span className="px-3 py-1 text-[11px] text-on-surface-variant/70 uppercase tracking-wider font-semibold">
          Sistema
        </span>
        <nav className="flex flex-col gap-1">
          <Link 
            href="/admin/auditoria" 
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px] text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span>Auditoria & Logs</span>
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px] text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Voltar ao Fórum</span>
          </Link>
          <form action={signOut} className="w-full">
            <button 
              type="submit" 
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px] text-error hover:bg-error/10 transition-all w-full text-left"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="font-medium">Sair da Conta</span>
            </button>
          </form>
        </nav>
      </div>
    </aside>
  )
}
