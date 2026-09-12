import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'

export const dynamic = 'force-dynamic'

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  const supabase = createClient()

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Falha ao autenticar usuário na página Explorar', error)
  }

  let categories: any[] = []
  let topics: any[] = []
  try {
    const [fetchedCategories, fetchedTopics] = await Promise.all([
      adminService.getCategories(),
      adminService.getTopics(),
    ])
    categories = fetchedCategories || []
    topics = fetchedTopics || []
  } catch (error) {
    console.error('Falha ao carregar dados em Explorar', error)
  }

  // Agrupar contagem real de tópicos por categoria
  const topicCountByCategory: Record<string, number> = {}
  topics.forEach((t) => {
    const catId = t.category_id || t.category?.id
    if (catId) {
      topicCountByCategory[catId] = (topicCountByCategory[catId] || 0) + 1
    }
  })

  // Suporte a filtro de pesquisa
  const query = searchParams?.q?.toLowerCase().trim() || ''

  const activeCategories = categories.filter((c) => c.is_active)
  const filteredCategories = query
    ? activeCategories.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.description && c.description.toLowerCase().includes(query))
      )
    : activeCategories

  const publishedTopics = topics.filter((t) => t.is_published)
  const filteredTopics = query
    ? publishedTopics.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.content && t.content.toLowerCase().includes(query))
      )
    : publishedTopics

  const isEmoji = (str?: string) => Boolean(str && !/^[a-zA-Z0-9_ -]+$/.test(str))

  const getCategoryTheme = (slug: string, index: number) => {
    const themes = [
      { bg: 'bg-primary/10 text-primary', icon: 'psychology' },
      { bg: 'bg-secondary/10 text-secondary', icon: 'terminal' },
      { bg: 'bg-tertiary/10 text-tertiary', icon: 'photo_library' },
      { bg: 'bg-primary-container/20 text-primary', icon: 'trending_up' },
      { bg: 'bg-secondary-container/20 text-secondary', icon: 'article' },
    ]

    if (slug === 'ia-geral') return { bg: 'bg-primary-fixed text-on-primary-fixed', icon: 'psychology' }
    if (slug === 'programacao') return { bg: 'bg-primary-fixed text-on-primary-fixed', icon: 'terminal' }
    if (slug === 'imagens-e-videos') return { bg: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', icon: 'photo_library' }
    if (slug === 'negocios') return { bg: 'bg-secondary-fixed text-secondary', icon: 'trending_up' }
    if (slug === 'blog') return { bg: 'bg-surface-container-high text-primary', icon: 'campaign' }

    return themes[index % themes.length]
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />

          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <div className="flex flex-col w-full gap-space-xl">

                {/* Cabeçalho Explorar */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                  <div className="flex flex-col gap-space-xs max-w-xl">
                    <div className="flex items-center gap-space-xs">
                      <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                        Hub Temático
                      </span>
                    </div>
                    <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                      Categorias da Comunidade
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Explore discussões e tópicos agrupados pelos principais pilares de Inteligência Artificial.
                    </p>
                  </div>
                  <div className="flex items-center gap-space-sm self-start md:self-auto bg-surface-container-low px-space-md py-space-xs rounded-xl text-on-surface-variant shadow-sm">
                    <span className="material-symbols-outlined text-[18px] text-primary">forum</span>
                    <span className="font-code-md text-code-md text-on-surface font-medium">
                      {topics.length} {topics.length === 1 ? 'debate ativo' : 'debates ativos'}
                    </span>
                  </div>
                </div>

                {/* Barra de Busca de Categorias e Tópicos */}
                <form action="/explorar" method="GET" className="relative w-full">
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                      search
                    </span>
                    <input
                      type="text"
                      name="q"
                      defaultValue={query}
                      placeholder="Pesquisar por categoria, tema ou discussão..."
                      className="w-full pl-11 pr-24 py-2.5 bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                    />
                    {query ? (
                      <Link
                        href="/explorar"
                        className="absolute right-3 px-2 py-1 text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container-high rounded-md transition-colors"
                      >
                        Limpar
                      </Link>
                    ) : (
                      <button
                        type="submit"
                        className="absolute right-2 px-3 py-1.5 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:bg-primary-container transition-colors"
                      >
                        Buscar
                      </button>
                    )}
                  </div>
                </form>

                {/* Grid de Categorias Reais */}
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">category</span>
                      <span>Categorias</span>
                    </h2>
                    {query && (
                      <span className="text-body-sm font-body-sm text-on-surface-variant">
                        {filteredCategories.length} {filteredCategories.length === 1 ? 'resultado' : 'resultados'}
                      </span>
                    )}
                  </div>

                  {filteredCategories.length === 0 ? (
                    <div className="p-space-lg text-center bg-surface-container-lowest rounded-xl text-on-surface-variant font-body-sm shadow-sm border border-outline-variant/30">
                      Nenhuma categoria encontrada para &ldquo;{query}&rdquo;.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                      {filteredCategories.map((cat, index) => {
                        const theme = getCategoryTheme(cat.slug, index)
                        const count = topicCountByCategory[cat.id] || 0
                        const targetHref = cat.slug === 'blog' ? '/blog' : `/categoria/${cat.slug}`

                        return (
                          <div
                            key={cat.id}
                            className="group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden border border-outline-variant/20"
                          >
                            <div className="flex flex-col gap-space-md relative z-10">
                              <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 rounded-xl ${theme.bg} flex items-center justify-center shadow-sm`}>
                                  {isEmoji(cat.icon) ? (
                                    <span className="text-[24px] leading-none select-none">{cat.icon}</span>
                                  ) : (
                                    <span className="material-symbols-outlined text-[26px]">
                                      {cat.icon || theme.icon}
                                    </span>
                                  )}
                                </div>
                                <span className="font-label-sm text-label-sm px-space-sm py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-medium">
                                  {count} {count === 1 ? 'tópico' : 'tópicos'}
                                </span>
                              </div>

                              <div className="flex flex-col gap-space-xs">
                                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold group-hover:text-primary transition-colors flex items-center gap-space-xs">
                                  {cat.name}
                                </h3>
                                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed line-clamp-2">
                                  {cat.description || 'Discussões técnicas e novidades.'}
                                </p>
                              </div>

                              <div className="flex items-center gap-space-md py-space-xs text-outline font-label-sm text-label-sm">
                                <div className="flex items-center gap-1.5 text-on-surface-variant">
                                  <span className="material-symbols-outlined text-[16px] text-primary">chat_bubble</span>
                                  <span className="font-medium text-on-surface">Comunidade Ativa</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-space-md mt-space-md flex items-center justify-between relative z-10 border-t border-surface-container">
                              <div className="flex items-center gap-1 text-primary font-label-md text-label-md font-semibold">
                                <span>Explorar tópicos</span>
                                <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">
                                  arrow_forward
                                </span>
                              </div>
                              <Link aria-label={`Acessar categoria ${cat.name}`} className="absolute inset-0 z-20" href={targetHref} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Banner de Sugestão */}
                <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-sm border border-outline-variant/20">
                  <div className="flex items-center gap-space-md">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[22px]">lightbulb</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        Sentiu falta de uma categoria técnica?
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Inicie uma discussão ou compartilhe sua sugestão com os moderadores.
                      </span>
                    </div>
                  </div>
                  <Link
                    className="shrink-0 bg-surface-container-lowest text-on-surface hover:text-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg shadow-sm transition-colors flex items-center gap-space-xs border border-outline-variant/30"
                    href="/criar-topico"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>Sugerir Tópico</span>
                  </Link>
                </div>

                {/* Seção de Tópicos Recentes */}
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-md text-headline-md font-semibold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">schedule</span>
                      <span>{query ? 'Tópicos Encontrados' : 'Tópicos Recentes'}</span>
                    </h2>
                    <Link href="/" className="text-primary font-label-sm text-label-sm hover:underline">
                      Ver todas as discussões
                    </Link>
                  </div>

                  <div className="flex flex-col gap-space-sm">
                    {filteredTopics.length === 0 ? (
                      <div className="p-space-lg text-center bg-surface-container-lowest rounded-xl text-on-surface-variant font-body-sm shadow-sm border border-outline-variant/30">
                        {query
                          ? `Nenhum debate encontrado para "${query}".`
                          : 'Nenhum tópico encontrado no momento.'}
                      </div>
                    ) : (
                      filteredTopics.slice(0, 8).map((topic) => (
                        <Link
                          key={topic.id}
                          href={`/topico/${topic.slug}`}
                          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow transition-shadow flex flex-col gap-1.5 border border-outline-variant/20"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-label-lg text-label-lg font-semibold text-on-surface hover:text-primary transition-colors line-clamp-1">
                              {topic.title}
                            </h3>
                            {topic.category && (
                              <span className="shrink-0 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                                {topic.category.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant flex-wrap">
                            <span>@{topic.author?.username || 'membro'}</span>
                            <span>•</span>
                            <span>{new Date(topic.created_at).toLocaleDateString('pt-BR')}</span>
                            <div className="flex items-center gap-3 ml-auto text-outline font-label-sm text-label-sm">
                              <span className="flex items-center gap-1 text-on-surface-variant" title="Curtidas">
                                <span className="material-symbols-outlined text-[15px]">code</span>
                                <span>{topic.likes_count || 0}</span>
                              </span>
                              <span className="flex items-center gap-1 text-on-surface-variant" title="Respostas">
                                <span className="material-symbols-outlined text-[15px]">forum</span>
                                <span>{topic.comments_count || 0}</span>
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </main>
          </div>

          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
