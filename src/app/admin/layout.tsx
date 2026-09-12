import { Sidebar } from '@/components/admin/Sidebar'
import { Header } from '@/components/admin/Header'

// Garante que o painel administrativo sempre sirva dados frescos em tempo real (zero cache fantasma)
export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#0b0f19] font-sans text-[15px] text-[#f1f5f9] antialiased selection:bg-indigo-500/30 selection:text-white min-h-screen">
      <Header />
      <Sidebar />
      <div className="pl-64">
        <main className="relative pt-16 bg-[#0b0f19] min-h-screen w-full px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
