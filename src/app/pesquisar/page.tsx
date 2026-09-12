import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import { getPublishedArticles } from '@/lib/services/articleService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import PesquisarClient from './PesquisarClient'

export const dynamic = 'force-dynamic'

export default async function PesquisarPage() {
  const supabase = createClient()
  
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Falha ao autenticar usuário na página Pesquisar', error)
  }

  let categories: any[] = []
  let topics: any[] = []
  let articles: any[] = []
  try {
    const [catData, topicsData, articlesData] = await Promise.all([
      adminService.getCategories(),
      adminService.getTopics(),
      getPublishedArticles(),
    ])
    categories = catData || []
    topics = topicsData || []
    articles = articlesData || []
  } catch (error) {
    console.error('Falha ao carregar dados na PesquisarPage', error)
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <PesquisarClient initialTopics={topics} initialArticles={articles} categories={categories} />
          </div>
          
          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
