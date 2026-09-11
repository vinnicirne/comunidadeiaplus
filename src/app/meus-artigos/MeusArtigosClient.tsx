'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MeusArtigosClient() {
  const [activeTab, setActiveTab] = useState('published')
  
  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        
        {/* Top Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-outline font-label-sm text-label-sm uppercase tracking-wider">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-primary font-semibold">Autor</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">Meus Artigos</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Gerencie suas publicações técnicas, acompanhe o alcance de leitura e edite rascunhos.</p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <Link href="/escrever-artigo" className="inline-flex items-center gap-space-xs bg-primary text-on-primary font-label-md text-label-md px-space-md py-2.5 rounded-lg shadow-sm hover:bg-primary-container transition-all hover:shadow-md">
              <span className="material-symbols-outlined text-[18px]">edit_square</span>
              <span>Novo Artigo</span>
            </Link>
          </div>
        </div>

        {/* Metric Highlights Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Total de Leituras</span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
              </div>
            </div>
            <div className="mt-space-sm flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">48.2k</span>
              <span className="inline-flex items-center gap-0.5 text-secondary font-label-sm text-label-sm font-semibold bg-secondary-fixed/50 px-1.5 py-0.5 rounded">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +14%
              </span>
            </div>
            <div className="w-full h-7 mt-space-xs pt-1">
              <svg className="w-full h-full text-primary/70" fill="none" preserveAspectRatio="none" viewBox="0 0 100 24">
                <path d="M0 20 Q 15 18, 30 14 T 60 8 T 85 10 T 100 2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
                <path d="M0 20 Q 15 18, 30 14 T 60 8 T 85 10 T 100 2 L 100 24 L 0 24 Z" fill="currentColor" fillOpacity="0.08"></path>
              </svg>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Artigos Publicados</span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">article</span>
              </div>
            </div>
            <div className="mt-space-sm flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">7</span>
              <span className="text-outline font-label-sm text-label-sm">100% indexados</span>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mt-space-md">
              <div className="bg-secondary h-full rounded-full w-[70%]"></div>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Rascunhos em Edição</span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              </div>
            </div>
            <div className="mt-space-sm flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">3</span>
              <span className="font-label-sm text-label-sm text-tertiary font-medium">1 em revisão</span>
            </div>
            <div className="flex items-center gap-1.5 mt-space-md text-on-surface-variant font-code-md text-code-md">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim inline-block animate-pulse"></span>
              <span className="truncate text-label-sm font-label-sm">Auto-salvamento ativo</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Reações & Salvos</span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
              </div>
            </div>
            <div className="mt-space-sm flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">1.420</span>
              <span className="inline-flex items-center gap-0.5 text-primary font-label-sm text-label-sm font-semibold bg-primary-fixed/50 px-1.5 py-0.5 rounded">
                94% taxa
              </span>
            </div>
            <div className="flex items-center gap-space-xs mt-space-md text-outline font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
              <span>Alta relevância técnica</span>
            </div>
          </div>
        </div>

        {/* Editorial Tips Notice */}
        <div className="bg-surface-container-low p-space-md rounded-xl shadow-sm flex items-start gap-space-md relative overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[20px]">insights</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Suas análises de RAG e Modelos Locais geram 3.2x mais engajamento</h2>
              <span className="text-outline font-label-sm text-label-sm">Dica de Curadoria</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Artigos com benchmarks reprodutíveis e trechos de código em Python/TypeScript têm maior probabilidade de destaque na newsletter semanal da comunidade.</p>
          </div>
        </div>

        {/* Main Management Panel */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Tabs Navigation Header */}
          <div className="px-space-md pt-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-lowest">
            <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0">
              <button onClick={() => setActiveTab('published')} className={`inline-flex items-center gap-space-xs px-3.5 py-2 rounded-lg font-label-md text-label-md transition-colors ${activeTab === 'published' ? 'bg-primary-fixed text-on-primary-fixed font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} type="button">
                <span>Publicados</span>
                <span className={`text-label-sm font-label-sm px-1.5 py-0.5 rounded-full ${activeTab === 'published' ? 'bg-surface-container-lowest text-on-surface' : 'bg-surface-container text-on-surface-variant'}`}>7</span>
              </button>
              <button onClick={() => setActiveTab('drafts')} className={`inline-flex items-center gap-space-xs px-3.5 py-2 rounded-lg font-label-md text-label-md transition-colors ${activeTab === 'drafts' ? 'bg-primary-fixed text-on-primary-fixed font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} type="button">
                <span>Rascunhos</span>
                <span className={`text-label-sm font-label-sm px-1.5 py-0.5 rounded-full ${activeTab === 'drafts' ? 'bg-surface-container-lowest text-on-surface' : 'bg-surface-container text-on-surface-variant'}`}>3</span>
              </button>
              <button onClick={() => setActiveTab('in_review')} className={`inline-flex items-center gap-space-xs px-3.5 py-2 rounded-lg font-label-md text-label-md transition-colors ${activeTab === 'in_review' ? 'bg-primary-fixed text-on-primary-fixed font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} type="button">
                <span>Em Revisão Técnica</span>
                <span className={`text-label-sm font-label-sm px-1.5 py-0.5 rounded-full ${activeTab === 'in_review' ? 'bg-surface-container-lowest text-on-surface' : 'bg-surface-container text-on-surface-variant'}`}>1</span>
              </button>
            </div>
            <Link href="/escrever-artigo" className="hidden md:inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-medium hover:underline pb-2 sm:pb-0">
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Novo rascunho rápido</span>
            </Link>
          </div>
          
          <div className="p-space-md bg-surface-container-low/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-label-md text-label-md pl-9 pr-space-md py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest shadow-sm" placeholder="Filtrar seus artigos por título, tag ou código..." type="text" />
            </div>
          </div>
          
          <div className="flex flex-col">
            {/* Item 1 */}
            <article className="p-space-md md:p-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-md hover:bg-surface-container-low/30 transition-colors bg-surface-container-lowest group border-b border-outline-variant/30 last:border-0">
              <div className="flex items-start gap-space-md flex-1 min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-surface-container hidden xs:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Thumbnail" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKdH0MOhlgwhTHzg-KuVjS7AF2bT0fc5xmk7XDyOGgNNeXg-ppOeRbCrh20z79ZGGyXT9zfN2dfR2vTYwEHV8AWhTGrNG7L8k9kLBtBsSq82UHq_7KO7SUTNOirUbgfEL_iRf3Tme224bjgCIDgJXst3pTkz5OzCKXFNHleKXU90R_xZJCR4Favk-9R7SFtQ7CG8rRcOoQse5uQwK9f8KghQMlR8PzcOVF0nma_L6WOXLduSw8zR9C"/>
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-surface-container text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                      Publicado
                    </span>
                    <span className="text-outline font-label-sm text-label-sm">·</span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm">Publicado há 2 semanas</span>
                  </div>
                  <Link href="/artigo/qual-tamanho-context-window-ideal" className="font-headline-sm text-headline-sm text-on-surface font-semibold hover:text-primary transition-colors line-clamp-1 mt-0.5">
                    Qual o tamanho de context window ideal para RAG antes de sofrer com lost in the middle?
                  </Link>
                  <p className="text-body-sm font-body-sm text-on-surface-variant line-clamp-2">
                    Análise empírica avaliando degradação de recall em documentos acima de 32k tokens utilizando Needle In A Haystack em modelos Llama 3 70B e Claude 3.5 Sonnet.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between lg:justify-end gap-space-md shrink-0 pt-space-xs lg:pt-0">
                <div className="grid grid-cols-3 gap-space-sm sm:gap-space-md text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">18.4k</span>
                    <span className="font-label-sm text-label-sm text-outline flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">visibility</span> Leituras</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">42</span>
                    <span className="font-label-sm text-label-sm text-outline flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">chat_bubble</span> Respostas</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">380</span>
                    <span className="font-label-sm text-label-sm text-outline flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span> Upvotes</span>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" title="Ações" type="button">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </div>
              </div>
            </article>
            
            {/* Item 2 */}
            <article className="p-space-md md:p-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-md hover:bg-surface-container-low/30 transition-colors bg-surface-container-lowest group">
              <div className="flex items-start gap-space-md flex-1 min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center hidden xs:flex text-tertiary">
                  <span className="material-symbols-outlined text-[32px]">terminal</span>
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-tertiary-fixed text-on-tertiary-fixed">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container inline-block"></span>
                      Rascunho
                    </span>
                    <span className="text-outline font-label-sm text-label-sm">·</span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm">Salvo hoje às 14:20</span>
                  </div>
                  <Link href="/escrever-artigo" className="font-headline-sm text-headline-sm text-on-surface font-semibold hover:text-primary transition-colors line-clamp-1 mt-0.5">
                    Otimizações de Inferência com vLLM e AWQ em Servidores Locais
                  </Link>
                  <p className="text-body-sm font-body-sm text-on-surface-variant line-clamp-2">
                    Setup de quantização em 4-bit para ganho de throughput em GPUs RTX 4090 e A10G sem perda de perplexidade no modelo Mixtral 8x7B.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between lg:justify-end gap-space-md shrink-0 pt-space-xs lg:pt-0">
                <div className="flex items-center gap-space-sm">
                  <Link href="/escrever-artigo" className="inline-flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm font-medium transition-colors">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Continuar</span>
                  </Link>
                </div>
              </div>
            </article>
          </div>
          
          <div className="p-space-md bg-surface-container-low/20 flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <span className="text-outline font-label-sm text-label-sm">Mostrando 1-2 de 7 publicações</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-outline hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-40" disabled type="button">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold" type="button">1</button>
              <button className="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm transition-colors" type="button">2</button>
              <button className="p-1.5 rounded-lg text-outline hover:bg-surface-container hover:text-on-surface transition-colors" type="button">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </main>
  )
}
