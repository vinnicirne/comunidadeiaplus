'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface PesquisarClientProps {
  initialTopics: any[]
  initialArticles: any[]
  initialProfiles: any[]
  categories: any[]
  initialQuery?: string
  initialType?: string
  initialCategory?: string
  initialSort?: string
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

function extractFirstImage(content: string): string | null {
  if (!content) return null
  const match = content.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/)
  if (match && match[1]) return match[1]
  const urlMatch = content.match(/(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp|svg))/i)
  if (urlMatch && urlMatch[1]) return urlMatch[1]
  return null
}

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function PesquisarClient({
  initialTopics = [],
  initialArticles = [],
  initialProfiles = [],
  categories = [],
  initialQuery = '',
  initialType = 'all',
  initialCategory = 'all',
  initialSort = 'recentes',
}: PesquisarClientProps) {
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [selectedType, setSelectedType] = useState(initialType)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [currentSort, setCurrentSort] = useState(initialSort)

  const activeCategories = useMemo(() => categories.filter((c: any) => c.is_active), [categories])

  // Filtragem unificada
  const results = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()

    // 1. Tópicos
    const matchedTopics = initialTopics
      .filter((t) => {
        const matchesCategory =
          selectedCategory === 'all' ||
          t.category?.slug === selectedCategory ||
          t.category_id === selectedCategory

        if (!matchesCategory) return false
        if (!term) return true

        const title = (t.title || '').toLowerCase()
        const content = (t.content || '').toLowerCase()
        const author = (t.author?.username || t.author?.full_name || '').toLowerCase()
        return title.includes(term) || content.includes(term) || author.includes(term)
      })
      .map((t) => ({ ...t, itemType: 'topic' }))

    // 2. Artigos
    const matchedArticles = initialArticles
      .filter((a) => {
        const matchesCategory =
          selectedCategory === 'all' ||
          a.category?.slug === selectedCategory ||
          a.category_id === selectedCategory

        if (!matchesCategory) return false
        if (!term) return true

        const title = (a.title || '').toLowerCase()
        const content = (a.content || a.subtitle || '').toLowerCase()
        const author = (a.author?.username || a.author?.full_name || '').toLowerCase()
        const tags = (a.tags || []).join(' ').toLowerCase()
        return title.includes(term) || content.includes(term) || author.includes(term) || tags.includes(term)
      })
      .map((a) => ({ ...a, itemType: 'article' }))

    // 3. Membros
    const matchedProfiles = initialProfiles
      .filter((p) => {
        if (!term) return false // Só mostra membros se houver termo de busca
        const username = (p.username || '').toLowerCase()
        const fullName = (p.full_name || '').toLowerCase()
        const bio = (p.bio || '').toLowerCase()
        return username.includes(term) || fullName.includes(term) || bio.includes(term)
      })
      .map((p) => ({ ...p, itemType: 'profile' }))

    // Filtrar por tipo
    let combined: any[] = []
    if (selectedType === 'topics') {
      combined = matchedTopics
    } else if (selectedType === 'articles') {
      combined = matchedArticles
    } else if (selectedType === 'members') {
      combined = matchedProfiles
    } else {
      combined = [...matchedTopics, ...matchedArticles, ...matchedProfiles]
    }

    // Ordenação (para tópicos e artigos)
    if (selectedType !== 'members') {
      if (currentSort === 'votadas') {
        combined.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      } else if (currentSort === 'comentadas') {
        combined.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
      } else {
        // mais recentes
        combined.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      }
    }

    return {
      items: combined,
      topicsCount: matchedTopics.length,
      articlesCount: matchedArticles.length,
      membersCount: matchedProfiles.length,
    }
  }, [searchTerm, selectedType, selectedCategory, currentSort, initialTopics, initialArticles, initialProfiles])

  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Banner de Pesquisa Global */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-space-lg sm:p-space-xl shadow-sm">
          <div className="relative z-10 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm tracking-widest uppercase font-semibold">
              <span className="material-symbols-outlined text-[18px]">manage_search</span>
              <span>Busca Global na Comunidade</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              Pesquisar Conteúdo & Membros
            </h1>

            {/* Input de Busca Reativo */}
            <div className="relative flex items-center w-full">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[22px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Pesquisar por modelo, snippet, artigo, autor ou dúvida..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest shadow-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  title="Limpar busca"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros de Tipo de Conteúdo */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/20">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-all shrink-0 ${
                selectedType === 'all'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Todos ({results.topicsCount + results.articlesCount + results.membersCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('topics')}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-all flex items-center gap-1 shrink-0 ${
                selectedType === 'topics'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">forum</span>
              <span>Discussões ({results.topicsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('articles')}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-all flex items-center gap-1 shrink-0 ${
                selectedType === 'articles'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">article</span>
              <span>Artigos ({results.articlesCount})</span>
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSelectedType('members')}
                className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-all flex items-center gap-1 shrink-0 ${
                  selectedType === 'members'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">group</span>
                <span>Membros ({results.membersCount})</span>
              </button>
            )}
          </div>

          {/* Ordenação */}
          {selectedType !== 'members' && (
            <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setCurrentSort('recentes')}
                className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-colors ${
                  currentSort === 'recentes' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Mais recentes"
              >
                Recentes
              </button>
              <button
                type="button"
                onClick={() => setCurrentSort('votadas')}
                className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-colors ${
                  currentSort === 'votadas' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Mais votadas"
              >
                &lt;/&gt; Votadas
              </button>
              <button
                type="button"
                onClick={() => setCurrentSort('comentadas')}
                className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-colors ${
                  currentSort === 'comentadas' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Mais comentadas"
              >
                Comentadas
              </button>
            </div>
          )}
        </div>

        {/* Categorias Pills */}
        {selectedType !== 'members' && activeCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg font-label-sm text-label-sm font-semibold transition-colors shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant/30'
              }`}
            >
              Todas as Categorias
            </button>
            {activeCategories.map((cat: any) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat.slug ? 'all' : cat.slug)}
                className={`px-3 py-1 rounded-lg font-label-sm text-label-sm font-semibold transition-colors shrink-0 ${
                  selectedCategory === cat.slug
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant/30'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Contador de Resultados */}
        <div className="flex items-center justify-between text-body-sm text-on-surface-variant px-1">
          <span>
            {results.items.length === 1
              ? '1 resultado encontrado'
              : `${results.items.length} resultados encontrados`}
          </span>
          {searchTerm && (
            <span>
              Termo: <strong className="text-on-surface font-mono">&ldquo;{searchTerm}&rdquo;</strong>
            </span>
          )}
        </div>

        {/* Lista de Resultados Reais */}
        <div className="flex flex-col gap-space-md">
          {results.items.length === 0 ? (
            <div className="p-space-xl text-center bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm flex flex-col items-center gap-space-sm">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/60">search_off</span>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Nenhum resultado encontrado
              </h3>
              <p className="text-on-surface-variant font-body-sm max-w-md">
                Não encontramos correspondências para os filtros selecionados. Tente buscar por termos mais genéricos ou limpar os filtros.
              </p>
              {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setSelectedType('all')
                  }}
                  className="mt-2 px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-xs"
                >
                  Limpar Todos os Filtros
                </button>
              )}
            </div>
          ) : (
            results.items.map((item) => {
              // Card de Membro
              if (item.itemType === 'profile') {
                return (
                  <div
                    key={`profile-${item.id}`}
                    className="bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 border border-outline-variant/20 rounded-xl p-space-md shadow-xs flex items-center justify-between gap-space-md"
                  >
                    <div className="flex items-center gap-space-md">
                      {item.avatar_url ? (
                        <img
                          src={item.avatar_url}
                          alt={item.username}
                          className="w-11 h-11 rounded-full object-cover shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                          {item.username?.slice(0, 2) || 'M'}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-space-xs flex-wrap">
                          <span className="font-label-md text-label-md font-semibold text-on-surface">
                            {item.full_name || item.username}
                          </span>
                          <span className="font-code-md text-label-sm text-on-surface-variant">
                            @{item.username}
                          </span>
                          {item.role === 'admin' && (
                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] uppercase font-bold">
                              Admin
                            </span>
                          )}
                        </div>
                        {item.bio && (
                          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                            {item.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }

              // Card de Tópico ou Artigo
              const isArticle = item.itemType === 'article'
              const targetUrl = isArticle ? `/artigo/${item.slug}` : `/topico/${item.slug}`
              const thumbnail = isArticle ? item.cover_image_url : extractFirstImage(item.content)
              const cleanSnippet = cleanContentSnippet(item.content || item.subtitle || '')

              return (
                <article
                  key={`${item.itemType}-${item.id}`}
                  className="group bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 border border-outline-variant/20 rounded-2xl p-space-md sm:p-space-lg shadow-sm hover:shadow flex flex-col gap-space-sm"
                >
                  <div className="flex items-center justify-between gap-space-xs flex-wrap">
                    <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                      <span className="font-semibold text-on-surface">
                        @{item.author?.username || 'membro'}
                      </span>
                      <span>·</span>
                      <span>{formatDate(item.created_at)}</span>
                      <span>·</span>
                      <span className={`px-2 py-0.2 rounded-full font-label-sm text-label-sm font-semibold ${
                        isArticle
                          ? 'bg-secondary/15 text-secondary'
                          : 'bg-primary/15 text-primary'
                      }`}>
                        {isArticle ? 'Artigo' : 'Discussão'}
                      </span>
                    </div>

                    {item.category && (
                      <Link
                        href={item.category.slug === 'blog' ? '/blog' : `/categoria/${item.category.slug}`}
                        className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-medium transition-colors"
                      >
                        #{item.category.name}
                      </Link>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-space-md">
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors tracking-tight">
                        <Link href={targetUrl} className="hover:underline">
                          {item.title}
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
                        href={targetUrl}
                        className="shrink-0 hidden sm:block w-20 h-20 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container"
                      >
                        <img
                          src={thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-space-md pt-space-xs text-on-surface-variant font-label-sm text-label-sm border-t border-outline-variant/10 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="font-mono text-xs font-bold leading-none text-primary">&lt;/&gt;</span>
                      <span>{item.likes_count || 0} votos</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">forum</span>
                      <span>{item.comments_count || 0} respostas</span>
                    </span>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
