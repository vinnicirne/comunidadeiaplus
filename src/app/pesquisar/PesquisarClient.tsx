'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PesquisarClient() {
  const [searchTerm, setSearchTerm] = useState('Claude')
  const [activeCategory, setActiveCategory] = useState('all')

  const handleClear = () => {
    setSearchTerm('')
  }

  // Define articles array to make filtering easier
  const articles = [
    {
      id: 1,
      category: 'programacao',
      author: {
        name: 'Rodrigo Lima',
        handle: '@rodrigo',
        time: 'há 4 horas',
        role: 'Senior Prompt Engineer',
        roleIcon: 'bolt',
        avatarColor: 'bg-secondary-fixed',
        avatarText: 'text-on-secondary-fixed',
        initial: 'R'
      },
      title: <><span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-code-md text-code-md">Claude</span> ou Gemini: qual vocês preferem para desenvolvimento Fullstack?</>,
      excerpt: 'Venho testando intensamente o Claude 3.5 Sonnet contra o Gemini 1.5 Pro na refatoração de monorepos TypeScript complexos. O raciocínio de dependência cruzada do Claude impressiona, porém o cache de contexto do Gemini tem vantagens operacionais...',
      tags: ['#TypeScript', '#Fullstack', '#GeminiPro', { text: '#Sonnet3.5', active: true }],
      stats: { upvotes: 54, comments: 18, views: 412 }
    },
    {
      id: 2,
      category: 'programacao',
      author: {
        name: 'Vinícius Andrade',
        handle: '@vinicius',
        time: 'há 2 horas',
        role: 'Core Contributor',
        roleIcon: 'verified',
        avatarColor: 'bg-primary-fixed',
        avatarText: 'text-on-primary-fixed',
        initial: 'V'
      },
      title: <><span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-code-md text-code-md">Claude</span> para programação: melhores práticas de prompts e contexto longo</>,
      excerpt: 'Compilei um guia estruturado sobre como injetar a árvore de arquivos, schemas de banco e regras de linter no system prompt do Claude para evitar alucinações em bases de código legadas de 100k+ tokens...',
      artifact: { name: 'system-prompt-architect-v2.md', size: '2.4 KB' },
      tags: ['#PromptEngineering', '#ContextWindow', '#BestPractices'],
      stats: { upvotes: 112, comments: 42, views: 890 }
    },
    {
      id: 3,
      category: 'negocios',
      author: {
        name: 'Felipe Martins',
        handle: '@felipe_ai',
        time: 'há 1 dia',
        role: 'Founder & AI Consultant',
        roleIcon: 'analytics',
        avatarColor: 'bg-tertiary-fixed',
        avatarText: 'text-on-tertiary-fixed',
        initial: 'F'
      },
      title: <><span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-code-md text-code-md">Claude</span> vale a pena? Comparativo de custo do Claude Pro vs API do Sonnet 3.5</>,
      excerpt: 'Analisamos as faturas de 12 times de desenvolvimento. Se o seu fluxo diário ultrapassa 40 mensagens pesadas com anexos, a API com prompt caching reduz os custos em até 68% em comparação com múltiplas assinaturas Pro...',
      tags: ['#CustosAPI', '#ClaudePro', '#ROI'],
      stats: { upvotes: 88, comments: 29, views: 670 }
    },
    {
      id: 4,
      category: 'programacao',
      author: {
        name: 'Marcos Silva',
        handle: '@marcos_tech',
        time: 'há 3 dias',
        role: 'Software Architect',
        roleIcon: 'terminal',
        avatarColor: 'bg-secondary-container',
        avatarText: 'text-on-secondary-container',
        initial: 'M'
      },
      title: <>Como usar <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-code-md text-code-md">Claude</span> para criar aplicativos completos com Next.js e Tailwind</>,
      excerpt: 'Passo a passo com o recurso de Artifacts: montamos uma stack com Next.js App Router, Server Actions, Supabase Auth e Tailwind CSS. Veja o template pronto e o fluxo de iteração tela a tela...',
      tags: ['#Nextjs', '#TailwindCSS', '#Artifacts'],
      stats: { upvotes: 95, comments: 31, views: 750 }
    }
  ]

  const filteredArticles = articles.filter(a => {
    const matchesCategory = activeCategory === 'all' || a.category === activeCategory
    // Mockup just counts visible based on category, not actually filtering by text in JS, but we will add simple search
    return matchesCategory
  })

  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg sm:p-space-xl shadow-sm">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm tracking-wide uppercase font-semibold">
              <span className="material-symbols-outlined text-[16px]">manage_search</span>
              <span>Mecanismo de Descoberta Técnica</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              Pesquisar na comunidade
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Explore benchmarks, comparações de arquiteturas, prompts avançados e debates técnicos compartilhados por especialistas em IA.
            </p>
            <div className="relative w-full mt-space-xs">
              <div className="relative flex items-center bg-surface-container-low hover:bg-surface-container rounded-xl shadow-sm transition-all focus-within:bg-surface-container-lowest focus-within:shadow-md">
                <span className="material-symbols-outlined text-primary text-[24px] pl-space-md shrink-0">search</span>
                <input 
                  className="w-full bg-transparent text-on-surface placeholder:text-outline font-label-md text-label-md py-3.5 px-space-md focus:outline-none" 
                  placeholder="Digite o que você está procurando (ex: Claude, benchmarks, LLMs locais)..." 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex items-center gap-space-xs pr-space-md shrink-0">
                  <button 
                    onClick={handleClear}
                    className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container transition-colors" 
                    title="Limpar busca" 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                  <span className="font-code-md text-code-md text-outline bg-surface-container-high px-2 py-0.5 rounded">Enter</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-space-xs overflow-x-auto pb-1 pt-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0 mr-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">filter_list</span>
                Filtrar:
              </span>
              
              <button 
                onClick={() => setActiveCategory('all')}
                className={`filter-pill shrink-0 px-space-md py-1.5 rounded-full font-label-sm text-label-sm transition-colors ${
                  activeCategory === 'all' ? 'bg-primary text-on-primary shadow-sm font-semibold' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Todas as categorias
              </button>
              
              <button 
                onClick={() => setActiveCategory('programacao')}
                className={`filter-pill shrink-0 px-space-md py-1.5 rounded-full font-label-sm text-label-sm transition-colors ${
                  activeCategory === 'programacao' ? 'bg-primary text-on-primary shadow-sm font-semibold' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Programação
              </button>
              
              <button 
                onClick={() => setActiveCategory('ia-geral')}
                className={`filter-pill shrink-0 px-space-md py-1.5 rounded-full font-label-sm text-label-sm transition-colors ${
                  activeCategory === 'ia-geral' ? 'bg-primary text-on-primary shadow-sm font-semibold' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                IA Geral
              </button>
              
              <button 
                onClick={() => setActiveCategory('imagens-e-videos')}
                className={`filter-pill shrink-0 px-space-md py-1.5 rounded-full font-label-sm text-label-sm transition-colors ${
                  activeCategory === 'imagens-e-videos' ? 'bg-primary text-on-primary shadow-sm font-semibold' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Imagens e Vídeos
              </button>
              
              <button 
                onClick={() => setActiveCategory('negocios')}
                className={`filter-pill shrink-0 px-space-md py-1.5 rounded-full font-label-sm text-label-sm transition-colors ${
                  activeCategory === 'negocios' ? 'bg-primary text-on-primary shadow-sm font-semibold' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Negócios
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              {filteredArticles.length} resultado{filteredArticles.length !== 1 ? 's' : ''} encontrado{filteredArticles.length !== 1 ? 's' : ''} para <span className="text-primary font-bold">&quot;{searchTerm.trim() || 'todos'}&quot;</span>
            </h2>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-lg">
            <button className="px-space-sm py-0.5 rounded font-label-sm text-label-sm bg-surface-container-lowest text-on-surface shadow-xs font-medium">Relevância</button>
            <button className="px-space-sm py-0.5 rounded font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface">Recentes</button>
            <button className="px-space-sm py-0.5 rounded font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface">Mais votados</button>
          </div>
        </div>

        <div className="flex flex-col gap-space-md">
          {filteredArticles.map((article) => (
            <article key={article.id} className="group relative bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className={`w-9 h-9 rounded-full ${article.author.avatarColor} flex items-center justify-center shrink-0`}>
                    <span className={`font-label-md text-label-md ${article.author.avatarText} font-bold`}>{article.author.initial}</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">{article.author.name}</span>
                      <span className="font-label-sm text-label-sm text-outline">{article.author.handle}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                      <span className="font-body-sm text-body-sm text-outline">{article.author.time}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${article.category === 'negocios' ? 'text-tertiary' : article.category === 'programacao' ? (article.author.handle === '@vinicius' ? 'text-secondary' : 'text-primary') : 'text-primary'}`}>
                      <span className="material-symbols-outlined text-[14px]">{article.author.roleIcon}</span>
                      <span className="font-label-sm text-label-sm font-medium">{article.author.role}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded-md font-medium flex items-center gap-1">
                    <span className={`material-symbols-outlined text-[14px] ${article.category === 'negocios' ? 'text-tertiary' : 'text-primary'}`}>
                      {article.category === 'negocios' ? 'trending_up' : 'terminal'}
                    </span>
                    {article.category === 'negocios' ? 'Negócios' : 'Programação'}
                  </span>
                  <button className="p-1 rounded-md text-outline hover:text-primary hover:bg-surface-container-low transition-colors" title="Salvar discussão">
                    <span className="material-symbols-outlined text-[18px]">bookmark</span>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-space-xs">
                <Link href="#" className="block group-hover:text-primary transition-colors">
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold leading-snug">
                    {article.title}
                  </h3>
                </Link>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                  {article.excerpt}
                </p>
              </div>

              {article.artifact && (
                <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">code</span>
                    <span className="font-code-md text-code-md">artifact: {article.artifact.name}</span>
                  </div>
                  <span className="font-code-md text-code-md text-outline">{article.artifact.size}</span>
                </div>
              )}

              <div className="flex items-center gap-space-xs flex-wrap">
                {article.tags.map((tag, idx) => {
                  if (typeof tag === 'string') {
                    return (
                      <span key={idx} className="px-2 py-0.5 rounded bg-surface-container-low font-code-md text-code-md text-on-surface-variant">
                        {tag}
                      </span>
                    )
                  } else {
                    return (
                      <span key={idx} className="px-2 py-0.5 rounded bg-secondary-fixed font-code-md text-code-md text-on-secondary-fixed">
                        {tag.text}
                      </span>
                    )
                  }
                })}
              </div>

              <div className="flex items-center justify-between pt-space-xs text-outline">
                <div className="flex items-center gap-space-md">
                  <div className="flex items-center gap-1 bg-surface-container-low px-2.5 py-1 rounded-lg text-on-surface-variant font-label-sm text-label-sm">
                    <button className="hover:text-primary flex items-center transition-colors">
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    </button>
                    <span className="font-semibold text-on-surface">{article.stats.upvotes}</span>
                    <button className="hover:text-error flex items-center transition-colors">
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-outline">chat_bubble</span>
                    <span className="font-semibold text-on-surface">{article.stats.comments}</span> comentários
                  </div>
                  <div className="hidden sm:flex items-center gap-1 font-body-sm text-body-sm text-outline">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    <span>{article.stats.views} visualizações</span>
                  </div>
                </div>
                <Link href="#" className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:underline font-semibold">
                  <span>Ver debate</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-center pt-space-sm pb-space-lg">
          <div className="inline-flex items-center gap-space-xs font-body-sm text-body-sm text-outline">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Fim dos resultados correspondentes para esta consulta</span>
          </div>
        </div>

      </div>
    </main>
  )
}
