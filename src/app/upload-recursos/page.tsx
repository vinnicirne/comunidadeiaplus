import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import UploadRecursosClient from './UploadRecursosClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Upload de Recursos - Comunidade IA PLUS',
  description: 'Compartilhe datasets, pesos LoRA e notebooks compactados com a comunidade de engenharia de IA.',
}

export default async function UploadRecursosPage() {
  const supabase = createClient()

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Falha ao autenticar usuário na página Upload Recursos', error)
  }

  if (!user) {
    redirect('/login?next=/upload-recursos')
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
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <UploadRecursosClient 
                categories={categories}
                envSupabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''}
                envSupabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''}
              />
            </main>
          </div>

          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
