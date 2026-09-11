'use client'

import { useEffect, useState } from 'react'
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Trash2,
  UserX,
  AlertTriangle,
  MessageSquare,
  MessagesSquare,
  Clock,
  Check,
} from 'lucide-react'
import { adminService } from '@/lib/services/adminService'
import { Report, ReportStatus, ReportActionTaken } from '@/types/database'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [activeTab, setActiveTab] = useState<ReportStatus>('pending')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const loadReports = async (status: ReportStatus) => {
    setLoading(true)
    try {
      const data = await adminService.getReports(status)
      setReports(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports(activeTab)
  }, [activeTab])

  const handleResolveAction = async (reportId: string, action: ReportActionTaken) => {
    const actionLabels = {
      ignored: 'ignorar esta denúncia',
      content_deleted: 'excluir o conteúdo denunciado',
      user_blocked: 'bloquear o usuário infrator e remover o conteúdo',
    }

    if (!confirm(`Confirmar ação: Deseja ${actionLabels[action]}?`)) {
      return
    }

    setActionId(reportId)
    try {
      await adminService.resolveReport(reportId, action)
      setReports((prev) => prev.filter((r) => r.id !== reportId))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Fila de Moderação de Denúncias</h2>
          <p className="text-xs text-slate-400">
            Revise alertas enviados pela comunidade e tome ações rápidas de proteção.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'resolved'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolvidas
          </button>
          <button
            onClick={() => setActiveTab('ignored')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ignored'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ignoradas
          </button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Carregando fila de denúncias...
        </div>
      ) : reports.length === 0 ? (
        <div className="py-20 rounded-2xl border border-slate-800/80 bg-slate-900/20 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">
            Nenhuma denúncia {activeTab === 'pending' ? 'pendente' : activeTab}!
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'Tudo em ordem na comunidade. Novos relatos de usuários aparecerão aqui.'
              : 'Não há registros nesta categoria de histórico.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => {
            const isTopic = Boolean(report.topic_id)
            const contentAuthor = isTopic ? report.topic?.author : report.comment?.author

            return (
              <div
                key={report.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all shadow-lg space-y-4"
              >
                {/* Meta header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {report.reason}
                    </span>

                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                      {isTopic ? (
                        <>
                          <MessageSquare className="w-3 h-3 text-indigo-400" />
                          <span>Tópico</span>
                        </>
                      ) : (
                        <>
                          <MessagesSquare className="w-3 h-3 text-cyan-400" />
                          <span>Comentário</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(report.created_at).toLocaleString('pt-BR')}
                    </span>
                    <span>·</span>
                    <span>
                      Denunciado por{' '}
                      <strong className="text-slate-200">@{report.reporter?.username}</strong>
                    </span>
                  </div>
                </div>

                {/* Content Details Box */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Conteúdo postado por:{' '}
                      <strong className="text-indigo-300">
                        @{contentAuthor?.username || 'desconhecido'}
                      </strong>
                    </span>
                    {report.details && (
                      <span className="text-rose-400 italic">
                        Motivo do denunciante: &ldquo;{report.details}&rdquo;
                      </span>
                    )}
                  </div>

                  {isTopic && report.topic && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{report.topic.title}</h4>
                      <p className="text-xs text-slate-300">{report.topic.content}</p>
                    </div>
                  )}

                  {!isTopic && report.comment && (
                    <div>
                      <p className="text-xs text-slate-300 italic">&ldquo;{report.comment.content}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* 3 Mod Actions Bar (from 00 - prd dashboard.txt) */}
                {report.status === 'pending' && (
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    {/* Ação 1: Ignorar */}
                    <button
                      onClick={() => handleResolveAction(report.id, 'ignored')}
                      disabled={actionId === report.id}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700 disabled:opacity-40"
                    >
                      <Check className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ignorar Denúncia</span>
                    </button>

                    {/* Ação 2: Excluir Conteúdo */}
                    <button
                      onClick={() => handleResolveAction(report.id, 'content_deleted')}
                      disabled={actionId === report.id}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Excluir Conteúdo</span>
                    </button>

                    {/* Ação 3: Bloquear Usuário */}
                    <button
                      onClick={() => handleResolveAction(report.id, 'user_blocked')}
                      disabled={actionId === report.id}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-600/20 disabled:opacity-40"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Bloquear Usuário Infrator</span>
                    </button>
                  </div>
                )}

                {report.status !== 'pending' && (
                  <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Resolução:</span>
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                      {report.action_taken === 'ignored'
                        ? 'Denúncia Ignorada'
                        : report.action_taken === 'content_deleted'
                        ? 'Conteúdo Excluído'
                        : report.action_taken === 'user_blocked'
                        ? 'Usuário Bloqueado'
                        : report.status}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
