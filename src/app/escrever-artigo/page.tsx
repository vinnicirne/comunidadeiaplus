import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import EscreverArtigoClient from './EscreverArtigoClient'

export const dynamic = 'force-dynamic'

export default async function EscreverArtigoPage({
  searchParams,
}: {
  searchParams?: { id?: string }
}) {
  const supabase = createClient()
  
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (!user) {
      redirect('/login')
    }
  } catch (error) {
    console.error('Falha ao autenticar usuário na página Escrever Artigo', error)
    redirect('/login')
  }

  let categories: any[] = []
  try {
    categories = await adminService.getCategories()
  } catch (error) {
    console.error('Falha ao carregar categorias', error)
  }

  let initialArticle = null
  if (searchParams?.id) {
    try {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('id', searchParams.id)
        .eq('author_id', user.id)
        .maybeSingle()
      initialArticle = data
    } catch (err) {
      console.error('Falha ao carregar artigo por id:', err)
    }
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          {/* For the writer view, we often hide or collapse sidebars, but we'll stick to the layout provided */}
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <EscreverArtigoClient categories={categories} initialArticle={initialArticle} />
          </div>
          
          {/* We might want to hide the right sidebar to give more room for writing, 
              but since the layout specifies xl:pr-80 we keep it. */}
          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
