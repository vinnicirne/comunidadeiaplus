'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Code2,
  MessageCircle,
} from 'lucide-react'
import { adminService } from '@/lib/services/adminService'
import { Topic, Category } from '@/types/database'

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [topicsData, categoriesData] = await Promise.all([
        adminService.getTopics(selectedCategory, searchTerm),
        adminService.getCategories(),
      ])
      setTopics(topicsData)
      setCategories(categoriesData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedCategory, searchTerm])

  const handleTogglePublish = async (topicId: string) => {
    setActionId(topicId)
    try {
      const updated = await adminService.togglePublishTopic(topicId)
      if (updated) {
        setTopics((prev) => prev.map((t) => (t.id === topicId ? updated : t)))
      }
    } finally {
      setActionId(null)
    }
  }

  const handleDeleteTopic = async (topicId: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o tópico "${title}"? Todos os comentários relacionados serão removidos.`)) {
      return
    }
    setActionId(topicId)
    try {
      await adminService.deleteTopic(topicId)
      setTopics((prev) => prev.filter((t) => t.id !== topicId))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Controle de Tópicos</h2>
          <p className="text-xs text-on-surface-variant">
            Gerenciamento das discussões criadas pela comunidade, moderação e visibilidade.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Categoria Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-surface-container/60 border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-container/60 border border-outline-variant/40 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Topics List Table */}
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container/50 text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4">Tópico & Autor</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Engajamento</th>
                <th className="px-6 py-4">Visibilidade</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Carregando discussões...
                  </td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                    Nenhum tópico encontrado.
                  </td>
                </tr>
              ) : (
                topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-surface-container/40 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="space-y-1">
                        <div className="font-semibold text-on-surface line-clamp-1">
                          {topic.title}
                        </div>
                        <p className="text-[11px] text-on-surface-variant line-clamp-1 italic">
                          {topic.content}
                        </p>
                        <div className="text-[11px] text-primary font-medium">
                          por @{topic.author?.username || 'membro'}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-medium text-[11px]">
                        <span>{topic.category?.icon || '📁'}</span>
                        <span>{topic.category?.name || 'Geral'}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="flex items-center gap-1" title="Respostas">
                          <MessageCircle className="w-3.5 h-3.5 text-primary" />
                          <strong className="text-on-surface">{topic.comments_count}</strong>
                        </span>
                        <span className="flex items-center gap-1" title="Votos Neurais">
                          <Code2 className="w-3.5 h-3.5 text-primary font-bold" />
                          <strong className="text-on-surface">{topic.likes_count}</strong>
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1.5 ${
                          topic.is_published
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-surface-container text-on-surface-variant border border-outline-variant/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            topic.is_published ? 'bg-emerald-500' : 'bg-outline'
                          }`}
                        ></span>
                        {topic.is_published ? 'Publicado' : 'Oculto'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Ver no Fórum */}
                        <a
                          href={`/topico/${topic.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                          title="Visualizar no fórum público"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Ocultar / Publicar */}
                        <button
                          onClick={() => handleTogglePublish(topic.id)}
                          disabled={actionId === topic.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            topic.is_published
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          } disabled:opacity-40`}
                          title={topic.is_published ? 'Ocultar tópico' : 'Publicar tópico'}
                        >
                          {topic.is_published ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>

                        {/* Excluir Tópico */}
                        <button
                          onClick={() => handleDeleteTopic(topic.id, topic.title)}
                          disabled={actionId === topic.id}
                          className="p-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 transition-colors disabled:opacity-40"
                          title="Excluir tópico"
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
