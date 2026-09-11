'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  MessageSquareText,
  MessagesSquare,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FolderTree,
  ExternalLink,
} from 'lucide-react'
import { adminService } from '@/lib/services/adminService'
import { AdminKPIs, Topic, Report } from '@/types/database'

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<AdminKPIs | null>(null)
  const [recentTopics, setRecentTopics] = useState<Topic[]>([])
  const [pendingReports, setPendingReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [kpiData, topicsData, reportsData] = await Promise.all([
          adminService.getKPIs(),
          adminService.getTopics(),
          adminService.getReports('pending'),
        ])
        setKpis(kpiData)
        setRecentTopics(topicsData.slice(0, 5))
        setPendingReports(reportsData.slice(0, 4))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading || !kpis) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const kpiCards = [
    {
      title: 'Usuários Cadastrados',
      value: kpis.totalUsers,
      subtext: `${kpis.activeUsers} ativos · ${kpis.blockedUsers} bloqueados`,
      icon: Users,
      href: '/admin/usuarios',
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30',
      badge: `${kpis.activeUsers} ativos`,
    },
    {
      title: 'Tópicos Criados',
      value: kpis.totalTopics,
      subtext: `${kpis.publishedTopics} publicados · ${kpis.hiddenTopics} ocultos`,
      icon: MessageSquareText,
      href: '/admin/topicos',
      color: 'from-violet-500/20 to-purple-500/10 text-violet-400 border-violet-500/30',
      badge: `${kpis.publishedTopics} visíveis`,
    },
    {
      title: 'Total de Comentários',
      value: kpis.totalComments,
      subtext: 'Discussões ativas na comunidade',
      icon: MessagesSquare,
      href: '/admin/comentarios',
      color: 'from-cyan-500/20 to-teal-500/10 text-cyan-400 border-cyan-500/30',
      badge: 'Engajamento',
    },
    {
      title: 'Denúncias Pendentes',
      value: kpis.pendingReports,
      subtext: kpis.pendingReports > 0 ? 'Atenção necessária imediatamente' : 'Fila de moderação zerada',
      icon: ShieldAlert,
      href: '/admin/denuncias',
      color:
        kpis.pendingReports > 0
          ? 'from-rose-500/30 to-red-500/10 text-rose-400 border-rose-500/40 ring-1 ring-rose-500/30'
          : 'from-emerald-500/20 to-green-500/10 text-emerald-400 border-emerald-500/30',
      badge: kpis.pendingReports > 0 ? 'Revisar agora' : 'Limpo',
      highlight: kpis.pendingReports > 0,
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Alert se houver denúncias */}
      {kpis.pendingReports > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/60 to-red-950/30 border border-rose-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-200">
                Você possui {kpis.pendingReports} denúncia(s) pendente(s) de moderação
              </h3>
              <p className="text-xs text-rose-300/80">
                Acesse a fila para aplicar ações como ignorar, excluir conteúdo ou bloquear usuários.
              </p>
            </div>
          </div>
          <Link
            href="/admin/denuncias"
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
          >
            <span>Moderar Agora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-5 rounded-2xl bg-slate-900/60 border ${card.color} hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-200 group relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-950/80 border border-white/10 text-slate-300">
                  {card.badge}
                </span>
              </div>
              <div className="text-3xl font-black text-white tracking-tight mb-1">
                {card.value}
              </div>
              <p className="text-xs font-semibold text-slate-300 mb-1">{card.title}</p>
              <p className="text-[11px] text-slate-400">{card.subtext}</p>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions & Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividade Recente: Tópicos */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Últimos Tópicos Publicados</h2>
              <p className="text-xs text-slate-400">Atividade mais recente nas discussões da comunidade</p>
            </div>
            <Link
              href="/admin/topicos"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentTopics.map((topic) => (
              <div key={topic.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{topic.category?.icon || '📁'}</span>
                    <span className="text-xs font-semibold text-slate-400">{topic.category?.name}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400 font-medium">@{topic.author?.username}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 truncate hover:text-indigo-300 transition-colors">
                    {topic.title}
                  </h4>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div className="text-xs text-slate-400">
                    <span className="font-bold text-slate-200">{topic.comments_count}</span> respostas
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      topic.is_published
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {topic.is_published ? 'Publicado' : 'Oculto'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fila de Denúncias Recentes */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Fila de Moderação</h2>
                <p className="text-xs text-slate-400">Denúncias aguardando análise</p>
              </div>
              <Link
                href="/admin/denuncias"
                className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <span>Fila ({pendingReports.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingReports.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-medium">Nenhuma denúncia pendente!</p>
                <p className="text-[11px] text-slate-400">A comunidade está sem ocorrências no momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-rose-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {report.reason}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        por @{report.reporter?.username}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 italic">
                      &ldquo;{report.topic?.title || report.comment?.content}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <Link
              href="/admin/categorias"
              className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-400" />
                <span>Gerenciar Categorias da Comunidade</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
