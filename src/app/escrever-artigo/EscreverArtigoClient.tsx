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

function renderMarkdownPreview(content: string) {
  if (!content) return '<p class="text-on-surface-variant italic">Nenhum conteúdo digitado ainda...</p>'

  let html = content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Blocos de código
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `<div class="my-4 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-sm">
      <div class="flex items-center justify-between px-4 py-1.5 bg-surface-container border-b border-outline-variant/20 text-on-surface-variant font-mono text-xs">
        <span>${lang || 'código'}</span>
      </div>
      <pre class="p-4 overflow-x-auto text-on-surface font-mono text-sm leading-relaxed scrollbar-none"><code>${code.trim()}</code></pre>
    </div>`
  })

  // Código inline
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-xs border border-outline-variant/20">$1</code>')

  // Imagens
  html = html.replace(/!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g, '<div class="my-4 rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm max-w-full"><img src="$2" alt="$1" class="w-full max-h-[450px] object-cover" loading="lazy" /></div>')

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="font-headline-sm text-headline-sm font-semibold text-on-surface mt-6 mb-2 tracking-tight">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="font-headline-md text-headline-md font-bold text-on-surface mt-8 mb-3 tracking-tight">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="font-headline-lg text-headline-lg font-bold text-on-surface mt-8 mb-4 tracking-tight">$1</h1>')

  // Citações
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-1.5 my-3 text-on-surface-variant italic font-body-md bg-surface-container-low/40 rounded-r-lg">$1</blockquote>')

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-on-surface">$1</strong>')
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="italic text-on-surface">$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold">$1</a>')

  // Listas
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="flex items-start gap-2 ml-2 my-1 text-on-surface"><span class="text-primary mt-1.5">•</span><span>$1</span></li>')

  // Quebras de linha
  html = html.replace(/\n/g, '<br />')

  return html
}

