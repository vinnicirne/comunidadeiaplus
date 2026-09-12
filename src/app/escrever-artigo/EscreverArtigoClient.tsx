'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { saveDraft, publishArticle } from '@/lib/actions/article'

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export default function EscreverArtigoClient({ categories = [] }: { categories?: any[] }) {
  const router = useRouter()
  
  // State for article data
  const [articleId, setArticleId] = useState<string | undefined>(undefined)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState(categories.length > 0 ? categories[0].id : '')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [slug, setSlug] = useState('')
  const [coverImage, setCoverImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuAgUnCd__oGQESj1H_uBcZKQz3Fs6mQna8mlfMoBxRfqakv4nVKo16R0eeqf8bcQozqo6wljFQdP87Y1ncY1d-ejs6zPQ_F07k5ZI58a4cMr_D0XgPLjeRFdxqkgK2YxFKPk7UuZBZSX0VmuRf_JAWtPOrl95lUciyH2D2RJvY5bEPJPJ81MAo4KAMUwuTBhK3OHNBdR70qtiyAYMShtheW0y8kgx8mw-h_pebLApEvZENWaY-Qr8iK')

  // UI state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isPublishing, startTransitionPublish] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Ref to track if it's the first render to avoid immediate autosave
  const isFirstRender = useRef(true)

  // Auto-save logic (Debounce)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const handler = setTimeout(() => {
      handleSaveDraft(true)
    }, 2000) // 2 segundos de debounce

    return () => {
      clearTimeout(handler)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, content, categoryId, tags, slug, coverImage])

  const handleSaveDraft = async (isAutoSave = false) => {
    setSaveStatus('saving')
    const res = await saveDraft({
      id: articleId,
      title,
      subtitle,
      content,
      category_id: categoryId,
      tags,
      cover_image_url: coverImage,
      slug
    })

    if (res.error) {
      setSaveStatus('error')
      if (!isAutoSave) setErrorMsg(res.error)
    } else if (res.success && res.article) {
      setArticleId(res.article.id)
      setSaveStatus('saved')
      if (!slug && res.article.slug) {
        setSlug(res.article.slug)
      }
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handlePublish = () => {
    setErrorMsg(null)
    startTransitionPublish(async () => {
      const res = await publishArticle({
        id: articleId,
        title,
        subtitle,
        content,
        category_id: categoryId,
        tags,
        cover_image_url: coverImage,
        slug
      })

      if (res?.error) {
        setErrorMsg(res.error)
      } else if (res?.success && res.slug) {
        router.push(`/artigo/${res.slug}`)
      } else {
        setErrorMsg('Ocorreu um erro inesperado ao publicar.')
      }
    })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    // Se ainda não tem ID (artigo novo) e slug não foi editado manualmente, auto-preenche o slug
    if (!articleId) {
      setSlug(generateSlug(newTitle))
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = tagInput.trim()
      if (val && !tags.includes(val)) {
        setTags([...tags, val])
        setTagInput('')
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  return (
    <main className="w-full max-w-3xl mx-auto px-4 lg:px-6 py-6 text-[#dce2f7]">
      <div className="flex flex-col w-full">
        
        {/* Top Editor Utility & Action Bar */}
        <header className="w-full bg-[#141b2b] border border-[#2e3545]/60 rounded-xl shadow-md px-4 lg:px-6 py-2 mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Breadcrumb & Autosave Status */}
          <div className="flex items-center gap-4 min-w-0">
            <nav className="flex items-center gap-1 text-[12px] font-medium text-[#94a3b8] shrink-0">
              <Link href="/meus-artigos" className="hover:text-[#c0c1ff] transition-colors text-[#908fa0]">Meus Artigos</Link>
              <span className="text-[#464554]">/</span>
              <span className="text-[#dce2f7] font-semibold truncate max-w-[140px] sm:max-w-none">
                {articleId ? 'Editando Rascunho' : 'Novo Artigo'}
              </span>
            </nav>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#191f2f] border border-[#2e3545]/60 text-[#94a3b8] text-[11px] font-semibold tracking-wide">
              {saveStatus === 'saving' && <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>}
              {saveStatus === 'saved' && <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>}
              {saveStatus === 'error' && <span className="material-symbols-outlined text-[14px] text-[#ffb4ab]">error</span>}
              <span className="text-[#94a3b8]">
                {saveStatus === 'saving' ? 'Salvando...' : 
                 saveStatus === 'saved' ? 'Salvo automaticamente' : 
                 saveStatus === 'error' ? 'Erro ao salvar' : 'Edição ativa'}
              </span>
            </div>
          </div>
          
          {/* Right: Publishing Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => handleSaveDraft(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141b2b] border border-[#2e3545]/50 text-[#94a3b8] hover:text-[#dce2f7] hover:bg-[#191f2f] transition-colors text-[12px] font-medium" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span className="hidden md:inline">Salvar Rascunho</span>
            </button>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-lg bg-[#c0c1ff] text-[#1000a9] hover:bg-[#8083ff] hover:text-white transition-all shadow-sm text-[12px] font-bold disabled:opacity-60" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              <span>{isPublishing ? 'Publicando...' : 'Publicar Artigo'}</span>
            </button>
            <button aria-label="Opções avançadas do artigo" className="p-2 rounded-lg text-[#94a3b8] hover:bg-[#191f2f] hover:text-[#dce2f7] transition-colors" type="button">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          </div>
        </header>

        {errorMsg && (
          <div className="mb-4 p-4 bg-[#93000a] text-[#ffdad6] rounded-lg text-[13px] flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)}><span className="material-symbols-outlined text-[18px]">close</span></button>
          </div>
        )}

        {/* Main Grid: Writing Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Rich Document Body (Col 1-8) */}
          <section className="lg:col-span-8 flex flex-col gap-4">
            {/* Cover Image Slot */}
            <div className="group relative w-full h-56 md:h-72 rounded-xl bg-[#191f2f] border border-[#2e3545]/50 overflow-hidden flex flex-col items-center justify-center transition-all shadow-md">
              <img className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 brightness-90 hover:opacity-100" alt="Cover" src={coverImage}/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#070e1d]/90 via-[#070e1d]/40 to-transparent flex items-end justify-between p-4 md:p-6">
                <div className="flex items-center gap-1 text-[#dce2f7] text-[11px] font-semibold bg-[#070e1d]/70 border border-[#2e3545]/60 backdrop-blur px-4 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-[#c0c1ff]">photo_camera</span>
                  <span>Imagem de capa (16:9)</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-4 py-1.5 rounded-lg bg-[#232a3a]/90 hover:bg-[#2e3545] text-[#dce2f7] text-[11px] font-semibold border border-[#2e3545] backdrop-blur transition-all flex items-center gap-1" type="button" onClick={() => { const url = prompt('Digite a URL da imagem:'); if (url) setCoverImage(url); }}>
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Alterar</span>
                  </button>
                  <button aria-label="Remover capa" className="p-1.5 rounded-lg bg-[#232a3a]/90 hover:bg-[#93000a] text-[#dce2f7] hover:text-[#ffdad6] border border-[#2e3545] backdrop-blur transition-all" type="button" onClick={() => setCoverImage('')}>
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editor Content Container */}
            <article className="bg-[#141b2b] border border-[#2e3545]/60 rounded-xl shadow-md p-4 sm:p-8 flex flex-col gap-6">
              {/* Document Title Input */}
              <div className="flex flex-col gap-1">
                <input 
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full bg-transparent text-[36px] font-bold text-white placeholder:text-[#908fa0]/40 focus:outline-none tracking-tight leading-tight py-1" 
                  placeholder="Digite o título do seu artigo técnico..." 
                  type="text" 
                />
                <textarea 
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-transparent resize-none text-[16px] text-slate-300 placeholder:text-[#908fa0]/50 focus:outline-none leading-relaxed mt-1" 
                  placeholder="Adicione um subtítulo ou resumo executivo do artigo para prévia nos cards..." 
                  rows={2}
                />
              </div>
              
              {/* Sticky Rich Text Formatting Toolbar */}
              <div className="sticky top-20 z-20 w-full bg-[#232a3a]/90 border border-[#2e3545]/80 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-between gap-1 overflow-x-auto shadow-md">
                <div className="flex items-center gap-0.5 shrink-0">
                  <button className="px-2 py-1 rounded hover:bg-[#2e3545] text-[16px] font-semibold text-white transition-colors" title="Título H2" type="button">H2</button>
                  <button className="px-2 py-1 rounded hover:bg-[#2e3545] text-[16px] font-semibold text-slate-300 text-sm transition-colors" title="Título H3" type="button">H3</button>
                  <div className="w-px h-5 bg-[#464554]/60 mx-1"></div>
                  <button className="p-1.5 rounded hover:bg-[#2e3545] text-slate-200 transition-colors" title="Negrito" type="button"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                  <button className="p-1.5 rounded hover:bg-[#2e3545] text-slate-200 transition-colors" title="Itálico" type="button"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                  <button className="p-1.5 rounded hover:bg-[#2e3545] text-slate-200 transition-colors" title="Link" type="button"><span className="material-symbols-outlined text-[18px]">link</span></button>
                  <button className="p-1.5 rounded hover:bg-[#2e3545] text-slate-200 transition-colors" title="Citação" type="button"><span className="material-symbols-outlined text-[18px]">format_quote</span></button>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-px h-5 bg-[#464554]/60 mx-1"></div>
                  <div className="relative inline-flex items-center bg-[#070e1d] border border-[#2e3545]/80 rounded px-2 py-0.5 text-[#dce2f7] font-mono text-xs">
                    <span className="material-symbols-outlined text-[16px] text-[#c0c1ff] mr-1">code</span>
                    <select className="bg-transparent text-[11px] font-semibold text-[#dce2f7] focus:outline-none cursor-pointer pr-1">
                      <option className="bg-[#232a3a] text-[#dce2f7]" value="python">Python</option>
                      <option className="bg-[#232a3a] text-[#dce2f7]" value="typescript">TypeScript</option>
                      <option className="bg-[#232a3a] text-[#dce2f7]" value="sql">SQL</option>
                      <option className="bg-[#232a3a] text-[#dce2f7]" value="json">JSON</option>
                    </select>
                  </div>
                  <button className="p-1.5 rounded hover:bg-[#2e3545] text-slate-200 transition-colors" title="Lista com marcadores" type="button"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                  <button className="p-1.5 rounded hover:bg-[#2e3545] text-slate-200 transition-colors" title="Inserir Imagem / Diagrama" type="button"><span className="material-symbols-outlined text-[18px]">add_photo_alternate</span></button>
                </div>
              </div>

              {/* Document Content Editor Canvas */}
              <div className="flex flex-col gap-4 text-[#dce2f7]">
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[300px] bg-transparent resize-none text-[14px] leading-relaxed text-slate-300 placeholder:text-[#908fa0]/50 focus:outline-none" 
                  placeholder="Comece a escrever o conteúdo técnico aqui (Markdown suportado)..."
                />
              </div>

              {/* Document Word Counter & Reading Time Stats */}
              <footer className="flex items-center justify-between pt-4 border-t border-[#2e3545]/60 bg-[#191f2f]/60 px-4 py-2 rounded-lg mt-2">
                <div className="flex items-center gap-4 text-[#908fa0] text-[11px] font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">format_shapes</span>
                    <strong className="text-slate-300">{content.split(/\s+/).filter(w => w.length > 0).length}</strong> palavras
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    ~<strong className="text-slate-300">{Math.max(1, Math.ceil(content.split(/\s+/).filter(w => w.length > 0).length / 200))} min</strong> de leitura
                  </span>
                </div>
                <span className="text-[#908fa0] text-[11px] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#c0c1ff]">verified</span>
                  Sintaxe Markdown ativa
                </span>
              </footer>
            </article>
          </section>

          {/* RIGHT: Publication Metadata & Settings (Col 9-12) */}
          <aside className="lg:col-span-4 flex flex-col gap-4">
            {/* Configuration Card */}
            <div className="bg-[#141b2b] border border-[#2e3545]/60 rounded-xl shadow-md p-6 flex flex-col gap-4">
              <div className="flex items-center gap-1 text-[#dce2f7] pb-1">
                <span className="material-symbols-outlined text-[#c0c1ff] text-[20px]">tune</span>
                <h2 className="text-[16px] font-semibold text-white">Configurações do Post</h2>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-300 font-semibold">Categoria Editorial</label>
                <div className="relative w-full">
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#191f2f] border border-[#2e3545]/80 text-[#dce2f7] text-[12px] font-medium px-4 py-2 rounded-lg appearance-none focus:outline-none focus:border-[#c0c1ff] transition-colors cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#191f2f] text-[#dce2f7]">Selecione uma categoria...</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id} className="bg-[#191f2f] text-[#dce2f7]">{cat.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#908fa0] text-[20px]">expand_more</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-300 font-semibold">Tags Técnicas</label>
                  <span className="text-[11px] text-[#908fa0]">{tags.length}/5 tags</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2f3aa3]/60 border border-[#c0c1ff]/30 text-[#e1e0ff] text-[11px] font-medium">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-white" aria-label="Remover tag"><span className="material-symbols-outlined text-[14px]">close</span></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#908fa0] text-[18px]">tag</span>
                  <input 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full bg-[#191f2f] border border-[#2e3545]/80 text-[#dce2f7] placeholder:text-[#908fa0] text-[11px] font-semibold pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-[#c0c1ff] transition-colors" 
                    placeholder="Adicionar tag e teclar Enter..." 
                    type="text"
                  />
                </div>
              </div>

              {/* Technical Level Pills */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-300 font-semibold">Nível de Profundidade</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#191f2f] border border-[#2e3545]/80 rounded-lg">
                  <button className="py-1.5 text-center text-[11px] font-semibold rounded-md text-[#c7c4d7] hover:text-white transition-colors" type="button">Iniciante</button>
                  <button className="py-1.5 text-center text-[11px] font-semibold rounded-md text-[#c7c4d7] hover:text-white transition-colors" type="button">Intermediário</button>
                  <button className="py-1.5 text-center text-[11px] font-semibold rounded-md bg-[#c0c1ff] text-[#1000a9] shadow-sm" type="button">Avançado</button>
                </div>
              </div>
            </div>

            <div className="bg-[#141b2b] border border-[#2e3545]/60 rounded-xl shadow-md p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#dce2f7]">
                  <span className="material-symbols-outlined text-[#bdc2ff] text-[20px]">share</span>
                  <h2 className="text-[16px] font-semibold text-white">SEO & Prévia Social</h2>
                </div>
                <span className="font-mono text-xs text-[#c0c1ff] bg-[#191f2f] border border-[#c0c1ff]/40 px-2 py-0.5 rounded">OG 2.0</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-300 font-semibold">Slug da URL</label>
                <div className="flex items-center bg-[#191f2f] border border-[#2e3545]/80 rounded-lg px-4 py-2 text-[#dce2f7] font-mono text-xs">
                  <span className="text-[#908fa0] truncate">iacomunidade.com/blog/</span>
                  <input 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-transparent text-[#c0c1ff] font-mono text-xs focus:outline-none ml-0.5" 
                    type="text" 
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-[#141b2b] border border-[#2e3545]/60 rounded-xl shadow-md p-6 flex flex-col gap-4">
              <div className="flex items-center gap-1 text-[#dce2f7]">
                <span className="material-symbols-outlined text-[#c0c1ff] text-[20px]">fact_check</span>
                <h2 className="text-[16px] font-semibold text-white">Critérios de Qualidade</h2>
              </div>
              <p className="text-[13px] text-[#94a3b8]">
                Artigos destacados no feed da comunidade precisam seguir os padrões técnicos estabelecidos:
              </p>
              <ul className="flex flex-col gap-2.5">
                <li className="flex items-center gap-2 text-[11px] font-semibold text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-[#00885d] text-[#6ffbbe] flex items-center justify-center text-[11px] font-bold">✓</span>
                  <span>Título claro e sem clickbait promocional</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] font-semibold text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-[#00885d] text-[#6ffbbe] flex items-center justify-center text-[11px] font-bold">✓</span>
                  <span>Código contextualizado com ambiente/runtime</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
