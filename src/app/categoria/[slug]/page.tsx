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
              <div className="flex flex-col w-full gap-space-lg">
                
                {/* Header Contextual */}
                <section className="bg-surface-container border border-outline-variant/60 rounded-xl p-space-lg shadow-lg relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-primary/10 pointer-events-none blur-3xl"></div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md relative z-10">
                    <div className="flex items-center gap-space-md">
                      <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-fixed-dim shrink-0 shadow-inner">
                        <span className="material-symbols-outlined text-[32px] text-secondary">{currentCategory.icon || 'category'}</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-sm flex-wrap">
                          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">{currentCategory.name}</h1>
                        </div>
                        <span className="font-body-sm text-body-sm text-outline">Categoria Principal</span>
                      </div>
                    </div>
                    
                    {/* Ações Rápidas */}
                    <div className="flex items-center gap-space-sm w-full sm:w-auto relative z-10">
                      {user ? (
                        <Link href={`/criar-topico?category=${currentCategory.id}`} className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-[0_0_14px_rgba(99,102,241,0.35)]">
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          <span className="whitespace-nowrap">Nova discussão</span>
                        </Link>
                      ) : (
                        <Link href="/cadastro" className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-[0_0_14px_rgba(99,102,241,0.35)]">
                          <span className="material-symbols-outlined text-[18px]">person_add</span>
                          <span className="whitespace-nowrap">Participar da Comunidade</span>
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {/* Descrição */}
                  <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed max-w-2xl mt-4 relative z-10">
                    {currentCategory.description || `Explore discussões, artigos e tutoriais sobre ${currentCategory.name}.`}
                  </p>
                  
                  {/* Métricas / Estatísticas Minimalistas */}
                  <div className="flex flex-wrap items-center gap-space-md sm:gap-space-xl pt-space-xs relative z-10">
                    <div className="flex items-baseline gap-space-xs">
                      <span className="font-headline-md text-headline-md text-on-surface font-semibold">{publishedTopics.length}</span>
                      <span className="font-body-sm text-body-sm text-outline">discussões ativas</span>
                    </div>
                  </div>
                </section>

                {/* Filtros e Ordenação */}
                <section className="flex flex-col gap-space-sm">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md bg-surface-container border border-outline-variant/50 p-space-sm rounded-xl shadow-md">
                    {/* Abas de Ordenação */}
                    <nav aria-label="Ordenação do feed" className="flex items-center gap-space-xs overflow-x-auto pb-1 md:pb-0">
                      <button className="px-space-md py-space-xs rounded-lg font-label-md text-label-md font-semibold bg-primary text-on-primary shadow-sm transition-colors whitespace-nowrap">
                        Mais recentes
                      </button>
                      <button className="px-space-md py-space-xs rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors whitespace-nowrap">
                        Mais votadas
                      </button>
                      <button className="px-space-md py-space-xs rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors whitespace-nowrap">
                        Em alta
                      </button>
                    </nav>
                  </div>
                </section>

                {/* Feed de Discussões */}
                <section className="flex flex-col gap-space-md">
                  {publishedTopics.length === 0 ? (
                    <div className="p-space-lg text-center bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-body-md text-on-surface-variant">
                      Nenhuma discussão publicada ainda nesta categoria.
                    </div>
                  ) : (
                    publishedTopics.map((topic) => (
                      <article key={topic.id} className="bg-surface-container border border-outline-variant/60 rounded-xl p-space-lg shadow-md hover:border-primary/50 transition-all flex gap-space-md group">
                        
                        {/* Coluna de Votação Lateral */}
                        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                          <button aria-label="Votar a favor" className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-secondary transition-colors" type="button">
                            <span className="material-symbols-outlined text-[20px]">keyboard_arrow_up</span>
                          </button>
                          <span className="font-label-md text-label-md font-semibold text-secondary select-none">
                            {topic.likes_count || 0}
                          </span>
                          <button aria-label="Votar contra" className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors" type="button">
                            <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
                          </button>
                        </div>
                        
                        {/* Conteúdo da Discussão */}
                        <div className="flex flex-col gap-space-sm flex-1 min-w-0">
                          {/* Metadados do Topo */}
                          <div className="flex items-center justify-between gap-space-sm flex-wrap">
                            <div className="flex items-center gap-space-sm">
                              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-secondary font-semibold text-label-sm uppercase">
                                {topic.author?.username?.slice(0, 2) || 'A'}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-label-md text-label-md font-semibold text-on-surface">
                                  {topic.author?.full_name || topic.author?.username || 'Membro'}
                                </span>
                                <span className="font-body-sm text-body-sm text-outline">
                                  @{topic.author?.username}
                                </span>
                                <span className="text-outline text-body-sm">·</span>
                                <span className="font-body-sm text-body-sm text-outline">
                                  {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                            <span className="px-space-sm py-0.5 rounded bg-surface-container-high border border-outline-variant/40 font-label-sm text-label-sm text-on-surface-variant font-medium">
                              {currentCategory.name}
                            </span>
                          </div>
                          
                          {/* Título */}
                          <Link href={`/topico/${topic.slug}`} className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-secondary transition-colors leading-snug">
                            {topic.title}
                          </Link>
                          
                          {/* Resumo */}
                          <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 leading-relaxed">
                            {topic.content}
                          </p>
                          
                          {/* Tags */}
                          <div className="flex items-center gap-space-xs flex-wrap pt-space-xs">
                            {/* Futuramente exibir as tags do post aqui */}
                          </div>
                          
                          {/* Rodapé de Métricas e Ações */}
                          <div className="flex items-center justify-between pt-space-xs text-outline font-label-sm text-label-sm">
                            <div className="flex items-center gap-space-lg">
                              <Link href={`/topico/${topic.slug}`} className="inline-flex items-center gap-1 hover:text-on-surface cursor-pointer transition-colors">
                                <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                                <span>{topic.comments_count || 0} respostas</span>
                              </Link>
                              <span className="inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                <span>{topic.views_count || 0} visualizações</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-space-xs">
                              <button aria-label="Salvar discussão" className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors" type="button">
                                <span className="material-symbols-outlined text-[18px]">bookmark</span>
                              </button>
                              <button aria-label="Compartilhar" className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors" type="button">
                                <span className="material-symbols-outlined text-[18px]">share</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </section>

                {/* Paginação */}
                {publishedTopics.length > 0 && (
                  <section className="flex flex-col sm:flex-row items-center justify-between gap-space-md py-space-md font-label-md text-label-md border-t border-outline-variant/40 mt-space-md">
                    <span className="text-outline font-body-sm text-body-sm">
                      Mostrando <span className="font-medium text-on-surface">1–{publishedTopics.length}</span> de <span className="font-medium text-on-surface">{publishedTopics.length}</span> discussões
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="p-2 rounded-lg text-outline opacity-40 cursor-not-allowed flex items-center justify-center" disabled type="button">
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-semibold flex items-center justify-center shadow-md shadow-primary/20" type="button">
                        1
                      </button>
                      <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center border border-outline-variant/50 transition-colors" disabled type="button">
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </div>
                  </section>
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
