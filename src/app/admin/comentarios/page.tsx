'use client'

import { useEffect, useState } from 'react'
import { Search, MessagesSquare, Trash2, ExternalLink, ThumbsUp } from 'lucide-react'
import { adminService } from '@/lib/services/adminService'
import { Comment } from '@/types/database'

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const loadComments = async (query = '') => {
    setLoading(true)
    try {
      const data = await adminService.getComments(query)
      setComments(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments(searchTerm)
  }, [searchTerm])

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) {
      return
    }
    setActionId(commentId)
    try {
      await adminService.deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Moderação de Comentários</h2>
          <p className="text-xs text-slate-400">
            Acompanhe o conteúdo postado nas discussões e remova spam ou respostas impróprias.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar no conteúdo dos comentários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Comments List Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Comentário & Autor</th>
                <th className="px-6 py-4">Contexto da Discussão</th>
                <th className="px-6 py-4">Curtidas</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Carregando comentários...
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Nenhum comentário encontrado.
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">
                            @{comment.author?.username}
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {comment.author?.role === 'admin' ? '(Admin)' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                          {comment.content}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Tópico Pai
                        </span>
                        <p className="font-medium text-slate-200 line-clamp-2">
                          {comment.topic?.title || 'Tópico não identificado'}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-bold">{comment.likes_count}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Ver Contexto no Fórum */}
                        {comment.topic?.slug && (
                          <a
                            href={`/topico/${comment.topic.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Ver contexto da discussão"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {/* Excluir Comentário */}
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={actionId === comment.id}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors disabled:opacity-40"
                          title="Excluir comentário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
