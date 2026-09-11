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

export default function UploadRecursosClient() {
  const router = useRouter()
  
  // Storage & state
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Form Fields
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Pesos & Checkpoints (LoRA / GGUF / SafeTensors)')
  const [license, setLicense] = useState('Apache 2.0 (Uso Comercial e Livre com Atribuição)')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>(['LoRA', 'FineTuning'])
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

  const handleSubmit = async () => {
    if (files.length === 0) {
      setErrorMsg('Adicione pelo menos um arquivo.')
      return
    }
    if (!title) {
      setErrorMsg('O título é obrigatório.')
      return
    }

    setIsPublishing(true)
    setErrorMsg(null)
    const uploadedPaths: string[] = []
    
    // Atualiza estado visual de todos para uploading (se prontos)
    setFiles(prev => prev.map(f => f.status === 'ready' ? { ...f, status: 'uploading', progress: 10 } : f))

    let hasUploadError = false

    // Como Storage da Supabase no JS pode não dar progresso preciso por padrão no upload direto, 
    // a gente apenas aguarda a promise e seta 100%. (Com xhr/fetch daria pra rastrear onUploadProgress)
    for (const fileObj of files) {
      if (fileObj.status !== 'ready') continue

      // Gera um nome único pra evitar conflito
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

    if (hasUploadError) {
      setErrorMsg('Falha ao enviar alguns arquivos. Tente novamente.')
      setIsPublishing(false)
      return
    }

    // Chama Server Action para salvar os metadados no banco
    const res = await saveResourceMetadata({
      title,
      category,
      license,
      description,
      tags,
      file_paths: uploadedPaths
    })

    if (res.error) {
      setErrorMsg(res.error)
      setIsPublishing(false)
    } else {
      // Sucesso! Redireciona para home ou para a lista de recursos
      router.push('/')
    }
  }

  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full gap-space-lg pb-space-xl">
        
        {/* Breadcrumb & Limit Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <Link href="/" className="hover:text-primary transition-colors">Início</Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Recursos &amp; Downloads</span>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold">Novo Pacote de Arquivos</span>
          </nav>
          <div className="inline-flex items-center gap-space-xs px-space-md py-1 bg-surface-container rounded-full text-on-surface-variant font-label-sm text-label-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Limite: <strong className="text-on-surface font-semibold">{MAX_SIZE_MB}MB</strong></span>
            <span className="text-outline">·</span>
            <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
            <span>.zip e .rar</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">folder_zip</span>
            </div>
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Disponibilizar Recursos</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                Compartilhe datasets, LoRAs e pacotes com a comunidade.
              </p>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="flex items-start gap-space-sm p-space-md rounded-xl bg-error-container border border-error/20 text-on-error-container font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="ml-auto shrink-0 hover:opacity-70 transition-opacity" type="button">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isPublishing && inputRef.current?.click()}
          className={`relative bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col items-center justify-center text-center transition-all border-2 border-dashed ${isPublishing ? 'opacity-50 cursor-not-allowed border-outline-variant' : isDragging ? 'border-primary bg-primary-fixed/30 scale-[1.01] cursor-pointer' : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low cursor-pointer'}`}
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
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-space-md transition-all ${isDragging ? 'bg-primary-fixed scale-110' : 'bg-surface-container group-hover:bg-primary-fixed'}`}>
            <span className="material-symbols-outlined text-[36px]">drive_folder_upload</span>
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Arraste e solte seus arquivos <span className="text-primary font-semibold">.zip</span> ou <span className="text-primary font-semibold">.rar</span> aqui
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            ou <span className="text-primary font-medium underline underline-offset-2">clique para procurar</span> no seu computador
          </p>
        </div>

        {/* File Queue */}
        {files.length > 0 && (
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
                Arquivos ({files.length})
              </h3>
            </div>

            {files.map((f) => (
              <div key={f.id} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
                <div className="flex items-start justify-between gap-space-md">
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[24px]">
                        {getFileExt(f.name) === '.rar' ? 'archive' : 'folder_zip'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="font-label-md text-label-md text-on-surface font-semibold truncate max-w-[260px]">{f.name}</span>
                        <span className="font-code-md text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">{formatBytes(f.size)}</span>
                      </div>
                      <div className="flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm mt-0.5 flex-wrap">
                        {f.status === 'ready' && <span className="inline-flex items-center gap-1 text-primary font-medium"><span className="material-symbols-outlined text-[16px]">check_circle</span> Pronto</span>}
                        {f.status === 'uploading' && <span className="inline-flex items-center gap-1 text-primary font-medium"><span className="material-symbols-outlined text-[16px] animate-spin">sync</span> Enviando...</span>}
                        {f.status === 'done' && <span className="inline-flex items-center gap-1 text-primary font-medium"><span className="material-symbols-outlined text-[16px]">cloud_done</span> Concluído</span>}
                        {f.status === 'error' && <span className="inline-flex items-center gap-1 text-error font-medium"><span className="material-symbols-outlined text-[16px]">error</span> {f.error}</span>}
                      </div>
                    </div>
                  </div>
                  {!isPublishing && f.status === 'ready' && (
                    <div className="flex items-center gap-space-xs shrink-0">
                      <button onClick={() => removeFile(f.id)} className="p-1.5 rounded-lg text-error hover:bg-error-container transition-colors" title="Remover" type="button">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
                {/* Progress bar visual indication (faked/stepped during fetch) */}
                {(f.status === 'uploading' || f.status === 'done') && (
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${f.progress}%` }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Package Metadata Form */}
        <div className={`bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg transition-opacity ${isPublishing ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
              <span>Título do Recurso / Pacote <span className="text-error">*</span></span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md py-space-sm rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
              maxLength={100}
              placeholder="Ex: Pesos LoRA Mistral 7B para Raciocínio Matemático"
              type="text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold">Categoria <span className="text-error">*</span></label>
              <div className="relative">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full appearance-none bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-space-sm pr-10 rounded-lg outline-none cursor-pointer">
                  <option>Pesos &amp; Checkpoints (LoRA / GGUF / SafeTensors)</option>
                  <option>Datasets &amp; Benchmarks Estruturados</option>
                  <option>Scripts, Notebooks &amp; Pipelines de Treino</option>
                  <option>Templates de Agentes &amp; Prompts Sistemáticos</option>
                  <option>Modelos Quantizados para Inferência Local</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">expand_more</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold">Licença <span className="text-error">*</span></label>
              <div className="relative">
                <select value={license} onChange={(e) => setLicense(e.target.value)} className="w-full appearance-none bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-space-sm pr-10 rounded-lg outline-none cursor-pointer">
                  <option>Apache 2.0 (Uso Comercial e Livre com Atribuição)</option>
                  <option>MIT License</option>
                  <option>Creative Commons BY-SA 4.0</option>
                  <option>Uso Acadêmico &amp; Pesquisa Não Comercial</option>
                  <option>Llama 3 Community License Agreement</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">expand_more</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">Tags Técnicas</label>
            <div className="flex flex-wrap items-center gap-space-xs p-space-sm bg-surface-container-low rounded-lg min-h-[44px]">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-lowest text-primary rounded-md font-code-md text-code-md shadow-sm">
                  <span>#{tag}</span>
                  <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-error transition-colors" type="button">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 bg-transparent outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline px-2 py-1 min-w-[140px]"
                placeholder="+ Digite e aperte Enter..."
                type="text"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">Instruções de Uso &amp; Documentação Breve</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md p-space-md outline-none placeholder:text-outline resize-y rounded-lg"
              placeholder="Explique como carregar os pesos, parâmetros recomendados..."
              rows={5}
            ></textarea>
          </div>

          <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant">
            <Link href="/" className="px-space-md py-2.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
              Cancelar
            </Link>
            <button
              onClick={handleSubmit}
              disabled={files.length === 0 || isPublishing}
              className="inline-flex items-center gap-space-xs bg-primary text-on-primary font-label-md text-label-md px-space-lg py-2.5 rounded-lg hover:bg-primary-container transition-all shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">{isPublishing ? 'sync' : 'cloud_upload'}</span>
              <span>{isPublishing ? 'Enviando e Publicando...' : 'Publicar Pacote'}</span>
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}
