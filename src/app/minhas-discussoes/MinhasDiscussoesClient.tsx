'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MinhasDiscussoesClient({ initialTab = 'discussions' }: { initialTab?: 'discussions' | 'comments' | 'saved' }) {
  const [activeTab, setActiveTab] = useState<'discussions' | 'comments' | 'saved'>(initialTab)

  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full">
        {/* Profile Header Hero Card */}
        <div className="relative bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-lg">
          {/* Subtle Ambient Banner with Geometric Visual Grid */}
          <div className="h-32 w-full bg-gradient-to-r from-primary via-primary-container to-secondary relative overflow-hidden flex items-end justify-end p-space-md">
            <svg className="absolute inset-0 w-full h-full opacity-10" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern height="24" id="grid-pattern" patternUnits="userSpaceOnUse" width="24">
                  <circle className="text-on-primary" cx="2" cy="2" fill="currentColor" r="1"></circle>
                </pattern>
              </defs>
              <rect fill="url(#grid-pattern)" height="100%" width="100%"></rect>
            </svg>
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
            {/* Top Action Bar inside banner */}
            <div className="relative z-10 flex items-center gap-space-sm">
              <button className="inline-flex items-center gap-1.5 px-space-md py-1.5 bg-surface-container-lowest/90 backdrop-blur-md hover:bg-surface-container-lowest text-on-surface rounded-lg font-label-sm text-label-sm shadow-sm transition-all duration-200">
                <span className="material-symbols-outlined text-[16px] text-primary">share</span>
                <span>Compartilhar</span>
              </button>
              <button className="inline-flex items-center gap-1.5 px-space-md py-1.5 bg-surface-container-lowest/90 backdrop-blur-md hover:bg-surface-container-lowest text-on-surface rounded-lg font-label-sm text-label-sm shadow-sm transition-all duration-200">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
                <span>Editar perfil</span>
              </button>
            </div>
          </div>
          {/* User Meta & Info Block */}
          <div className="px-space-lg pb-space-lg pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 mb-space-md gap-space-md">
              {/* Avatar with Online Indicator */}
              <div className="relative w-28 h-28 shrink-0">
                <div className="w-28 h-28 rounded-full bg-surface-container-lowest p-1 shadow-md">
                  <img alt="Avatar" className="w-full h-full object-cover rounded-full bg-surface-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNAQEksVXlfV6__YrshC_0KvJeLlT7MPfUXRv_9iGfF58Oc2VMVpXu1XtepznBujhz_xdlIBdeTlxfo6DkT3eZ8YUH5_XHDOkA0XPEB_feFvDEOEEWtA30DVRXixIMLKvzS5X3Ed5-_1QcKdWp1g9gyokcwSkrQ3SnsW-HOvddBJG9kpyAst5vTbi39tcL9Ut8qG09txTFuteZfqruaXCuDPC_FxaFCISbohUcYJw5MEwsOOCYDSzP"/>
                </div>
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-surface-container-lowest rounded-full p-0.5 flex items-center justify-center shadow-sm">
                  <span className="w-full h-full bg-emerald-500 rounded-full animate-pulse"></span>
                </span>
              </div>
              {/* Role Badges & Status Pill */}
              <div className="flex flex-wrap items-center gap-space-xs pt-2">
                <div className="inline-flex items-center gap-1 px-space-sm py-1 bg-surface-container-high rounded-full text-primary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Membro Pro</span>
                </div>
                <div className="inline-flex items-center gap-1 px-space-sm py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span>Top Contribuidor</span>
                </div>
              </div>
            </div>
            {/* Identity & Bio Details */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-baseline gap-space-sm flex-wrap">
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">Vinicius Rocha</h1>
                <span className="font-label-md text-label-md text-outline">@vinicius</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl leading-relaxed mt-1">
                SaaS Builder & Engenheiro Fullstack. Experimentando LLMs em produção, Claude 3.5 Sonnet, agentes e automações.
              </p>
              {/* Location & Join Date Metadata */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-space-lg text-outline font-label-sm text-label-sm mt-space-sm">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span>São Paulo, Brasil</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span>Membro desde Nov 2023</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">terminal</span>
                  <span className="font-code-md text-code-md">github.com/vinicius</span>
                </div>
              </div>
            </div>
            {/* Impact Metrics Dashboard Strip */}
            <div className="grid grid-cols-3 gap-space-sm mt-space-lg pt-space-md bg-surface-container-low rounded-xl p-space-md">
              <div className="flex flex-col items-center sm:items-start px-space-sm">
                <div className="flex items-center gap-1.5 text-outline mb-0.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">forum</span>
                  <span className="font-label-sm text-label-sm hidden sm:inline">Discussões criadas</span>
                  <span className="font-label-sm text-label-sm sm:hidden">Discussões</span>
                </div>
                <span className="font-headline-md text-headline-md text-on-surface font-semibold">14</span>
              </div>
              <div className="flex flex-col items-center sm:items-start px-space-sm bg-surface-container-high/40 rounded-lg">
                <div className="flex items-center gap-1.5 text-outline mb-0.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">chat_bubble</span>
                  <span className="font-label-sm text-label-sm hidden sm:inline">Comentários</span>
                  <span className="font-label-sm text-label-sm sm:hidden">Comentários</span>
                </div>
                <span className="font-headline-md text-headline-md text-on-surface font-semibold">86</span>
              </div>
              <div className="flex flex-col items-center sm:items-start px-space-sm">
                <div className="flex items-center gap-1.5 text-outline mb-0.5">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">thumb_up</span>
                  <span className="font-label-sm text-label-sm hidden sm:inline">Votos recebidos</span>
                  <span className="font-label-sm text-label-sm sm:hidden">Votos</span>
                </div>
                <span className="font-headline-md text-headline-md text-on-surface font-semibold">342</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Profile Tabs */}
        <div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-xl mb-space-lg shadow-sm">
          <button 
            onClick={() => setActiveTab('discussions')}
            className={`flex-1 py-2 px-space-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'discussions' ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">post_add</span>
            <span>Discussões criadas</span>
            <span className={activeTab === 'discussions' ? 'bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold' : 'bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded-full text-label-sm font-label-sm'}>14</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-2 px-space-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'comments' ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">forum</span>
            <span>Comentários</span>
            <span className={activeTab === 'comments' ? 'bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold' : 'bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded-full text-label-sm font-label-sm'}>86</span>
          </button>

          <button 
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 px-space-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'saved' ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">bookmark</span>
            <span>Salvos</span>
            <span className={activeTab === 'saved' ? 'bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold' : 'bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded-full text-label-sm font-label-sm'}>29</span>
          </button>
        </div>

        {/* Tab Content: DISCUSSÕES CRIADAS */}
        {activeTab === 'discussions' && (
          <div className="flex flex-col gap-space-md">
            {/* Topic 1 */}
            <article className="group bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low text-primary rounded-lg font-label-sm text-label-sm font-medium">
                    <span className="material-symbols-outlined text-[14px]">terminal</span>
                    Programação
                  </span>
                  <span className="text-outline text-label-sm font-label-sm">· há 3 dias</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Solução aceita
                  </span>
                </div>
                <button aria-label="Mais opções" className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <Link href="#" className="group-hover:text-primary transition-colors">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                    Qual a melhor IA no momento para criar aplicativos?
                  </h2>
                </Link>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                  Venho testando intensamente Claude 3.5 Sonnet com Cursor, v0 da Vercel e o novo GPT-4o. Para scaffolds rápidos de UI o v0 entrega quase pronto, mas para orquestração fullstack em Next.js com Prisma e server actions o Claude 3.5 foi o que menos alucinou schemas complexos...
                </p>
              </div>
              <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between font-code-md text-code-md text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">data_object</span>
                  <span className="truncate max-w-xs sm:max-w-md">Stack: Next.js 14 · Tailwind CSS · Supabase Vec · LangChain</span>
                </div>
                <span className="text-outline text-label-sm font-label-sm shrink-0">TypeScript</span>
              </div>
              <div className="flex items-center justify-between pt-space-xs text-on-surface-variant">
                <div className="flex items-center gap-space-md">
                  <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container hover:text-primary transition-colors font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                    <span className="font-semibold">42</span>
                    <span className="hidden sm:inline">curtidas</span>
                  </button>
                  <Link href="#" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                    <span>24 respostas</span>
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  <button aria-label="Salvar tópico" className="p-1.5 text-outline hover:text-primary rounded-lg hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-[20px]">bookmark_border</span>
                  </button>
                  <button aria-label="Compartilhar" className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                </div>
              </div>
            </article>
            
            {/* Topic 2 */}
            <article className="group bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low text-primary rounded-lg font-label-sm text-label-sm font-medium">
                    <span className="material-symbols-outlined text-[14px]">terminal</span>
                    Programação
                  </span>
                  <span className="text-outline text-label-sm font-label-sm">· há 2 semanas</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-md font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[14px]">analytics</span>
                    Benchmark
                  </span>
                </div>
                <button aria-label="Mais opções" className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <Link href="#" className="group-hover:text-primary transition-colors">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                    Arquitetura RAG com PostgreSQL e pgvector: benchmarks de latência
                  </h2>
                </Link>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                  Compilei métricas de mais de 100.000 embeddings gerados com text-embedding-3-small armazenados em instâncias RDS. Comparamos índices HNSW vs IVFFlat operando sob concorrência de 50 QPS. Seguem tabelas e comandos EXPLAIN ANALYZE...
                </p>
              </div>
              <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>Latência P95 de busca vetorial (100k docs)</span>
                  <span className="font-code-md text-code-md text-primary font-semibold">HNSW: 18.4ms</span>
                </div>
                <div className="w-full flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-outline font-code-md text-code-md shrink-0">HNSW</span>
                    <div className="flex-1 bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '28%' }}></div>
                    </div>
                    <span className="font-code-md text-code-md text-on-surface shrink-0 w-14 text-right">18.4ms</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-outline font-code-md text-code-md shrink-0">IVFFlat</span>
                    <div className="flex-1 bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                      <div className="bg-secondary-container h-full rounded-full transition-all duration-500" style={{ width: '64%' }}></div>
                    </div>
                    <span className="font-code-md text-code-md text-on-surface shrink-0 w-14 text-right">41.2ms</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-space-xs text-on-surface-variant">
                <div className="flex items-center gap-space-md">
                  <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container hover:text-primary transition-colors font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                    <span className="font-semibold">35</span>
                    <span className="hidden sm:inline">curtidas</span>
                  </button>
                  <Link href="#" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                    <span>19 respostas</span>
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  <button aria-label="Salvar tópico" className="p-1.5 text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                  </button>
                  <button aria-label="Compartilhar" className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                </div>
              </div>
            </article>

            {/* Topic 3 */}
            <article className="group bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low text-primary rounded-lg font-label-sm text-label-sm font-medium">
                    <span className="material-symbols-outlined text-[14px]">terminal</span>
                    Programação
                  </span>
                  <span className="text-outline text-label-sm font-label-sm">· há 1 mês</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                    Em alta
                  </span>
                </div>
                <button aria-label="Mais opções" className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <Link href="#" className="group-hover:text-primary transition-colors">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                    Frameworks para agentes autônomos em Python vs TypeScript
                  </h2>
                </Link>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                  CrewAI e AutoGen dominam o ecossistema Python, mas ferramentas como LangGraph.js trazem tipagem estrita com Zod e execução serverless no runtime Edge da Vercel. Qual caminho vocês têm escolhido para agentes operando em background?
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="px-2 py-0.5 bg-surface-container-low rounded font-label-sm text-label-sm text-outline">#LangGraph</span>
                <span className="px-2 py-0.5 bg-surface-container-low rounded font-label-sm text-label-sm text-outline">#CrewAI</span>
                <span className="px-2 py-0.5 bg-surface-container-low rounded font-label-sm text-label-sm text-outline">#Agents</span>
                <span className="px-2 py-0.5 bg-surface-container-low rounded font-label-sm text-label-sm text-outline">#TypeScript</span>
              </div>
              <div className="flex items-center justify-between pt-space-xs text-on-surface-variant">
                <div className="flex items-center gap-space-md">
                  <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container hover:text-primary transition-colors font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                    <span className="font-semibold">58</span>
                    <span className="hidden sm:inline">curtidas</span>
                  </button>
                  <Link href="#" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                    <span>31 respostas</span>
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  <button aria-label="Salvar tópico" className="p-1.5 text-outline hover:text-primary rounded-lg hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-[20px]">bookmark_border</span>
                  </button>
                  <button aria-label="Compartilhar" className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                </div>
              </div>
            </article>

            {/* End indicator */}
            <div className="flex items-center justify-center py-space-md">
              <span className="text-outline font-label-sm text-label-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">check</span>
                Mostrando todas as discussões de Vinicius Rocha
              </span>
            </div>
          </div>
        )}

        {/* Tab Content: COMENTÁRIOS */}
        {activeTab === 'comments' && (
          <div className="flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                <span>Respondeu a <Link href="#" className="text-primary font-semibold hover:underline">@marcos_dev</Link> em <em>&quot;Fine-tuning de Llama 3 para análise jurídica&quot;</em></span>
                <span>ontem</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface">
                &quot;Para contexto de jurisprudência brasileira, o segredo foi mesclar LoRA rank 32 com dados sintéticos gerados pelo Claude 3.5 com temperatura 0.2. Reduziu alucinações de precedentes do STJ em 74%.&quot;
              </p>
              <div className="flex items-center gap-space-md text-outline font-label-sm text-label-sm pt-1">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">thumb_up</span> 18 votos</span>
                <Link href="#" className="text-primary hover:underline">Ver no contexto</Link>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                <span>Respondeu em <em>&quot;Arquiteturas MoE em produção: trade-offs de latência&quot;</em></span>
                <span>há 4 dias</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface">
                &quot;Usamos vLLM com chunked prefill ativado no cluster A100. O ganho no TTFT (Time To First Token) foi brutal em streams contínuos.&quot;
              </p>
              <div className="flex items-center gap-space-md text-outline font-label-sm text-label-sm pt-1">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">thumb_up</span> 29 votos</span>
                <Link href="#" className="text-primary hover:underline">Ver no contexto</Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: SALVOS */}
        {activeTab === 'saved' && (
          <div className="flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex items-center justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary font-medium">#LLMs · Salvo há 1 semana</span>
                <Link href="#" className="font-headline-sm text-headline-sm text-on-surface font-semibold hover:text-primary transition-colors">
                  Guia definitivo de Evaluation de RAG com Ragas e TruLens
                </Link>
                <span className="text-outline font-body-sm text-body-sm">Por @camilatech · 48 comentários · 190 curtidas</span>
              </div>
              <button className="p-2 text-primary hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
              </button>
            </div>
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex items-center justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary font-medium">#Negócios · Salvo há 3 semanas</span>
                <Link href="#" className="font-headline-sm text-headline-sm text-on-surface font-semibold hover:text-primary transition-colors">
                  Custos reais de rodar LLMs proprietários vs modelos locais em SaaS B2B
                </Link>
                <span className="text-outline font-body-sm text-body-sm">Por @rodrigo_m · 62 comentários · 210 curtidas</span>
              </div>
              <button className="p-2 text-primary hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
