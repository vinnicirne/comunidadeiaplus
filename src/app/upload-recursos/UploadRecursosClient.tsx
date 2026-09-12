'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { saveResourceMetadata } from '@/lib/actions/resource'

const MAX_SIZE_MB = 50
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const ALLOWED_TYPES = ['.zip', '.rar']

interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  status: 'ready' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
  storagePath?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileExt(name: string): string {
  return name.substring(name.lastIndexOf('.')).toLowerCase()
}

export default function UploadRecursosClient({
  categories = [],
  envSupabaseUrl,
  envSupabaseAnonKey
}: {
  categories?: any[]
  envSupabaseUrl: string
  envSupabaseAnonKey: string
}) {
  const router = useRouter()
  
  const supabase = createBrowserClient(envSupabaseUrl, envSupabaseAnonKey)

  const activeCategories = categories.filter((c) => c.is_active)
  const defaultCategoryId = activeCategories[0]?.id || ''
  const defaultCategoryName = activeCategories[0]?.name || 'Geral'

  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [title, setTitle] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultCategoryId)
  const [license, setLicense] = useState('Apache 2.0 (Uso Comercial e Livre com Atribuição)')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>(['Llama3', 'LoRA', 'FineTuning'])
  const [tagInput, setTagInput] = useState('')

  const validateAndAdd = useCallback((incoming: File[]) => {
    setErrorMsg(null)
    const next: UploadedFile[] = []
    const errors: string[] = []

    for (const f of incoming) {
      const ext = getFileExt(f.name)
      if (!ALLOWED_TYPES.includes(ext)) {
        errors.push(`"${f.name}" não é permitido. Somente .zip e .rar são aceitos.`)
        continue
      }
      if (f.size > MAX_SIZE_BYTES) {
        errors.push(`"${f.name}" excede o limite de ${MAX_SIZE_MB}MB (${formatBytes(f.size)}).`)
        continue
      }
      next.push({
        id: crypto.randomUUID(),
        file: f,
        name: f.name,
        size: f.size,
        status: 'ready',
        progress: 0,
      })
    }

    if (errors.length > 0) setErrorMsg(errors.join(' '))
    if (next.length > 0) setFiles(prev => [...prev, ...next])
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) validateAndAdd(Array.from(e.target.files))
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) validateAndAdd(Array.from(e.dataTransfer.files))
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  
  const removeFile = (id: string) => {
    if (isPublishing) return
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = tagInput.trim()
      if (val && !tags.includes(val)) { setTags([...tags, val]); setTagInput('') }
    }
  }

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = description.substring(start, end)
    const textToInsert = selected ? `${prefix}${selected}${suffix}` : `${prefix}texto${suffix}`

    const newDescription = description.substring(0, start) + textToInsert + description.substring(end)
    setDescription(newDescription)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 5))
    }, 10)
  }

  const handleSubmit = async () => {
    if (files.length === 0) {
      setErrorMsg('Adicione pelo menos um arquivo compactado (.zip ou .rar).')
      return
    }
    if (!title.trim()) {
      setErrorMsg('O título do recurso é obrigatório.')
      return
    }

    setIsPublishing(true)
    setErrorMsg(null)
    const uploadedPaths: string[] = []
    
    setFiles(prev => prev.map(f => f.status === 'ready' ? { ...f, status: 'uploading', progress: 15 } : f))

    let hasUploadError = false

    for (const fileObj of files) {
      if (fileObj.status !== 'ready' && fileObj.status !== 'uploading') continue

      const safeName = fileObj.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${Date.now()}_${safeName}`

      const { data, error } = await supabase.storage
        .from('recursos')
        .upload(filePath, fileObj.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erro de upload:', error)
        hasUploadError = true
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', error: error.message } : f))
      } else if (data) {
        uploadedPaths.push(data.path)
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'done', progress: 100, storagePath: data.path } : f))
      }
    }

    if (hasUploadError || uploadedPaths.length === 0) {
      setErrorMsg('Falha ao enviar alguns arquivos para o armazenamento. Tente novamente.')
      setIsPublishing(false)
      return
    }

    const selectedCategoryObj = activeCategories.find(c => c.id === selectedCategoryId)
    const categoryName = selectedCategoryObj?.name || defaultCategoryName

    const res = await saveResourceMetadata({
      title,
      category: categoryName,
      category_id: selectedCategoryId || undefined,
      license,
      description,
      tags,
      file_paths: uploadedPaths
    })

    if (res.error) {
      setErrorMsg(res.error)
      setIsPublishing(false)
    } else {
      if (res.topicSlug) {
        router.push(`/topico/${res.topicSlug}`)
      } else {
        router.push('/')
      }
    }
  }

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-xl">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
          <Link href="/" className="hover:text-primary transition-colors cursor-pointer">Início</Link>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Recursos</span>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-on-surface font-semibold">Novo Pacote</span>
        </nav>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low border border-outline-variant/30 rounded-full text-on-surface-variant font-label-sm text-label-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span>Limite: <strong className="text-on-surface font-semibold">{MAX_SIZE_MB} MB</strong> por arquivo</span>
          <span className="text-outline">·</span>
          <span className="material-symbols-outlined text-[15px] text-primary">verified_user</span>
          <span className="font-medium text-on-surface">Varredura ativa</span>
        </div>
      </div>

      {/* Page Header Title */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-start sm:items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[26px]">folder_zip</span>
          </div>
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              Disponibilizar Recursos para Download
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5 leading-relaxed">
              Compartilhe datasets, adaptadores LoRA, pesos quantizados, notebooks e pipelines empacotados em arquivos compactados (<code className="font-code-md text-label-sm px-1.5 py-0.5 rounded bg-surface-container-low text-primary border border-outline-variant/30">.zip</code> ou <code className="font-code-md text-label-sm px-1.5 py-0.5 rounded bg-surface-container-low text-primary border border-outline-variant/30">.rar</code>).
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-space-sm p-space-md rounded-xl bg-error/10 border border-error/30 text-error font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
          <span className="flex-1 font-medium">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="shrink-0 hover:opacity-75 transition-opacity" type="button">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Primary Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isPublishing && inputRef.current?.click()}
        className={`relative bg-surface-container-lowest hover:bg-surface-container-low border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-xl p-space-xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all duration-200 shadow-sm ${
          isPublishing ? 'opacity-50 pointer-events-none' : ''
        } ${isDragging ? 'border-primary bg-primary/5' : ''}`}
      >
        <input
          ref={inputRef}
          accept=".zip,.rar"
          className="hidden"
          multiple
          type="file"
          onChange={handleInputChange}
          disabled={isPublishing}
        />
        <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mb-space-md group-hover:scale-105 transition-all shadow-sm">
          <span className="material-symbols-outlined text-[36px]">drive_folder_upload</span>
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-semibold">
          Arraste e solte seus arquivos <span className="text-primary font-bold">.zip</span> ou <span className="text-primary font-bold">.rar</span> aqui
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
          ou <span className="text-primary font-medium underline underline-offset-2">clique para navegar</span> nos diretórios do seu computador
        </p>
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-space-md">
          <span className="font-code-md text-label-sm px-2.5 py-1 bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-md font-medium">.ZIP</span>
          <span className="font-code-md text-label-sm px-2.5 py-1 bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-md font-medium">.RAR</span>
          <span className="font-label-sm text-label-sm text-outline ml-1">Até {MAX_SIZE_MB} MB por arquivo</span>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 text-on-surface-variant px-space-md py-space-sm rounded-lg max-w-xl text-left">
          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">security</span>
          <span className="font-body-sm text-body-sm leading-relaxed">
            Arquivos executáveis diretos (<code className="font-code-md text-label-sm bg-surface-container text-on-surface px-1.5 py-0.5 rounded">.exe</code>, <code className="font-code-md text-label-sm bg-surface-container text-on-surface px-1.5 py-0.5 rounded">.bat</code>) sofrem bloqueio na triagem automatizada da comunidade.
          </span>
        </div>
      </div>

      {/* Uploaded & Processing Queue */}
      {files.length > 0 && (
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
              Arquivos no Pacote ({files.length})
            </h3>
            {!isPublishing && (
              <button onClick={() => inputRef.current?.click()} className="text-primary hover:underline font-label-md text-label-md font-medium flex items-center gap-1 transition-colors" type="button">
                <span className="material-symbols-outlined text-[16px]">add_circle</span> Adicionar outro arquivo
              </button>
            )}
          </div>

          {files.map((f) => (
            <div key={f.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs transition-all hover:border-outline-variant">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[24px]">
                      {getFileExt(f.name) === '.rar' ? 'archive' : 'folder_zip'}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{f.name}</span>
                      <span className="font-code-md text-label-sm px-2 py-0.5 rounded bg-surface-container-low border border-outline-variant/30 text-on-surface-variant font-medium">{formatBytes(f.size)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mt-0.5 flex-wrap">
                      {f.status === 'ready' && <span className="inline-flex items-center gap-1 text-primary font-medium"><span className="material-symbols-outlined text-[16px]">verified</span> Pronto</span>}
                      {f.status === 'uploading' && <span className="inline-flex items-center gap-1 text-primary font-medium"><span className="material-symbols-outlined text-[16px] animate-spin">sync</span> Enviando...</span>}
                      {f.status === 'done' && <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium"><span className="material-symbols-outlined text-[16px]">check_circle</span> Concluído</span>}
                      {f.status === 'error' && <span className="inline-flex items-center gap-1 text-error font-medium"><span className="material-symbols-outlined text-[16px]">error</span> {f.error}</span>}
                    </div>
                  </div>
                </div>
                {!isPublishing && f.status === 'ready' && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => removeFile(f.id)} className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-colors" title="Remover" type="button">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                )}
              </div>
              {(f.status === 'uploading' || f.status === 'done') && (
                <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${f.progress}%` }}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Package Metadata Form Section */}
      <div className={`bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg transition-opacity ${isPublishing ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Metadados e Especificações do Recurso</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Forneça o contexto técnico necessário para que membros da comunidade utilizem o pacote imediatamente.</p>
          </div>
          <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-surface-container-low border border-outline-variant/30 text-primary font-medium">
            Novo Recurso
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
            <span>Título do Recurso / Pacote <span className="text-error">*</span></span>
            <span className="font-label-sm text-label-sm text-outline font-normal">Máx. 100 caracteres</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg border border-outline-variant/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
            maxLength={100}
            placeholder="Ex: Pesos LoRA Mistral 7B para Raciocínio Matemático"
            type="text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Categoria do Recurso <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full appearance-none bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md py-2.5 pr-10 rounded-lg border border-outline-variant/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              >
                {activeCategories.length > 0 ? (
                  activeCategories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface text-on-surface">
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="" className="bg-surface text-on-surface">IA Geral</option>
                    <option value="" className="bg-surface text-on-surface">Programação</option>
                    <option value="" className="bg-surface text-on-surface">Imagens e Vídeos</option>
                    <option value="" className="bg-surface text-on-surface">Negócios</option>
                  </>
                )}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Licença do Arquivo <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full appearance-none bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md py-2.5 pr-10 rounded-lg border border-outline-variant/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              >
                <option value="Apache 2.0 (Uso Comercial e Livre com Atribuição)" className="bg-surface text-on-surface">Apache 2.0 (Uso Comercial e Livre com Atribuição)</option>
                <option value="MIT License" className="bg-surface text-on-surface">MIT License</option>
                <option value="Creative Commons BY-SA 4.0" className="bg-surface text-on-surface">Creative Commons BY-SA 4.0</option>
                <option value="Uso Acadêmico & Pesquisa Não Comercial" className="bg-surface text-on-surface">Uso Acadêmico &amp; Pesquisa Não Comercial</option>
                <option value="Llama 3 Community License Agreement" className="bg-surface text-on-surface">Llama 3 Community License Agreement</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface font-semibold">Tags Técnicas &amp; Modelos Base</label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg min-h-[44px]">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low border border-outline-variant/30 text-primary rounded-md font-code-md text-label-sm shadow-xs">
                <span>#{tag}</span>
                <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-error transition-colors" type="button" aria-label={`Remover tag ${tag}`}>
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="flex-1 bg-transparent outline-none font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 px-2 py-1 min-w-[140px]"
              placeholder="+ Digite e aperte Enter..."
              type="text"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface font-semibold">Instruções de Uso &amp; Documentação Breve</label>
            <span className="font-label-sm text-label-sm text-outline">Suporta sintaxe Markdown</span>
          </div>
          <div className="rounded-lg bg-surface-container-lowest border border-outline-variant/50 overflow-hidden flex flex-col focus-within:border-primary transition-colors">
            {/* Barra de Formatação Markdown Funcional */}
            <div className="flex items-center gap-1 px-space-md py-1.5 bg-surface-container-low border-b border-surface-container text-on-surface-variant text-[12px]">
              <button onClick={() => insertMarkdown('**', '**')} className="p-1 hover:bg-surface-container hover:text-on-surface rounded transition-colors" title="Negrito" type="button">
                <span className="material-symbols-outlined text-[18px]">format_bold</span>
              </button>
              <button onClick={() => insertMarkdown('*', '*')} className="p-1 hover:bg-surface-container hover:text-on-surface rounded transition-colors" title="Itálico" type="button">
                <span className="material-symbols-outlined text-[18px]">format_italic</span>
              </button>
              <button onClick={() => insertMarkdown('`', '`')} className="p-1 hover:bg-surface-container hover:text-on-surface rounded transition-colors" title="Código Inline" type="button">
                <span className="material-symbols-outlined text-[18px]">code</span>
              </button>
              <button onClick={() => insertMarkdown('\n- ')} className="p-1 hover:bg-surface-container hover:text-on-surface rounded transition-colors" title="Item de Lista" type="button">
                <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              </button>
              <button onClick={() => insertMarkdown('[Título](', ')')} className="p-1 hover:bg-surface-container hover:text-on-surface rounded transition-colors" title="Link" type="button">
                <span className="material-symbols-outlined text-[18px]">link</span>
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-on-surface font-mono text-[13px] leading-relaxed p-space-md outline-none placeholder:text-on-surface-variant/50 resize-y"
              placeholder="Explique como carregar os pesos no Hugging Face transformers, parâmetros de inferência recomendados ou detalhes do pré-processamento do dataset..."
              rows={6}
            ></textarea>
          </div>
        </div>

        <div className="flex items-center justify-between pt-space-xs border-t border-surface-container">
          <Link href="/" className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-label-md text-label-md font-medium">
            Cancelar
          </Link>
          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || isPublishing}
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-space-lg py-2 rounded-lg hover:bg-primary-container transition-all shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">{isPublishing ? 'sync' : 'cloud_upload'}</span>
            <span>{isPublishing ? 'Enviando e Publicando...' : 'Publicar Pacote'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
