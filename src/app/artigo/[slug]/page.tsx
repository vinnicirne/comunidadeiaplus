import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import { getArticleBySlug, incrementArticleViews } from '@/lib/services/articleService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import ArtigoClient from './ArtigoClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug).catch(() => null)
  if (!article) {
    return { title: 'Artigo não encontrado | Comunidade IA PLUS' }
  }

  const description = article.subtitle || article.content?.slice(0, 160).replace(/[#*`_\[\]]/g, '') || ''

  return {
    title: `${article.title} | Blog IA PLUS`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      images: article.cover_image_url ? [{ url: article.cover_image_url }] : [],
    },
  }
}

export default async function ArtigoPage({ params }: Props) {
  const supabase = createClient()

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Falha ao autenticar usuário em ArtigoPage:', error)
  }

  let article = null
  try {
    article = await getArticleBySlug(params.slug)
  } catch (error) {
    console.error('Falha ao carregar artigo por slug:', error)
  }

  if (!article || (article.status !== 'published' && article.author_id !== user?.id)) {
    notFound()
  }

  // Incrementa a visualização de forma assíncrona
  incrementArticleViews(article.id).catch(console.error)

  // Verifica permissões e estado de like
  let userLiked = false
  let userRole = 'member'

  if (user) {
    try {
      const [likeRes, profileRes] = await Promise.all([
        supabase.from('likes').select('id').eq('topic_id', article.id).eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      ])
      userLiked = !!likeRes.data
      if (profileRes.data?.role) {
        userRole = profileRes.data.role
      }
    } catch (_) {}
  }

  let categories: any[] = []
  try {
    categories = (await adminService.getCategories()) || []
  } catch (error) {
    console.error('Falha ao carregar categorias em ArtigoPage:', error)
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />

          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <ArtigoClient
              article={article}
              user={user}
              userLiked={userLiked}
              userRole={userRole}
            />
          </div>

          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
