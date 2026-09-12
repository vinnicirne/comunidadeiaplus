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
    <main className="w-full max-w-3xl mx-auto px-4 lg:px-6 py-6 text-[#dce2f7]">
      <div className="flex flex-col w-full gap-6">
        
        {/* Top Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-[#908fa0] text-[11px] font-semibold uppercase tracking-wider">
              <span>Workspace</span>
              <span className="text-[#464554]">/</span>
              <span className="text-[#c0c1ff]">Autor</span>
            </div>
            <h1 className="text-[28px] text-white font-bold tracking-tight mt-1">Meus Artigos</h1>
            <p className="text-[13px] text-[#94a3b8] mt-0.5">Gerencie suas publicações técnicas, acompanhe o alcance de leitura e edite rascunhos.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/escrever-artigo" className="inline-flex items-center gap-1 bg-[#c0c1ff] text-[#1000a9] text-[12px] px-4 py-2.5 rounded-lg font-semibold shadow-[0_0_15px_rgba(192,193,255,0.25)] hover:bg-[#8083ff] hover:shadow-[0_0_20px_rgba(128,131,255,0.4)] transition-all">
              <span className="material-symbols-outlined text-[18px]">edit_square</span>
              <span>Novo Artigo</span>
            </Link>
          </div>
        </div>

        {/* Metric Highlights Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#141b2b] p-4 rounded-xl border border-[#2e3748]/60 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-[#c0c1ff]/40 transition-colors">
            <div className="flex items-center justify-between text-[#94a3b8]">
              <span className="text-[11px] font-medium">Total de Leituras</span>
              <div className="w-7 h-7 rounded-lg bg-[#232a3a] flex items-center justify-center text-[#c0c1ff]">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[28px] text-white font-bold tracking-tight">{totalViews.toLocaleString('pt-BR')}</span>
            </div>
            <div className="w-full h-7 mt-1 pt-1">
              <svg className="w-full h-full text-[#c0c1ff]" fill="none" preserveAspectRatio="none" viewBox="0 0 100 24">
                <path d="M0 20 Q 15 18, 30 14 T 60 8 T 85 10 T 100 2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
                <path d="M0 20 Q 15 18, 30 14 T 60 8 T 85 10 T 100 2 L 100 24 L 0 24 Z" fill="currentColor" fillOpacity="0.15"></path>
              </svg>
            </div>
          </div>
          
          <div className="bg-[#141b2b] p-4 rounded-xl border border-[#2e3748]/60 shadow-md flex flex-col justify-between hover:border-[#bdc2ff]/40 transition-colors">
            <div className="flex items-center justify-between text-[#94a3b8]">
              <span className="text-[11px] font-medium">Artigos Publicados</span>
              <div className="w-7 h-7 rounded-lg bg-[#232a3a] flex items-center justify-center text-[#bdc2ff]">
                <span className="material-symbols-outlined text-[18px]">article</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[28px] text-white font-bold tracking-tight">{publishedArticles.length}</span>
              <span className="text-[#908fa0] text-[11px] font-semibold">100% indexados</span>
            </div>
            <div className="w-full bg-[#232a3a] h-1.5 rounded-full overflow-hidden mt-4">
              <div className="bg-[#bdc2ff] h-full rounded-full w-[70%] shadow-[0_0_8px_rgba(189,194,255,0.6)]"></div>
            </div>
          </div>
          
          <div className="bg-[#141b2b] p-4 rounded-xl border border-[#2e3748]/60 shadow-md flex flex-col justify-between hover:border-[#4edea3]/40 transition-colors">
            <div className="flex items-center justify-between text-[#94a3b8]">
              <span className="text-[11px] font-medium">Rascunhos em Edição</span>
              <div className="w-7 h-7 rounded-lg bg-[#232a3a] flex items-center justify-center text-[#4edea3]">
                <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[28px] text-white font-bold tracking-tight">{draftArticles.length}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[#94a3b8] font-mono text-[13px]">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] inline-block animate-pulse shadow-[0_0_6px_#4edea3]"></span>
              <span className="truncate text-[11px] font-semibold">Auto-salvamento ativo</span>
            </div>
          </div>
          
          <div className="bg-[#141b2b] p-4 rounded-xl border border-[#2e3748]/60 shadow-md flex flex-col justify-between hover:border-[#c0c1ff]/40 transition-colors">
            <div className="flex items-center justify-between text-[#94a3b8]">
              <span className="text-[11px] font-medium">Reações (Likes)</span>
              <div className="w-7 h-7 rounded-lg bg-[#232a3a] flex items-center justify-center text-[#c0c1ff]">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[28px] text-white font-bold tracking-tight">{totalLikes.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-1 mt-4 text-[#908fa0] text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[16px] text-[#c0c1ff]">verified</span>
              <span>Alta relevância técnica</span>
            </div>
          </div>
        </div>

        {/* Main Management Panel */}
        <div className="bg-[#141b2b] rounded-xl border border-[#2e3748]/60 shadow-md overflow-hidden flex flex-col">
          {/* Tabs Navigation Header */}
          <div className="px-4 pt-4 pb-2 flex flex-wrap items-center justify-between gap-2 bg-[#141b2b] border-b border-[#2e3748]/60">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button onClick={() => setActiveTab('published')} className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-colors ${activeTab === 'published' ? 'bg-[#2f3aa3] text-white border border-[#c0c1ff]/40 shadow-[0_0_10px_rgba(192,193,255,0.2)]' : 'text-[#94a3b8] hover:bg-[#232a3a] hover:text-white'}`} type="button">
                <span>Publicados</span>
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'published' ? 'bg-[#070e1d] text-[#c0c1ff]' : 'bg-[#232a3a] text-[#94a3b8]'}`}>{publishedArticles.length}</span>
              </button>
              <button onClick={() => setActiveTab('drafts')} className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-colors ${activeTab === 'drafts' ? 'bg-[#2f3aa3] text-white border border-[#c0c1ff]/40 shadow-[0_0_10px_rgba(192,193,255,0.2)]' : 'text-[#94a3b8] hover:bg-[#232a3a] hover:text-white'}`} type="button">
                <span>Rascunhos</span>
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'drafts' ? 'bg-[#070e1d] text-[#c0c1ff]' : 'bg-[#232a3a] text-[#94a3b8]'}`}>{draftArticles.length}</span>
              </button>
            </div>
            <Link href="/escrever-artigo" className="hidden md:inline-flex items-center gap-1 text-[#c0c1ff] text-[11px] font-medium hover:underline pb-1 sm:pb-0">
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Novo rascunho rápido</span>
            </Link>
          </div>
          
          {/* Filters & Search Toolbar */}
          <div className="p-4 bg-[#191f2f]/60 border-b border-[#2e3748]/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#908fa0] text-[18px]">search</span>
              <input className="w-full bg-[#070e1d] text-white placeholder:text-[#908fa0] text-[12px] font-semibold pl-9 pr-4 py-2 rounded-lg border border-[#2e3748]/80 focus:outline-none focus:border-[#c0c1ff] focus:ring-1 focus:ring-[#c0c1ff] shadow-sm" placeholder="Filtrar seus artigos por título..." type="text" />
            </div>
          </div>
          
          <div className="divide-y divide-[#2e3748]/60">
            {displayedArticles.length === 0 ? (
              <div className="p-8 text-center text-[#94a3b8]">
                Você ainda não tem nenhum artigo nesta categoria.
              </div>
            ) : (
              displayedArticles.map(article => (
                <article key={article.id} className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#191f2f]/50 transition-colors bg-[#141b2b] group">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-[#232a3a] border border-[#2e3748]/80 hidden xs:flex items-center justify-center text-[#908fa0]">
                      {article.cover_image_url ? (
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100" alt="Thumbnail" src={article.cover_image_url}/>
                      ) : (
                        <span className="material-symbols-outlined text-[32px]">article</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        {article.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#c0c1ff]/15 text-[#c0c1ff] border border-[#c0c1ff]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff] inline-block shadow-[0_0_6px_#c0c1ff]"></span>
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] inline-block shadow-[0_0_6px_#4edea3]"></span>
                            Rascunho
                          </span>
                        )}
                        <span className="text-[#908fa0] text-[11px] font-semibold">·</span>
                        <span className="text-[#94a3b8] text-[11px] font-semibold">
                           {article.status === 'published' ? `Publicado em ${formatDate(article.updated_at)}` : `Atualizado em ${formatDate(article.updated_at)}`}
                        </span>
                      </div>
                      <Link href={article.status === 'published' ? `/artigo/${article.slug}` : `/escrever-artigo?id=${article.id}`} className="text-[16px] text-white font-semibold hover:text-[#c0c1ff] transition-colors line-clamp-1 mt-0.5">
                        {article.title || 'Artigo sem título'}
                      </Link>
                      <p className="text-[13px] text-[#94a3b8] line-clamp-2">
                        {article.subtitle || article.content.substring(0, 100) + '...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0">
                    {article.status === 'published' ? (
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[16px] text-white font-bold">{article.views_count}</span>
                          <span className="text-[11px] text-[#908fa0] font-semibold flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">visibility</span> Leituras</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[16px] text-[#c0c1ff] font-bold">{article.likes_count}</span>
                          <span className="text-[11px] text-[#908fa0] font-semibold flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px] text-[#c0c1ff]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span> Upvotes</span>
                        </div>
                      </div>
                    ) : (
                      <Link href={`/escrever-artigo?id=${article.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#232a3a] text-white hover:bg-[#2e3545] border border-[#2e3748]/80 text-[11px] font-medium transition-colors">
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
