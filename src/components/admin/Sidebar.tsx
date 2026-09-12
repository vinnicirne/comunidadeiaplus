'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
      icon: 'dashboard',
      exact: true,
    },
    {
      name: 'Usuários',
      href: '/admin/usuarios',
      icon: 'group',
      badge: '1.4k',
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
      badge: pendingReports > 0 ? pendingReports.toString() : null,
      isDanger: true,
    },
    {
      name: 'Categorias',
      href: '/admin/categorias',
      icon: 'category',
    },
  ]

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#111827] border-r border-[#1f2937] shadow-[4px_0_24px_rgba(0,0,0,0.35)] z-40 flex flex-col justify-between py-4">
      <div className="flex flex-col gap-1 px-2">
        <span className="px-4 py-1 text-[12px] text-[#64748b] uppercase tracking-wider font-semibold">
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
                className={`flex items-center justify-between px-4 py-2 transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-white font-semibold rounded-lg border border-indigo-500/40 shadow-sm'
                    : 'rounded-lg text-[#94a3b8] hover:bg-[#1e293b] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? (item.isDanger ? 'text-red-400' : 'text-indigo-500') : (item.isDanger ? 'text-red-400' : '')}`}>
                    {item.icon}
                  </span>
                  <span className="text-[14px]">{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[12px] px-1.5 py-0.5 rounded-full font-medium ${
                      item.isDanger
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-semibold'
                        : 'bg-[#1e293b] border border-[#334155] text-slate-300'
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

      <div className="flex flex-col gap-1 px-2 pt-4">
        <div className="h-px bg-[#1f2937] mx-4 mb-2"></div>
        <span className="px-4 py-1 text-[12px] text-[#64748b] uppercase tracking-wider font-semibold">
          Sistema
        </span>
        <nav className="flex flex-col gap-1">
          <Link href="/admin/auditoria" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#94a3b8] hover:bg-[#1e293b] hover:text-white transition-all">
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span className="text-[14px]">Auditoria Básica</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#94a3b8] hover:bg-[#1e293b] hover:text-white transition-all">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="text-[14px]">Voltar ao Fórum</span>
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all w-full text-left">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-[14px] font-medium">Sair</span>
          </button>
        </nav>
      </div>
    </aside>
  )
}
