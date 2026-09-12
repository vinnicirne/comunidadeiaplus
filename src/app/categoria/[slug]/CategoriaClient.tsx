'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toggleTopicLike, toggleTopicSave } from '@/lib/actions/topic'

interface CategoriaClientProps {
  currentCategory: any
  initialTopics: any[]
  user: any
  initialSort?: string
}

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function CategoriaClient({
  currentCategory,
  initialTopics = [],
  user,
  initialSort = 'recentes',
}: CategoriaClientProps) {
  const [topics, setTopics] = useState<any[]>(initialTopics)
  const [searchFilter, setSearchFilter] = useState('')
  const [currentSort, setCurrentSort] = useState(initialSort)
  
  // Local state for optimistic upvotes and bookmarks
  const [votedTopicIds, setVotedTopicIds] = useState<Record<string, boolean>>({})
  const [savedTopicIds, setSavedTopicIds] = useState<Record<string, boolean>>({})
  const [, startTransition] = useTransition()

  const isEmoji = (str?: string) => Boolean(str && !/^[a-zA-Z0-9_ -]+$/.test(str))

  const handleVote = (topicId: string, slug: string, currentCount: number) => {
    if (!user) {
      window.location.href = `/login?next=/categoria/${currentCategory.slug}`
      return
    }

    const hasVoted = !!votedTopicIds[topicId]
    const delta = hasVoted ? -1 : 1

    // Optimistic update
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

  const handleToggleSave = (topicId: string, slug: string) => {
    if (!user) {
      window.location.href = `/login?next=/categoria/${currentCategory.slug}`
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

  // Filter & Sort logic
  const query = searchFilter.toLowerCase().trim()
  let displayedTopics = query
    ? topics.filter(t => {
        const titleMatch = t.title?.toLowerCase().includes(query)
        const contentMatch = t.content?.toLowerCase().includes(query)
        const authorMatch = t.author?.username?.toLowerCase().includes(query) || t.author?.full_name?.toLowerCase().includes(query)
        return titleMatch || contentMatch || authorMatch
      })
    : [...topics]

  if (currentSort === 'votadas') {
    displayedTopics.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
  } else if (currentSort === 'alta') {
    displayedTopics.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
  } else {
    displayedTopics.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const totalLikes = topics.reduce((acc, t) => acc + (t.likes_count || 0), 0)
  const totalComments = topics.reduce((acc, t) => acc + (t.comments_count || 0), 0)

  return (
    <div className="flex flex-col w-full gap-space-lg">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-on-surface-variant font-mono text-xs tracking-wider uppercase font-semibold">
        <Link href="/" className="hover:text-primary transition-colors">INÍCIO</Link>
        <span className="text-outline">/</span>
        <Link href="/explorar" className="hover:text-primary transition-colors">CATEGORIAS</Link>
        <span className="text-outline">/</span>
        <span className="text-primary font-bold">{currentCategory.name.toUpperCase()}</span>
      </div>

      {/* Header Contextual da Categoria */}
      <section className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm border border-outline-variant/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md relative z-10">
          <div className="flex items-center gap-space-md">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              {isEmoji(currentCategory.icon) ? (
                <span className="text-[32px] leading-none select-none">{currentCategory.icon}</span>
              ) : (
                <span className="material-symbols-outlined text-[32px] text-primary">
                  {currentCategory.icon || 'category'}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-sm flex-wrap">
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                  {currentCategory.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-label-sm text-label-sm font-semibold">
                  Oficial
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Comunidade de debates e arquiteturas
              </span>
            </div>
          </div>

          {/* Quick Action */}
          <div className="flex items-center gap-space-sm w-full sm:w-auto relative z-10">
            {user ? (
              <Link
                href={`/criar-topico?category=${currentCategory.id}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-space-md py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="whitespace-nowrap">Nova discussão</span>
              </Link>
            ) : (
              <Link
                href="/cadastro"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-space-md py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span className="whitespace-nowrap">Participar da Comunidade</span>
              </Link>
            )}
          </div>
        </div>

        {/* Descrição */}
        <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed max-w-3xl mt-4 relative z-10">
          {currentCategory.description ||
            `Explore discussões técnicas, benchmarks e arquiteturas sobre ${currentCategory.name}.`}
        </p>

        {/* Métricas Reais da Categoria */}
        <div className="flex flex-wrap items-center gap-space-md sm:gap-space-xl pt-space-md relative z-10 border-t border-surface-container mt-space-md text-on-surface-variant font-label-sm text-label-sm">
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">
              {topics.length}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {topics.length === 1 ? 'discussão ativa' : 'discussões ativas'}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">
              {totalComments}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {totalComments === 1 ? 'resposta técnica' : 'respostas técnicas'}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-headline-md text-headline-md text-primary font-bold font-mono">
              {totalLikes}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              upvotes &lt;/&gt;
            </span>
          </div>
        </div>
      </section>

      {/* Barra de Filtros e Busca */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm">
        {/* Sort Tabs */}
        <div className="flex items-center gap-space-xs bg-surface-container-low p-1.5 rounded-xl overflow-x-auto shadow-xs">
          <button
            onClick={() => setCurrentSort('recentes')}
            className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-colors whitespace-nowrap ${
              currentSort === 'recentes'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            Mais recentes
          </button>
          <button
            onClick={() => setCurrentSort('votadas')}
            className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-colors whitespace-nowrap ${
              currentSort === 'votadas'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            Mais curtidas
          </button>
          <button
            onClick={() => setCurrentSort('alta')}
            className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-colors whitespace-nowrap ${
              currentSort === 'alta'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            Em alta
          </button>
        </div>

        {/* Real-time Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm pl-9 pr-4 py-2 rounded-xl border border-outline-variant/40 focus:outline-none focus:border-primary transition-all shadow-xs"
            placeholder={`Filtrar em ${currentCategory.name}...`}
            type="text"
          />
        </div>
      </section>

      {/* Feed de Discussões */}
      <section className="flex flex-col gap-space-md">
        {displayedTopics.length === 0 ? (
          <div className="p-space-xl text-center bg-surface-container-lowest rounded-2xl font-body-md text-on-surface-variant shadow-sm border border-outline-variant/30 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[28px]">forum</span>
            </div>
            <div className="flex flex-col max-w-md">
              <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                {searchFilter.trim()
                  ? 'Nenhuma discussão encontrada para a busca'
                  : `Nenhuma discussão publicada em ${currentCategory.name}`}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {searchFilter.trim()
                  ? 'Tente utilizar outras palavras-chave ou limpe o campo de busca.'
                  : 'Seja o primeiro a compartilhar um desafio, benchmark ou tutorial nesta categoria.'}
              </span>
            </div>
            <Link
              href={`/criar-topico?category=${currentCategory.id}`}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Iniciar primeira discussão</span>
            </Link>
          </div>
        ) : (
          displayedTopics.map((topic) => {
            const hasVoted = !!votedTopicIds[topic.id]
            const isSaved = !!savedTopicIds[topic.id]

            return (
              <article
                key={topic.id}
                className="group bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 rounded-2xl p-space-md sm:p-space-lg shadow-sm hover:shadow-md flex gap-space-md sm:gap-space-lg border border-outline-variant/30"
              >
                {/* Rail de Likes </> Interativo */}
                <button
                  onClick={() => handleVote(topic.id, topic.slug, topic.likes_count || 0)}
                  className={`flex flex-col items-center justify-center shrink-0 px-2.5 py-2 rounded-xl transition-all border ${
                    hasVoted
                      ? 'bg-primary/15 text-primary border-primary/40 shadow-xs'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary border-outline-variant/30'
                  }`}
                  title="Dar upvote nesta discussão"
                  type="button"
                >
                  <span className="font-mono text-xs font-bold leading-none select-none">
                    &lt;/&gt;
                  </span>
                  <span className="font-label-md text-label-md font-bold text-on-surface py-0.5 select-none">
                    {topic.likes_count || 0}
                  </span>
                </button>

                {/* Conteúdo da Discussão */}
                <div className="flex flex-col gap-space-xs flex-1 min-w-0">
                  {/* Metadados do Topo */}
                  <div className="flex items-center justify-between gap-space-sm flex-wrap">
                    <div className="flex items-center gap-space-xs min-w-0">
                      {topic.author?.avatar_url ? (
                        <img
                          src={topic.author.avatar_url}
                          alt={topic.author.username || 'Avatar'}
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-outline-variant/30"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0 uppercase border border-primary/20">
                          {topic.author?.username?.slice(0, 1) || 'M'}
                        </div>
                      )}
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                        {topic.author?.full_name || topic.author?.username || 'Membro'}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                        @{topic.author?.username || 'membro'}
                      </span>
                      <span className="text-on-surface-variant text-body-sm shrink-0">·</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant shrink-0">
                        {formatDate(topic.created_at)}
                      </span>
                    </div>

                    <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-label-sm text-label-sm font-semibold">
                      {currentCategory.name}
                    </span>
                  </div>

                  {/* Título */}
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors leading-snug mt-1">
                    <Link href={`/topico/${topic.slug}`} className="block focus:outline-none">
                      {topic.title}
                    </Link>
                  </h2>

                  {/* Resumo */}
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed mt-0.5">
                    {topic.content}
                  </p>

                  {/* Rodapé de Métricas e Ações */}
                  <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm mt-1.5">
                    <div className="flex items-center gap-space-md sm:gap-space-lg">
                      <Link
                        href={`/topico/${topic.slug}`}
                        className="inline-flex items-center gap-1 hover:text-primary transition-colors font-medium"
                      >
                        <span className="material-symbols-outlined text-[16px]">forum</span>
                        <span>{topic.comments_count || 0} respostas</span>
                      </Link>
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>{topic.views_count || 0} visualizações</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSave(topic.id, topic.slug)}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                          isSaved
                            ? 'text-primary bg-primary/10'
                            : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                        }`}
                        title={isSaved ? 'Remover dos Salvos' : 'Salvar discussão'}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isSaved ? 'bookmark' : 'bookmark_border'}
                        </span>
                      </button>

                      <Link
                        href={`/topico/${topic.slug}`}
                        className="text-primary hover:underline font-label-sm text-label-sm font-semibold inline-flex items-center gap-0.5"
                      >
                        <span>Acessar</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </section>

      {/* Indicador de Discussões */}
      {displayedTopics.length > 0 && (
        <section className="flex items-center justify-between py-space-md font-label-md text-label-md border-t border-surface-container mt-space-md text-on-surface-variant">
          <span className="font-body-sm text-body-sm">
            Exibindo <span className="font-semibold text-on-surface">{displayedTopics.length}</span>{' '}
            {displayedTopics.length === 1 ? 'discussão' : 'discussões'} em {currentCategory.name}
          </span>
          <Link
            href="/explorar"
            className="text-primary hover:underline font-label-sm text-label-sm font-semibold"
          >
            Ver todas as categorias →
          </Link>
        </section>
      )}

    </div>
  )
}
