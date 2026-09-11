'use client'

import Link from 'next/link'

export default function EscreverArtigoClient() {
  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full">
        {/* Top Editor Utility & Action Bar */}
        <header className="w-full bg-surface-container-lowest rounded-xl shadow-sm px-space-md lg:px-space-lg py-space-sm mb-space-lg flex flex-wrap items-center justify-between gap-space-md">
          {/* Left: Breadcrumb & Autosave Status */}
          <div className="flex items-center gap-space-md min-w-0">
            <nav className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant shrink-0">
              <Link href="/meus-artigos" className="hover:text-primary transition-colors">Meus Artigos</Link>
              <span className="text-outline">/</span>
              <span className="text-on-surface font-semibold truncate max-w-[140px] sm:max-w-none">Novo Artigo</span>
            </nav>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-outline">Salvo automaticamente</span>
            </div>
          </div>
          
          {/* Right: Publishing Actions */}
          <div className="flex items-center gap-space-xs sm:gap-space-sm">
            <button className="inline-flex items-center gap-1.5 px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md" type="button">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              <span className="hidden md:inline">Prévia</span>
            </button>
            <button className="inline-flex items-center gap-1.5 px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md" type="button">
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span className="hidden md:inline">Salvar Rascunho</span>
            </button>
            <button className="inline-flex items-center gap-1.5 px-space-lg py-space-sm rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm font-label-md text-label-md font-semibold" type="button">
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              <span>Publicar</span>
            </button>
          </div>
        </header>

        {/* Main Grid: Writing Canvas (2 Cols on xl, stacked on tablet/mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT: Rich Document Body (Col 1-8) */}
          <section className="lg:col-span-8 flex flex-col gap-space-md">
            {/* Cover Image Slot */}
            <div className="group relative w-full h-56 md:h-72 rounded-xl bg-surface-container overflow-hidden flex flex-col items-center justify-center transition-all shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Cover Image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgUnCd__oGQESj1H_uBcZKQz3Fs6mQna8mlfMoBxRfqakv4nVKo16R0eeqf8bcQozqo6wljFQdP87Y1ncY1d-ejs6zPQ_F07k5ZI58a4cMr_D0XgPLjeRFdxqkgK2YxFKPk7UuZBZSX0VmuRf_JAWtPOrl95lUciyH2D2RJvY5bEPJPJ81MAo4KAMUwuTBhK3OHNBdR70qtiyAYMShtheW0y8kgx8mw-h_pebLApEvZENWaY-Qr8iK"/>
              {/* Overlay Gradient & Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/30 to-transparent flex items-end justify-between p-space-md md:p-space-lg">
                <div className="flex items-center gap-space-xs text-on-primary font-label-sm text-label-sm bg-inverse-surface/60 backdrop-blur px-space-md py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  <span>Imagem de capa (16:9)</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button className="px-space-md py-1.5 rounded-lg bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm backdrop-blur transition-all flex items-center gap-1" type="button">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Alterar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editor Content Container */}
            <article className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md sm:p-space-xl flex flex-col gap-space-lg">
              {/* Document Title Input */}
              <div className="flex flex-col gap-space-xs">
                <input className="w-full bg-transparent font-headline-xl text-headline-xl text-on-surface placeholder:text-outline/40 focus:outline-none tracking-tight leading-tight py-1" placeholder="Digite o título do seu artigo técnico..." type="text" defaultValue="Arquitetura de Avaliação de LLMs em Produção com Ragas e TruLens"/>
                <textarea className="w-full bg-transparent resize-none font-body-lg text-body-lg text-on-surface-variant placeholder:text-outline/50 focus:outline-none leading-relaxed mt-1" placeholder="Adicione um subtítulo ou resumo executivo do artigo para prévia nos cards..." rows={2} defaultValue="Um comparativo prático de estratégias para medir fidelidade, relevância semântica e alucinações em sistemas RAG corporativos em tempo real."></textarea>
              </div>
              
              {/* Sticky Rich Text Formatting Toolbar */}
              <div className="sticky top-20 z-20 w-full bg-surface-container-low/95 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-between gap-1 overflow-x-auto shadow-sm">
                <div className="flex items-center gap-0.5 shrink-0">
                  <button className="px-2 py-1 rounded hover:bg-surface-container font-headline-sm text-headline-sm text-on-surface" title="Título H2" type="button">H2</button>
                  <button className="px-2 py-1 rounded hover:bg-surface-container font-headline-sm text-headline-sm text-on-surface-variant text-sm" title="Título H3" type="button">H3</button>
                  <div className="w-px h-5 bg-outline-variant mx-1"></div>
                  <button className="p-1.5 rounded hover:bg-surface-container text-on-surface" title="Negrito" type="button"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                  <button className="p-1.5 rounded hover:bg-surface-container text-on-surface" title="Itálico" type="button"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                  <button className="p-1.5 rounded hover:bg-surface-container text-on-surface" title="Link" type="button"><span className="material-symbols-outlined text-[18px]">link</span></button>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-px h-5 bg-outline-variant mx-1"></div>
                  <button className="p-1.5 rounded hover:bg-surface-container text-on-surface" title="Lista com marcadores" type="button"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                  <button className="p-1.5 rounded hover:bg-surface-container text-on-surface" title="Inserir Imagem / Diagrama" type="button"><span className="material-symbols-outlined text-[18px]">add_photo_alternate</span></button>
                </div>
              </div>

              {/* Document Content Editor Canvas */}
              <div className="flex flex-col gap-space-md text-on-surface">
                <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
                  Em arquiteturas modernas de <strong className="text-on-surface font-semibold">Retrieval-Augmented Generation (RAG)</strong>, validar a acurácia de respostas sem intervenção humana contínua é um dos principais desafios de engenharia.
                </p>

                {/* Technical Code Block Demonstration */}
                <div className="rounded-xl bg-inverse-surface text-inverse-on-surface overflow-hidden shadow-sm my-space-xs">
                  <div className="flex items-center justify-between px-space-md py-2 bg-inverse-surface/90 text-inverse-on-surface/80 font-code-md text-code-md">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-error"></span>
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim"></span>
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-fixed-dim"></span>
                      <span className="ml-2 font-label-sm text-label-sm text-inverse-on-surface/70">evaluation_pipeline.py</span>
                    </div>
                  </div>
                  <pre className="p-space-md font-code-md text-code-md overflow-x-auto leading-relaxed"><code><span className="text-secondary-fixed">from</span> ragas <span className="text-secondary-fixed">import</span> evaluate
<span className="text-secondary-fixed">from</span> ragas.metrics <span className="text-secondary-fixed">import</span> faithfulness, answer_relevancy

<span className="text-outline"># Avaliação automatizada de métricas críticas de pipeline</span>
results = evaluate(
    dataset=eval_dataset,
    metrics=[faithfulness, answer_relevancy],
    raise_exceptions=<span className="text-primary-fixed-dim">False</span>
)
</code></pre>
                </div>

                <div className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-text flex items-center gap-space-sm text-outline">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span className="font-body-md text-body-md">Clique aqui para continuar escrevendo ou digite '/' para comandos rápidos...</span>
                </div>
              </div>

              {/* Document Word Counter & Reading Time Stats */}
              <footer className="flex items-center justify-between pt-space-md border-t border-transparent bg-surface-container-low/50 px-space-md py-space-sm rounded-lg mt-space-sm">
                <div className="flex items-center gap-space-md text-outline font-label-sm text-label-sm">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">format_shapes</span>
                    <strong>1.450</strong> palavras
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    ~<strong>7 min</strong> de leitura
                  </span>
                </div>
              </footer>
            </article>
          </section>

          {/* RIGHT: Publication Metadata & Settings (Col 9-12) */}
          <aside className="lg:col-span-4 flex flex-col gap-space-md">
            {/* Configuration Card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs text-on-surface pb-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                <h2 className="font-headline-sm text-headline-sm font-semibold">Configurações do Post</h2>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Categoria Editorial</label>
                <div className="relative w-full">
                  <select className="w-full bg-surface-container-low text-on-surface font-label-md text-label-md px-space-md py-2 rounded-lg appearance-none focus:outline-none focus:bg-surface-container transition-colors cursor-pointer" defaultValue="pesquisa">
                    <option value="pesquisa">Pesquisa & Engenharia de IA</option>
                    <option value="programacao">Programação & Modelos</option>
                    <option value="agentes">Sistemas Agênticos</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[20px]">expand_more</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Tags Técnicas</label>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-medium">
                    #LLMs
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-medium">
                    #Ragas
                  </span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">tag</span>
                  <input className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-label-sm text-label-sm pl-9 pr-space-md py-2 rounded-lg focus:outline-none focus:bg-surface-container transition-colors" placeholder="Adicionar tag e teclar Enter..." type="text"/>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[20px]">share</span>
                  <h2 className="font-headline-sm text-headline-sm font-semibold">SEO & Prévia Social</h2>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Slug da URL</label>
                <div className="flex items-center bg-surface-container-low rounded-lg px-space-md py-2 text-on-surface font-code-md text-code-md">
                  <span className="text-outline truncate">iacomunidade.com/blog/</span>
                  <input className="w-full bg-transparent text-primary font-code-md text-code-md focus:outline-none ml-0.5" type="text" defaultValue="avaliacao-llms-producao"/>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
