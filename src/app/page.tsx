import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import { adminService } from '@/lib/services/adminService'
import { getPublishedArticles } from '@/lib/services/articleService'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage({ searchParams }: { searchParams: { sort?: string } }) {
  const supabase = createClient()
  let user = null
  let topics: any[] = []
  let categories: any[] = []
  let articles: any[] = []
  const sort = searchParams.sort || 'recentes'

  try {
    const [authResult, fetchedTopics, fetchedCategories, fetchedArticles] = await Promise.all([
      supabase.auth.getUser(),
      adminService.getTopics(),
      adminService.getCategories(),
      getPublishedArticles()
    ])
    user = authResult.data?.user || null
    topics = fetchedTopics || []
    categories = fetchedCategories || []
    articles = fetchedArticles || []
  } catch (error) {
    console.error('Falha ao carregar dados do Supabase na HomePage:', error)
  }

  let publishedTopics = topics.filter((t) => t.is_published).map(t => ({ ...t, type: 'topic' }))
  let publishedArticles = articles.map(a => ({ ...a, type: 'article' }))
  
  let feedItems = [...publishedTopics, ...publishedArticles]

  // Aplicar Filtros e Ordenação
  if (sort === 'comentadas') {
    feedItems.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
  } else if (sort === 'alta') {
    feedItems.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
  } else if (sort === 'sem-resposta') {
    feedItems = feedItems.filter(t => (t.comments_count || 0) === 0)
    feedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else {
    // recentes (padrão)
    feedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const getTabClass = (tabName: string) => {
    return sort === tabName
      ? "tab-btn px-space-md py-1 rounded font-label-md text-label-md bg-surface-container-high text-secondary font-semibold border border-outline-variant transition-all flex items-center gap-1"
      : "tab-btn px-space-md py-1 rounded font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-1 border border-transparent"
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <div className="flex flex-col w-full">
                
                {/* Hero Contextual (Como no mockup do Home) */}
                <div className="relative overflow-hidden rounded-2xl bg-surface-container border border-outline-variant p-space-lg md:p-space-xl shadow-lg mb-space-lg">
                  <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute right-12 bottom-4 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col items-start gap-space-md max-w-2xl">
                    <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high border border-outline-variant text-secondary font-label-sm text-label-sm">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                      <span>Comunidade Ativa • +4.2k membros</span>
                    </div>
                    <div className="flex flex-col gap-space-xs">
                      <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight leading-tight">
                        Converse sobre Inteligência Artificial.
                      </h1>
                      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                        Pergunte, compartilhe experiências e descubra novas formas de usar IA com engenheiros, criadores e pesquisadores.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                      <Link href="/criar-topico" className="inline-flex items-center gap-space-xs bg-primary text-on-primary font-label-md text-label-md px-space-lg py-space-sm rounded-lg hover:bg-primary-container transition-all shadow-md active:scale-95">
                        <span>Começar agora</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                      <Link href="#feed" className="inline-flex items-center gap-space-xs bg-surface-container-high border border-outline-variant text-on-surface font-label-md text-label-md px-space-md py-space-sm rounded-lg hover:bg-surface-container-highest transition-colors">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">explore</span>
                        <span>Explorar tópicos</span>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-space-md" id="feed">
                  {/* Feed Header & Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[22px]">forum</span>
                      <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                        Discussões recentes
                      </h2>
                    </div>
                    <div className="inline-flex p-1 bg-surface-container border border-outline-variant rounded-lg shadow-sm self-start sm:self-auto" id="feed-tabs">
                      <Link href="/?sort=recentes" className={getTabClass('recentes')}>
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span>Recentes</span>
                      </Link>
                      <Link href="/?sort=alta" className={getTabClass('alta')}>
                        <span className="material-symbols-outlined text-[16px]">trending_up</span>
                        <span>Em alta</span>
                      </Link>
                      <Link href="/?sort=comentadas" className={getTabClass('comentadas')}>
                        <span className="material-symbols-outlined text-[16px]">mode_comment</span>
                        <span>Mais comentadas</span>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Discussion Stream Stack */}
                  <div className="flex flex-col gap-space-md" id="feed-list">
                    {feedItems.length === 0 ? (
                      <div className="p-space-lg text-center bg-surface-container-lowest rounded-xl font-body-md text-on-surface-variant border border-outline-variant">
                        Nenhum item encontrado para este filtro.
                      </div>
                    ) : (
                      feedItems.map((item) => (
                        <article key={`${item.type}-${item.id}`} className="group bg-surface-container border border-outline-variant hover:border-outline-variant/80 p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col gap-space-sm relative">
                          <div className="flex items-start justify-between gap-space-sm">
                            <div className="flex items-center gap-space-sm">
                              {item.author?.avatar_url ? (
                                <img src={item.author.avatar_url} className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-outline-variant" alt="Avatar" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant text-secondary flex items-center justify-center font-label-md font-bold">
                                  {item.author?.username?.slice(0, 1)?.toUpperCase() || 'A'}
                                </div>
                              )}
                              <div className="flex flex-col leading-tight">
                                <div className="flex items-center gap-space-xs">
                                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                                    @{item.author?.username || 'membro'}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-outline"></span>
                                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                                    {new Date(item.updated_at || item.created_at).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                <span className="font-body-sm text-body-sm text-outline">
                                  {item.author?.full_name || 'Membro'}
                                </span>
                              </div>
                            </div>
                            
                            {item.type === 'topic' && item.category && (
                              <Link href={`/categoria/${item.category.slug}`} className="px-space-sm py-0.5 rounded bg-primary/20 border border-primary/30 text-primary-fixed-dim font-label-sm text-label-sm font-medium">
                                {item.category.name}
                              </Link>
                            )}
                            {item.type === 'article' && (
                              <Link href="/blog" className="px-space-sm py-0.5 rounded bg-secondary/20 border border-secondary/30 text-secondary-fixed-dim font-label-sm text-label-sm font-medium">
                                Artigo
                              </Link>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-space-xs">
                            <Link href={item.type === 'article' ? `/artigo/${item.slug}` : `/topico/${item.slug}`} className="font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors font-semibold">
                              {item.title}
                            </Link>
                            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                              {item.type === 'article' ? (item.subtitle || item.content) : item.content}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
                            {/* Tags would go here se existissem */}
                          </div>
                          
                          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant">
                            <div className="flex items-center gap-space-md">
                              <button className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-surface-container-high hover:text-secondary transition-colors font-label-sm text-label-sm text-on-surface-variant" type="button">
                                <span className="material-symbols-outlined text-[18px]">favorite</span>
                                <span>{item.likes_count || 0}</span>
                              </button>
                              <Link href={item.type === 'article' ? `/artigo/${item.slug}` : `/topico/${item.slug}`} className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-surface-container-high hover:text-secondary transition-colors font-label-sm text-label-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                                <span>{item.comments_count || 0} comentários</span>
                              </Link>
                            </div>
                            <div className="flex items-center gap-space-xs">
                              <button aria-label="Salvar" className="p-1.5 rounded-lg hover:bg-surface-container-high hover:text-secondary transition-colors text-on-surface-variant" type="button">
                                <span className="material-symbols-outlined text-[20px]">bookmark</span>
                              </button>
                              <button aria-label="Compartilhar" className="p-1.5 rounded-lg hover:bg-surface-container-high hover:text-secondary transition-colors text-on-surface-variant" type="button">
                                <span className="material-symbols-outlined text-[20px]">share</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                  
                  {/* Pagination / Load More */}
                  {feedItems.length > 0 && (
                    <div className="pt-space-md pb-space-lg flex justify-center">
                      <button className="px-space-lg py-space-sm bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant hover:border-outline-variant/80 font-label-md text-label-md rounded-lg transition-colors flex items-center gap-space-xs shadow-sm" type="button">
                        <span>Carregar mais tópicos</span>
                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                      </button>
                    </div>
                  )}
                  
                </div>
                
                {/* Secondary Integrated Context Section: Mobile/Tablet view */}
                <section className="xl:hidden flex flex-col gap-space-md mt-space-xl">
                  <div className="bg-surface-container border border-outline-variant p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
                        <span>Regras da Comunidade</span>
                      </h3>
                      <span className="font-code-md text-label-sm text-on-surface-variant bg-surface border border-outline-variant px-2 py-0.5 rounded">v2.4</span>
                    </div>
                    <ul className="space-y-space-xs text-body-sm font-body-sm text-on-surface-variant">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px] shrink-0 mt-0.5">check_circle</span>
                        <span>Traga evidências ou snippets técnicos ao refutar benchmarks de LLMs.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px] shrink-0 mt-0.5">check_circle</span>
                        <span>Sinalize prompts gerados e versões exatas dos modelos (ex: Claude 3.5 Sonnet Oct-24).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px] shrink-0 mt-0.5">check_circle</span>
                        <span>Respeite licenças open-weight e termos de serviço de APIs.</span>
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
            </main>
          </div>

          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
