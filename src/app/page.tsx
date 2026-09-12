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
      ? "filter-btn active flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-primary shadow-sm font-label-md text-label-md font-medium transition-colors"
      : "filter-btn flex items-center gap-space-xs px-space-md py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md font-medium transition-colors"
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <div className="flex flex-col w-full">
                
                {/* Feed Header & Controller Strip */}
                <section className="flex flex-col gap-space-md mb-space-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                    <div className="flex items-baseline gap-space-sm">
                      <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">Discussões e Artigos</h1>
                      <span className="font-code-md text-code-md text-on-surface-variant bg-surface-container px-space-xs py-0.5 rounded">
                        {feedItems.length} itens
                      </span>
                    </div>
                    {user ? (
                      <Link href="/criar-topico" className="sm:hidden inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg shadow-sm transition-all duration-200 hover:shadow active:scale-[0.99]">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span>Criar discussão</span>
                      </Link>
                    ) : (
                      <Link href="/cadastro" className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg shadow-sm transition-all duration-200 hover:shadow active:scale-[0.99]">
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        <span>Participar da Comunidade</span>
                      </Link>
                    )}
                  </div>
                  
                  {/* Filter Pill Tabs & Visual Metrics */}
                  <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-1.5 rounded-xl">
                    <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto" id="feed-filters">
                      <Link href="/?sort=recentes" className={getTabClass('recentes')}>
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        <span>Mais recentes</span>
                      </Link>
                      <Link href="/?sort=comentadas" className={getTabClass('comentadas')}>
                        <span className="material-symbols-outlined text-[18px]">mode_comment</span>
                        <span>Mais comentadas</span>
                      </Link>
                      <Link href="/?sort=alta" className={getTabClass('alta')}>
                        <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                        <span>Em alta</span>
                      </Link>
                      <Link href="/?sort=sem-resposta" className={getTabClass('sem-resposta')}>
                        <span className="material-symbols-outlined text-[18px]">help_outline</span>
                        <span>Sem resposta</span>
                      </Link>
                    </div>
                    
                    {/* Feed Quick Search / View Density */}
                    <div className="hidden md:flex items-center gap-space-xs px-space-xs text-on-surface-variant">
                      <span className="font-label-sm text-label-sm">Ordem por atividade</span>
                      <span className="material-symbols-outlined text-[18px]">swap_vert</span>
                    </div>
                  </div>
                </section>

                {/* Discussion Stream Stack */}
                <div className="flex flex-col gap-space-md">
                  {feedItems.length === 0 ? (
                    <div className="p-space-lg text-center bg-surface-container-lowest rounded-xl font-body-md text-on-surface-variant">
                      Nenhum item encontrado para este filtro.
                    </div>
                  ) : (
                    feedItems.map((item) => (
                      <article key={`${item.type}-${item.id}`} className="group bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 rounded-xl p-space-md sm:p-space-lg shadow-sm hover:shadow flex gap-space-md sm:gap-space-lg">
                        
                        {/* Vertical Vote Rail */}
                        <div className="flex flex-col items-center justify-start shrink-0 bg-surface-container-low group-hover:bg-surface-container-lowest px-2 py-space-sm rounded-lg transition-colors">
                          <button aria-label="Votar positivo" className="vote-up text-on-surface-variant hover:text-primary transition-colors p-0.5" type="button">
                            <span className="material-symbols-outlined text-[20px]">expand_less</span>
                          </button>
                          <span className="font-label-md text-label-md font-semibold text-on-surface py-0.5 vote-count">
                            {item.likes_count || 0}
                          </span>
                          <button aria-label="Votar negativo" className="vote-down text-on-surface-variant hover:text-error transition-colors p-0.5" type="button">
                            <span className="material-symbols-outlined text-[20px]">expand_more</span>
                          </button>
                        </div>

                        {/* Main Topic Content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-space-xs">
                          {/* Author / Meta Header */}
                          <div className="flex items-center justify-between gap-space-sm">
                            <div className="flex items-center gap-space-xs min-w-0">
                              {item.author?.avatar_url ? (
                                <img src={item.author.avatar_url} className="w-6 h-6 rounded-full object-cover shrink-0" alt="Avatar" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-label-md font-bold uppercase shrink-0">
                                  {item.author?.username?.slice(0, 1) || item.author?.full_name?.slice(0, 1) || 'A'}
                                </div>
                              )}
                              <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                                {item.author?.full_name || item.author?.username || 'Membro'}
                              </span>
                              {item.author?.username && (
                                <span className="font-label-sm text-label-sm text-on-surface-variant font-code-md truncate">
                                  @{item.author.username}
                                </span>
                              )}
                              <span className="text-on-surface-variant text-body-sm shrink-0">·</span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant shrink-0">
                                {new Date(item.updated_at || item.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            
                            {item.type === 'topic' && item.category && (
                              <Link href={`/categoria/${item.category.slug}`} className="shrink-0 inline-flex items-center gap-1 font-label-sm text-label-sm text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full font-medium hover:bg-primary-fixed transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                <span>{item.category.name}</span>
                              </Link>
                            )}
                            {item.type === 'article' && (
                              <Link href="/blog" className="shrink-0 inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary bg-secondary-fixed/40 px-2 py-0.5 rounded-full font-medium hover:bg-secondary-fixed transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                <span>Artigo</span>
                              </Link>
                            )}
                          </div>

                          {/* Topic Title */}
                          <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors tracking-tight mt-0.5">
                            <Link href={item.type === 'article' ? `/artigo/${item.slug}` : `/topico/${item.slug}`} className="block focus:outline-none">
                              {item.title}
                            </Link>
                          </h2>

                          {/* Snippet / Context */}
                          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                            {item.type === 'article' ? (item.subtitle || item.content) : item.content}
                          </p>

                          {/* Topic Badges & Bottom Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs mt-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Tags could go here se existissem */}
                            </div>
                            <div className="flex items-center gap-space-md text-on-surface-variant">
                              <Link href={item.type === 'article' ? `/artigo/${item.slug}` : `/topico/${item.slug}`} className="flex items-center gap-1 hover:text-primary transition-colors font-label-sm text-label-sm">
                                <span className="material-symbols-outlined text-[16px]">forum</span>
                                <span>{item.comments_count || 0} respostas</span>
                              </Link>
                              <button aria-label="Salvar discussão" className="bookmark-btn flex items-center hover:text-primary transition-colors" type="button">
                                <span className="material-symbols-outlined text-[16px]">bookmark_border</span>
                              </button>
                              <button aria-label="Compartilhar" className="flex items-center hover:text-primary transition-colors" type="button">
                                <span className="material-symbols-outlined text-[16px]">share</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                {/* Pagination & Feed Utility Footer */}
                {feedItems.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md mt-space-xl pt-space-lg bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm">
                    <div className="font-body-sm text-body-sm text-on-surface-variant">
                      Mostrando <span className="font-semibold text-on-surface font-code-md">1–{feedItems.length}</span> de <span className="font-semibold text-on-surface font-code-md">{feedItems.length}</span> itens
                    </div>
                    <nav aria-label="Paginação de tópicos" className="flex items-center gap-1">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40" disabled type="button">
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md font-semibold" type="button">1</button>
                      <button className="px-space-sm h-8 rounded-lg flex items-center gap-1 text-on-surface-variant hover:bg-surface-container transition-colors font-label-md text-label-md disabled:opacity-40" disabled type="button">
                        <span>Próximo</span>
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </nav>
                  </div>
                )}
                
                {/* Secondary Integrated Context Section: Mobile/Tablet view */}
                <section className="xl:hidden flex flex-col gap-space-md mt-space-xl">
                  <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                        <span>Regras da Comunidade</span>
                      </h3>
                    </div>
                    <ul className="space-y-space-xs text-body-sm font-body-sm text-on-surface-variant">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                        <span>Traga evidências ou snippets técnicos ao refutar benchmarks de LLMs.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
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
