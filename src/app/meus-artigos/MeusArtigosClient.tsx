'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Article } from '@/types/database'

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function MeusArtigosClient({ articles = [] }: { articles?: Article[] }) {
  const [activeTab, setActiveTab] = useState('published')
  
  const publishedArticles = articles.filter(a => a.status === 'published')
  const draftArticles = articles.filter(a => a.status !== 'published')

  const totalViews = articles.reduce((sum, a) => sum + a.views_count, 0)
  const totalLikes = articles.reduce((sum, a) => sum + a.likes_count, 0)

  const displayedArticles = activeTab === 'published' ? publishedArticles : draftArticles

  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        
        {/* Top Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-outline font-label-sm text-label-sm uppercase tracking-wider">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-primary font-semibold">Autor</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">Meus Artigos</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Gerencie suas publicações técnicas, acompanhe o alcance de leitura e edite rascunhos.</p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <Link href="/escrever-artigo" className="inline-flex items-center gap-space-xs bg-primary text-on-primary font-label-md text-label-md px-space-md py-2.5 rounded-lg shadow-sm hover:bg-primary-container transition-all hover:shadow-md">
              <span className="material-symbols-outlined text-[18px]">edit_square</span>
              <span>Novo Artigo</span>
            </Link>
          </div>
        </div>

        {/* Metric Highlights Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Total de Leituras</span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
              </div>
            </div>
            <div className="mt-space-sm flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">{totalViews}</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Artigos Publicados</span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">article</span>
              </div>
            </div>
            <div className="mt-space-sm flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">{publishedArticles.length}</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Rascunhos em Edição</span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              </div>
            </div>
            <div className="mt-space-sm flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">{draftArticles.length}</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Reações (Likes)</span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
            </div>
            <div className="mt-space-sm flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">{totalLikes}</span>
            </div>
          </div>
        </div>

        {/* Main Management Panel */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Tabs Navigation Header */}
          <div className="px-space-md pt-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-lowest">
            <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0">
              <button onClick={() => setActiveTab('published')} className={`inline-flex items-center gap-space-xs px-3.5 py-2 rounded-lg font-label-md text-label-md transition-colors ${activeTab === 'published' ? 'bg-primary-fixed text-on-primary-fixed font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} type="button">
                <span>Publicados</span>
                <span className={`text-label-sm font-label-sm px-1.5 py-0.5 rounded-full ${activeTab === 'published' ? 'bg-surface-container-lowest text-on-surface' : 'bg-surface-container text-on-surface-variant'}`}>{publishedArticles.length}</span>
              </button>
              <button onClick={() => setActiveTab('drafts')} className={`inline-flex items-center gap-space-xs px-3.5 py-2 rounded-lg font-label-md text-label-md transition-colors ${activeTab === 'drafts' ? 'bg-primary-fixed text-on-primary-fixed font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} type="button">
                <span>Rascunhos</span>
                <span className={`text-label-sm font-label-sm px-1.5 py-0.5 rounded-full ${activeTab === 'drafts' ? 'bg-surface-container-lowest text-on-surface' : 'bg-surface-container text-on-surface-variant'}`}>{draftArticles.length}</span>
              </button>
            </div>
            <Link href="/escrever-artigo" className="hidden md:inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-medium hover:underline pb-2 sm:pb-0">
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Novo rascunho rápido</span>
            </Link>
          </div>
          
          <div className="p-space-md bg-surface-container-low/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-label-md text-label-md pl-9 pr-space-md py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest shadow-sm" placeholder="Filtrar seus artigos por título..." type="text" />
            </div>
          </div>
          
          <div className="flex flex-col">
            {displayedArticles.length === 0 ? (
              <div className="p-space-xl text-center text-on-surface-variant">
                Você ainda não tem nenhum artigo nesta categoria.
              </div>
            ) : (
              displayedArticles.map(article => (
                <article key={article.id} className="p-space-md md:p-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-md hover:bg-surface-container-low/30 transition-colors bg-surface-container-lowest group border-b border-outline-variant/30 last:border-0">
                  <div className="flex items-start gap-space-md flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-surface-container hidden xs:flex items-center justify-center text-outline">
                      {article.cover_image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Thumbnail" src={article.cover_image_url}/>
                      ) : (
                        <span className="material-symbols-outlined text-[32px]">article</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        {article.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-surface-container text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-tertiary-fixed text-on-tertiary-fixed">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container inline-block"></span>
                            Rascunho
                          </span>
                        )}
                        <span className="text-outline font-label-sm text-label-sm">·</span>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">
                           {article.status === 'published' ? `Publicado em ${formatDate(article.updated_at)}` : `Atualizado em ${formatDate(article.updated_at)}`}
                        </span>
                      </div>
                      <Link href={article.status === 'published' ? `/artigo/${article.slug}` : `/escrever-artigo?id=${article.id}`} className="font-headline-sm text-headline-sm text-on-surface font-semibold hover:text-primary transition-colors line-clamp-1 mt-0.5">
                        {article.title || 'Artigo sem título'}
                      </Link>
                      <p className="text-body-sm font-body-sm text-on-surface-variant line-clamp-2">
                        {article.subtitle || article.content.substring(0, 100) + '...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-space-md shrink-0 pt-space-xs lg:pt-0">
                    {article.status === 'published' ? (
                      <div className="grid grid-cols-2 gap-space-sm sm:gap-space-md text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{article.views_count}</span>
                          <span className="font-label-sm text-label-sm text-outline flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">visibility</span> Leituras</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="font-headline-sm text-headline-sm text-primary font-bold">{article.likes_count}</span>
                          <span className="font-label-sm text-label-sm text-outline flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span> Upvotes</span>
                        </div>
                      </div>
                    ) : (
                      <Link href={`/escrever-artigo?id=${article.id}`} className="inline-flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm font-medium transition-colors">
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
