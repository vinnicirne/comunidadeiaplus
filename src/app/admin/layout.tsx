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
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16]">
      {/* Sidebar Lateral */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  )
}
