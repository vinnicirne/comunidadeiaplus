import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import { adminService } from '@/lib/services/adminService'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams?: { sort?: string }
}) {
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
  const currentCategory = categories.find((c) => c.slug === params.slug)

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
  const currentSort = searchParams?.sort || 'recentes'

  if (currentSort === 'votadas') {
    publishedTopics.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
  } else if (currentSort === 'alta') {
    publishedTopics.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
  } else {
    // recentes
    publishedTopics.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const isEmoji = (str?: string) => Boolean(str && !/^[a-zA-Z0-9_ -]+$/.test(str))

  const getSortTabClass = (sortKey: string) => {
    const isActive = currentSort === sortKey
    return isActive
      ? 'px-space-md py-space-xs rounded-lg font-label-md text-label-md font-semibold bg-surface-container-lowest text-primary shadow-sm transition-colors whitespace-nowrap'
      : 'px-space-md py-space-xs rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors whitespace-nowrap'
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />

          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <div className="flex flex-col w-full gap-space-lg">

                {/* Header Contextual da Categoria */}
                <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md relative z-10">
                    <div className="flex items-center gap-space-md">
                      <div className="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0 shadow-sm">
                        {isEmoji(currentCategory.icon) ? (
                          <span className="text-[32px] leading-none select-none">{currentCategory.icon}</span>
                        ) : (
                          <span className="material-symbols-outlined text-[32px] text-primary">
                            {currentCategory.icon || 'category'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-sm flex-wrap">
                          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                            {currentCategory.name}
                          </h1>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Categoria Oficial
                        </span>
                      </div>
                    </div>

                    {/* Ações Rápidas */}
                    <div className="flex items-center gap-space-sm w-full sm:w-auto relative z-10">
                      {user ? (
                        <Link
                          href={`/criar-topico?category=${currentCategory.id}`}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          <span className="whitespace-nowrap">Nova discussão</span>
                        </Link>
                      ) : (
                        <Link
                          href="/cadastro"
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[18px]">person_add</span>
                          <span className="whitespace-nowrap">Participar da Comunidade</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Descrição */}
                  <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed max-w-2xl mt-4 relative z-10">
                    {currentCategory.description ||
                      `Explore discussões, artigos e tutoriais sobre ${currentCategory.name}.`}
                  </p>

                  {/* Métricas Reais */}
                  <div className="flex flex-wrap items-center gap-space-md sm:gap-space-xl pt-space-md relative z-10 border-t border-surface-container mt-space-md">
                    <div className="flex items-baseline gap-space-xs">
                      <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                        {publishedTopics.length}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {publishedTopics.length === 1 ? 'discussão ativa' : 'discussões ativas'}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Filtros e Ordenação */}
                <section className="flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between gap-space-md bg-surface-container-low p-1.5 rounded-xl">
                    <nav aria-label="Ordenação do feed" className="flex items-center gap-space-xs overflow-x-auto w-full sm:w-auto">
                      <Link
                        href={`/categoria/${currentCategory.slug}?sort=recentes`}
                        className={getSortTabClass('recentes')}
                      >
                        Mais recentes
                      </Link>
                      <Link
                        href={`/categoria/${currentCategory.slug}?sort=votadas`}
                        className={getSortTabClass('votadas')}
                      >
                        Mais curtidas
                      </Link>
                      <Link
                        href={`/categoria/${currentCategory.slug}?sort=alta`}
                        className={getSortTabClass('alta')}
                      >
                        Em alta
                      </Link>
                    </nav>
                  </div>
                </section>

                {/* Feed de Discussões */}
                <section className="flex flex-col gap-space-md">
                  {publishedTopics.length === 0 ? (
                    <div className="p-space-xl text-center bg-surface-container-lowest rounded-xl font-body-md text-on-surface-variant shadow-sm border border-outline-variant/30">
                      Nenhuma discussão publicada ainda nesta categoria.
                    </div>
                  ) : (
                    publishedTopics.map((topic) => (
                      <article
                        key={topic.id}
                        className="group bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 rounded-xl p-space-md sm:p-space-lg shadow-sm hover:shadow flex gap-space-md sm:gap-space-lg border border-outline-variant/20"
                      >
                        {/* Rail de Likes </> */}
                        <div className="flex flex-col items-center justify-start shrink-0 bg-surface-container-low group-hover:bg-surface-container-lowest px-2 py-space-sm rounded-lg transition-colors">
                          <span
                            className="material-symbols-outlined text-[18px] text-primary"
                            title="Curtidas"
                          >
                            code
                          </span>
                          <span className="font-label-md text-label-md font-semibold text-on-surface py-0.5 select-none">
                            {topic.likes_count || 0}
                          </span>
                        </div>

                        {/* Conteúdo da Discussão */}
                        <div className="flex flex-col gap-space-xs flex-1 min-w-0">
                          {/* Metadados do Topo */}
                          <div className="flex items-center justify-between gap-space-sm flex-wrap">
                            <div className="flex items-center gap-space-xs min-w-0">
                              <div className="w-6 h-6 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-[11px] shrink-0 uppercase">
                                {topic.author?.username?.slice(0, 1) || 'M'}
                              </div>
                              <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                                {topic.author?.full_name || topic.author?.username || 'Membro'}
                              </span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                                @{topic.author?.username || 'membro'}
                              </span>
                              <span className="text-on-surface-variant text-body-sm shrink-0">·</span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant shrink-0">
                                {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>

                            <span className="shrink-0 px-2 py-0.5 rounded bg-primary-fixed/40 text-primary font-label-sm text-label-sm font-medium">
                              {currentCategory.name}
                            </span>
                          </div>

                          {/* Título */}
                          <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug mt-0.5">
                            <Link href={`/topico/${topic.slug}`} className="block focus:outline-none">
                              {topic.title}
                            </Link>
                          </h2>

                          {/* Resumo */}
                          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                            {topic.content}
                          </p>

                          {/* Rodapé de Métricas e Ações */}
                          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm mt-1">
                            <div className="flex items-center gap-space-lg">
                              <Link
                                href={`/topico/${topic.slug}`}
                                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">forum</span>
                                <span>{topic.comments_count || 0} respostas</span>
                              </Link>
                              <span className="inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                                <span>{topic.views_count || 0} visualizações</span>
                              </span>
                            </div>

                            <Link
                              href={`/topico/${topic.slug}`}
                              className="text-primary hover:underline font-label-sm text-label-sm font-medium"
                            >
                              Ver discussão →
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </section>

                {/* Indicador de Discussões */}
                {publishedTopics.length > 0 && (
                  <section className="flex items-center justify-between py-space-md font-label-md text-label-md border-t border-surface-container mt-space-md text-on-surface-variant">
                    <span className="font-body-sm text-body-sm">
                      Exibindo <span className="font-medium text-on-surface">{publishedTopics.length}</span>{' '}
                      {publishedTopics.length === 1 ? 'discussão' : 'discussões'} nesta categoria
                    </span>
                    <Link
                      href="/explorar"
                      className="text-primary hover:underline font-label-sm text-label-sm"
                    >
                      Voltar para todas as categorias
                    </Link>
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
