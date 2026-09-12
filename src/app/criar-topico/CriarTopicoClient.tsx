'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createTopic } from '@/lib/actions/auth'
import { SubmitButton } from '@/components/ui/SubmitButton'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
}

export default function CriarTopicoClient({
  categories,
  error,
  userRole = 'user',
  initialCategoryId = '',
}: {
  categories: Category[]
  error?: string
  userRole?: string
  initialCategoryId?: string
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState(initialCategoryId || (categories[0]?.id || ''))
  const [level, setLevel] = useState('Iniciante')
  const [tags, setTags] = useState<string[]>(['Llama3', 'FineTuning'])
  const [tagInput, setTagInput] = useState('')
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write')
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('Rascunho salvo')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Restore draft from localStorage on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('draft_topic')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.title) setTitle(parsed.title)
        if (parsed.content) setContent(parsed.content)
        if (parsed.level) setLevel(parsed.level)
        if (parsed.tags && Array.isArray(parsed.tags)) setTags(parsed.tags)
        if (parsed.categoryId && !initialCategoryId) setCategoryId(parsed.categoryId)
      }
    } catch (e) {
      console.warn('Falha ao restaurar rascunho do localStorage', e)
    }
  }, [initialCategoryId])

  // Debounced auto-save to localStorage
  useEffect(() => {
    setAutoSaveStatus('Salvando rascunho...')
    const timer = setTimeout(() => {
      try {
        if (title || content) {
          localStorage.setItem('draft_topic', JSON.stringify({
            title,
            content,
            level,
            tags,
            categoryId,
          }))
          setAutoSaveStatus('Rascunho salvo')
        }
      } catch (e) {
        console.warn('Erro no autosave local', e)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [title, content, level, tags, categoryId])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
    }
  }

  // Functional Markdown Insertion
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const replacement = `${prefix}${selectedText || 'texto'}${suffix}`

    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 5)
      )
    }, 10)
  }

  const isEmoji = (str?: string) => Boolean(str && !/^[a-zA-Z0-9_ -]+$/.test(str))

  return (
    <main className="w-full max-w-4xl mx-auto px-space-md lg:px-space-lg py-space-lg text-on-surface">
      <div className="flex flex-col w-full gap-space-lg">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-on-surface-variant font-mono text-xs tracking-wider uppercase font-semibold">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Início</span>
          </Link>
          <span className="text-outline">/</span>
          <Link href="/explorar" className="hover:text-primary transition-colors">
            Discussões
          </Link>
          <span className="text-outline">/</span>
          <span className="text-primary font-bold">Nova Discussão</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-sm border-b border-surface-container">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-7 rounded-full bg-primary shrink-0"></span>
              <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
                Iniciar uma nova discussão técnica
              </h1>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant pl-5">
              Compartilhe testes práticos, dúvidas de arquitetura, benchmarks ou pipelines de inferência.
            </p>
          </div>

          {/* Auto-save Status Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-surface-container-low text-on-surface-variant px-3 py-1.5 rounded-full border border-outline-variant/30 font-label-sm text-label-sm font-medium shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>{autoSaveStatus}</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-error-container border border-error/30 text-on-error-container font-body-sm text-body-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        <form 
          action={async (formData) => {
            try {
              localStorage.removeItem('draft_topic')
            } catch (_) {}
            await createTopic(formData)
          }} 
          className="flex flex-col gap-6" 
          id="discussion-form"
        >
          {/* Hidden Inputs for state that needs to be submitted */}
          <input type="hidden" name="tags" value={tags.join(', ')} />
          <input type="hidden" name="level" value={level} />

          {/* Main Card: Title & Classification */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-5">
            {/* Field: Title */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5" htmlFor="topic-title">
                  <span>Título da discussão</span>
                  <span className="text-error">*</span>
                </label>
                <span className="font-mono text-xs text-on-surface-variant" id="title-counter">
                  {title.length}/150
                </span>
              </div>
              <div className="relative">
                <input 
                  name="title"
                  required
                  value={title}
                  maxLength={150}
                  onChange={handleTitleChange}
                  className="w-full bg-surface-container-low hover:bg-surface-container text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md px-4 py-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all" 
                  id="topic-title" 
                  placeholder="Ex: Qual o trade-off de latência ao usar LoRA vs Full Fine-Tuning em Llama 3?" 
                  type="text" 
                />
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-primary">info</span>
                Títulos no formato de dúvida técnica ou estudo de caso atraem respostas 4x mais qualificadas.
              </p>
            </div>

            {/* Field: Category & Technical Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              {/* Category Selector */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5" htmlFor="topic-category">
                  <span>Categoria principal</span>
                  <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select 
                    name="category_id"
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full appearance-none bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all cursor-pointer pr-10" 
                    id="topic-category"
                  >
                    <option value="" disabled>Selecione uma categoria...</option>
                    {categories.filter(cat => {
                      if (cat.slug === 'blog' || cat.slug === 'artigos') {
                        return userRole === 'admin' || userRole === 'moderator'
                      }
                      return true
                    }).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {isEmoji(cat.icon) ? `${cat.icon} ` : ''}{cat.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Technical Level Selector */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
                  <span>Nível técnico esperado</span>
                </label>
                <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 text-center h-[42px] items-center">
                  <button 
                    onClick={() => setLevel('Iniciante')}
                    className={`level-btn py-1.5 px-2 rounded-lg font-label-sm text-label-sm transition-all ${
                      level === 'Iniciante' 
                        ? 'font-semibold bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30' 
                        : 'font-medium text-on-surface-variant hover:text-on-surface'
                    }`} 
                    type="button"
                  >
                    Iniciante
                  </button>
                  <button 
                    onClick={() => setLevel('Prático')}
                    className={`level-btn py-1.5 px-2 rounded-lg font-label-sm text-label-sm transition-all ${
                      level === 'Prático' 
                        ? 'font-semibold bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30' 
                        : 'font-medium text-on-surface-variant hover:text-on-surface'
                    }`} 
                    type="button"
                  >
                    Prático
                  </button>
                  <button 
                    onClick={() => setLevel('Deep Dive')}
                    className={`level-btn py-1.5 px-2 rounded-lg font-label-sm text-label-sm transition-all ${
                      level === 'Deep Dive' 
                        ? 'font-semibold bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30' 
                        : 'font-medium text-on-surface-variant hover:text-on-surface'
                    }`} 
                    type="button"
                  >
                    Deep Dive
                  </button>
                </div>
              </div>
            </div>

            {/* Field: Tags with Pills & Suggestions */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
                  <span>Tags técnicas</span>
                  <span className="text-on-surface-variant font-normal text-xs">(até 5 palavras-chave)</span>
                </label>
              </div>
              <div className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-2.5 flex flex-wrap items-center gap-2 focus-within:bg-surface-container-lowest focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all min-h-[48px]">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary font-label-sm text-label-sm font-semibold px-2.5 py-1 rounded-lg group shadow-xs">
                    <span>#{tag}</span>
                    <button 
                      onClick={() => removeTag(tag)} 
                      aria-label={`Remover tag ${tag}`} 
                      className="hover:bg-primary/20 text-primary rounded-md p-0.5 transition-colors" 
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[13px] block">close</span>
                    </button>
                  </span>
                ))}
                
                {/* Add Tag Input */}
                {tags.length < 5 && (
                  <input 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="bg-transparent text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm px-2 py-1 focus:outline-none flex-1 min-w-[120px]" 
                    placeholder="+ Digite e tecle Enter..." 
                    type="text" 
                  />
                )}
              </div>
              
              {/* Suggested Tags Quick Add */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs text-on-surface-variant">
                <span className="font-medium shrink-0">Sugeridas:</span>
                {['LangGraph', 'PyTorch', 'CUDA', 'RAG', 'Claude 3.5', 'LoRA', 'Diffusers'].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => addSuggestedTag(tag)}
                    className="px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-primary/10 hover:text-primary text-on-surface-variant border border-outline-variant/30 transition-colors font-mono text-[11px] shrink-0" 
                    type="button"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Content Editor Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
            {/* Editor Top Navigation / Tabs */}
            <div className="flex items-center justify-between px-5 pt-3 border-b border-surface-container bg-surface-container-low">
              <div className="flex items-center gap-1 -mb-px">
                <button 
                  onClick={() => setEditorMode('write')}
                  className={`px-4 py-2.5 font-label-md text-label-md font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                    editorMode === 'write'
                      ? 'text-primary border-primary bg-surface-container-lowest rounded-t-lg'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface'
                  }`} 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[17px]">edit_note</span>
                  <span>Escrever</span>
                </button>
                <button 
                  onClick={() => setEditorMode('preview')}
                  className={`px-4 py-2.5 font-label-md text-label-md font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                    editorMode === 'preview'
                      ? 'text-primary border-primary bg-surface-container-lowest rounded-t-lg'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface'
                  }`} 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[17px]">preview</span>
                  <span>Pré-visualização</span>
                </button>
              </div>
              <div className="flex items-center gap-2 pb-2">
                <span className="font-mono text-xs text-on-surface-variant hidden sm:flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-primary">markdown</span> 
                  Markdown ativo
                </span>
              </div>
            </div>
            
            {/* WYSIWYG / Formatting Toolbar */}
            {editorMode === 'write' && (
              <div className="flex items-center flex-wrap gap-1 px-4 py-2 bg-surface-container-low border-b border-surface-container text-on-surface-variant">
                <button 
                  onClick={() => insertMarkdown('**', '**')} 
                  className="p-1.5 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors" 
                  title="Negrito" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">format_bold</span>
                </button>
                <button 
                  onClick={() => insertMarkdown('*', '*')} 
                  className="p-1.5 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors" 
                  title="Itálico" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">format_italic</span>
                </button>
                <button 
                  onClick={() => insertMarkdown('\n## ')} 
                  className="px-2 py-1 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors font-bold text-xs" 
                  title="Título H2" 
                  type="button"
                >
                  H2
                </button>
                <button 
                  onClick={() => insertMarkdown('\n### ')} 
                  className="px-2 py-1 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors font-bold text-xs" 
                  title="Subtítulo H3" 
                  type="button"
                >
                  H3
                </button>
                <span className="w-px h-5 bg-outline-variant/30 mx-1.5"></span>
                <button 
                  onClick={() => insertMarkdown('\n- ')} 
                  className="p-1.5 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors" 
                  title="Lista com marcadores" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                </button>
                <button 
                  onClick={() => insertMarkdown('\n1. ')} 
                  className="p-1.5 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors" 
                  title="Lista numerada" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                </button>
                <button 
                  onClick={() => insertMarkdown('\n> ')} 
                  className="p-1.5 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors" 
                  title="Citação" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">format_quote</span>
                </button>
                <span className="w-px h-5 bg-outline-variant/30 mx-1.5"></span>
                <button 
                  onClick={() => insertMarkdown('[', '](https://...)')} 
                  className="p-1.5 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors" 
                  title="Inserir Link" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">link</span>
                </button>
                <button 
                  onClick={() => insertMarkdown('`', '`')} 
                  className="p-1.5 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors" 
                  title="Código inline" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">code</span>
                </button>
                <button 
                  onClick={() => insertMarkdown('\n```python\n', '\n```\n')} 
                  className="px-2 py-1 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors font-mono text-xs" 
                  title="Bloco de Código" 
                  type="button"
                >
                  &lt;code&gt;
                </button>
                <button 
                  onClick={() => insertMarkdown('![descrição](', ')')} 
                  className="p-1.5 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors ml-auto sm:ml-0" 
                  title="Inserir Imagem / Diagrama" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">image</span>
                </button>
              </div>
            )}
            
            {/* Textarea Workspace Area */}
            <div className="relative p-4 sm:p-5 flex-1 bg-surface-container-lowest">
              {editorMode === 'write' ? (
                <textarea 
                  ref={textareaRef}
                  name="content"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  minLength={20}
                  className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md leading-relaxed resize-y min-h-[320px] focus:outline-none" 
                  id="topic-body" 
                  placeholder="Descreva detalhadamente sua dúvida técnica, hipóteses testadas, snippets de código e métricas observadas..." 
                  rows={14}
                />
              ) : (
                <div className="min-h-[320px] prose prose-invert max-w-none text-on-surface font-body-md text-body-md leading-relaxed whitespace-pre-wrap">
                  {content.trim() ? (
                    content
                  ) : (
                    <span className="text-on-surface-variant italic">
                      Nada para pré-visualizar ainda. Escreva algo no editor!
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link 
              href="/" 
              className="px-5 py-2.5 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-semibold font-label-md text-label-md transition-colors border border-outline-variant/30"
            >
              Cancelar
            </Link>
            <SubmitButton />
          </div>
        </form>
      </div>
    </main>
  )
}
