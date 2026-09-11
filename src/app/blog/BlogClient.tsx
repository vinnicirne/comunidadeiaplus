'use client'

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
  const featuredArticle = articles.length > 0 ? articles[0] : null
  const recentArticles = articles.length > 1 ? articles.slice(1) : []

  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full">
        
        <section className="flex flex-col gap-space-md mb-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-1 max-w-xl">
              <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                <span>Publicações da Comunidade</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                Blog Técnico & Insights
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Artigos aprofundados, benchmarks de arquitetura e tutoriais avançados escritos pela comunidade de engenharia de IA.
              </p>
            </div>
            <div className="flex items-center gap-space-sm shrink-0">
              <Link href="/escrever-artigo" className="inline-flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-2.5 rounded-lg shadow-sm transition-all duration-200">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>Escrever Artigo</span>
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-space-sm items-stretch sm:items-center mt-space-xs">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-md text-body-md pl-11 pr-space-md py-2.5 rounded-lg shadow-sm focus:outline-none focus:bg-surface-container-lowest" id="blog-search" placeholder="Buscar artigos técnicos, tutoriais ou autores..." type="text" />
            </div>
          </div>
        </section>

        {featuredArticle && (
          <section className="mb-space-xl">
            <div className="relative bg-surface-container-lowest rounded-xl shadow-md overflow-hidden group">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 p-space-lg lg:p-space-xl flex flex-col justify-between order-2 lg:order-1">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        Em Destaque
                      </span>
                    </div>
                    <Link href={`/artigo/${featuredArticle.slug}`} className="group-hover:text-primary transition-colors">
                      <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold leading-tight">
                        {featuredArticle.title}
                      </h2>
                    </Link>
                    <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">
                      {featuredArticle.subtitle || featuredArticle.content.substring(0, 150) + '...'}
                    </p>
                    <div className="flex flex-wrap gap-space-xs pt-1">
                      {featuredArticle.tags?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-surface-container-low text-primary font-code-md text-code-md">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-space-md mt-space-md bg-transparent">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-semibold font-label-md text-label-md shadow-sm">
                        {getInitials(featuredArticle.author?.full_name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">{featuredArticle.author?.full_name || 'Usuário'}</span>
                        <span className="font-body-sm text-body-sm text-outline">{formatDate(featuredArticle.published_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-sm">
                      <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                        <span className="material-symbols-outlined text-[18px] text-tertiary-container">visibility</span>
                        <span>{featuredArticle.views_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full order-1 lg:order-2 overflow-hidden bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={featuredArticle.title} src={featuredArticle.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBe6ch0ZDuosbOlxGIEL9s1E8QWEmF5szF4XY3rz6sgJ38ZlNgvSuCHZGi2UgB5x0t842ZISZbOrT7l2g6HyiBBADSD0ece9cQLbZIaj5k2Lnvk-FPcT52R6VWEoyMhYpFAPMC_9QPH_7GJz0sB8tX3vrHsSlls_mXL0i3UnEomR6CpHcGpg7Ume4LDCQo1-6yDuRZXprZ1p7AoiyKgBT2w4P52VQRWnrR00Gr8n9Z1HF7OYBOtpn3r"}/>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                Artigos Recentes
              </h3>
              <span className="font-body-sm text-body-sm text-outline">Mostrando {recentArticles.length} publicações</span>
            </div>
            
            <div className="flex flex-col gap-space-md">
              {recentArticles.length === 0 ? (
                <div className="p-space-lg text-center text-on-surface-variant">
                  Nenhum outro artigo publicado ainda.
                </div>
              ) : recentArticles.map(article => (
                <article key={article.id} className="bg-surface-container-lowest p-space-md lg:p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-space-md group">
                  <div className="sm:w-44 sm:h-36 shrink-0 rounded-lg overflow-hidden relative bg-surface-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Thumbnail" src={article.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDYhDuAZiUnQansagrSJGevgmqIbWXk-C7QMnVSN0w-_zzM1W9bnUhec_TPCSXtf4AgHcxHwXGvfwMKhvEjT_Ok5EL3SZ0fuL-OnlnOfgjHm2g2VSazwZu8-zZlx1hRvJ_jN6PDy_VVAOffCdV1CIDYtpqxdoBC-DTvMuvnLZpdJ0b5BWyFKxpavSmu3H58uaMAKyhcfsuzUn8ToLUvYnWzPEHUEaghoSfYD0GE_y5oJUH1-UUUyO9F"}/>
                  </div>
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-space-xs">
                        {article.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-surface-container-low text-primary font-code-md text-code-md">#{tag}</span>
                        ))}
                      </div>
                      <Link href={`/artigo/${article.slug}`} className="group-hover:text-primary transition-colors">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold line-clamp-2">
                          {article.title}
                        </h4>
                      </Link>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {article.subtitle || article.content.substring(0, 100) + '...'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-space-sm mt-space-xs">
                      <div className="flex items-center gap-space-xs">
                        <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-sm text-label-sm font-semibold">
                          {getInitials(article.author?.full_name)}
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface font-medium">{article.author?.full_name || 'Usuário'}</span>
                      </div>
                      <div className="flex items-center gap-space-sm">
                        <span className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
                          <span className="material-symbols-outlined text-[16px] text-tertiary-container">visibility</span>
                          {article.views_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-gradient-to-br from-primary-fixed to-surface-container-low p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm relative overflow-hidden">
              <div className="flex items-center gap-space-xs text-primary">
                <span className="material-symbols-outlined text-[22px]">mark_email_unread</span>
                <h4 className="font-label-md text-label-md text-on-surface font-bold">Radar de IA Semanal</h4>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Receba resumos e benchmarks diretamente no seu email.
              </p>
              <div className="flex flex-col gap-2 mt-1">
                <input className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm px-space-md py-2 rounded-lg shadow-sm focus:outline-none" placeholder="seu-email@tech.com" type="email" />
                <button className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm py-2 rounded-lg font-medium shadow-sm transition-colors" type="button">
                  Inscrever-se
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </main>
  )
}
