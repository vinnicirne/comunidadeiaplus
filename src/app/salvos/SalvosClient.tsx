'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toggleTopicSave } from '@/lib/actions/topic'

interface SalvosClientProps {
  initialSavedTopics?: any[]
  categories?: any[]
}

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function SalvosClient({
  initialSavedTopics = [],
  categories = [],
}: SalvosClientProps) {
  const [savedTopics, setSavedTopics] = useState<any[]>(initialSavedTopics)
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRemoveSaved = (topicId: string, slug: string) => {
    setRemovingId(topicId)
    // Optimistic UI removal
    setSavedTopics(prev => prev.filter(s => s.id !== topicId))

    startTransition(async () => {
      try {
        await toggleTopicSave(topicId, slug)
      } catch (e) {
        console.error('Erro ao remover dos salvos:', e)
      } finally {
        setRemovingId(null)
      }
    })
  }

  // Filter logic
  const query = searchFilter.toLowerCase().trim()
  const filteredTopics = savedTopics.filter(item => {
    const matchesSearch = query
      ? item.title?.toLowerCase().includes(query) ||
        item.content?.toLowerCase().includes(query) ||
        item.category?.name?.toLowerCase().includes(query)
      : true

    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory

    return matchesSearch && matchesCategory
  })

  const totalUpvotes = savedTopics.reduce((acc, t) => acc + (t.likes_count || 0), 0)
  const totalComments = savedTopics.reduce((acc, t) => acc + (t.comments_count || 0), 0)

  return (
    <main className="w-full max-w-4xl mx-auto px-space-md lg:px-space-lg py-space-lg text-on-surface">
      <div className="flex flex-col w-full gap-space-lg">

        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-on-surface-variant font-mono text-xs tracking-wider uppercase font-semibold">
              <Link href="/" className="hover:text-primary transition-colors">INÍCIO</Link>
              <span className="text-outline">/</span>
              <span className="text-primary font-bold">SALVOS</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mt-1">
              Itens Salvos & Favoritos
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Acesse rapidamente as discussões, benchmarks e conteúdos técnicos que você favoritou ou curtiu.
            </p>
          </div>

          <div className="flex items-center gap-space-xs shrink-0">
            <Link
              href="/explorar"
              className="inline-flex items-center gap-2 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface font-label-md text-label-md px-space-md py-2.5 rounded-lg font-semibold shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              <span>Explorar Mais</span>
            </Link>
          </div>
        </div>

        {/* Bento Stat Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
          {/* Card 1: Total Guardados */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Discussões Salvas</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">bookmark</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {savedTopics.length}
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm font-medium">
                {savedTopics.length === 1 ? '1 item' : `${savedTopics.length} itens`}
              </span>
            </div>
          </div>

          {/* Card 2: Respostas Ativas */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Respostas nas Salvas</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">forum</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {totalComments}
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm font-medium">
                Comentários
              </span>
            </div>
          </div>

          {/* Card 3: Upvotes */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Upvotes Registrados</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary font-mono font-bold text-xs">
                &lt;/&gt;
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {totalUpvotes}
              </span>
              <span className="text-primary text-[11px] font-medium flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">code</span>
                <span>Comunidade</span>
              </span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
          
          {/* Filter & Search Bar */}
          <div className="p-space-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm bg-surface-container-low border-b border-surface-container">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm pl-9 pr-4 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-primary transition-all shadow-xs"
                placeholder="Filtrar discussões salvas..."
                type="text"
              />
            </div>

            {/* Category Filter Dropdown */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant font-label-sm text-label-sm hidden md:inline">Categoria:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filtrar por Categoria"
                  className="bg-surface-container-lowest text-on-surface font-label-sm text-label-sm px-3 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-primary cursor-pointer shadow-xs"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* List of Saved Items */}
          <div className="divide-y divide-surface-container">
            {filteredTopics.length === 0 ? (
              <div className="p-space-xl text-center flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[28px]">bookmark_border</span>
                </div>
                <div className="flex flex-col max-w-md">
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                    {searchFilter.trim() || selectedCategory !== 'all'
                      ? 'Nenhuma discussão salva corresponde aos filtros'
                      : 'Você ainda não possui conteúdos salvos'}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    {searchFilter.trim() || selectedCategory !== 'all'
                      ? 'Tente ajustar os termos de pesquisa ou selecionar outra categoria.'
                      : 'Navegue pelo feed, explore tópicos ou blog e clique em salvar para guardar discussões aqui.'}
                  </span>
                </div>
                <Link
                  href="/explorar"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">explore</span>
                  <span>Explorar Conteúdos</span>
                </Link>
              </div>
            ) : (
              filteredTopics.map((item) => (
                <article
                  key={item.id}
                  className="p-space-md sm:p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md hover:bg-surface-container-low transition-colors group"
                >
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.category && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                          {item.category.name}
                        </span>
                      )}
                      <span className="text-on-surface-variant font-label-sm text-label-sm">·</span>
                      <span className="text-on-surface-variant font-label-sm text-label-sm">
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <Link href={`/topico/${item.slug}`}>
                      <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors line-clamp-1 mt-0.5">
                        {item.title}
                      </h2>
                    </Link>

                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-space-md shrink-0 pt-space-xs sm:pt-0">
                    {/* Metrics */}
                    <div className="flex items-center gap-space-md text-center">
                      <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm" title="Upvotes">
                        <span className="material-symbols-outlined text-[16px] text-primary">code</span>
                        <span className="font-semibold text-on-surface">{item.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm" title="Respostas">
                        <span className="material-symbols-outlined text-[16px]">forum</span>
                        <span className="font-semibold text-on-surface">{item.comments_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm" title="Visualizações">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span className="font-semibold text-on-surface">{item.views_count || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/topico/${item.slug}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container border border-outline-variant/30 transition-colors"
                        title="Acessar discussão"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      </Link>

                      <button
                        onClick={() => handleRemoveSaved(item.id, item.slug)}
                        disabled={removingId === item.id}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-outline-variant/30 transition-colors disabled:opacity-50"
                        title="Remover dos Salvos"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">bookmark_remove</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

        </div>

      </div>
    </main>
  )
}
