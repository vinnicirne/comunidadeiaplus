'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toggleTopicLike, toggleTopicSave } from '@/lib/actions/topic'

interface DiscussoesEmAltaClientProps {
  initialTopics: any[]
  categories: any[]
  user: any
  initialCategory?: string
  initialSort?: string
}

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 60) return `há ${Math.max(1, diffMin)} min`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `há ${diffHours} h`
    const diffDays = Math.floor(diffHours / 24)
    return `há ${diffDays} d`
  } catch {
    return 'recentemente'
  }
}

function extractFirstImage(content: string): string | null {
  if (!content) return null
  const match = content.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/)
  if (match && match[1]) return match[1]
  const urlMatch = content.match(/(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp|svg))/i)
  if (urlMatch && urlMatch[1]) return urlMatch[1]
  return null
}

function cleanContentSnippet(content: string): string {
  if (!content) return ''
  return content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`{1,3}.*?`{1,3}/gs, '')
    .trim()
}

export default function DiscussoesEmAltaClient({
  initialTopics = [],
  categories = [],
  user,
  initialCategory = '',
  initialSort = 'votadas',
}: DiscussoesEmAltaClientProps) {
  const [topics, setTopics] = useState<any[]>(initialTopics)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [currentSort, setCurrentSort] = useState(initialSort)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Optimistic upvotes and bookmarks
  const [votedTopicIds, setVotedTopicIds] = useState<Record<string, boolean>>({})
  const [savedTopicIds, setSavedTopicIds] = useState<Record<string, boolean>>({})
  const [, startTransition] = useTransition()

  const handleVote = (topicId: string, slug: string, currentCount: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      window.location.href = `/login?next=/discussoes-em-alta`
      return
    }

    const hasVoted = !!votedTopicIds[topicId]
    const delta = hasVoted ? -1 : 1

    setVotedTopicIds(prev => ({ ...prev, [topicId]: !hasVoted }))
    setTopics(prev =>
      prev.map(t =>
        t.id === topicId
          ? { ...t, likes_count: Math.max(0, (t.likes_count || currentCount) + delta) }
          : t
      )
    )

    startTransition(async () => {
      try {
        await toggleTopicLike(topicId, slug)
      } catch (err) {
        console.error('Erro ao curtir tópico:', err)
      }
    })
  }

  const handleToggleSave = (topicId: string, slug: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      window.location.href = `/login?next=/discussoes-em-alta`
      return
    }

    const isSaved = !!savedTopicIds[topicId]
    setSavedTopicIds(prev => ({ ...prev, [topicId]: !isSaved }))

    startTransition(async () => {
      try {
        await toggleTopicSave(topicId, slug)
      } catch (err) {
        console.error('Erro ao salvar tópico:', err)
      }
    })
  }

  const handleCopyLink = (slug: string, id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/topico/${slug}`)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2500)
    }
  }

  // Filtragem e Ordenação
  const query = searchQuery.toLowerCase().trim()
  let filtered = topics.filter(t => {
    // Filtro de categoria
    if (selectedCategory) {
      const catSlug = t.category?.slug || t.category_slug
      const catId = t.category_id || t.category?.id
      if (catSlug !== selectedCategory && catId !== selectedCategory) {
        return false
      }
    }
    // Filtro de busca
    if (query) {
      const titleMatch = t.title?.toLowerCase().includes(query)
      const contentMatch = t.content?.toLowerCase().includes(query)
      const authorMatch =
        t.author?.username?.toLowerCase().includes(query) ||
        t.author?.full_name?.toLowerCase().includes(query)
      return titleMatch || contentMatch || authorMatch
    }
    return true
  })

  if (currentSort === 'comentadas') {
    filtered.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
  } else if (currentSort === 'recentes') {
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else {
    // 'votadas' ou 'alta' (padrão): likes_count + comments_count ponderado
    filtered.sort((a, b) => {
      const scoreA = (a.likes_count || 0) * 2 + (a.comments_count || 0)
      const scoreB = (b.likes_count || 0) * 2 + (b.comments_count || 0)
      if (scoreB !== scoreA) return scoreB - scoreA
      return (b.likes_count || 0) - (a.likes_count || 0)
    })
  }

  const totalLikes = topics.reduce((acc, t) => acc + (t.likes_count || 0), 0)
  const totalComments = topics.reduce((acc, t) => acc + (t.comments_count || 0), 0)
  const activeCategories = categories.filter((c: any) => c.is_active)

  return (
    <div className="flex flex-col gap-space-xl">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-lg border-b border-outline-variant/30">
        <div className="flex flex-col gap-space-xs max-w-xl">
          <div className="flex items-center gap-space-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
              Ranking Comunitário
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight flex items-center gap-space-sm">
            <span>Discussões em Alta</span>
            <span className="text-primary font-mono text-base font-bold bg-primary/10 px-2 py-0.5 rounded-md">
              &lt;/&gt;
            </span>
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Os tópicos e experimentos com inteligência artificial mais votados e debatidos pela comunidade.
          </p>
        </div>

        <Link
          href="/criar-topico"
          className="inline-flex items-center justify-center gap-space-xs bg-primary text-on-primary font-label-md text-label-md px-space-lg py-space-sm rounded-lg hover:bg-primary-container transition-all shadow-sm font-semibold shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Iniciar Tópico</span>
        </Link>
      </div>

      {/* Metric KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/20 shadow-sm flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">local_fire_department</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {topics.length}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Tópicos ranqueados</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/20 shadow-sm flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-mono font-bold text-sm">
            &lt;/&gt;
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {totalLikes}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Votos de IA registrados</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/20 shadow-sm flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">forum</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {totalComments}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Respostas colaborativas</span>
          </div>
        </div>
      </div>

      {/* Search & Sorting Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md bg-surface-container-low p-2 rounded-xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar em discussões em alta..."
            className="w-full pl-10 pr-9 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5 rounded-full"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Sort Pill Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto self-end md:self-auto shrink-0">
          <button
            onClick={() => setCurrentSort('votadas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-all ${
              currentSort === 'votadas'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="font-mono text-xs font-bold">&lt;/&gt;</span>
            <span>Mais votadas</span>
          </button>

          <button
            onClick={() => setCurrentSort('comentadas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-all ${
              currentSort === 'comentadas'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">mode_comment</span>
            <span>Mais comentadas</span>
          </button>

          <button
            onClick={() => setCurrentSort('recentes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-all ${
              currentSort === 'recentes'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Mais recentes</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      {activeCategories.length > 0 && (
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-colors shrink-0 ${
              selectedCategory === ''
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant/30'
            }`}
          >
            Todas ({topics.length})
          </button>

          {activeCategories.map((cat: any) => {
            const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id
            const count = topics.filter(t => (t.category?.slug || t.category_id) === (cat.slug || cat.id)).length
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? '' : cat.slug)}
                className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant/30'
                }`}
              >
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Discussion List Stack */}
      <div className="flex flex-col gap-space-md">
        {filtered.length === 0 ? (
          <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/30 shadow-sm text-center flex flex-col items-center gap-space-md">
            <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[30px]">search_off</span>
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Nenhuma discussão encontrada
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {searchQuery || selectedCategory
                  ? 'Não encontramos resultados para os filtros selecionados. Tente ajustar o termo de busca.'
                  : 'Nenhum tópico em alta disponível no momento.'}
              </p>
            </div>
            <div className="flex items-center gap-space-sm pt-space-xs">
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                  }}
                  className="px-space-md py-space-xs rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm hover:bg-surface-container transition-colors font-medium"
                >
                  Limpar Filtros
                </button>
              )}
              <Link
                href="/criar-topico"
                className="px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container transition-colors font-medium"
              >
                Criar Nova Discussão
              </Link>
            </div>
          </div>
        ) : (
          filtered.map((topic, index) => {
            const hasVoted = !!votedTopicIds[topic.id]
            const isSaved = !!savedTopicIds[topic.id]
            const thumbnail = extractFirstImage(topic.content)
            const cleanSnippet = cleanContentSnippet(topic.content)
            const isTop3 = index < 3 && currentSort === 'votadas' && !searchQuery && !selectedCategory

            return (
              <article
                key={topic.id}
                className="group bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm hover:shadow-md transition-all duration-200 border border-outline-variant/20 flex gap-space-md sm:gap-space-lg relative"
              >
                {/* Ranking Position Badge (Top 3) */}
                {isTop3 && (
                  <div
                    className={`absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                      index === 0
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-surface'
                        : index === 1
                        ? 'bg-slate-300 text-slate-900 ring-2 ring-surface'
                        : 'bg-amber-700 text-amber-100 ring-2 ring-surface'
                    }`}
                    title={`Posição #${index + 1} em alta`}
                  >
                    #{index + 1}
                  </div>
                )}

                {/* Vertical Upvote Rail */}
                <div className="flex flex-col items-center justify-start shrink-0 bg-surface-container-low group-hover:bg-surface-container px-2 py-space-xs rounded-lg transition-colors self-start">
                  <button
                    onClick={e => handleVote(topic.id, topic.slug, topic.likes_count || 0, e)}
                    className={`p-1 rounded-md transition-colors ${
                      hasVoted
                        ? 'text-primary bg-primary/20 font-bold'
                        : 'text-on-surface-variant hover:text-primary hover:bg-primary/10'
                    }`}
                    title={hasVoted ? 'Remover voto' : 'Votar neste debate'}
                    type="button"
                    aria-label="Votar"
                  >
                    <span className="font-mono text-xs font-bold leading-none select-none">
                      &lt;/&gt;
                    </span>
                  </button>
                  <span className="font-label-md text-label-md font-semibold text-on-surface py-0.5 select-none">
                    {topic.likes_count || 0}
                  </span>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 flex flex-col gap-space-xs">
                  {/* Author Header */}
                  <div className="flex items-center justify-between gap-space-xs flex-wrap">
                    <div className="flex items-center gap-space-xs min-w-0">
                      {topic.author?.avatar_url ? (
                        <img
                          src={topic.author.avatar_url}
                          alt={topic.author.username || 'Autor'}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                          {topic.author?.username?.slice(0, 1)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                        {topic.author?.full_name || topic.author?.username || 'Membro'}
                      </span>
                      <span className="font-code-md text-label-sm text-on-surface-variant truncate">
                        @{topic.author?.username || 'membro'}
                      </span>
                      <span className="text-on-surface-variant text-body-sm">·</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {formatTimeAgo(topic.created_at)}
                      </span>
                    </div>

                    {topic.category && (
                      <Link
                        href={topic.category.slug === 'blog' ? '/blog' : `/categoria/${topic.category.slug}`}
                        className="shrink-0 px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 font-label-sm text-label-sm font-medium transition-colors"
                      >
                        #{topic.category.name}
                      </Link>
                    )}
                  </div>

                  {/* Title & Preview Grid */}
                  <div className="flex items-start justify-between gap-space-md">
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors tracking-tight">
                        <Link href={`/topico/${topic.slug}`} className="hover:underline">
                          {topic.title}
                        </Link>
                      </h2>

                      {cleanSnippet && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                          {cleanSnippet}
                        </p>
                      )}
                    </div>

                    {thumbnail && (
                      <Link
                        href={`/topico/${topic.slug}`}
                        className="shrink-0 hidden sm:block w-20 h-20 rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container"
                      >
                        <img
                          src={thumbnail}
                          alt={topic.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                    )}
                  </div>

                  {/* Bottom Actions Bar */}
                  <div className="flex items-center justify-between gap-space-sm pt-space-xs mt-1 border-t border-outline-variant/10">
                    <div className="flex items-center gap-space-md text-on-surface-variant">
                      <Link
                        href={`/topico/${topic.slug}#comentarios`}
                        className="flex items-center gap-1.5 font-label-sm text-label-sm hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">forum</span>
                        <span>{topic.comments_count || 0} respostas</span>
                      </Link>

                      <button
                        onClick={e => handleToggleSave(topic.id, topic.slug, e)}
                        className={`flex items-center gap-1 font-label-sm text-label-sm transition-colors ${
                          isSaved ? 'text-primary font-semibold' : 'hover:text-primary'
                        }`}
                        title={isSaved ? 'Salvo' : 'Salvar discussão'}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isSaved ? 'bookmark' : 'bookmark_border'}
                        </span>
                        <span className="hidden sm:inline">{isSaved ? 'Salvo' : 'Salvar'}</span>
                      </button>

                      <button
                        onClick={e => handleCopyLink(topic.slug, topic.id, e)}
                        className="flex items-center gap-1 font-label-sm text-label-sm hover:text-primary transition-colors"
                        title="Copiar link"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {copiedId === topic.id ? 'check' : 'share'}
                        </span>
                        <span className="hidden sm:inline">
                          {copiedId === topic.id ? 'Copiado!' : 'Compartilhar'}
                        </span>
                      </button>
                    </div>

                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {formatDate(topic.created_at)}
                    </span>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
