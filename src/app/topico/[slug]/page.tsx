import Link from 'next/link'
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

export default async function TopicPage({ params }: Props) {
  const supabase = createClient()

  const [authResult, topics, allComments, categories] = await Promise.all([
    supabase.auth.getUser(),
    adminService.getTopics(),
    adminService.getComments(),
    adminService.getCategories(),
  ])

  const user = authResult.data?.user || null
  const topic = topics.find((t) => t.slug === params.slug)

  if (!topic) notFound()

  const topicComments = allComments.filter((c) => c.topic_id === topic.id && !c.is_deleted)

  // Verificar se o usuário curtiu / salvou o tópico
  let userLiked = false
  let userSaved = false

  if (user) {
    try {
      const [likeResult, saveResult] = await Promise.all([
        supabase.from('topic_likes').select('id').eq('topic_id', topic.id).eq('user_id', user.id).maybeSingle(),
        supabase.from('saved_topics').select('id').eq('topic_id', topic.id).eq('user_id', user.id).maybeSingle(),
      ])
      userLiked = !!likeResult.data
      userSaved = !!saveResult.data
    } catch (_) {
      // Tabelas podem não existir ainda, ignorar silenciosamente
    }
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />

          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <TopicoClient
                topic={topic as any}
                comments={topicComments as any}
                user={user}
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
