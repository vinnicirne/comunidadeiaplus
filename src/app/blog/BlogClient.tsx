'use client'

import Link from 'next/link'

export default function BlogClient() {
  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full">
        
        <section className="flex flex-col gap-space-md mb-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-1 max-w-xl">
              <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                <span>Publicações da Comunidade</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                Blog Técnico & Insights
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Artigos aprofundados, benchmarks de arquitetura e tutoriais avançados escritos pela comunidade de engenharia de IA.
              </p>
            </div>
            <div className="flex items-center gap-space-sm shrink-0">
              <Link href="/escrever-artigo" className="inline-flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-2.5 rounded-lg shadow-sm transition-all duration-200">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>Escrever Artigo</span>
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-space-sm items-stretch sm:items-center mt-space-xs">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-md text-body-md pl-11 pr-space-md py-2.5 rounded-lg shadow-sm focus:outline-none focus:bg-surface-container-lowest" id="blog-search" placeholder="Buscar artigos técnicos, tutoriais ou autores..." type="text" />
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-lowest p-1 rounded-lg shadow-sm">
              <button className="px-space-sm py-1.5 rounded-md font-label-sm text-label-sm text-on-surface bg-surface-container font-medium transition-colors" type="button">Mais Recentes</button>
              <button className="px-space-sm py-1.5 rounded-md font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors" type="button">Mais Lidos</button>
            </div>
          </div>
          
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 mt-1 scrollbar-none">
            <button className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm whitespace-nowrap shadow-sm transition-colors" type="button">Todos</button>
            <button className="px-space-md py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap shadow-sm transition-colors" type="button">LLMs & Arquiteturas</button>
            <button className="px-space-md py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap shadow-sm transition-colors" type="button">Fine-Tuning</button>
            <button className="px-space-md py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap shadow-sm transition-colors" type="button">Visão Computacional</button>
            <button className="px-space-md py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap shadow-sm transition-colors" type="button">Engenharia de Prompt</button>
            <button className="px-space-md py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm whitespace-nowrap shadow-sm transition-colors" type="button">RAG & Vetores</button>
          </div>
        </section>

        <section className="mb-space-xl">
          <div className="relative bg-surface-container-lowest rounded-xl shadow-md overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 p-space-lg lg:p-space-xl flex flex-col justify-between order-2 lg:order-1">
                <div className="flex flex-col gap-space-sm">
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      Em Destaque
                    </span>
                    <span className="inline-flex items-center px-space-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-medium">
                      Artigo da Semana
                    </span>
                    <span className="text-outline font-label-sm text-label-sm">•</span>
                    <span className="text-outline font-label-sm text-label-sm flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      12 min de leitura
                    </span>
                  </div>
                  <Link href="/artigo/guia-definitivo-rag" className="group-hover:text-primary transition-colors">
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold leading-tight">
                      Guia Definitivo: Otimizando RAG com Embeddings Multilíngues e Re-ranking Híbrido
                    </h2>
                  </Link>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">
                    Análise prática de arquiteturas de busca semântica em produção. Detalhamos benchmarks comparativos entre BM25 esparso e bi-encoders densos, estratégias de cross-encoder para reordenação de contexto, e como atingir 94.2% de recall com redução de 40% na latência p99 e contenção de custo computacional em GPUs corporativas.
                  </p>
                  <div className="flex flex-wrap gap-space-xs pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-primary font-code-md text-code-md">#RAG</span>
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-primary font-code-md text-code-md">#Embeddings</span>
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-primary font-code-md text-code-md">#Produção</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-space-md mt-space-md bg-transparent">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-semibold font-label-md text-label-md shadow-sm">
                      VR
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">Vinícius Rocha</span>
                      <span className="font-body-sm text-body-sm text-outline">Engenheiro de ML Staff · 18 de Outubro</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[18px] text-tertiary-container">thumb_up</span>
                      <span>450</span>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                      <span>38</span>
                    </div>
                    <button aria-label="Salvar nos favoritos" className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors" type="button">
                      <span className="material-symbols-outlined text-[20px]">bookmark</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full order-1 lg:order-2 overflow-hidden bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="RAG Visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBe6ch0ZDuosbOlxGIEL9s1E8QWEmF5szF4XY3rz6sgJ38ZlNgvSuCHZGi2UgB5x0t842ZISZbOrT7l2g6HyiBBADSD0ece9cQLbZIaj5k2Lnvk-FPcT52R6VWEoyMhYpFAPMC_9QPH_7GJz0sB8tX3vrHsSlls_mXL0i3UnEomR6CpHcGpg7Ume4LDCQo1-6yDuRZXprZ1p7AoiyKgBT2w4P52VQRWnrR00Gr8n9Z1HF7OYBOtpn3r"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden"></div>
                <div className="absolute bottom-space-md right-space-md bg-inverse-surface/90 backdrop-blur text-inverse-on-surface px-space-sm py-1 rounded-md font-code-md text-code-md shadow-md hidden sm:flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Recall: 94.2% | Latência: 48ms
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                Artigos Recentes & Mais Votados
              </h3>
              <span className="font-body-sm text-body-sm text-outline">Mostrando 4 de 48 publicações</span>
            </div>
            
            <div className="flex flex-col gap-space-md">
              <article className="bg-surface-container-lowest p-space-md lg:p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-space-md group">
                <div className="sm:w-44 sm:h-36 shrink-0 rounded-lg overflow-hidden relative bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="GPU Thumbnail" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYhDuAZiUnQansagrSJGevgmqIbWXk-C7QMnVSN0w-_zzM1W9bnUhec_TPCSXtf4AgHcxHwXGvfwMKhvEjT_Ok5EL3SZ0fuL-OnlnOfgjHm2g2VSazwZu8-zZlx1hRvJ_jN6PDy_VVAOffCdV1CIDYtpqxdoBC-DTvMuvnLZpdJ0b5BWyFKxpavSmu3H58uaMAKyhcfsuzUn8ToLUvYnWzPEHUEaghoSfYD0GE_y5oJUH1-UUUyO9F"/>
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur font-label-sm text-label-sm text-on-surface font-medium">8 min</span>
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-space-xs">
                      <span className="px-2 py-0.5 rounded bg-surface-container-low text-primary font-code-md text-code-md">#FineTuning</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-low text-primary font-code-md text-code-md">#Llama3</span>
                    </div>
                    <Link href="#" className="group-hover:text-primary transition-colors">
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold line-clamp-2">
                        Fine-Tuning de Llama 3 70B com LoRA em GPUs de Consumo: Lições Práticas
                      </h4>
                    </Link>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      Estratégias de quantização QLoRA de 4-bits, offloading com FSDP e ajuste de learning rate para rodar modelos massivos mantendo a convergência estável.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-space-sm mt-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-sm text-label-sm font-semibold">
                        CD
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface font-medium">Dra. Camila Duarte</span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                      <span className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
                        <span className="material-symbols-outlined text-[16px] text-tertiary-container">thumb_up</span>
                        320
                      </span>
                      <button aria-label="Salvar" className="text-outline hover:text-primary transition-colors" type="button">
                        <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
              
              <article className="bg-surface-container-lowest p-space-md lg:p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-space-md group">
                <div className="sm:w-44 sm:h-36 shrink-0 rounded-lg overflow-hidden relative bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Charts Thumbnail" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8toVaeNftgd2Vidzt_kHXJmcG60qE1n8GJIRL_It_TEDtCBIEthMvHF7TF7woP5SZHiTMGQ0K9c5bA1rmIAy0JZVqRV8McM-i-j67gKNRGA3s9D4rRtznruTCWYUXmHLH86DGDNeUHWC60of3dMA6u7lj-BUNfl60JfXc4-1jOGdfGjeuRnJaYkYXH_bugkgdZaLXzs2TEU0bGR-4we5R9C1kskQ1fqqae_ewf1RWSB4Xde3YMuWh"/>
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur font-label-sm text-label-sm text-on-surface font-medium">15 min</span>
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-space-xs">
                      <span className="px-2 py-0.5 rounded bg-surface-container-low text-primary font-code-md text-code-md">#Benchmarks</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-low text-primary font-code-md text-code-md">#Custos</span>
                    </div>
                    <Link href="#" className="group-hover:text-primary transition-colors">
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold line-clamp-2">
                        Comparativo de Custo e Throughput: Claude 3.5 Sonnet vs GPT-4o em Pipelines em Larga Escala
                      </h4>
                    </Link>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      Processamos mais de 50 milhões de tokens sob testes de carga sintéticos para avaliar limites de taxa de requisições, latência TTFT e variabilidade de parsing de JSON estruturado.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-space-sm mt-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-semibold">
                        RL
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface font-medium">Rodrigo Lima</span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                      <span className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
                        <span className="material-symbols-outlined text-[16px] text-tertiary-container">thumb_up</span>
                        580
                      </span>
                      <button aria-label="Salvar" className="text-outline hover:text-primary transition-colors" type="button">
                        <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </div>
            
            <div className="flex justify-center my-space-md">
              <button className="inline-flex items-center gap-space-xs bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md px-space-lg py-2.5 rounded-lg shadow-sm transition-colors" type="button">
                <span>Carregar mais artigos</span>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-gradient-to-br from-primary-fixed to-surface-container-low p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm relative overflow-hidden">
              <div className="flex items-center gap-space-xs text-primary">
                <span className="material-symbols-outlined text-[22px]">mark_email_unread</span>
                <h4 className="font-label-md text-label-md text-on-surface font-bold">Radar de IA Semanal</h4>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Receba diretamente em sua caixa de entrada resumos de papers, benchmarks e novidades de código testadas por engenheiros.
              </p>
              <div className="flex flex-col gap-2 mt-1">
                <input className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm px-space-md py-2 rounded-lg shadow-sm focus:outline-none" placeholder="seu-email@tech.com" type="email" />
                <button className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm py-2 rounded-lg font-medium shadow-sm transition-colors" type="button">
                  Inscrever-se gratuitamente
                </button>
              </div>
              <span className="font-label-sm text-label-sm text-outline text-center">Sem spam. Cancelamento em um clique.</span>
            </div>
            
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h4 className="font-label-md text-label-md text-on-surface font-semibold">Autores em Destaque</h4>
                <span className="font-label-sm text-label-sm text-primary font-medium">Este Mês</span>
              </div>
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-semibold text-label-sm">VR</div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface font-semibold">Vinícius Rocha</span>
                      <span className="font-body-sm text-body-sm text-outline">14 artigos · 2.4k seguidores</span>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-primary font-label-sm text-label-sm transition-colors" type="button">Seguir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </main>
  )
}
