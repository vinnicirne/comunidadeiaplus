import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import { createTopic } from '@/lib/actions/auth'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
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
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mb-space-md">
                  <Link className="hover:text-primary transition-colors flex items-center gap-1" href="/">
                    <span className="material-symbols-outlined text-[16px]">home</span>
                    <span>Início</span>
                  </Link>
                  <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
                  <span className="text-on-surface font-semibold">Criar nova discussão</span>
                </div>
                
                <div className="flex flex-col gap-space-xs mb-space-lg">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-2.5 h-7 rounded-full bg-primary"></div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Criar nova discussão</h1>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl pl-4">
                    Compartilhe uma dúvida, experimento ou visão sobre ferramentas e modelos de IA com a comunidade de especialistas e desenvolvedores.
                  </p>
                </div>

                {searchParams.error && (
                  <div className="mb-space-lg p-4 rounded-xl bg-error-container border border-error/30 text-on-error-container text-sm font-medium">
                    ⚠️ {searchParams.error}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                  <div className="lg:col-span-8 flex flex-col gap-space-lg">
                    <form action={createTopic} className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg" id="discussion-form">
                      <div className="flex flex-col gap-space-xs">
                        <div className="flex items-center justify-between">
                          <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5" htmlFor="topic-title">
                            <span>Título da discussão</span>
                            <span className="text-primary">*</span>
                          </label>
                          <span className="font-code-md text-code-md text-outline" id="title-counter">0/120</span>
                        </div>
                        <div className="relative w-full">
                          <input 
                            name="title"
                            required
                            maxLength={120}
                            className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md px-space-md py-space-sm rounded-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/25 transition-all" 
                            id="topic-title" 
                            placeholder="Ex: Como otimizar embeddings com Milvus em larga escala?" 
                            type="text" 
                          />
                        </div>
                        <span className="font-label-sm text-label-sm text-outline">Um título direto e formulado como pergunta atrai 4x mais respostas qualificadas.</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                        <div className="flex flex-col gap-space-xs">
                          <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5" htmlFor="topic-category">
                            <span>Categoria</span>
                            <span className="text-primary">*</span>
                          </label>
                          <div className="relative">
                            <select 
                              name="category_id"
                              required
                              className="w-full appearance-none bg-surface-container-low text-on-surface font-label-md text-label-md px-space-md py-2.5 rounded-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/25 transition-all cursor-pointer pr-10" 
                              id="topic-category"
                              defaultValue=""
                            >
                              <option value="" disabled>Selecione uma categoria...</option>
                              {activeCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.icon} {cat.name}
                                </option>
                              ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-space-md top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[20px]">
                              expand_more
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-space-xs">
                          <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                            <span>Nível técnico esperado</span>
                          </label>
                          <div className="flex items-center gap-1.5 h-[42px] p-1 bg-surface-container-low rounded-lg">
                            <button className="flex-1 py-1 px-2 text-center rounded font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" type="button">Iniciante</button>
                            <button className="flex-1 py-1 px-2 text-center rounded bg-surface-container-lowest font-label-sm text-label-sm font-semibold text-primary shadow-xs" type="button">Prático</button>
                            <button className="flex-1 py-1 px-2 text-center rounded font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" type="button">Avançado</button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-space-xs">
                        <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span>Tags da discussão</span>
                            <span className="text-outline font-normal text-label-sm">(opcional)</span>
                          </span>
                        </label>
                        <div className="relative w-full">
                          <input 
                            name="tags"
                            className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md px-space-md py-space-sm rounded-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/25 transition-all" 
                            placeholder="Separe as tags por vírgula. ex: react, supabase" 
                            type="text" 
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-space-xs">
                        <div className="flex items-center justify-between">
                          <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5" htmlFor="topic-body">
                            <span>Conteúdo da discussão</span>
                            <span className="text-primary">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <button className="text-outline hover:text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1" type="button">
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              <span>Prévia</span>
                            </button>
                          </div>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-surface-container-low focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/25 transition-all">
                          <div className="flex items-center flex-wrap gap-1 px-3 py-2 bg-surface-container">
                            <button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors" title="Negrito" type="button">
                              <span className="material-symbols-outlined text-[18px]">format_bold</span>
                            </button>
                            <button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors" title="Itálico" type="button">
                              <span className="material-symbols-outlined text-[18px]">format_italic</span>
                            </button>
                            <span className="w-px h-4 bg-outline-variant mx-1"></span>
                            <button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors" title="Bloco de código" type="button">
                              <span className="material-symbols-outlined text-[18px]">code</span>
                            </button>
                            <button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors" title="Link" type="button">
                              <span className="material-symbols-outlined text-[18px]">link</span>
                            </button>
                            <button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors" title="Lista com marcadores" type="button">
                              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                            </button>
                            <button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors" title="Citação" type="button">
                              <span className="material-symbols-outlined text-[18px]">format_quote</span>
                            </button>
                            <span className="w-px h-4 bg-outline-variant mx-1"></span>
                            <button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors" title="Inserir Imagem" type="button">
                              <span className="material-symbols-outlined text-[18px]">image</span>
                            </button>
                            <div className="ml-auto flex items-center gap-1 font-label-sm text-label-sm text-outline">
                              <span className="material-symbols-outlined text-[15px]">markdown</span>
                              <span>Markdown suportado</span>
                            </div>
                          </div>
                          <textarea 
                            name="content"
                            required
                            minLength={20}
                            className="w-full bg-transparent text-on-surface placeholder:text-outline font-body-md text-body-md p-space-md focus:outline-none resize-y min-h-[200px]" 
                            id="topic-body" 
                            placeholder="Descreva em detalhes sua dúvida, experiência ou debate. Quanto mais contexto você der, melhores serão as respostas da comunidade..." 
                            rows={8}
                          ></textarea>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-space-xs">
                        <Link href="/" className="px-space-md py-2.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors">
                          Cancelar
                        </Link>
                        <div className="flex items-center gap-space-sm">
                          <SubmitButton />
                        </div>
                      </div>
                    </form>
                  </div>
                  
                  <div className="lg:col-span-4 flex flex-col gap-space-md">
                    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                        </div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Como criar uma boa discussão</h2>
                      </div>
                      <ul className="flex flex-col gap-space-sm">
                        <li className="flex items-start gap-space-sm">
                          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md text-on-surface font-semibold">Seja específico no título</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Evite títulos vagos como "Dúvida com IA". Formule o problema exato e o contexto.</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-space-sm">
                          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md text-on-surface font-semibold">Mencione as ferramentas</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Cite modelos, versões, bibliotecas.</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-space-sm">
                          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md text-on-surface font-semibold">Adicione contexto</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Inclua snippets de código, logs de erro ou métricas.</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
          <RightSidebar categories={categories} />
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          (() => {
            const titleInput = document.getElementById('topic-title');
            const titleCounter = document.getElementById('title-counter');

            if (titleInput && titleCounter) {
              titleInput.addEventListener('input', (e) => {
                const len = e.target.value.length;
                titleCounter.textContent = len + '/120';
              });
            }
          })();
        `
      }} />
    </>
  )
}
