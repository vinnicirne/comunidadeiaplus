import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/Sidebar'
import { Header } from '@/components/admin/Header'
import { Profile } from '@/types/database'

// Garante que o painel administrativo sempre sirva dados frescos em tempo real (zero cache fantasma)
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    redirect('/')
  }

  return (
    <div className="bg-surface font-sans text-[15px] text-on-surface antialiased selection:bg-primary/30 selection:text-white min-h-screen">
      <Header profile={profile as Profile} />
      <Sidebar />
      <div className="pl-64">
        <main className="relative pt-20 bg-surface min-h-screen w-full px-6 pb-12">
          {children}
        </main>
      </div>
    </div>
  )
}
