'use client'

import { useEffect, useState } from 'react'
import { Search, Trash2, ExternalLink, Code2 } from 'lucide-react'
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
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Moderação de Comentários</h2>
          <p className="text-xs text-on-surface-variant">
            Acompanhe o conteúdo postado nas discussões e remova spam ou respostas impróprias.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar no conteúdo dos comentários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container/60 border border-outline-variant/40 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Comments List Table */}
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container/50 text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4">Comentário & Autor</th>
                <th className="px-6 py-4">Contexto da Discussão</th>
                <th className="px-6 py-4">Votos Neurais</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Carregando comentários...
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                    Nenhum comentário encontrado.
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-surface-container/40 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-on-surface">
                            @{comment.author?.username || 'membro'}
                          </span>
                          {comment.author?.role === 'admin' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface leading-relaxed bg-surface-container/40 p-2.5 rounded-xl border border-outline-variant/30">
                          {comment.content}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                          Tópico Pai
                        </span>
                        <p className="font-medium text-on-surface line-clamp-2">
                          {comment.topic?.title || 'Tópico não identificado'}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <Code2 className="w-3.5 h-3.5 text-primary font-bold" />
                        <span className="font-bold text-on-surface">{comment.likes_count}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Ver Contexto no Fórum */}
                        {comment.topic?.slug && (
                          <a
                            href={`/topico/${comment.topic.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                            title="Ver contexto da discussão"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {/* Excluir Comentário */}
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={actionId === comment.id}
                          className="p-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 transition-colors disabled:opacity-40"
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
