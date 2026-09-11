'use client'

import { useState } from 'react'
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
  error
}: {
  categories: Category[]
  error?: string
}) {
  const [titleLength, setTitleLength] = useState(0)
  const [level, setLevel] = useState('Iniciante')
  const [tags, setTags] = useState<string[]>(['Llama3', 'FineTuning'])
  const [tagInput, setTagInput] = useState('')

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleLength(e.target.value.length)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Elegant Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-outline">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Início</span>
          </Link>
          <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
          <span className="text-on-surface font-semibold">Nova Discussão</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-outline-variant/80">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-8 rounded-full bg-primary shrink-0"></span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Iniciar uma nova discussão técnica</h1>
            </div>
            <p className="text-[14px] text-outline pl-5">
              Compartilhe testes práticos, dúvidas de arquitetura, benchmarks ou pipelines de inferência.
            </p>
          </div>
          {/* Auto-save Status Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-full border border-outline-variant text-[12px] font-medium shrink-0">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            <span>Rascunho salvo</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-error-container border border-error/30 text-on-error-container text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        <form action={createTopic} className="flex flex-col gap-6" id="discussion-form">
          {/* Hidden Inputs for state that needs to be submitted */}
          <input type="hidden" name="tags" value={tags.join(', ')} />
          <input type="hidden" name="level" value={level} />

          {/* Main Card: Title & Classification */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col gap-5">
            {/* Field: Title */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-semibold text-on-surface flex items-center gap-1.5" htmlFor="topic-title">
                  <span>Título da discussão</span>
                  <span className="text-error">*</span>
                </label>
                <span className="font-code-md text-[12px] text-outline" id="title-counter">{titleLength}/150</span>
              </div>
              <div className="relative">
                <input 
                  name="title"
                  required
                  maxLength={150}
                  onChange={handleTitleChange}
                  className="w-full bg-surface-container-low hover:bg-surface-container text-on-surface placeholder:text-outline text-[15px] font-medium px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                  id="topic-title" 
                  placeholder="Ex: Qual o trade-off de latência ao usar LoRA vs Full Fine-Tuning em Llama 3?" 
                  type="text" 
                />
              </div>
              <p className="text-[12px] text-outline flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-primary">info</span>
                Títulos claros no formato de dúvida técnica ou estudo de caso atraem respostas 4x mais qualificadas.
              </p>
            </div>

            {/* Field: Category & Technical Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              {/* Category Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-on-surface flex items-center gap-1.5" htmlFor="topic-category">
                  <span>Categoria principal</span>
                  <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select 
                    name="category_id"
                    required
                    defaultValue=""
                    className="w-full appearance-none bg-surface-container-low hover:bg-surface-container text-on-surface text-[14px] font-medium px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer pr-10" 
                    id="topic-category"
                  >
                    <option value="" disabled>Selecione uma categoria...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Technical Level Selector (Segmented Control) */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-on-surface flex items-center gap-1.5">
                  <span>Nível técnico esperado</span>
                </label>
                <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-xl border border-outline-variant text-center h-[42px] items-center">
                  <button 
                    onClick={() => setLevel('Iniciante')}
                    className={`level-btn py-1.5 px-2 rounded-lg text-[12.5px] transition-all ${level === 'Iniciante' ? 'font-semibold bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/80' : 'font-medium text-on-surface-variant hover:text-on-surface'}`} 
                    type="button"
                  >
                    Iniciante
                  </button>
                  <button 
                    onClick={() => setLevel('Prático')}
                    className={`level-btn py-1.5 px-2 rounded-lg text-[12.5px] transition-all ${level === 'Prático' ? 'font-semibold bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/80' : 'font-medium text-on-surface-variant hover:text-on-surface'}`} 
                    type="button"
                  >
                    Prático
                  </button>
                  <button 
                    onClick={() => setLevel('Deep Dive')}
                    className={`level-btn py-1.5 px-2 rounded-lg text-[12.5px] transition-all ${level === 'Deep Dive' ? 'font-semibold bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/80' : 'font-medium text-on-surface-variant hover:text-on-surface'}`} 
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
                <label className="text-[14px] font-semibold text-on-surface flex items-center gap-1.5">
                  <span>Tags técnicas</span>
                  <span className="text-outline font-normal text-[12px]">(palavras-chave indexáveis)</span>
                </label>
              </div>
              <div className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 flex flex-wrap items-center gap-2 focus-within:bg-surface-container-lowest focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all min-h-[48px]">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 bg-primary-container border border-primary/20 text-on-primary-container text-[12.5px] font-medium px-2.5 py-1 rounded-lg group shadow-sm">
                    <span>#{tag}</span>
                    <button onClick={() => removeTag(tag)} aria-label={`Remover tag ${tag}`} className="hover:bg-primary/10 text-primary hover:text-primary-hover rounded-md p-0.5 transition-colors" type="button">
                      <span className="material-symbols-outlined text-[13px] block">close</span>
                    </button>
                  </span>
                ))}
                
                {/* Add Tag Input */}
                <input 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="bg-transparent text-on-surface placeholder:text-outline text-[13px] px-2 py-1 focus:outline-none flex-1 min-w-[120px]" 
                  placeholder="+ Adicionar outra tag..." 
                  type="text"
                />
              </div>
              
              {/* Suggested Tags Quick Add */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1 text-[12px] text-outline">
                <span className="font-medium shrink-0">Sugeridas:</span>
                {['LangGraph', 'PyTorch', 'CUDA', 'RAG', 'Claude 3.5'].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => addSuggestedTag(tag)}
                    className="px-2 py-0.5 rounded-md bg-surface-container hover:bg-primary-container hover:text-primary text-on-surface-variant border border-outline-variant transition-colors font-code-md text-[11px] shrink-0" 
                    type="button"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Content Editor Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
            {/* Editor Top Navigation / Tabs */}
            <div className="flex items-center justify-between px-5 pt-3 border-b border-outline-variant bg-surface-container-low/70">
              <div className="flex items-center gap-1 -mb-px">
                <button className="px-4 py-2.5 text-[13.5px] font-semibold text-primary border-b-2 border-primary bg-surface-container-lowest rounded-t-lg flex items-center gap-2" type="button">
                  <span className="material-symbols-outlined text-[17px]">edit_note</span>
                  <span>Escrever</span>
                </button>
                <button className="px-4 py-2.5 text-[13.5px] font-medium text-outline hover:text-on-surface hover:bg-surface-container/80 rounded-t-lg transition-colors flex items-center gap-2" type="button">
                  <span className="material-symbols-outlined text-[17px]">preview</span>
                  <span>Pré-visualização</span>
                </button>
              </div>
              <div className="flex items-center gap-2 pb-2">
                <span className="text-[12px] text-outline hidden sm:flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[15px]">markdown</span> Markdown habilitado
                </span>
              </div>
            </div>
            
            {/* WYSIWYG / Formatting Toolbar */}
            <div className="flex items-center flex-wrap gap-1 px-4 py-2 bg-surface-container-low/40 border-b border-outline-variant text-on-surface-variant">
              <button className="p-1.5 rounded-lg hover:bg-surface-container/80 hover:text-on-surface transition-colors" title="Negrito (Ctrl+B)" type="button">
                <span className="material-symbols-outlined text-[18px]">format_bold</span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-surface-container/80 hover:text-on-surface transition-colors" title="Itálico (Ctrl+I)" type="button">
                <span className="material-symbols-outlined text-[18px]">format_italic</span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-surface-container/80 hover:text-on-surface transition-colors font-bold text-[14px]" title="Título H2" type="button">
                H2
              </button>
              <button className="p-1.5 rounded-lg hover:bg-surface-container/80 hover:text-on-surface transition-colors font-bold text-[13px]" title="Subtítulo H3" type="button">
                H3
              </button>
              <span className="w-px h-5 bg-outline-variant mx-1.5"></span>
              <button className="p-1.5 rounded-lg hover:bg-surface-container/80 hover:text-on-surface transition-colors" title="Lista com marcadores" type="button">
                <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-surface-container/80 hover:text-on-surface transition-colors" title="Lista numerada" type="button">
                <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-surface-container/80 hover:text-on-surface transition-colors" title="Citação / Quote" type="button">
                <span className="material-symbols-outlined text-[18px]">format_quote</span>
              </button>
              <span className="w-px h-5 bg-outline-variant mx-1.5"></span>
              <button className="p-1.5 rounded-lg hover:bg-surface-container/80 hover:text-on-surface transition-colors" title="Inserir Link" type="button">
                <span className="material-symbols-outlined text-[18px]">link</span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-surface-container/80 hover:text-on-surface transition-colors" title="Código inline" type="button">
                <span className="material-symbols-outlined text-[18px]">code</span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-surface-container/80 hover:text-on-surface transition-colors ml-auto sm:ml-0" title="Inserir Imagem / Diagrama de Arquitetura" type="button">
                <span className="material-symbols-outlined text-[18px]">image</span>
              </button>
            </div>
            
            {/* Textarea Workspace Area */}
            <div className="relative p-4 sm:p-5 flex-1 bg-surface-container-lowest">
              <textarea 
                name="content"
                required
                minLength={20}
                className="w-full bg-transparent text-on-surface placeholder:text-outline font-body-md text-[14.5px] leading-relaxed resize-y min-h-[320px] focus:outline-none" 
                id="topic-body" 
                placeholder="Descreva detalhadamente sua dúvida técnica, hipóteses testadas, snippets de código e métricas observadas..." 
                rows={14}
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link href="/" className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-semibold text-[14px] transition-colors">
              Cancelar
            </Link>
            <SubmitButton />
          </div>
        </form>
      </div>
    </main>
  )
}
