import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import { createTopic } from '@/lib/actions/auth'
import { Bot, ArrowLeft, Tag, ChevronDown, Lightbulb } from 'lucide-react'
import { SubmitButton } from '@/components/ui/SubmitButton'

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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-sm tracking-wider text-white">COMUNIDADE IAPLUS</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
        {/* Page Header */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight">Iniciar uma Discussão</h1>
          <p className="text-sm text-slate-400">
            Compartilhe uma experiência, faça uma pergunta ou abra um debate sobre IA com a comunidade.
          </p>
        </div>

        {searchParams.error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium">
            ⚠️ {searchParams.error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <form action={createTopic} className="lg:col-span-2 space-y-5">

            {/* Título */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Título <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                maxLength={150}
                placeholder="Ex: Qual a melhor IA para criar aplicativos em 2026?"
                className="w-full px-4 py-3.5 bg-slate-900/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Seja claro e específico. Títulos diretos atraem mais respostas.
              </p>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Categoria <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="category_id"
                  required
                  className="w-full px-4 py-3.5 bg-slate-900/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none"
                >
                  <option value="" disabled selected>Selecione uma categoria...</option>
                  {activeCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Conteúdo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Descrição <span className="text-rose-400">*</span>
              </label>
              <textarea
                name="content"
                required
                minLength={20}
                rows={8}
                placeholder="Descreva em detalhes sua dúvida, experiência ou debate. Quanto mais contexto você der, melhores serão as respostas da comunidade..."
                className="w-full px-4 py-3.5 bg-slate-900/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Tags <span className="text-slate-500 font-normal normal-case tracking-normal">(opcional)</span>
              </label>
              <input
                type="text"
                name="tags"
                placeholder="claude, gemini, vibecoding, react, supabase"
                className="w-full px-4 py-3.5 bg-slate-900/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Separe as tags por vírgula. Ajuda outros usuários a encontrarem sua discussão.
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <SubmitButton />
              <Link
                href="/"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </form>

          {/* Sidebar de Dicas */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Dicas para uma boa discussão</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>Seja específico no título — evite títulos vagos como &ldquo;Dúvida sobre IA&rdquo;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>Inclua contexto: qual ferramenta, qual tarefa, qual resultado você teve</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>Use tags para facilitar a busca — ex: <code className="bg-slate-800 px-1 rounded">claude</code>, <code className="bg-slate-800 px-1 rounded">react</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>Escolha a categoria certa para chegar às pessoas certas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5 shrink-0">✗</span>
                  <span>Evite spam, propaganda ou links suspeitos</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
              <p className="font-semibold text-indigo-300">📋 Categorias disponíveis:</p>
              {activeCategories.map((cat) => (
                <p key={cat.id} className="text-slate-400">
                  {cat.icon} <strong className="text-slate-200">{cat.name}</strong> — {cat.description}
                </p>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
