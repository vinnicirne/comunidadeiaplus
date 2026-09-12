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
    if (!articleId) {
      setSlug(generateSlug(newTitle))
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = tagInput.trim().replace(/^#/, '')
      if (val && !tags.includes(val) && tags.length < 5) {
        setTags([...tags, val])
        setTagInput('')
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    setContent(prev => `${prev}\n${prefix}texto${suffix}\n`)
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-space-md lg:px-space-lg py-space-lg text-on-surface">
      <div className="flex flex-col w-full">
        
        {/* Top Utility & Action Bar */}
        <header className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm px-space-md py-space-sm mb-space-lg flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md min-w-0">
            <nav className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant shrink-0">
              <Link href="/meus-artigos" className="hover:text-primary transition-colors">Meus Artigos</Link>
              <span className="text-outline">/</span>
              <span className="text-on-surface font-semibold truncate max-w-[140px] sm:max-w-none">
                {articleId ? 'Editando Rascunho' : 'Novo Artigo'}
              </span>
            </nav>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm">
              {saveStatus === 'saving' && <span className="material-symbols-outlined text-[14px] text-primary animate-spin">sync</span>}
              {saveStatus === 'saved' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
              {saveStatus === 'error' && <span className="material-symbols-outlined text-[14px] text-error">error</span>}
              <span>
                {saveStatus === 'saving' ? 'Salvando...' : 
                 saveStatus === 'saved' ? 'Salvo automaticamente' : 
                 saveStatus === 'error' ? 'Erro ao salvar' : 'Edição ativa'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-space-xs">
            <button 
              onClick={() => handleSaveDraft(false)}
              className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface hover:bg-surface-container transition-colors font-label-sm text-label-sm font-medium" 
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span className="hidden md:inline">Salvar Rascunho</span>
            </button>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 px-space-lg py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-bold transition-all shadow-sm disabled:opacity-60" 
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">{isPublishing ? 'sync' : 'rocket_launch'}</span>
              <span>{isPublishing ? 'Publicando...' : 'Publicar Artigo'}</span>
            </button>
          </div>
        </header>

        {errorMsg && (
          <div className="mb-space-md p-space-md bg-error/10 border border-error/30 text-error rounded-xl font-body-sm text-body-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)}><span className="material-symbols-outlined text-[18px]">close</span></button>
          </div>
        )}

        {/* Main Grid: Writing Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <section className="lg:col-span-8 flex flex-col gap-space-md">
            {/* Cover Image Slot */}
            <div className="group relative w-full h-56 md:h-72 rounded-xl bg-surface-container-low border border-outline-variant/30 overflow-hidden flex flex-col items-center justify-center transition-all shadow-sm">
              {coverImage && (
                <img className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Cover" src={coverImage}/>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-between p-space-md">
                <div className="flex items-center gap-1 text-white text-[12px] font-semibold bg-black/60 border border-white/20 backdrop-blur px-3 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  <span>Imagem de capa (16:9)</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[12px] font-semibold border border-white/20 backdrop-blur transition-all flex items-center gap-1" type="button" onClick={() => { const url = prompt('Digite a URL da imagem:'); if (url) setCoverImage(url); }}>
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Alterar</span>
                  </button>
                  <button aria-label="Remover capa" className="p-1 rounded-lg bg-black/60 hover:bg-red-600 text-white border border-white/20 backdrop-blur transition-all" type="button" onClick={() => setCoverImage('')}>
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editor Content Container */}
            <article className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-space-md sm:p-space-xl flex flex-col gap-space-md">
              {/* Document Title Input */}
              <div className="flex flex-col gap-space-xs">
                <input 
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full bg-transparent font-headline-lg text-headline-lg font-bold text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none tracking-tight leading-tight py-1" 
                  placeholder="Digite o título do seu artigo técnico..." 
                  type="text" 
                />
                <textarea 
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-transparent resize-none font-body-md text-body-md text-on-surface-variant placeholder:text-on-surface-variant/40 focus:outline-none leading-relaxed mt-1" 
                  placeholder="Adicione um subtítulo ou resumo executivo do artigo para prévia nos cards..." 
                  rows={2}
                />
              </div>
              
              {/* Sticky Formatting Toolbar */}
              <div className="sticky top-20 z-20 w-full bg-surface-container-low border border-outline-variant/40 rounded-lg p-1.5 flex items-center justify-between gap-1 overflow-x-auto shadow-sm">
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => insertMarkdown('## ')} className="px-2 py-1 rounded hover:bg-surface-container text-[14px] font-semibold text-on-surface transition-colors" title="Título H2" type="button">H2</button>
                  <button onClick={() => insertMarkdown('### ')} className="px-2 py-1 rounded hover:bg-surface-container text-[14px] font-semibold text-on-surface-variant transition-colors" title="Título H3" type="button">H3</button>
                  <div className="w-px h-5 bg-outline-variant/40 mx-1"></div>
                  <button onClick={() => insertMarkdown('**', '**')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Negrito" type="button"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                  <button onClick={() => insertMarkdown('*', '*')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Itálico" type="button"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                  <button onClick={() => insertMarkdown('[Título](', ')')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Link" type="button"><span className="material-symbols-outlined text-[18px]">link</span></button>
                  <button onClick={() => insertMarkdown('> ')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Citação" type="button"><span className="material-symbols-outlined text-[18px]">format_quote</span></button>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => insertMarkdown('```\n', '\n```')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Bloco de código" type="button"><span className="material-symbols-outlined text-[18px]">code</span></button>
                  <button onClick={() => insertMarkdown('\n- ')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Lista com marcadores" type="button"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                </div>
              </div>

              {/* Document Content Editor Canvas */}
              <div className="flex flex-col gap-space-md text-on-surface">
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[350px] bg-transparent resize-none font-body-md text-body-md leading-relaxed text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none" 
                  placeholder="Comece a escrever o conteúdo técnico aqui (Markdown suportado)..."
                />
              </div>

              {/* Stats Footer */}
              <footer className="flex items-center justify-between pt-space-sm border-t border-surface-container text-on-surface-variant font-label-sm text-label-sm px-space-xs">
                <div className="flex items-center gap-space-md">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">format_shapes</span>
                    <strong className="text-on-surface font-semibold">{content.split(/\s+/).filter(w => w.length > 0).length}</strong> palavras
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    ~<strong className="text-on-surface font-semibold">{Math.max(1, Math.ceil(content.split(/\s+/).filter(w => w.length > 0).length / 200))} min</strong>
                  </span>
                </div>
                <span className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Markdown ativo
                </span>
              </footer>
            </article>
          </section>

          {/* RIGHT: Settings */}
          <aside className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-1.5 text-on-surface pb-1 border-b border-surface-container">
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                <h2 className="font-label-lg text-label-lg font-semibold text-on-surface">Configurações</h2>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Categoria</label>
                <div className="relative w-full">
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 text-on-surface font-label-md text-label-md px-3 py-2 rounded-lg appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="" disabled className="bg-surface text-on-surface">Selecione uma categoria...</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id} className="bg-surface text-on-surface">{cat.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">expand_more</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Tags Técnicas</label>
                  <span className="font-label-sm text-label-sm text-outline">{tags.length}/5</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-low border border-outline-variant/30 text-primary font-code-md text-label-sm">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-error" aria-label="Remover tag"><span className="material-symbols-outlined text-[14px]">close</span></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">tag</span>
                  <input 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-body-sm pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-primary transition-colors" 
                    placeholder="Adicionar tag e teclar Enter..." 
                    type="text"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Slug da URL</label>
                <input 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 text-primary font-code-md text-label-sm px-3 py-2 rounded-lg focus:outline-none focus:border-primary" 
                  type="text" 
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
