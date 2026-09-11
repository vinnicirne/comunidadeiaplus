'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Filter,
  ThumbsUp,
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
          <h2 className="text-xl font-bold text-white tracking-tight">Controle de Tópicos</h2>
          <p className="text-xs text-slate-400">
            Gerenciamento das discussões criadas pela comunidade, moderação e visibilidade.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Categoria Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Topics List Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Tópico & Autor</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Engajamento</th>
                <th className="px-6 py-4">Visibilidade</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Carregando discussões...
                  </td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum tópico encontrado.
                  </td>
                </tr>
              ) : (
                topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-100 line-clamp-1">
                          {topic.title}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                          {topic.content}
                        </p>
                        <div className="text-[11px] text-indigo-400 font-medium">
                          por @{topic.author?.username}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium">
                        <span>{topic.category?.icon}</span>
                        <span>{topic.category?.name}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-slate-400">
                        <span className="flex items-center gap-1" title="Respostas">
                          <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
                          <strong className="text-slate-200">{topic.comments_count}</strong>
                        </span>
                        <span className="flex items-center gap-1" title="Curtidas">
                          <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                          <strong className="text-slate-200">{topic.likes_count}</strong>
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${
                          topic.is_published
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            topic.is_published ? 'bg-emerald-500' : 'bg-slate-500'
                          }`}
                        ></span>
                        {topic.is_published ? 'Publicado' : 'Oculto'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Ver no Fórum */}
                        <a
                          href={`/topico/${topic.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
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
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors disabled:opacity-40"
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
