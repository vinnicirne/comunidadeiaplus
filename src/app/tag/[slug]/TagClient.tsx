'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TagClient({ slug }: { slug: string }) {
  const [isFollowing, setIsFollowing] = useState(true)

  const toggleFollowTag = () => {
    setIsFollowing(!isFollowing)
  }

  // Format slug for display (e.g. llms -> LLMs)
  const displayTitle = slug.toUpperCase()

  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        
        {/* Header da Tag / Hashtag Hero Contextual */}
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/5 pointer-events-none blur-2xl"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md relative z-10">
            <div className="flex items-center gap-space-md">
              <div className="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0 shadow-sm">
                <span className="font-headline-lg font-bold text-headline-lg leading-none select-none">#</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">{displayTitle}</h1>
                  <span className="px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Large Language Models</span>
                </div>
                <span className="font-body-sm text-body-sm text-outline">Tópico de alta relevância técnica</span>
              </div>
            </div>
            
            {/* Ações Rápidas */}
            <div className="flex items-center gap-space-sm w-full sm:w-auto">
              <button 
                onClick={toggleFollowTag}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-colors ${
                  isFollowing 
                    ? 'bg-surface-container-low hover:bg-surface-container text-on-surface' 
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isFollowing ? 'text-primary' : 'text-outline'}`}>
                  {isFollowing ? 'notifications_active' : 'notifications_none'}
                </span>
                <span>{isFollowing ? 'Seguindo' : 'Seguir tag'}</span>
              </button>
              <Link href="/criar-topico" className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="whitespace-nowrap">Nova discussão</span>
              </Link>
            </div>
          </div>
          
          {/* Descrição */}
          <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed max-w-2xl relative z-10">
            Debates técnicos, benchmarks, arquiteturas, fine-tuning e novidades práticas sobre Modelos de Linguagem de Grande Escala.
          </p>
          
          {/* Métricas / Estatísticas Minimalistas */}
          <div className="flex flex-wrap items-center gap-space-md sm:gap-space-xl pt-space-xs relative z-10">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-md text-headline-md text-on-surface font-semibold">342</span>
              <span className="font-body-sm text-body-sm text-outline">discussões ativas</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-outline-variant hidden sm:block"></div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-md text-headline-md text-on-surface font-semibold">2.8k</span>
              <span className="font-body-sm text-body-sm text-outline">respostas</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-outline-variant hidden sm:block"></div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-md text-headline-md text-on-surface font-semibold">4.1k</span>
              <span className="font-body-sm text-body-sm text-outline">membros interessados</span>
            </div>
          </div>
          
          {/* Tags Relacionadas */}
          <div className="flex flex-col gap-space-xs pt-space-xs relative z-10">
            <div className="font-label-sm text-label-sm text-outline font-semibold uppercase tracking-wider">Tags Co-ocorrentes</div>
            <div className="flex flex-wrap gap-space-xs">
              {['Claude', 'Llama3', 'RAG', 'PromptEngineering', 'FineTuning', 'OpenSource'].map(tag => (
                <Link key={tag} href={`/tag/${tag.toLowerCase()}`} className="inline-flex items-center gap-1 px-space-md py-1 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm rounded-full transition-colors">
                  <span className="text-primary font-medium">#</span>{tag}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Filtros e Ordenação */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-sm rounded-xl shadow-sm">
            {/* Abas de Ordenação */}
            <nav aria-label="Ordenação do feed" className="flex items-center gap-space-xs overflow-x-auto pb-1 md:pb-0">
              <button className="px-space-md py-space-xs rounded-lg font-label-md text-label-md font-semibold bg-primary text-on-primary transition-colors whitespace-nowrap">
                Mais recentes
              </button>
              <button className="px-space-md py-space-xs rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors whitespace-nowrap">
                Mais votadas
              </button>
              <button className="px-space-md py-space-xs rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors whitespace-nowrap">
                Em alta
              </button>
              <button className="px-space-md py-space-xs rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors whitespace-nowrap">
                Sem resposta
              </button>
            </nav>
            {/* Sub-categorias */}
            <div className="flex items-center gap-space-xs justify-end">
              <span className="font-label-sm text-label-sm text-outline hidden sm:inline">Categoria:</span>
              <div className="relative inline-block w-full sm:w-auto">
                <select className="w-full sm:w-auto appearance-none bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg pl-space-md pr-space-xl py-1.5 focus:outline-none focus:bg-surface-container-lowest cursor-pointer transition-colors" defaultValue="todas">
                  <option value="todas">Todas as categorias</option>
                  <option value="programacao">Programação</option>
                  <option value="ia-geral">IA Geral</option>
                  <option value="negocios">Negócios</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feed de Discussões */}
        <section className="flex flex-col gap-space-md">
          {/* Card 1 */}
          <article className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex gap-space-md group">
            <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
              <button aria-label="Votar a favor" className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors" type="button">
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_up</span>
              </button>
              <span className="font-label-md text-label-md font-semibold text-primary select-none">+68</span>
              <button aria-label="Votar contra" className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors" type="button">
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-space-sm flex-1 min-w-0">
              <div className="flex items-center justify-between gap-space-sm flex-wrap">
                <div className="flex items-center gap-space-sm">
                  <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed text-label-sm font-semibold">
                    RL
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Rodrigo Lima</span>
                    <span className="font-body-sm text-body-sm text-outline">@rodrigo</span>
                    <span className="text-outline text-body-sm">·</span>
                    <span className="font-body-sm text-body-sm text-outline">há 3 horas</span>
                  </div>
                </div>
                <span className="px-space-sm py-0.5 rounded bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant font-medium">
                  Programação
                </span>
              </div>
              
              <Link href="#" className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug">
                Arquiteturas MoE vs Dense em LLMs: trade-offs de latência e consumo de VRAM em produção
              </Link>
              
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 leading-relaxed">
                Venho testando a implantação de modelos MoE (como Mixtral e DeepSeek-V2) versus modelos densos equivalentes. Para pipelines em tempo real com batch size pequeno, a latência de token first-byte...
              </p>
              
              <div className="flex items-center gap-space-xs flex-wrap pt-space-xs">
                {['LLMs', 'Mixtral', 'MoE', 'DeepSeek'].map(tag => (
                  <span key={tag} className={`px-2 py-0.5 rounded-md ${tag === 'LLMs' ? 'bg-surface-container-low text-primary font-medium' : 'bg-surface-container-low text-on-surface-variant'} font-label-sm text-label-sm`}>
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-space-xs text-outline font-label-sm text-label-sm">
                <div className="flex items-center gap-space-lg">
                  <span className="inline-flex items-center gap-1 hover:text-on-surface cursor-pointer transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                    <span>38 respostas</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    <span>890 visualizações</span>
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button aria-label="Salvar discussão" className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors" type="button">
                    <span className="material-symbols-outlined text-[18px]">bookmark</span>
                  </button>
                  <button aria-label="Compartilhar" className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors" type="button">
                    <span className="material-symbols-outlined text-[18px]">share</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
          
          {/* Card 2 */}
          <article className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex gap-space-md group">
            <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
              <button aria-label="Votar a favor" className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors" type="button">
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_up</span>
              </button>
              <span className="font-label-md text-label-md font-semibold text-primary select-none">+52</span>
              <button aria-label="Votar contra" className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors" type="button">
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-space-sm flex-1 min-w-0">
              <div className="flex items-center justify-between gap-space-sm flex-wrap">
                <div className="flex items-center gap-space-sm">
                  <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed text-label-sm font-semibold">
                    CD
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Dra. Camila Duarte</span>
                    <span className="font-body-sm text-body-sm text-outline">@camilaml</span>
                    <span className="text-outline text-body-sm">·</span>
                    <span className="font-body-sm text-body-sm text-outline">há 5 horas</span>
                  </div>
                </div>
                <span className="px-space-sm py-0.5 rounded bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant font-medium">
                  Programação
                </span>
              </div>
              
              <Link href="#" className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug">
                Fine-tuning de Llama 3 8B vs LoRA em dados jurídicos em português: resultados e lições
              </Link>
              
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 leading-relaxed">
                Comparamos LoRA de rank 32 com full fine-tuning em 12.000 pareceres jurídicos em pt-BR. O overfitting foi um desafio nos primeiros epochs com LoRA, enquanto a retenção de contexto genérico...
              </p>
              
              <div className="flex items-center gap-space-xs flex-wrap pt-space-xs">
                {['LLMs', 'Llama3', 'FineTuning', 'OpenSource'].map(tag => (
                  <span key={tag} className={`px-2 py-0.5 rounded-md ${tag === 'LLMs' ? 'bg-surface-container-low text-primary font-medium' : 'bg-surface-container-low text-on-surface-variant'} font-label-sm text-label-sm`}>
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-space-xs text-outline font-label-sm text-label-sm">
                <div className="flex items-center gap-space-lg">
                  <span className="inline-flex items-center gap-1 hover:text-on-surface cursor-pointer transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                    <span>24 respostas</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    <span>1.2k visualizações</span>
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button aria-label="Salvar discussão" className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors" type="button">
                    <span className="material-symbols-outlined text-[18px]">bookmark</span>
                  </button>
                  <button aria-label="Compartilhar" className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors" type="button">
                    <span className="material-symbols-outlined text-[18px]">share</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* Paginação */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-space-md py-space-md font-label-md text-label-md">
          <span className="text-outline font-body-sm text-body-sm">
            Mostrando <span className="font-medium text-on-surface">1–4</span> de <span className="font-medium text-on-surface">342</span> discussões
          </span>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg text-outline opacity-40 cursor-not-allowed flex items-center justify-center" disabled type="button">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-semibold flex items-center justify-center" type="button">
              1
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors" type="button">
              2
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors" type="button">
              3
            </button>
            <span className="px-1 text-outline select-none">...</span>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors" type="button">
              86
            </button>
            <button className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors" type="button">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </section>

      </div>
    </main>
  )
}
