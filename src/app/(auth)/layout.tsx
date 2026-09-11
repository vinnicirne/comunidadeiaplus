import type { Metadata } from 'next'
import '../globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'COMUNIDADE IAPLUS — Entrar',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full min-h-screen flex items-center justify-center p-space-md bg-surface">
      <div className="flex flex-col w-full items-center justify-center py-space-xl">
        <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-xl shadow-xl p-space-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            {children}
          </div>
        </div>
        
        <div className="mt-space-lg flex items-center gap-space-lg text-on-surface-variant">
          <div className="flex items-center gap-1.5 font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-base text-primary">verified_user</span>
            <span>Criptografia ponta a ponta</span>
          </div>
          <span className="text-outline/40">•</span>
          <div className="flex items-center gap-1.5 font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-base text-primary">forum</span>
            <span>+14k Membros ativos</span>
          </div>
          <span className="text-outline/40">•</span>
          <Link className="font-label-sm text-label-sm hover:text-on-surface transition-colors" href="#">Termos & Privacidade</Link>
        </div>
      </div>
    </main>
  )
}
