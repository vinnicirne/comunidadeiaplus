'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArticleWithAuthor } from '@/lib/services/articleService'

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getInitials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function BlogClient({ articles = [] }: { articles?: ArticleWithAuthor[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return articles

    return articles.filter((a) => {
      const matchTitle = a.title.toLowerCase().includes(q)
      const matchSubtitle = a.subtitle ? a.subtitle.toLowerCase().includes(q) : false
      const matchContent = a.content ? a.content.toLowerCase().includes(q) : false
      const matchAuthor = a.author?.full_name ? a.author.full_name.toLowerCase().includes(q) : false
      const matchTags = a.tags ? a.tags.some(t => t.toLowerCase().includes(q)) : false
      return matchTitle || matchSubtitle || matchContent || matchAuthor || matchTags
    })
  }, [articles, searchQuery])

  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null
  const recentArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : []

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true)
      setNewsletterEmail('')
    }
  }

  return (
    <div className="flex flex-col w-full text-on-surface">
      
      {/* Cabeçalho da Seção de Blog */}
      <section className="flex flex-col gap-space-md mb-space-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs max-w-xl">
            <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Publicações da Comunidade</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              Blog Técnico &amp; Insights
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Artigos aprofundados, benchmarks de arquitetura e tutoriais avançados escritos pela comunidade de engenharia de IA.
            </p>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <Link
              href="/escrever-artigo"
              className="inline-flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg shadow-sm transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              <span>Escrever Artigo</span>
            </Link>
          </div>
        </div>
        
        {/* Barra de Busca de Artigos com Estado Reativo */}
        <div className="relative flex-1 mt-space-xs">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md pl-11 pr-10 py-2.5 rounded-xl shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            id="blog-search"
            placeholder="Buscar artigos técnicos, tutoriais ou autores..."
            type="text"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 rounded-md"
              type="button"
              aria-label="Limpar pesquisa"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </section>

      {/* Artigo em Destaque */}
      {featuredArticle && (
        <section className="mb-space-lg">
          <div className="relative bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 p-space-lg lg:p-space-xl flex flex-col justify-between order-2 lg:order-1">
                <div className="flex flex-col gap-space-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      Em Destaque
                    </span>
                  </div>
                  <Link href={`/artigo/${featuredArticle.slug}`} className="group-hover:text-primary transition-colors">
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold leading-tight mt-1">
                      {featuredArticle.title}
                    </h2>
                  </Link>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 mt-1 leading-relaxed">
                    {featuredArticle.subtitle || (featuredArticle.content ? featuredArticle.content.substring(0, 160) + '...' : '')}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-space-xs mt-1">
                    {featuredArticle.tags?.slice(0, 4).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-surface-container-low text-primary font-code-md text-label-sm border border-outline-variant/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-space-md mt-space-md border-t border-surface-container">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-semibold font-label-md text-label-md shadow-xs">
                      {getInitials(featuredArticle.author?.full_name || featuredArticle.author?.username)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        {featuredArticle.author?.full_name || featuredArticle.author?.username || 'Autor da Comunidade'}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {formatDate(featuredArticle.updated_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
                    <span className="flex items-center gap-1" title="Visualizações">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>{featuredArticle.views_count || 0}</span>
                    </span>
                    <span className="flex items-center gap-1" title="Curtidas">
                      <span className="material-symbols-outlined text-[16px] text-primary">code</span>
                      <span>{featuredArticle.likes_count || 0}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full order-1 lg:order-2 overflow-hidden bg-surface-container-low">
                {featuredArticle.cover_image_url ? (
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={featuredArticle.title}
                    src={featuredArticle.cover_image_url}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-primary">
                    <span className="material-symbols-outlined text-[64px] opacity-40">article</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid Principal: Artigos Recentes & Sidebar Newsletter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
              {searchQuery ? 'Resultados da Busca' : 'Artigos Recentes'}
            </h3>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {recentArticles.length} {recentArticles.length === 1 ? 'publicação' : 'publicações'}
            </span>
          </div>
          
          <div className="flex flex-col gap-space-md">
            {recentArticles.length === 0 ? (
              <div className="p-space-lg text-center bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-on-surface-variant font-body-sm shadow-sm">
                {searchQuery
                  ? `Nenhum outro artigo encontrado para "${searchQuery}".`
                  : filteredArticles.length === 0
                  ? 'Nenhum artigo publicado no momento.'
                  : 'Nenhum outro artigo na listagem secundária.'}
              </div>
            ) : (
              recentArticles.map((article) => (
                <article
                  key={article.id}
                  className="bg-surface-container-lowest border border-outline-variant/30 p-space-md sm:p-space-lg rounded-xl shadow-sm hover:shadow transition-all flex flex-col sm:flex-row gap-space-md group"
                >
                  {article.cover_image_url && (
                    <div className="sm:w-44 sm:h-32 shrink-0 rounded-lg overflow-hidden relative bg-surface-container-low">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={article.title}
                        src={article.cover_image_url}
                      />
                    </div>
                  )}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {article.tags?.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-surface-container-low text-primary font-code-md text-label-sm border border-outline-variant/30"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <Link href={`/artigo/${article.slug}`} className="group-hover:text-primary transition-colors mt-0.5">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold line-clamp-2 leading-snug">
                          {article.title}
                        </h4>
                      </Link>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                        {article.subtitle || (article.content ? article.content.substring(0, 120) + '...' : '')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-space-xs mt-space-sm border-t border-surface-container">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-semibold">
                          {getInitials(article.author?.full_name || article.author?.username)}
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface font-medium">
                          {article.author?.full_name || article.author?.username || 'Membro'}
                        </span>
                      </div>
                      <div className="flex items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
                        <span className="flex items-center gap-1" title="Visualizações">
                          <span className="material-symbols-outlined text-[15px]">visibility</span>
                          <span>{article.views_count || 0}</span>
                        </span>
                        <span className="flex items-center gap-1" title="Curtidas">
                          <span className="material-symbols-outlined text-[15px] text-primary">code</span>
                          <span>{article.likes_count || 0}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
        
        {/* Newsletter Lateral */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-low border border-outline-variant/30 p-space-lg rounded-xl shadow-sm flex flex-col gap-space-xs relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[22px]">mark_email_unread</span>
              <h4 className="font-label-lg text-label-lg text-on-surface font-bold">Radar de IA Semanal</h4>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Receba resumos técnicos, modelos em lançamento e benchmarks diretamente no seu email.
            </p>
            
            {newsletterSubscribed ? (
              <div className="mt-space-sm p-space-md rounded-lg bg-primary-fixed text-on-primary-fixed font-body-sm text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Inscrição confirmada! Você receberá o radar semanal.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-space-xs mt-space-sm">
                <input
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-body-sm px-space-md py-2 rounded-lg shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="seu-email@tech.com"
                  type="email"
                  required
                />
                <button
                  className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm py-2 rounded-lg font-medium shadow-sm transition-colors"
                  type="submit"
                >
                  Inscrever-se gratuitamente
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      
    </div>
  )
}
