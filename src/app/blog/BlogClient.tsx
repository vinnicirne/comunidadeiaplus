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
    <main className="w-full max-w-3xl mx-auto px-4 lg:px-6 py-6 text-[#dce2f7]">
      <div className="flex flex-col w-full">
        
        <section className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1 max-w-xl">
              <div className="flex items-center gap-1 text-[#6366f1] text-[11px] uppercase tracking-wider font-semibold">
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                <span>Publicações da Comunidade</span>
              </div>
              <h1 className="text-[36px] text-white font-bold tracking-tight mt-1">
                Blog Técnico & Insights
              </h1>
              <p className="text-[15px] text-[#94a3b8] mt-1">
                Artigos aprofundados, benchmarks de arquitetura e tutoriais avançados escritos pela comunidade de engenharia de IA.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/escrever-artigo" className="inline-flex items-center gap-1 bg-[#6366f1] hover:bg-indigo-500 text-white text-[14px] px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>Escrever Artigo</span>
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mt-1">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#908fa0] text-[20px]">search</span>
              <input className="w-full bg-[#141b2b] border border-[#2e3545]/40 text-[#dce2f7] placeholder:text-[#908fa0] text-[15px] pl-11 pr-4 py-2.5 rounded-lg shadow-sm focus:outline-none focus:border-[#6366f1]/50 focus:bg-[#191f2f]" id="blog-search" placeholder="Buscar artigos técnicos, tutoriais ou autores..." type="text" />
            </div>
          </div>
        </section>

        {featuredArticle && (
          <section className="mb-8">
            <div className="relative bg-[#141b2b] border border-[#2e3545]/40 rounded-xl shadow-md overflow-hidden group">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between order-2 lg:order-1">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6366f1]/20 text-[#bdc2ff] text-[11px] font-semibold border border-[#6366f1]/30">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        Em Destaque
                      </span>
                    </div>
                    <Link href={`/artigo/${featuredArticle.slug}`} className="group-hover:text-[#6366f1] transition-colors">
                      <h2 className="text-[28px] text-white font-bold leading-tight mt-1">
                        {featuredArticle.title}
                      </h2>
                    </Link>
                    <p className="text-[15px] text-[#94a3b8] line-clamp-3 mt-1">
                      {featuredArticle.subtitle || featuredArticle.content.substring(0, 150) + '...'}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1 mt-1">
                      {featuredArticle.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-[#191f2f] text-[#bdc2ff] font-mono text-[13px] border border-[#2e3545]/40">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#2e3545]/30 bg-transparent">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#6366f1]/25 border border-[#6366f1]/40 text-[#c0c1ff] flex items-center justify-center font-semibold text-[14px] shadow-sm">
                        {getInitials(featuredArticle.author?.full_name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] text-white font-semibold">{featuredArticle.author?.full_name || 'Usuário'}</span>
                        <span className="text-[13px] text-[#908fa0]">{formatDate(featuredArticle.updated_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[#94a3b8] text-[11px]">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                        <span>{featuredArticle.views_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full order-1 lg:order-2 overflow-hidden bg-[#191f2f]">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85" alt={featuredArticle.title} src={featuredArticle.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBe6ch0ZDuosbOlxGIEL9s1E8QWEmF5szF4XY3rz6sgJ38ZlNgvSuCHZGi2UgB5x0t842ZISZbOrT7l2g6HyiBBADSD0ece9cQLbZIaj5k2Lnvk-FPcT52R6VWEoyMhYpFAPMC_9QPH_7GJz0sB8tX3vrHsSlls_mXL0i3UnEomR6CpHcGpg7Ume4LDCQo1-6yDuRZXprZ1p7AoiyKgBT2w4P52VQRWnrR00Gr8n9Z1HF7OYBOtpn3r"}/>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] text-white font-semibold tracking-tight">
                Artigos Recentes
              </h3>
              <span className="text-[13px] text-[#908fa0]">Mostrando {recentArticles.length} publicações</span>
            </div>
            
            <div className="flex flex-col gap-4">
              {recentArticles.length === 0 ? (
                <div className="p-6 text-center text-[#94a3b8]">
                  Nenhum outro artigo publicado ainda.
                </div>
              ) : recentArticles.map(article => (
                <article key={article.id} className="bg-[#141b2b] border border-[#2e3545]/40 p-4 lg:p-6 rounded-xl shadow-sm hover:border-[#2e3545] transition-all flex flex-col sm:flex-row gap-4 group">
                  <div className="sm:w-44 sm:h-36 shrink-0 rounded-lg overflow-hidden relative bg-[#191f2f]">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85" alt="Thumbnail" src={article.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDYhDuAZiUnQansagrSJGevgmqIbWXk-C7QMnVSN0w-_zzM1W9bnUhec_TPCSXtf4AgHcxHwXGvfwMKhvEjT_Ok5EL3SZ0fuL-OnlnOfgjHm2g2VSazwZu8-zZlx1hRvJ_jN6PDy_VVAOffCdV1CIDYtpqxdoBC-DTvMuvnLZpdJ0b5BWyFKxpavSmu3H58uaMAKyhcfsuzUn8ToLUvYnWzPEHUEaghoSfYD0GE_y5oJUH1-UUUyO9F"}/>
                  </div>
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1">
                        {article.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-[#191f2f] text-[#bdc2ff] font-mono text-[13px] border border-[#2e3545]/30">#{tag}</span>
                        ))}
                      </div>
                      <Link href={`/artigo/${article.slug}`} className="group-hover:text-[#6366f1] transition-colors mt-1">
                        <h4 className="text-[16px] text-white font-semibold line-clamp-2">
                          {article.title}
                        </h4>
                      </Link>
                      <p className="text-[13px] text-[#94a3b8] line-clamp-2 mt-0.5">
                        {article.subtitle || article.content.substring(0, 100) + '...'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#2e3545]/20">
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-[#bdc2ff] text-[#131e8c] flex items-center justify-center text-[11px] font-semibold">
                          {getInitials(article.author?.full_name)}
                        </div>
                        <span className="text-[11px] text-[#dce2f7] font-medium ml-1">{article.author?.full_name || 'Usuário'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] text-[#908fa0]">
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          {article.views_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-[#191f2f] to-[#141b2b] border border-[#6366f1]/30 p-6 rounded-xl shadow-sm flex flex-col gap-2 relative overflow-hidden">
              <div className="flex items-center gap-1 text-[#6366f1]">
                <span className="material-symbols-outlined text-[22px]">mark_email_unread</span>
                <h4 className="text-[14px] text-white font-bold">Radar de IA Semanal</h4>
              </div>
              <p className="text-[13px] text-[#94a3b8] mt-1">
                Receba resumos e benchmarks diretamente no seu email.
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <input className="w-full bg-[#070e1d] border border-[#2e3545]/60 text-[#dce2f7] placeholder:text-[#908fa0] text-[13px] px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:border-[#6366f1]/60" placeholder="seu-email@tech.com" type="email" />
                <button className="w-full bg-[#6366f1] hover:bg-indigo-500 text-white text-[11px] py-2 rounded-lg font-medium shadow-sm transition-colors" type="button">
                  Inscrever-se gratuitamente
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </main>
  )
}
