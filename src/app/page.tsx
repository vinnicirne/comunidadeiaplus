import Link from 'next/link'
import {
  Bot,
  Shield,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  TrendingUp,
  Clock,
  Plus,
  Search,
  LogIn,
  User,
} from 'lucide-react'
import { adminService } from '@/lib/services/adminService'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createClient()
  let user = null
  let topics: any[] = []
  let categories: any[] = []

  try {
    const [authResult, fetchedTopics, fetchedCategories] = await Promise.all([
      supabase.auth.getUser(),
      adminService.getTopics(),
      adminService.getCategories(),
    ])
    user = authResult.data?.user || null
    topics = fetchedTopics || []
    categories = fetchedCategories || []
  } catch (error) {
    console.error('Falha ao carregar dados do Supabase na HomePage:', error)
    // O sistema continuará renderizando com listas vazias ou nulas ao invés de crashar a página.
  }

  const publishedTopics = topics.filter((t) => t.is_published)
  const activeCategories = categories.filter((c) => c.is_active)

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-sm tracking-wider text-white">COMUNIDADE IAPLUS</span>
              <span className="block text-[10px] text-slate-400 font-medium leading-tight">Discussões reais sobre IA</span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Criar Tópico — principal CTA */}
                <Link
                  href="/criar-topico"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Criar Tópico</span>
                  <span className="sm:hidden">Criar</span>
                </Link>

                {/* Avatar + Menu rápido */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                    {user.email?.slice(0, 2).toUpperCase()}
                  </div>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-medium hidden sm:block"
                    >
                      Sair
                    </button>
                  </form>
                </div>

                {/* Admin Link */}
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
                  title="Painel Administrativo"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden md:inline">Admin</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </Link>
                <Link
                  href="/cadastro"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/20"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Criar Conta</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full space-y-10">
        {/* Hero Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900/60 to-slate-950 border border-indigo-500/20 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Plataforma Oficial de IA do Brasil</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              O que pessoas reais estão achando de cada ferramenta de IA?
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Compare Claude, Gemini, ChatGPT e técnicas de Vibe Coding com base na experiência real de desenvolvedores e criadores da comunidade.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {user ? (
                <Link
                  href="/criar-topico"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/25"
                >
                  <Plus className="w-4 h-4" />
                  <span>Iniciar uma Discussão</span>
                </Link>
              ) : (
                <Link
                  href="/cadastro"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/25"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Participar Grátis</span>
                </Link>
              )}
              <span className="text-xs text-slate-400">
                <strong className="text-slate-200">{publishedTopics.length}</strong> discussões ativas
              </span>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Explorar por Categoria
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {activeCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/40 transition-colors flex items-center gap-3 cursor-pointer group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {cat.name}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {cat.topics_count || 0} discussões
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discussions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Discussões em Destaque</h2>
            </div>
            {user && (
              <Link
                href="/criar-topico"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova discussão</span>
              </Link>
            )}
          </div>

          {publishedTopics.length === 0 ? (
            <div className="py-16 rounded-2xl border border-slate-800/80 bg-slate-900/20 text-center space-y-4">
              <p className="text-slate-400 text-sm">Nenhuma discussão publicada ainda.</p>
              <Link
                href={user ? '/criar-topico' : '/cadastro'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Seja o primeiro a postar!</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {publishedTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topico/${topic.slug}`}
                  className="block p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/30 hover:bg-slate-900/70 transition-all space-y-3 group"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700">
                      {topic.category?.icon} {topic.category?.name}
                    </span>
                    <span>·</span>
                    <span>por @{topic.author?.username}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {topic.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {topic.content}
                  </p>

                  <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      {topic.comments_count} respostas
                    </span>
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                      {topic.likes_count} curtidas
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>COMUNIDADE IAPLUS © 2026 — Fórum & Plataforma de Conhecimento sobre Inteligência Artificial.</p>
      </footer>
    </div>
  )
}
