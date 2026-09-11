import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import CriarTopicoClient from './CriarTopicoClient'

export const dynamic = 'force-dynamic'

export default async function CriarTopicoPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const supabase = createClient()
  
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Falha ao autenticar usuário na página Criar Topico', error)
  }

  if (!user) {
    redirect('/login?next=/criar-topico')
  }

  let categories: any[] = []
  try {
    categories = await adminService.getCategories()
  } catch (error) {
    console.error('Falha ao carregar categorias', error)
  }

  const activeCategories = categories.filter((c) => c.is_active)

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <CriarTopicoClient categories={activeCategories} error={searchParams.error} />
          </div>
          
          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
