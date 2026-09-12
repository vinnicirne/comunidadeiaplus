'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Article } from '@/types/database'
import { deleteArticle } from '@/lib/actions/article'

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

export default function MeusArtigosClient({ articles: initialArticles = [] }: { articles?: Article[] }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published')
  const [searchFilter, setSearchFilter] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)

  const publishedArticles = articles.filter(a => a.status === 'published')
  const draftArticles = articles.filter(a => a.status !== 'published')

  const totalViews = articles.reduce((sum, a) => sum + (a.views_count || 0), 0)
  const totalLikes = articles.reduce((sum, a) => sum + (a.likes_count || 0), 0)

  const rawDisplayedArticles = activeTab === 'published' ? publishedArticles : draftArticles
  const displayedArticles = searchFilter.trim()
    ? rawDisplayedArticles.filter(a => {
        const q = searchFilter.toLowerCase().trim()
        const titleMatch = a.title?.toLowerCase().includes(q)
        const subMatch = a.subtitle?.toLowerCase().includes(q)
        const tagMatch = a.tags?.some(t => t.toLowerCase().includes(q))
        return titleMatch || subMatch || tagMatch
      })
    : rawDisplayedArticles

  const handleDeleteConfirm = () => {
    if (!articleToDelete) return
    const targetId = articleToDelete.id
    setDeletingId(targetId)

    startDeleteTransition(async () => {
      const res = await deleteArticle(targetId)
      if (res.success) {
        setArticles(prev => prev.filter(a => a.id !== targetId))
      } else {
        alert(res.error || 'Erro ao excluir artigo')
      }
      setDeletingId(null)
      setArticleToDelete(null)
    })
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-space-md lg:px-space-lg py-space-lg text-on-surface">
      <div className="flex flex-col w-full gap-space-lg">
        
        {/* Top Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-on-surface-variant font-mono text-xs tracking-wider uppercase font-semibold">
              <Link href="/" className="hover:text-primary transition-colors">WORKSPACE</Link>
              <span className="text-outline">/</span>
              <span className="text-primary font-bold">AUTOR</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mt-1">Meus Artigos</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Gerencie suas publicações técnicas, acompanhe o alcance de leitura e edite rascunhos.
            </p>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <Link 
              href="/escrever-artigo" 
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-2.5 rounded-lg font-semibold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">edit_square</span>
              <span>Novo Artigo</span>
            </Link>
          </div>
        </div>

        {/* Metric Highlights Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: Leituras */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Total de Leituras</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {totalViews.toLocaleString('pt-BR')}
              </span>
              <span className="text-primary text-[11px] font-medium flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>Alcance</span>
              </span>
            </div>
          </div>
          
          {/* Card 2: Publicados */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Artigos Publicados</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">article</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {publishedArticles.length}
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm font-medium">
                {publishedArticles.length > 0 ? '100% indexados' : 'Nenhum ativo'}
              </span>
            </div>
          </div>
          
          {/* Card 3: Rascunhos */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Rascunhos em Edição</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {draftArticles.length}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span>Auto-salvamento ativo</span>
              </span>
            </div>
          </div>
          
          {/* Card 4: Likes */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Reações (Likes)</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary font-mono font-bold text-xs">
                &lt;/&gt;
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {totalLikes.toLocaleString('pt-BR')}
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm font-medium">
                Alta relevância técnica
              </span>
            </div>
          </div>
        </div>

        {/* Main Management Panel */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
          {/* Tabs Navigation Header */}
          <div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low border-b border-surface-container">
            <div className="flex items-center gap-space-xs overflow-x-auto">
              <button 
                onClick={() => setActiveTab('published')} 
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-colors ${
                  activeTab === 'published' 
                    ? 'bg-surface-container-lowest text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`} 
                type="button"
              >
                <span>Publicados</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'published' 
                    ? 'bg-primary/15 text-primary' 
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {publishedArticles.length}
                </span>
              </button>
              <button 
                onClick={() => setActiveTab('drafts')} 
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-colors ${
                  activeTab === 'drafts' 
                    ? 'bg-surface-container-lowest text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`} 
                type="button"
              >
                <span>Rascunhos</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'drafts' 
                    ? 'bg-primary/15 text-primary' 
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {draftArticles.length}
                </span>
              </button>
            </div>
            <Link 
              href="/escrever-artigo" 
              className="inline-flex items-center gap-1.5 text-primary font-label-sm text-label-sm font-semibold hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Novo rascunho rápido</span>
            </Link>
          </div>
          
          {/* Search Filter Toolbar */}
          <div className="p-space-md bg-surface-container-lowest border-b border-surface-container">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input 
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm pl-9 pr-4 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-primary transition-all" 
                placeholder="Filtrar seus artigos por título..." 
                type="text" 
              />
            </div>
          </div>
          
          {/* Article List */}
          <div className="divide-y divide-surface-container">
            {displayedArticles.length === 0 ? (
              <div className="p-space-xl text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[24px]">drafts</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                    {searchFilter.trim() ? 'Nenhum artigo corresponde à busca' : 'Nenhum artigo encontrado nesta seção'}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {activeTab === 'published' ? 'Você ainda não publicou nenhum artigo.' : 'Você não possui nenhum rascunho em edição.'}
                  </span>
                </div>
                <Link 
                  href="/escrever-artigo" 
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Começar a escrever</span>
                </Link>
              </div>
            ) : (
              displayedArticles.map(article => (
                <article key={article.id} className="p-space-md sm:p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md hover:bg-surface-container-low transition-colors group">
                  <div className="flex items-start gap-space-md flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-on-surface-variant">
                      {article.cover_image_url ? (
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Capa do artigo" src={article.cover_image_url}/>
                      ) : (
                        <span className="material-symbols-outlined text-[28px]">article</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {article.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            <span>Publicado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Rascunho</span>
                          </span>
                        )}
                        <span className="text-on-surface-variant font-label-sm text-label-sm">·</span>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">
                          {article.status === 'published' 
                            ? `Publicado em ${formatDate(article.updated_at)}` 
                            : `Atualizado em ${formatDate(article.updated_at)}`}
                        </span>
                      </div>
                      <Link 
                        href={article.status === 'published' ? `/artigo/${article.slug}` : `/escrever-artigo?id=${article.id}`} 
                        className="font-headline-sm text-headline-sm text-on-surface font-semibold hover:text-primary transition-colors line-clamp-1 mt-0.5"
                      >
                        {article.title || 'Artigo sem título'}
                      </Link>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {article.subtitle || (article.content ? article.content.substring(0, 100) + '...' : 'Sem descrição disponível')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-space-md shrink-0 pt-space-xs sm:pt-0">
                    {/* Metrics */}
                    <div className="flex items-center gap-space-md text-center">
                      <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm" title="Visualizações">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span className="font-semibold text-on-surface">{article.views_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm" title="Curtidas (Upvotes)">
                        <span className="material-symbols-outlined text-[16px] text-primary">code</span>
                        <span className="font-semibold text-on-surface">{article.likes_count || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <Link 
                        href={`/escrever-artigo?id=${article.id}`} 
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/30 font-label-sm text-label-sm font-medium transition-colors"
                        title="Editar artigo"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span className="hidden sm:inline">Editar</span>
                      </Link>

                      {article.status === 'published' && (
                        <Link 
                          href={`/artigo/${article.slug}`} 
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container border border-outline-variant/30 transition-colors"
                          title="Visualizar no blog"
                          target="_blank"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </Link>
                      )}

                      <button
                        onClick={() => setArticleToDelete(article)}
                        disabled={deletingId === article.id}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-outline-variant/30 transition-colors disabled:opacity-50"
                        title="Excluir artigo"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
          
        </div>
        
      </div>

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant/30 shadow-2xl p-space-lg flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Excluir Artigo</h3>
            </div>
            
            <p className="font-body-md text-body-md text-on-surface-variant">
              Tem certeza que deseja excluir o artigo <strong className="text-on-surface font-semibold">"{articleToDelete.title || 'Sem título'}"</strong>? Esta ação é definitiva e não poderá ser desfeita.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setArticleToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg font-label-md text-label-md font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-label-md text-label-md font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all disabled:opacity-50"
                type="button"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
