import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import { adminService } from '@/lib/services/adminService'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import CategoriaClient from './CategoriaClient'

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

  // Buscar tópicos dessa categoria com suporte a autor
  try {
    topics = await adminService.getTopics(currentCategory.id)
  } catch (error) {
    console.error('Falha ao carregar tópicos da categoria:', error)
  }

  const publishedTopics = topics.filter((t) => t.is_published)
  const currentSort = searchParams?.sort || 'recentes'

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />

          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-4xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <CategoriaClient
                currentCategory={currentCategory}
                initialTopics={publishedTopics}
                user={user}
                initialSort={currentSort}
              />
            </main>
          </div>

          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
