import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import EscreverArtigoClient from './EscreverArtigoClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Escrever Artigo | Blog IA PLUS',
  description: 'Compartilhe seus artigos, tutoriais técnicos e experimentos de inteligência artificial com a comunidade.',
}

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
  } catch (error) {
    console.error('Falha ao autenticar usuário na página Escrever Artigo', error)
  }

  if (!user) {
    redirect('/login?next=/escrever-artigo')
  }

  let categories: any[] = []
  try {
    categories = (await adminService.getCategories()) || []
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
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <EscreverArtigoClient categories={categories} initialArticle={initialArticle} />
          </div>
          
          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
