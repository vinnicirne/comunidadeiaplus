'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Article } from '@/types/database'

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function MeusArtigosClient({ articles = [] }: { articles?: Article[] }) {
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published')
  const [searchFilter, setSearchFilter] = useState('')
  
  const publishedArticles = articles.filter(a => a.status === 'published')
  const draftArticles = articles.filter(a => a.status !== 'published')

  const totalViews = articles.reduce((sum, a) => sum + (a.views_count || 0), 0)
  const totalLikes = articles.reduce((sum, a) => sum + (a.likes_count || 0), 0)

  const rawDisplayedArticles = activeTab === 'published' ? publishedArticles : draftArticles
  const displayedArticles = searchFilter.trim()
    ? rawDisplayedArticles.filter(a => a.title.toLowerCase().includes(searchFilter.toLowerCase().trim()))
    : rawDisplayedArticles

  return (
    <main className="w-full max-w-4xl mx-auto px-space-md lg:px-space-lg py-space-lg text-on-surface">
      <div className="flex flex-col w-full gap-space-lg">
        
        {/* Top Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              <Link href="/" className="hover:text-primary">Início</Link>
              <span className="text-outline">/</span>
              <span className="text-primary">Painel do Autor</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mt-1">Meus Artigos</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Gerencie suas publicações técnicas, acompanhe o alcance de leitura e edite rascunhos.</p>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <Link href="/escrever-artigo" className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-2.5 rounded-lg font-semibold shadow-sm transition-all">
              <span className="material-symbols-outlined text-[18px]">edit_square</span>
              <span>Novo Artigo</span>
            </Link>
          </div>
        </div>

        {/* Metric Highlights Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Total de Leituras</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">{totalViews.toLocaleString('pt-BR')}</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Artigos Publicados</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">article</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">{publishedArticles.length}</span>
              <span className="text-on-surface-variant font-label-sm text-label-sm font-medium">Ativos</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Rascunhos</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">{draftArticles.length}</span>
              <span className="text-on-surface-variant font-label-sm text-label-sm font-medium">Em edição</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Curtidas Totais</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">code</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">{totalLikes.toLocaleString('pt-BR')}</span>
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
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-colors ${
                  activeTab === 'published' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`} 
                type="button"
              >
                <span>Publicados</span>
                <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${activeTab === 'published' ? 'bg-primary/15 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>{publishedArticles.length}</span>
              </button>
              <button 
                onClick={() => setActiveTab('drafts')} 
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-colors ${
                  activeTab === 'drafts' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`} 
                type="button"
              >
                <span>Rascunhos</span>
                <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${activeTab === 'drafts' ? 'bg-primary/15 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>{draftArticles.length}</span>
              </button>
            </div>
            <Link href="/escrever-artigo" className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-medium hover:underline">
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Escrever Artigo</span>
            </Link>
          </div>
          
          {/* Search Filter Toolbar */}
          <div className="p-space-md bg-surface-container-lowest border-b border-surface-container">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input 
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm pl-9 pr-4 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-primary transition-all" 
                placeholder="Filtrar por título..." 
                type="text" 
              />
            </div>
          </div>
          
          <div className="divide-y divide-surface-container">
            {displayedArticles.length === 0 ? (
              <div className="p-space-xl text-center text-on-surface-variant font-body-sm">
                Nenhum artigo encontrado nesta seção.
              </div>
            ) : (
              displayedArticles.map(article => (
                <article key={article.id} className="p-space-md sm:p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md hover:bg-surface-container-low transition-colors group">
                  <div className="flex items-start gap-space-md flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-on-surface-variant">
                      {article.cover_image_url ? (
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Thumbnail" src={article.cover_image_url}/>
                      ) : (
                        <span className="material-symbols-outlined text-[28px]">article</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {article.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-primary-fixed text-on-primary-fixed">
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-secondary-fixed text-secondary">
                            Rascunho
                          </span>
                        )}
                        <span className="text-on-surface-variant font-label-sm text-label-sm">·</span>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">
                           {article.status === 'published' ? `Publicado em ${formatDate(article.updated_at)}` : `Atualizado em ${formatDate(article.updated_at)}`}
                        </span>
                      </div>
                      <Link href={article.status === 'published' ? `/artigo/${article.slug}` : `/escrever-artigo?id=${article.id}`} className="font-headline-sm text-headline-sm text-on-surface font-semibold hover:text-primary transition-colors line-clamp-1 mt-0.5">
                        {article.title || 'Artigo sem título'}
                      </Link>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {article.subtitle || (article.content ? article.content.substring(0, 100) + '...' : '')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-space-md shrink-0 pt-space-xs sm:pt-0">
                    {article.status === 'published' ? (
                      <div className="flex items-center gap-space-md text-center">
                        <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span className="font-semibold text-on-surface">{article.views_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[16px] text-primary">code</span>
                          <span className="font-semibold text-on-surface">{article.likes_count || 0}</span>
                        </div>
                      </div>
                    ) : (
                      <Link href={`/escrever-artigo?id=${article.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/30 font-label-sm text-label-sm font-medium transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>Continuar</span>
                      </Link>
                    )}
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
