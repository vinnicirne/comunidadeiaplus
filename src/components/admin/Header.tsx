'use client'

import Link from 'next/link'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-[#111827]/90 border-b border-[#1f2937] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      <div className="h-16 w-full px-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-[240px]">
          <Link href="/admin" className="flex items-center gap-1">
            <span className="text-lg text-white font-semibold tracking-tight">IA Comunidade</span>
          </Link>
          <span className="text-[12px] px-1 py-0.5 rounded bg-indigo-500/20 text-[#a5b4fc] border border-indigo-500/30 font-medium">
            Admin MVP
          </span>
        </div>
        
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-[#94a3b8] text-[20px] pointer-events-none">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0f172a] border border-[#334155] text-slate-100 placeholder:text-[#64748b] text-[13px] focus:outline-none focus:bg-[#131c2e] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
              placeholder="Buscar discussões, moderação, usuários ou logs..." 
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            <span className="text-[12px] text-emerald-300 font-medium">Sistemas 100% OK</span>
          </div>
          <Link href="/" className="hidden md:flex items-center gap-1 text-[14px] text-[#94a3b8] hover:text-[#818cf8] transition-colors">
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>Voltar ao Fórum
          </Link>
          <button className="relative p-2 rounded-lg hover:bg-[#1e293b] text-[#94a3b8] hover:text-slate-200 transition-colors" title="Notificações e Alertas">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#111827]"></span>
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-[#1f2937]">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-500">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[14px] text-slate-100 font-semibold leading-tight">Admin Root</span>
              <span className="text-[12px] text-[#94a3b8] leading-none">Matheus</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
