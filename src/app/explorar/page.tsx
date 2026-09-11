import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { adminService } from '@/lib/services/adminService'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'

export const dynamic = 'force-dynamic'

export default async function ExplorarPage() {
  const supabase = createClient()
  
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Falha ao autenticar usuário na página Explorar', error)
  }

  let categories: any[] = []
  try {
    categories = await adminService.getCategories()
  } catch (error) {
    console.error('Falha ao carregar categorias', error)
  }

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen bg-surface">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <div className="flex flex-col w-full">
                <div className="flex flex-col gap-space-xl">
                  
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                    <div className="flex flex-col gap-space-xs max-w-xl">
                      <div className="flex items-center gap-space-xs">
                        <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Hub Temático</span>
                      </div>
                      <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">Categorias da Comunidade</h1>
                      <p className="font-body-md text-body-md text-on-surface-variant">Explore discussões e tópicos agrupados pelos principais pilares de Inteligência Artificial.</p>
                    </div>
                    <div className="flex items-center gap-space-sm self-start md:self-auto bg-surface-container px-space-md py-space-xs rounded-xl text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px] text-primary">analytics</span>
                      <span className="font-code-md text-code-md text-on-surface font-medium">1.328 debates ativos</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                    
                    <div className="group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
                      <div className="flex flex-col gap-space-md relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed shadow-sm">
                            <span className="material-symbols-outlined text-[26px]">smart_toy</span>
                          </div>
                          <span className="font-label-sm text-label-sm px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">Principal</span>
                        </div>
                        <div className="flex flex-col gap-space-xs">
                          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold group-hover:text-primary transition-colors flex items-center gap-space-xs">
                            IA Geral
                          </h2>
                          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                            Debates conceituais, lançamentos de novos modelos, impactos éticos, filosofia e novidades gerais do ecossistema de IA.
                          </p>
                        </div>
                        <div className="flex items-center gap-space-md py-space-xs text-outline font-label-sm text-label-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-primary">chat_bubble</span>
                            <span className="font-medium text-on-surface">384 discussões</span>
                          </div>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-secondary">forum</span>
                            <span className="font-medium text-on-surface">2.1k respostas</span>
                          </div>
                        </div>
                        <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1">
                          <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span> Tópico recente
                          </span>
                          <span className="font-label-md text-label-md text-on-surface font-medium truncate">
                            Vale a pena pagar pelo ChatGPT Plus hoje?
                          </span>
                        </div>
                      </div>
                      <div className="pt-space-md mt-space-md flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-1 text-primary font-label-md text-label-md font-semibold">
                          <span>Explorar tópicos</span>
                          <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
                        </div>
                        <Link aria-label="Acessar categoria IA Geral" className="absolute inset-0 z-20" href="/categoria/ia-geral"></Link>
                      </div>
                    </div>
                    
                    <div className="group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
                      <div className="flex flex-col gap-space-md relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shadow-sm">
                            <span className="material-symbols-outlined text-[26px]">terminal</span>
                          </div>
                          <span className="font-label-sm text-label-sm px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">Desenvolvimento</span>
                        </div>
                        <div className="flex flex-col gap-space-xs">
                          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold group-hover:text-primary transition-colors flex items-center gap-space-xs">
                            Programação
                          </h2>
                          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                            Uso de IA para geração de código, refatoração, agentes de codificação, IDEs inteligentes (Cursor, Copilot) e engenharia de software.
                          </p>
                        </div>
                        <div className="flex items-center gap-space-md py-space-xs text-outline font-label-sm text-label-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-primary">chat_bubble</span>
                            <span className="font-medium text-on-surface">512 discussões</span>
                          </div>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-secondary">forum</span>
                            <span className="font-medium text-on-surface">4.8k respostas</span>
                          </div>
                        </div>
                        <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1">
                          <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span> Tópico recente
                          </span>
                          <span className="font-label-md text-label-md text-on-surface font-medium truncate">
                            Qual a melhor IA no momento para criar aplicativos?
                          </span>
                        </div>
                      </div>
                      <div className="pt-space-md mt-space-md flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-1 text-primary font-label-md text-label-md font-semibold">
                          <span>Explorar tópicos</span>
                          <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
                        </div>
                        <Link aria-label="Acessar categoria Programação" className="absolute inset-0 z-20" href="/categoria/programacao"></Link>
                      </div>
                    </div>
                    
                    <div className="group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-container/5 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
                      <div className="flex flex-col gap-space-md relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shadow-sm">
                            <span className="material-symbols-outlined text-[26px]">movie_filter</span>
                          </div>
                          <span className="font-label-sm text-label-sm px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">Multimídia</span>
                        </div>
                        <div className="flex flex-col gap-space-xs">
                          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold group-hover:text-primary transition-colors flex items-center gap-space-xs">
                            Imagens e Vídeos
                          </h2>
                          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                            Modelos generativos de difusão, Midjourney, Flux, ComfyUI, Runway, Sora e criação de conteúdo audiovisual.
                          </p>
                        </div>
                        <div className="flex items-center gap-space-md py-space-xs text-outline font-label-sm text-label-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-primary">chat_bubble</span>
                            <span className="font-medium text-on-surface">245 discussões</span>
                          </div>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-secondary">forum</span>
                            <span className="font-medium text-on-surface">1.4k respostas</span>
                          </div>
                        </div>
                        <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1">
                          <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span> Tópico recente
                          </span>
                          <span className="font-label-md text-label-md text-on-surface font-medium truncate">
                            Qual IA vocês usam para criar imagens e mockups?
                          </span>
                        </div>
                      </div>
                      <div className="pt-space-md mt-space-md flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-1 text-primary font-label-md text-label-md font-semibold">
                          <span>Explorar tópicos</span>
                          <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
                        </div>
                        <Link aria-label="Acessar categoria Imagens e Vídeos" className="absolute inset-0 z-20" href="/categoria/imagens-e-videos"></Link>
                      </div>
                    </div>
                    
                    <div className="group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
                      <div className="flex flex-col gap-space-md relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
                            <span className="material-symbols-outlined text-[26px]">domain_add</span>
                          </div>
                          <span className="font-label-sm text-label-sm px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">Estratégia</span>
                        </div>
                        <div className="flex flex-col gap-space-xs">
                          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold group-hover:text-primary transition-colors flex items-center gap-space-xs">
                            Negócios
                          </h2>
                          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                            Implementação de IA em empresas, ROI, redução de custos operacionais, vendas, automação com n8n e novos produtos digitais.
                          </p>
                        </div>
                        <div className="flex items-center gap-space-md py-space-xs text-outline font-label-sm text-label-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-primary">chat_bubble</span>
                            <span className="font-medium text-on-surface">187 discussões</span>
                          </div>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-secondary">forum</span>
                            <span className="font-medium text-on-surface">980 respostas</span>
                          </div>
                        </div>
                        <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1">
                          <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span> Tópico recente
                          </span>
                          <span className="font-label-md text-label-md text-on-surface font-medium truncate">
                            Como vocês estão integrando IA nos fluxos de negócios?
                          </span>
                        </div>
                      </div>
                      <div className="pt-space-md mt-space-md flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-1 text-primary font-label-md text-label-md font-semibold">
                          <span>Explorar tópicos</span>
                          <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
                        </div>
                        <Link aria-label="Acessar categoria Negócios" className="absolute inset-0 z-20" href="/categoria/negocios"></Link>
                      </div>
                    </div>
                    
                  </div>
                  
                  <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-md">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[22px]">lightbulb</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">Sentiu falta de uma categoria técnica?</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Sugira novos tópicos para avaliação da moderação técnica da comunidade.</span>
                      </div>
                    </div>
                    <Link className="shrink-0 bg-surface-container-lowest text-on-surface hover:text-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg shadow-sm transition-colors flex items-center gap-space-xs" href="/criar-topico">
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      <span>Sugerir Categoria</span>
                    </Link>
                  </div>
                  
                </div>
              </div>
            </main>
          </div>
          
          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
