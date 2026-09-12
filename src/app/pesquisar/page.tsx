import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import { getPublishedArticles } from '@/lib/services/articleService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import PesquisarClient from './PesquisarClient'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams?: {
    q?: string
    type?: string
    category?: string
    sort?: string
  }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = searchParams?.q?.trim() || ''
  return {
    title: query
      ? `Pesquisa: "${query}" | Comunidade IA PLUS`
      : 'Pesquisar | Comunidade IA PLUS',
    description: 'Explore discussões técnicas, artigos de blog e membros da Comunidade IA PLUS.',
  }
}

export default async function PesquisarPage({ searchParams }: Props) {
  const supabase = createClient()
  
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Falha ao autenticar usuário na página Pesquisar:', error)
  }

  let categories: any[] = []
  let topics: any[] = []
  let articles: any[] = []
  let profiles: any[] = []

  try {
    const [catData, topicsData, articlesData, profilesData] = await Promise.all([
      adminService.getCategories(),
      adminService.getTopics(),
      getPublishedArticles(),
      adminService.getUsers(),
    ])
    categories = catData || []
    topics = (topicsData || []).filter((t: any) => t.is_published)
    articles = articlesData || []
    profiles = profilesData || []
  } catch (error) {
    console.error('Falha ao carregar dados na PesquisarPage:', error)
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <PesquisarClient
              initialTopics={topics}
              initialArticles={articles}
              initialProfiles={profiles}
              categories={categories}
              initialQuery={searchParams?.q || ''}
              initialType={searchParams?.type || 'all'}
              initialCategory={searchParams?.category || 'all'}
              initialSort={searchParams?.sort || 'recentes'}
            />
          </div>
          
          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
