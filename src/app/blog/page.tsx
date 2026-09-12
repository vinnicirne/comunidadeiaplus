import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import { getPublishedArticles } from '@/lib/services/articleService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import BlogClient from './BlogClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog Técnico | Comunidade IA PLUS',
  description: 'Artigos, tutoriais aprofundados, benchmarks e engenharia de prompts com Inteligência Artificial.',
  openGraph: {
    title: 'Blog Técnico | Comunidade IA PLUS',
    description: 'Artigos, tutoriais aprofundados, benchmarks e engenharia de prompts com Inteligência Artificial.',
    type: 'website',
    images: [
      {
        url: '/api/og?title=Blog%20T%C3%A9cnico%20IA%20PLUS&subtitle=Artigos%2C%20tutoriais%20e%20engenharia%20de%20prompts&category=Blog&type=artigo',
        width: 1200,
        height: 630,
        alt: 'Blog IA PLUS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Técnico | Comunidade IA PLUS',
    description: 'Artigos, tutoriais aprofundados, benchmarks e engenharia de prompts com Inteligência Artificial.',
    images: ['/api/og?title=Blog%20T%C3%A9cnico%20IA%20PLUS&subtitle=Artigos%2C%20tutoriais%20e%20engenharia%20de%20prompts&category=Blog&type=artigo'],
  },
}

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
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <BlogClient articles={articles} />
            </main>
          </div>
          
          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
