'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'

const MAX_SIZE_MB = 50
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const ALLOWED_TYPES = ['.zip', '.rar']
const ALLOWED_MIME = ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/vnd.rar']

interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  status: 'ready' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileExt(name: string): string {
  return name.substring(name.lastIndexOf('.')).toLowerCase()
}

export default function UploadRecursosClient() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [tags, setTags] = useState<string[]>(['LoRA', 'FineTuning'])
  const [tagInput, setTagInput] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
        progress: 100,
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
  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id))

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = tagInput.trim()
      if (val && !tags.includes(val)) { setTags([...tags, val]); setTagInput('') }
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
            <span>Limite por arquivo: <strong className="text-on-surface font-semibold">{MAX_SIZE_MB}MB</strong></span>
            <span className="text-outline">·</span>
            <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
            <span>Somente .zip e .rar</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">folder_zip</span>
            </div>
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Disponibilizar Recursos para Download</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                Compartilhe datasets, adaptadores LoRA, pesos quantizados, notebooks e pipelines empacotados em{' '}
                <code className="font-code-md text-code-md px-1.5 py-0.5 rounded bg-surface-container text-primary font-medium">.zip</code> ou{' '}
                <code className="font-code-md text-code-md px-1.5 py-0.5 rounded bg-surface-container text-primary font-medium">.rar</code>.
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
          onClick={() => inputRef.current?.click()}
          className={`relative bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed ${isDragging ? 'border-primary bg-primary-fixed/30 scale-[1.01]' : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low'}`}
        >
          <input
            ref={inputRef}
            accept=".zip,.rar"
            className="hidden"
            id="archive-uploader"
            multiple
            type="file"
            onChange={handleInputChange}
          />
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-space-md transition-all ${isDragging ? 'bg-primary-fixed scale-110' : 'bg-surface-container group-hover:bg-primary-fixed'}`}>
            <span className="material-symbols-outlined text-[36px]">drive_folder_upload</span>
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Arraste e solte seus arquivos <span className="text-primary font-semibold">.zip</span> ou <span className="text-primary font-semibold">.rar</span> aqui
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            ou <span className="text-primary font-medium underline underline-offset-2">clique para navegar</span> nos diretórios do seu computador
          </p>

          {/* Format Badges */}
          <div className="flex flex-wrap items-center justify-center gap-space-xs mb-space-md">
            <span className="font-code-md text-code-md px-2.5 py-1 bg-surface-container text-primary rounded-md font-semibold border border-primary/20">.ZIP</span>
            <span className="font-code-md text-code-md px-2.5 py-1 bg-surface-container text-primary rounded-md font-semibold border border-primary/20">.RAR</span>
            <span className="font-label-sm text-label-sm text-outline ml-1">Até {MAX_SIZE_MB}MB por arquivo</span>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-space-xs bg-surface-container-low text-on-surface-variant px-space-md py-1.5 rounded-lg max-w-xl text-left">
            <span className="material-symbols-outlined text-[18px] text-outline shrink-0">security</span>
            <span className="font-label-sm text-label-sm">
              Apenas arquivos <code className="font-code-md text-[11px] bg-surface-container px-1 rounded">.zip</code> e{' '}
              <code className="font-code-md text-[11px] bg-surface-container px-1 rounded">.rar</code> são aceitos. Outros formatos serão rejeitados automaticamente.
            </span>
          </div>
        </div>

        {/* File Queue */}
        {files.length > 0 && (
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
                Arquivos Prontos para o Pacote ({files.length})
              </h3>
              <button onClick={() => inputRef.current?.click()} className="text-primary hover:opacity-70 font-label-sm text-label-sm font-medium flex items-center gap-1 transition-opacity" type="button">
                <span className="material-symbols-outlined text-[16px]">add_circle</span> Adicionar outro
              </button>
            </div>

            {files.map((f) => (
              <div key={f.id} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm transition-all hover:shadow-md">
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
                        {f.status === 'ready' && (
                          <span className="inline-flex items-center gap-1 text-primary font-medium">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span> Pronto para publicação
                          </span>
                        )}
                        {f.status === 'error' && (
                          <span className="inline-flex items-center gap-1 text-error font-medium">
                            <span className="material-symbols-outlined text-[16px]">error</span> {f.error}
                          </span>
                        )}
                        <span className="text-outline">·</span>
                        <span className="uppercase font-code-md text-[11px] px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-semibold">
                          {getFileExt(f.name).replace('.', '')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0">
                    <button onClick={() => removeFile(f.id)} className="p-1.5 rounded-lg text-error hover:bg-error-container transition-colors" title="Remover" type="button">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${f.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Package Metadata Form */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg">
          <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Metadados e Especificações do Recurso</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Forneça o contexto técnico necessário para que engenheiros utilizem o pacote imediatamente.</p>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between" htmlFor="package-title">
              <span>Título do Recurso / Pacote <span className="text-error">*</span></span>
              <span className="font-label-sm text-label-sm text-outline font-normal">Máx. 100 caracteres</span>
            </label>
            <input
              className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md py-space-sm rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
              id="package-title"
              maxLength={100}
              placeholder="Ex: Pesos LoRA Mistral 7B para Raciocínio Matemático"
              type="text"
            />
          </div>

          {/* Category & License */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="package-category">
                Categoria do Recurso <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select className="w-full appearance-none bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md py-space-sm pr-10 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer" id="package-category">
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
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="package-license">
                Licença do Arquivo <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select className="w-full appearance-none bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md py-space-sm pr-10 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer" id="package-license">
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

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Tags Técnicas &amp; Modelos Base
            </label>
            <div className="flex flex-wrap items-center gap-space-xs p-space-sm bg-surface-container-low rounded-lg min-h-[44px] focus-within:ring-2 focus-within:ring-primary/20 transition-all">
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

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="package-description">
                Instruções de Uso &amp; Documentação Breve
              </label>
              <span className="font-label-sm text-label-sm text-outline">Suporta Markdown</span>
            </div>
            <div className="rounded-lg bg-surface-container-low overflow-hidden flex flex-col">
              <div className="flex items-center gap-1 px-space-md py-1.5 bg-surface-container text-on-surface-variant font-label-sm">
                <button className="p-1 hover:bg-surface-container-high rounded transition-colors" title="Negrito" type="button"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                <button className="p-1 hover:bg-surface-container-high rounded transition-colors" title="Itálico" type="button"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                <button className="p-1 hover:bg-surface-container-high rounded transition-colors" title="Bloco de Código" type="button"><span className="material-symbols-outlined text-[18px]">code</span></button>
                <button className="p-1 hover:bg-surface-container-high rounded transition-colors" title="Lista" type="button"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                <button className="p-1 hover:bg-surface-container-high rounded transition-colors" title="Link" type="button"><span className="material-symbols-outlined text-[18px]">link</span></button>
              </div>
              <textarea
                className="w-full bg-transparent text-on-surface font-body-md text-body-md p-space-md outline-none placeholder:text-outline resize-y"
                id="package-description"
                placeholder="Explique como carregar os pesos, parâmetros recomendados (temperature, top_p) ou detalhes do dataset..."
                rows={5}
              ></textarea>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant">
            <Link href="/" className="px-space-md py-2.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors">
              Cancelar
            </Link>
            <div className="flex items-center gap-space-sm">
              <button
                type="button"
                className="px-space-md py-2.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
              >
                Salvar Rascunho
              </button>
              <button
                type="button"
                disabled={files.length === 0}
                className="inline-flex items-center gap-space-xs bg-primary text-on-primary font-label-md text-label-md px-space-lg py-2.5 rounded-lg hover:bg-primary-container transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>Publicar Pacote{files.length > 0 ? ` (${files.length})` : ''}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
