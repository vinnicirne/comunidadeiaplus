'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle2,
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
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Fila de Moderação de Denúncias</h2>
          <p className="text-xs text-on-surface-variant">
            Revise alertas enviados pela comunidade e tome ações rápidas de proteção.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center p-1 bg-surface-container/60 border border-outline-variant/40 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'resolved'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Resolvidas
          </button>
          <button
            onClick={() => setActiveTab('ignored')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ignored'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Ignoradas
          </button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-16 text-center text-on-surface-variant">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Carregando fila de denúncias...
        </div>
      ) : reports.length === 0 ? (
        <div className="py-20 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-on-surface">
            Nenhuma denúncia {activeTab === 'pending' ? 'pendente' : activeTab}!
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
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
                className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 hover:border-outline-variant transition-all shadow-sm space-y-4"
              >
                {/* Meta header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-error/10 text-error border border-error/20 text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {report.reason}
                    </span>

                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-surface-container text-on-surface text-[11px] font-medium border border-outline-variant/30">
                      {isTopic ? (
                        <>
                          <MessageSquare className="w-3 h-3 text-primary" />
                          <span>Tópico</span>
                        </>
                      ) : (
                        <>
                          <MessagesSquare className="w-3 h-3 text-primary" />
                          <span>Comentário</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(report.created_at).toLocaleString('pt-BR')}
                    </span>
                    <span>·</span>
                    <span>
                      Denunciado por{' '}
                      <strong className="text-on-surface">@{report.reporter?.username || 'membro'}</strong>
                    </span>
                  </div>
                </div>

                {/* Content Details Box */}
                <div className="p-4 rounded-xl bg-surface-container/50 border border-outline-variant/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>
                      Conteúdo postado por:{' '}
                      <strong className="text-primary font-semibold">
                        @{contentAuthor?.username || 'desconhecido'}
                      </strong>
                    </span>
                    {report.details && (
                      <span className="text-error italic">
                        Motivo detalhado: &ldquo;{report.details}&rdquo;
                      </span>
                    )}
                  </div>

                  {isTopic && report.topic && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-on-surface">{report.topic.title}</h4>
                      <p className="text-xs text-on-surface-variant">{report.topic.content}</p>
                    </div>
                  )}

                  {!isTopic && report.comment && (
                    <div>
                      <p className="text-xs text-on-surface italic">&ldquo;{report.comment.content}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* 3 Mod Actions Bar */}
                {report.status === 'pending' && (
                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                    {/* Ação 1: Ignorar */}
                    <button
                      onClick={() => handleResolveAction(report.id, 'ignored')}
                      disabled={actionId === report.id}
                      className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center gap-1.5 border border-outline-variant/40 disabled:opacity-40"
                    >
                      <Check className="w-3.5 h-3.5 text-on-surface-variant" />
                      <span>Ignorar Denúncia</span>
                    </button>

                    {/* Ação 2: Excluir Conteúdo */}
                    <button
                      onClick={() => handleResolveAction(report.id, 'content_deleted')}
                      disabled={actionId === report.id}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Excluir Conteúdo</span>
                    </button>

                    {/* Ação 3: Bloquear Usuário */}
                    <button
                      onClick={() => handleResolveAction(report.id, 'user_blocked')}
                      disabled={actionId === report.id}
                      className="px-3.5 py-2 rounded-xl bg-error hover:bg-error/90 text-on-error text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Bloquear Infrator</span>
                    </button>
                  </div>
                )}

                {report.status !== 'pending' && (
                  <div className="flex items-center justify-end gap-2 text-xs text-on-surface-variant">
                    <span className="font-semibold text-on-surface">Resolução:</span>
                    <span className="capitalize px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface border border-outline-variant/30 text-[11px] font-medium">
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
