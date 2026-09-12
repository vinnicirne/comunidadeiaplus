import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import SalvosClient from './SalvosClient'

export const dynamic = 'force-dynamic'

export default async function SalvosPage() {
  const supabase = createClient()
  
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Falha ao autenticar usuário na página Salvos', error)
  }

  if (!user) {
    redirect('/login?next=/salvos')
  }

  let categories: any[] = []
  let savedTopics: any[] = []

  try {
    const [catData, likesRes, savedRes] = await Promise.all([
      adminService.getCategories(),
      supabase.from('topic_likes').select('topic:topics(*, category:categories(*))').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('saved_topics').select('topic:topics(*, category:categories(*))').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    categories = catData || []

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
    console.error('Falha ao carregar dados salvos:', error)
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <SalvosClient 
              initialSavedTopics={savedTopics}
              categories={categories}
            />
          </div>
          
          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
