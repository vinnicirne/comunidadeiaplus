import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import DiscussoesEmAltaClient from './DiscussoesEmAltaClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Discussões em Alta | Comunidade IA PLUS',
  description: 'Confira os tópicos, análises e experimentos com inteligência artificial mais votados e debatidos pela comunidade.',
  openGraph: {
    title: 'Discussões em Alta | Comunidade IA PLUS',
    description: 'Confira os tópicos mais votados e debatidos da comunidade IA PLUS.',
    type: 'website',
  },
}

export default async function DiscussoesEmAltaPage({
  searchParams,
}: {
  searchParams?: { category?: string; sort?: string }
}) {
  const supabase = createClient()

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Falha ao autenticar usuário em Discussões em Alta:', error)
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
    console.error('Falha ao carregar dados em Discussões em Alta:', error)
  }

  const publishedTopics = topics.filter((t: any) => t.is_published)

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />

          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <DiscussoesEmAltaClient
                initialTopics={publishedTopics}
                categories={categories}
                user={user}
                initialCategory={searchParams?.category || ''}
                initialSort={searchParams?.sort || 'votadas'}
              />
            </main>
          </div>

          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
