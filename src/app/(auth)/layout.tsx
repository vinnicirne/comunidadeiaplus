import type { Metadata } from 'next'
import '../globals.css'
import { Bot } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'COMUNIDADE IAPLUS — Entrar',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col">
      {/* Mini Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-sm tracking-wider text-white">COMUNIDADE IAPLUS</span>
          </Link>
        </div>
      </header>

      {/* Centered Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-600">
        © 2026 COMUNIDADE IAPLUS — Fórum de Inteligência Artificial
      </footer>
    </div>
  )
}
