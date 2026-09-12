import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import InteractiveFeed from '@/components/feed/InteractiveFeed'
import { adminService } from '@/lib/services/adminService'
import { getPublishedArticles } from '@/lib/services/articleService'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HomePage({ searchParams }: { searchParams: { filter?: string; sort?: string } }) {
  const supabase = createClient()
  let user = null
  let topics: any[] = []
  let categories: any[] = []
  let articles: any[] = []
  const currentFilter = searchParams.filter || searchParams.sort || 'recentes'

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
  if (currentFilter === 'comentadas') {
    feedItems.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
  } else if (currentFilter === 'alta') {
    feedItems.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
  } else if (currentFilter === 'sem-resposta') {
    feedItems = feedItems.filter((t) => (t.comments_count || 0) === 0)
    feedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else {
    // mais recentes (padrão)
    feedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <InteractiveFeed items={feedItems} currentFilter={currentFilter} />
            </main>
          </div>

          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
