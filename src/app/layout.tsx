import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'COMUNIDADE IAPLUS — Painel Administrativo & Fórum',
  description: 'Comunidade exclusiva de Inteligência Artificial para compartilhar experiências e discussões reais.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  )
}
