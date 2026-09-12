import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { adminService } from '@/lib/services/adminService'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import TopicoClient from './TopicoClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: topic } = await supabase
    .from('topics')
    .select('title, content, category:categories(name)')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!topic) {
    return {
      title: 'Discussão não encontrada | Comunidade IA PLUS',
    }
  }

  const snippet = topic.content?.slice(0, 160).replace(/[#*`_\[\]]/g, '') || ''
  
  // Tenta extrair a primeira imagem do Markdown
  const imgMatch = topic.content?.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/)
  const categoryName = (topic.category as any)?.name || 'Discussão'
  
  const ogImageUrl = imgMatch 
    ? imgMatch[1] 
    : `/api/og?title=${encodeURIComponent(topic.title)}&subtitle=${encodeURIComponent(snippet)}&category=${encodeURIComponent(categoryName)}&type=discussao`

  return {
    title: `${topic.title} | Comunidade IA PLUS`,
    description: snippet,
    openGraph: {
      title: topic.title,
      description: snippet,
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: topic.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: topic.title,
      description: snippet,
      images: [ogImageUrl],
    },
  }
}

export default async function TopicPage({ params }: Props) {
  const supabase = createClient()

  const [authResult, topicRes, categories] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('topics')
      .select('*, author:profiles(*), category:categories(*)')
      .eq('slug', params.slug)
      .maybeSingle(),
    adminService.getCategories(),
  ])

  const user = authResult.data?.user || null
  let topic = topicRes.data

  if (!topic) notFound()

  // Fallback para profile de autor caso o join direto falhe
  if (!topic.author && topic.author_id) {
    const { data: authorProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', topic.author_id)
      .maybeSingle()
    topic.author = authorProfile
  }

  // Busca direta e eficiente dos comentários apenas deste tópico
  const { data: rawComments } = await supabase
    .from('comments')
    .select('*, author:profiles(*)')
    .eq('topic_id', topic.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  const topicComments = rawComments || []

  // Preencher autores que eventualmente venham sem profile nos comentários
  const missingCommentAuthors = topicComments.filter((c: any) => !c.author && c.author_id)
  if (missingCommentAuthors.length > 0) {
    const authorIds = Array.from(new Set(missingCommentAuthors.map((c: any) => c.author_id)))
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', authorIds)

    if (profiles) {
      const profileMap = new Map(profiles.map((p) => [p.id, p]))
      topicComments.forEach((c: any) => {
        if (!c.author && c.author_id && profileMap.has(c.author_id)) {
          c.author = profileMap.get(c.author_id)
        }
      })
    }
  }

  // Verificar se o usuário logado curtiu / salvou o tópico e seus comentários
  let userLiked = false
  let userSaved = false
  let userRole = 'member'

  if (user) {
    try {
      const [likeResult, saveResult, profileResult] = await Promise.all([
        supabase.from('topic_likes').select('id').eq('topic_id', topic.id).eq('user_id', user.id).maybeSingle(),
        supabase.from('saved_topics').select('id').eq('topic_id', topic.id).eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      ])
      userLiked = !!likeResult.data
      userSaved = !!saveResult.data
      if (profileResult.data?.role) {
        userRole = profileResult.data.role
      }
    } catch (_) {}
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />

          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <TopicoClient
                topic={topic as any}
                comments={topicComments as any}
                user={user}
                userRole={userRole}
                userLiked={userLiked}
                userSaved={userSaved}
              />
            </main>
          </div>

          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