export default function EscreverArtigoClient({ 
  categories = [], 
  initialArticle = null 
}: { 
  categories?: any[]
  initialArticle?: any
}) {
  const router = useRouter()
  
  // State principal do artigo
  const [articleId, setArticleId] = useState<string | undefined>(initialArticle?.id || undefined)
  const [title, setTitle] = useState(initialArticle?.title || '')
  const [subtitle, setSubtitle] = useState(initialArticle?.subtitle || '')
  const [content, setContent] = useState(initialArticle?.content || '')
  const [categoryId, setCategoryId] = useState(
    initialArticle?.category_id || (categories.length > 0 ? categories[0].id : '')
  )
  const [tags, setTags] = useState<string[]>(initialArticle?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [slug, setSlug] = useState(initialArticle?.slug || '')
  const [coverImage, setCoverImage] = useState(initialArticle?.cover_image_url || '')

  // UI state
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [showCoverModal, setShowCoverModal] = useState(false)
  const [coverInput, setCoverInput] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isPublishing, startTransitionPublish] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true)

  // Recupera rascunho local de emergência caso artigo não exista
  useEffect(() => {
    if (!initialArticle && typeof window !== 'undefined') {
      try {
        const localDraft = localStorage.getItem('draft_article_backup')
        if (localDraft) {
          const parsed = JSON.parse(localDraft)
          if (parsed.title && !title) setTitle(parsed.title)
          if (parsed.subtitle && !subtitle) setSubtitle(parsed.subtitle)
          if (parsed.content && !content) setContent(parsed.content)
          if (parsed.tags?.length && !tags.length) setTags(parsed.tags)
        }
      } catch (_) {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save logic (Debounce)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Salva cópia de segurança em localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'draft_article_backup',
          JSON.stringify({ title, subtitle, content, tags, categoryId, coverImage, timestamp: Date.now() })
        )
      } catch (_) {}
    }

    const handler = setTimeout(() => {
      handleSaveDraft(true)
    }, 2500)

    return () => {
      clearTimeout(handler)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, content, categoryId, tags, slug, coverImage])

  const handleSaveDraft = async (isAutoSave = false) => {
    if (!title && !content) return
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
    if (!title.trim()) {
      setErrorMsg('Por favor, informe o título do artigo.')
      return
    }
    if (!content.trim() || content.trim().length < 30) {
      setErrorMsg('O conteúdo do artigo deve conter pelo menos 30 caracteres.')
      return
    }

    startTransitionPublish(async () => {
      const res = await publishArticle({
        id: articleId,
        title,
        subtitle,
        content,
        category_id: categoryId,
        tags,
        cover_image_url: coverImage,
        slug: slug || generateSlug(title),
      })

      if (res?.error) {
        setErrorMsg(res.error)
      } else if (res?.success && res.slug) {
        // Limpa rascunho local
        if (typeof window !== 'undefined') {
          localStorage.removeItem('draft_article_backup')
        }
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

  // Engine precisa de manipulação de seleção no cursor
  const insertMarkdown = (syntax: string, defaultText = '') => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = textarea.value.substring(start, end) || defaultText

    let replacement = ''
    let cursorOffset = 0

    if (syntax === 'h2') {
      replacement = `\n## ${selected || 'Título da Seção'}\n`
      cursorOffset = 4
    } else if (syntax === 'h3') {
      replacement = `\n### ${selected || 'Subtítulo'}\n`
      cursorOffset = 5
    } else if (syntax === 'bold') {
      replacement = `**${selected || 'texto em negrito'}**`
      cursorOffset = 2
    } else if (syntax === 'italic') {
      replacement = `*${selected || 'texto em itálico'}*`
      cursorOffset = 1
    } else if (syntax === 'code') {
      replacement = `\`${selected || 'código'}\``
      cursorOffset = 1
    } else if (syntax === 'codeblock') {
      replacement = `\n\`\`\`python\n${selected || '# seu script aqui'}\n\`\`\`\n`
      cursorOffset = 12
    } else if (syntax === 'link') {
      replacement = `[${selected || 'texto do link'}](https://)`
      cursorOffset = 1
    } else if (syntax === 'image') {
      replacement = `\n![${selected || 'legenda da imagem'}](https://images.unsplash.com/photo-...)\n`
      cursorOffset = 3
    } else if (syntax === 'quote') {
      replacement = `\n> ${selected || 'Citação ou destaque técnico'}\n`
      cursorOffset = 3
    } else if (syntax === 'list') {
      replacement = `\n- ${selected || 'Item da lista'}\n`
      cursorOffset = 3
    }

    textarea.setRangeText(replacement, start, end, 'select')
    setContent(textarea.value)
    textarea.focus()
    const newCursor = start + (selected ? replacement.length : cursorOffset)
    textarea.setSelectionRange(newCursor, newCursor)
  }

  const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length
  const estimatedTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <main className="w-full max-w-4xl mx-auto px-space-md lg:px-space-lg py-space-lg text-on-surface">
      <div className="flex flex-col w-full gap-space-lg">
        
        {/* Top Utility & Action Bar */}
        <header className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm px-space-md py-space-sm flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md min-w-0">
            <nav className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant shrink-0">
              <Link href="/meus-artigos" className="hover:text-primary transition-colors">Meus Artigos</Link>
              <span className="text-outline">/</span>
              <span className="text-on-surface font-semibold truncate max-w-[140px] sm:max-w-none">
                {articleId ? 'Editando Artigo' : 'Novo Artigo'}
              </span>
            </nav>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm">
              {saveStatus === 'saving' && <span className="material-symbols-outlined text-[14px] text-primary animate-spin">sync</span>}
              {saveStatus === 'saved' && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
              {saveStatus === 'error' && <span className="material-symbols-outlined text-[14px] text-error">error</span>}
              <span>
                {saveStatus === 'saving' ? 'Salvando no banco...' : 
                 saveStatus === 'saved' ? 'Salvo no Supabase' : 
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
          <div className="p-space-md bg-error/10 border border-error/30 text-error rounded-xl font-body-sm text-body-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} type="button">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Main Grid: Canvas de Escrita e Configurações */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <section className="lg:col-span-8 flex flex-col gap-space-md">
            {/* Slot de Capa Inteligente */}
            <div className="group relative w-full h-56 md:h-72 rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden flex flex-col items-center justify-center transition-all shadow-sm">
              {coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Capa do artigo" src={coverImage}/>
              ) : (
                <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl text-outline">add_photo_alternate</span>
                  <span className="font-label-md text-label-md">Nenhuma capa configurada</span>
                  <button
                    type="button"
                    onClick={() => { setCoverInput(coverImage); setShowCoverModal(true); }}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-label-sm text-label-sm font-semibold transition-colors"
                  >
                    Adicionar Imagem de Capa
                  </button>
                </div>
              )}

              {coverImage && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-between p-space-md">
                  <div className="flex items-center gap-1 text-white text-[12px] font-semibold bg-black/60 border border-white/20 backdrop-blur px-3 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    <span>Capa do Artigo (16:9)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="px-3 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[12px] font-semibold border border-white/20 backdrop-blur transition-all flex items-center gap-1"
                      type="button"
                      onClick={() => { setCoverInput(coverImage); setShowCoverModal(true); }}
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>Alterar</span>
                    </button>
                    <button
                      aria-label="Remover capa"
                      className="p-1 rounded-lg bg-black/60 hover:bg-red-600 text-white border border-white/20 backdrop-blur transition-all"
                      type="button"
                      onClick={() => setCoverImage('')}
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal para Inserção de Capa */}
            {showCoverModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setShowCoverModal(false)}>
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-lg w-full max-w-md shadow-xl flex flex-col gap-space-md" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
                    <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">image</span>
                      <span>Imagem de Capa</span>
                    </h3>
                    <button onClick={() => setShowCoverModal(false)} type="button">
                      <span className="material-symbols-outlined text-[20px] text-outline hover:text-on-surface">close</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">URL da Imagem (HTTPS)</label>
                    <input
                      type="url"
                      value={coverInput}
                      onChange={e => setCoverInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-space-sm pt-space-xs">
                    <button
                      type="button"
                      onClick={() => setShowCoverModal(false)}
                      className="px-space-md py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCoverImage(coverInput.trim()); setShowCoverModal(false); }}
                      className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-xs"
                    >
                      Aplicar Capa
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Container do Editor */}
            <article className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm p-space-md sm:p-space-xl flex flex-col gap-space-md">
              {/* Título & Subtítulo */}
              <div className="flex flex-col gap-space-xs">
                <input 
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full bg-transparent font-headline-lg text-headline-lg font-bold text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none tracking-tight leading-tight py-1" 
                  placeholder="Título do artigo técnico..." 
                  type="text" 
                />
                <textarea 
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-transparent resize-none font-body-md text-body-md text-on-surface-variant placeholder:text-on-surface-variant/40 focus:outline-none leading-relaxed mt-1" 
                  placeholder="Subtítulo ou resumo executivo (visível nos cards do blog)..." 
                  rows={2}
                />
              </div>

              {/* Abas Escrever vs Pré-visualização */}
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('write')}
                    className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      activeTab === 'write'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Escrever</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      activeTab === 'preview'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Pré-visualização</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                  <span>{wordCount} palavras</span>
                  <span>·</span>
                  <span>~{estimatedTime} min</span>
                </div>
              </div>
              
              {/* Toolbar Funcional de Markdown */}
              {activeTab === 'write' && (
                <div className="sticky top-20 z-20 w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-1.5 flex items-center justify-between gap-1 overflow-x-auto shadow-xs">
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => insertMarkdown('h2')} className="px-2 py-1 rounded hover:bg-surface-container text-[13px] font-bold text-on-surface transition-colors" title="Título H2" type="button">H2</button>
                    <button onClick={() => insertMarkdown('h3')} className="px-2 py-1 rounded hover:bg-surface-container text-[13px] font-bold text-on-surface-variant transition-colors" title="Título H3" type="button">H3</button>
                    <div className="w-px h-5 bg-outline-variant/40 mx-1"></div>
                    <button onClick={() => insertMarkdown('bold')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Negrito (**texto**)" type="button"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                    <button onClick={() => insertMarkdown('italic')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Itálico (*texto*)" type="button"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                    <button onClick={() => insertMarkdown('link')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Link ([texto](url))" type="button"><span className="material-symbols-outlined text-[18px]">link</span></button>
                    <button onClick={() => insertMarkdown('image')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Imagem (![alt](url))" type="button"><span className="material-symbols-outlined text-[18px]">image</span></button>
                    <button onClick={() => insertMarkdown('quote')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Citação (> quote)" type="button"><span className="material-symbols-outlined text-[18px]">format_quote</span></button>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => insertMarkdown('code')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors font-mono text-xs font-bold" title="Código inline (`code`)" type="button">&lt;/&gt;</button>
                    <button onClick={() => insertMarkdown('codeblock')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Bloco de código (```lang)" type="button"><span className="material-symbols-outlined text-[18px]">data_object</span></button>
                    <button onClick={() => insertMarkdown('list')} className="p-1.5 rounded hover:bg-surface-container text-on-surface transition-colors" title="Lista (- item)" type="button"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                  </div>
                </div>
              )}

              {/* Área de Edição ou Visualização */}
              {activeTab === 'write' ? (
                <div className="flex flex-col gap-space-md text-on-surface">
                  <textarea 
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full min-h-[420px] bg-transparent resize-none font-body-md text-body-md leading-relaxed text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none" 
                    placeholder="Escreva seu artigo técnico em Markdown com snippets de código, benchmarks e reflexões sobre IA..."
                  />
                </div>
              ) : (
                <div
                  className="min-h-[420px] text-on-surface font-body-md text-body-md leading-relaxed markdown-body py-2"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }}
                />
              )}

              {/* Stats Footer */}
              <footer className="flex items-center justify-between pt-space-sm border-t border-outline-variant/15 text-on-surface-variant font-label-sm text-label-sm px-space-xs">
                <span className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Markdown ativo com auto-save
                </span>
                <span>{content.length} caracteres</span>
              </footer>
            </article>
          </section>

          {/* Lateral de Configurações */}
          <aside className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-1.5 text-on-surface pb-2 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                <h2 className="font-label-lg text-label-lg font-semibold text-on-surface">Configurações do Artigo</h2>
              </div>
              
              {/* Categoria */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Categoria</label>
                <div className="relative w-full">
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface font-label-md text-label-md px-3 py-2.5 rounded-xl appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="" disabled className="bg-surface text-on-surface">Selecione uma categoria...</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id} className="bg-surface text-on-surface">{cat.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">expand_more</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Tags Técnicas</label>
                  <span className="font-label-sm text-label-sm text-outline">{tags.length}/5</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary font-code-md text-label-sm">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-error" aria-label="Remover tag">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">tag</span>
                  <input 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-body-sm pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-primary transition-colors" 
                    placeholder="Adicionar tag e teclar Enter..." 
                    type="text"
                  />
                </div>
              </div>

              {/* Slug da URL */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Slug da URL</label>
                <input 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 text-primary font-code-md text-label-sm px-3 py-2 rounded-xl focus:outline-none focus:border-primary" 
                  type="text" 
                />
              </div>

              {/* Dica de Boas Práticas */}
              <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col gap-1 text-on-surface-variant font-body-sm text-body-sm">
                <span className="font-semibold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
                  Dica de Redação
                </span>
                <span>Artigos técnicos com códigos funcionais e referências a modelos de IA geram 3x mais engajamento na comunidade.</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
