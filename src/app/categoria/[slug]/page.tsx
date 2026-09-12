import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import { adminService } from '@/lib/services/adminService'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  if (params.slug === 'blog') {
    redirect('/blog')
  }

  const supabase = createClient()
  let user = null
  let topics: any[] = []
  let categories: any[] = []

  try {
    const [authResult, fetchedCategories] = await Promise.all([
      supabase.auth.getUser(),
      adminService.getCategories(),
    ])
    user = authResult.data?.user || null
    categories = fetchedCategories || []
  } catch (error) {
    console.error('Falha ao carregar dados do Supabase na CategoriaPage:', error)
  }

  // Encontrar a categoria pelo slug
  const currentCategory = categories.find(c => c.slug === params.slug)
  
  if (!currentCategory) {
    notFound()
  }

  // Buscar tópicos dessa categoria
  try {
    topics = await adminService.getTopics(currentCategory.id)
  } catch (error) {
    console.error('Falha ao carregar tópicos da categoria:', error)
  }

  const publishedTopics = topics.filter((t) => t.is_published)

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <div className="flex flex-col w-full">
                
                {/* Category Header */}
                <section className="flex flex-col gap-space-md mb-space-lg bg-surface-container-low p-space-xl rounded-xl">
                  <div className="flex items-center gap-space-sm mb-2">
                    <span className="material-symbols-outlined text-[32px] text-primary">{currentCategory.icon || 'category'}</span>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">{currentCategory.name}</h1>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {currentCategory.description}
                  </p>
                </section>

                {/* Feed Header & Controller Strip */}
                <section className="flex flex-col gap-space-md mb-space-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                    <div className="flex items-baseline gap-space-sm">
                      <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">Discussões</h2>
                      <span className="font-code-md text-code-md text-on-surface-variant bg-surface-container px-space-xs py-0.5 rounded">
                        {publishedTopics.length} tópicos
                      </span>
                    </div>
                    {user ? (
                      <Link href={`/criar-topico?category=${currentCategory.id}`} className="sm:hidden inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg shadow-sm transition-all duration-200 hover:shadow active:scale-[0.99]">
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
                      <button className="filter-btn active flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-primary shadow-sm font-label-md text-label-md font-medium transition-colors" type="button">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        <span>Mais recentes</span>
                      </button>
                      <button className="filter-btn flex items-center gap-space-xs px-space-md py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md font-medium transition-colors" type="button">
                        <span className="material-symbols-outlined text-[18px]">mode_comment</span>
                        <span>Mais comentadas</span>
                      </button>
                      <button className="filter-btn flex items-center gap-space-xs px-space-md py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md font-medium transition-colors" type="button">
                        <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                        <span>Em alta</span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Discussion Stream Stack */}
                <div className="flex flex-col gap-space-md">
                  {publishedTopics.length === 0 ? (
                    <div className="p-space-lg text-center bg-surface-container-lowest rounded-xl font-body-md text-on-surface-variant">
                      Nenhuma discussão publicada ainda nesta categoria.
                    </div>
                  ) : (
                    publishedTopics.map((topic) => (
                      <article key={topic.id} className="group bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 rounded-xl p-space-md sm:p-space-lg shadow-sm hover:shadow flex gap-space-md sm:gap-space-lg">
                        
                        {/* Vertical Vote Rail */}
                        <div className="flex flex-col items-center justify-start shrink-0 bg-surface-container-low group-hover:bg-surface-container-lowest px-2 py-space-sm rounded-lg transition-colors">
                          <button aria-label="Votar positivo" className="vote-up text-on-surface-variant hover:text-primary transition-colors p-0.5" type="button">
                            <span className="material-symbols-outlined text-[20px]">expand_less</span>
                          </button>
                          <span className="font-label-md text-label-md font-semibold text-on-surface py-0.5 vote-count">
                            {topic.likes_count || 0}
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
                              {topic.author?.avatar_url ? (
                                <img src={topic.author.avatar_url} className="w-6 h-6 rounded-full object-cover shrink-0" alt="Avatar" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-label-md font-bold uppercase shrink-0">
                                  {topic.author?.username?.slice(0, 1) || 'A'}
                                </div>
                              )}
                              <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                                {topic.author?.full_name || topic.author?.username || 'Membro'}
                              </span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant font-code-md truncate">
                                @{topic.author?.username}
                              </span>
                              <span className="text-on-surface-variant text-body-sm shrink-0">·</span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant shrink-0">
                                {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>

                          {/* Topic Title */}
                          <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors tracking-tight mt-0.5">
                            <Link href={`/topico/${topic.slug}`} className="block focus:outline-none">
                              {topic.title}
                            </Link>
                          </h2>

                          {/* Snippet / Context */}
                          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                            {topic.content}
                          </p>

                          {/* Topic Badges & Bottom Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs mt-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Tags could go here se existissem */}
                            </div>
                            <div className="flex items-center gap-space-md text-on-surface-variant">
                              <Link href={`/topico/${topic.slug}`} className="flex items-center gap-1 hover:text-primary transition-colors font-label-sm text-label-sm">
                                <span className="material-symbols-outlined text-[16px]">forum</span>
                                <span>{topic.comments_count || 0} respostas</span>
                              </Link>
                              <button aria-label="Salvar discussão" className="bookmark-btn flex items-center hover:text-primary transition-colors" type="button">
                                <span className="material-symbols-outlined text-[16px]">bookmark_border</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {publishedTopics.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md mt-space-xl pt-space-lg bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm">
                    <div className="font-body-sm text-body-sm text-on-surface-variant">
                      Mostrando <span className="font-semibold text-on-surface font-code-md">1–{publishedTopics.length}</span> de <span className="font-semibold text-on-surface font-code-md">{publishedTopics.length}</span> discussões
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
                
              </div>
            </main>
          </div>

          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
