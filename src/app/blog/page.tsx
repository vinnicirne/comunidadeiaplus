import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import { getPublishedArticles } from '@/lib/services/articleService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import BlogClient from './BlogClient'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const supabase = createClient()
  
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Falha ao autenticar usuário na página de Blog', error)
  }

  let categories: any[] = []
  try {
    categories = await adminService.getCategories()
  } catch (error) {
    console.error('Falha ao carregar categorias', error)
  }

  const articles = await getPublishedArticles()

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <BlogClient articles={articles} />
          </div>
          
          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
