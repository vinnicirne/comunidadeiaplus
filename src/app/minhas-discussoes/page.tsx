import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import MinhasDiscussoesClient from './MinhasDiscussoesClient'

export const dynamic = 'force-dynamic'

export default async function MinhasDiscussoesPage() {
  const supabase = createClient()
  
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Falha ao autenticar usuário na página Minhas Discussões', error)
  }

  if (!user) {
    redirect('/login?next=/minhas-discussoes')
  }

  let categories: any[] = []
  let profile: any = null
  let userTopics: any[] = []
  let userComments: any[] = []
  let savedTopics: any[] = []

  try {
    const [catData, profileRes, topicsRes, commentsRes, likesRes, savedRes] = await Promise.all([
      adminService.getCategories(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('topics').select('*, category:categories(*)').eq('author_id', user.id).order('created_at', { ascending: false }),
      supabase.from('comments').select('*, topic:topics(id, title, slug)').eq('author_id', user.id).order('created_at', { ascending: false }),
      supabase.from('topic_likes').select('topic:topics(*, category:categories(*))').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('saved_topics').select('topic:topics(*, category:categories(*))').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    categories = catData || []
    profile = profileRes.data || null
    userTopics = topicsRes.data || []
    userComments = commentsRes.data || []

    const rawSaved = [
      ...(savedRes?.data || []).map((s: any) => s.topic),
      ...(likesRes?.data || []).map((l: any) => l.topic)
    ].filter(Boolean)

    const seenIds = new Set<string>()
    savedTopics = rawSaved.filter((item: any) => {
      if (!item?.id || seenIds.has(item.id)) return false
      seenIds.add(item.id)
      return true
    })
  } catch (error) {
    console.error('Falha ao carregar dados do usuário em Minhas Discussões:', error)
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <MinhasDiscussoesClient 
              profile={profile}
              user={user}
              topics={userTopics}
              comments={userComments}
              savedTopics={savedTopics}
              initialTab="discussions"
            />
          </div>
          
          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
