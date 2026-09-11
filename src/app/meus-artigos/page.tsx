import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import MeusArtigosClient from './MeusArtigosClient'

export const dynamic = 'force-dynamic'

export default async function MeusArtigosPage() {
  const supabase = createClient()
  
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (!user) {
      redirect('/login')
    }
  } catch (error) {
    console.error('Falha ao autenticar usuário na página Meus Artigos', error)
    redirect('/login')
  }

  let categories: any[] = []
  try {
    categories = await adminService.getCategories()
  } catch (error) {
    console.error('Falha ao carregar categorias', error)
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <MeusArtigosClient />
          </div>
          
          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
