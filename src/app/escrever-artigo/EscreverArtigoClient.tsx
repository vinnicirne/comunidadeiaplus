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
  const [coverImage, setCoverImage] = useState('')

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
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full">
        {/* Top Editor Utility & Action Bar */}
        <header className="w-full bg-surface-container-lowest rounded-xl shadow-sm px-space-md lg:px-space-lg py-space-sm mb-space-lg flex flex-wrap items-center justify-between gap-space-md">
          {/* Left: Breadcrumb & Autosave Status */}
          <div className="flex items-center gap-space-md min-w-0">
            <nav className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant shrink-0">
              <Link href="/meus-artigos" className="hover:text-primary transition-colors">Meus Artigos</Link>
              <span className="text-outline">/</span>
              <span className="text-on-surface font-semibold truncate max-w-[140px] sm:max-w-none">
                {articleId ? 'Editando Rascunho' : 'Novo Artigo'}
              </span>
            </nav>
            <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm transition-colors ${
              saveStatus === 'error' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-low text-on-surface-variant'
            }`}>
              {saveStatus === 'saving' && <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>}
              {saveStatus === 'saved' && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
              {saveStatus === 'error' && <span className="material-symbols-outlined text-[14px]">error</span>}
              <span className="text-outline">
                {saveStatus === 'saving' ? 'Salvando...' : 
                 saveStatus === 'saved' ? 'Salvo automaticamente' : 
                 saveStatus === 'error' ? 'Erro ao salvar' : 'Edição ativa'}
              </span>
            </div>
          </div>
          
          {/* Right: Publishing Actions */}
          <div className="flex items-center gap-space-xs sm:gap-space-sm">
            <button 
              onClick={() => handleSaveDraft(false)}
              className="inline-flex items-center gap-1.5 px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span className="hidden md:inline">Salvar Rascunho</span>
            </button>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 px-space-lg py-space-sm rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm font-label-md text-label-md font-semibold disabled:opacity-60" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              <span>{isPublishing ? 'Publicando...' : 'Publicar'}</span>
            </button>
          </div>
        </header>

        {errorMsg && (
          <div className="mb-space-md p-space-md bg-error-container text-on-error-container rounded-lg font-body-sm text-body-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)}><span className="material-symbols-outlined text-[18px]">close</span></button>
          </div>
        )}

        {/* Main Grid: Writing Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT: Rich Document Body (Col 1-8) */}
          <section className="lg:col-span-8 flex flex-col gap-space-md">
            {/* Cover Image Slot */}
            <div className="group relative w-full h-56 md:h-72 rounded-xl bg-surface-container overflow-hidden flex flex-col items-center justify-center transition-all shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Cover Image" src={coverImage}/>
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/30 to-transparent flex items-end justify-between p-space-md md:p-space-lg">
                <div className="flex items-center gap-space-xs text-on-primary font-label-sm text-label-sm bg-inverse-surface/60 backdrop-blur px-space-md py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  <span>Imagem de capa (16:9)</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button className="px-space-md py-1.5 rounded-lg bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm backdrop-blur transition-all flex items-center gap-1" type="button" onClick={() => { const url = prompt('Digite a URL da imagem:'); if (url) setCoverImage(url); }}>
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Alterar URL</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editor Content Container */}
            <article className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md sm:p-space-xl flex flex-col gap-space-lg">
              {/* Document Title Input */}
              <div className="flex flex-col gap-space-xs">
                <input 
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full bg-transparent font-headline-xl text-headline-xl text-on-surface placeholder:text-outline/40 focus:outline-none tracking-tight leading-tight py-1" 
                  placeholder="Digite o título do seu artigo técnico..." 
                  type="text" 
                />
                <textarea 
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-transparent resize-none font-body-lg text-body-lg text-on-surface-variant placeholder:text-outline/50 focus:outline-none leading-relaxed mt-1" 
                  placeholder="Adicione um subtítulo ou resumo executivo..." 
                  rows={2}
                />
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
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[300px] bg-transparent resize-none font-body-md text-body-md text-on-surface-variant placeholder:text-outline/50 focus:outline-none leading-relaxed" 
                  placeholder="Comece a escrever o conteúdo técnico aqui (Markdown suportado futuramente)..."
                />
              </div>

              {/* Document Word Counter & Reading Time Stats */}
              <footer className="flex items-center justify-between pt-space-md border-t border-transparent bg-surface-container-low/50 px-space-md py-space-sm rounded-lg mt-space-sm">
                <div className="flex items-center gap-space-md text-outline font-label-sm text-label-sm">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">format_shapes</span>
                    <strong>{content.split(/\s+/).filter(w => w.length > 0).length}</strong> palavras
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    ~<strong>{Math.max(1, Math.ceil(content.split(/\s+/).filter(w => w.length > 0).length / 200))} min</strong> de leitura
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
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface font-label-md text-label-md px-space-md py-2 rounded-lg appearance-none focus:outline-none focus:bg-surface-container transition-colors cursor-pointer"
                  >
                    <option value="" disabled>Selecione uma categoria...</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Tags Técnicas</label>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-medium">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-error ml-0.5"><span className="material-symbols-outlined text-[14px]">close</span></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">tag</span>
                  <input 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-label-sm text-label-sm pl-9 pr-space-md py-2 rounded-lg focus:outline-none focus:bg-surface-container transition-colors" 
                    placeholder="Adicionar tag e teclar Enter..." 
                    type="text"
                  />
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
                  <span className="text-outline truncate">/artigo/</span>
                  <input 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-transparent text-primary font-code-md text-code-md focus:outline-none ml-0.5" 
                    type="text" 
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
