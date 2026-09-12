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
  envSupabaseUrl,
  envSupabaseAnonKey
}: {
  envSupabaseUrl: string
  envSupabaseAnonKey: string
}) {
  const router = useRouter()
  
  const supabase = createBrowserClient(envSupabaseUrl, envSupabaseAnonKey)

  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Pesos & Checkpoints (LoRA / GGUF / SafeTensors)')
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
    
    setFiles(prev => prev.map(f => f.status === 'ready' ? { ...f, status: 'uploading', progress: 10 } : f))

    let hasUploadError = false

    for (const fileObj of files) {
      if (fileObj.status !== 'ready') continue

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
      router.push('/upload-recursos')
    }
  }

  return (
    <div className="flex flex-col w-full gap-6 pb-8">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[#94a3b8] text-[12px] font-medium">
          <Link href="/" className="hover:text-[#818cf8] transition-colors cursor-pointer">Workspace</Link>
          <span className="material-symbols-outlined text-[14px] text-[#64748b]">chevron_right</span>
          <span className="hover:text-[#818cf8] transition-colors cursor-pointer">Recursos &amp; Downloads</span>
          <span className="material-symbols-outlined text-[14px] text-[#64748b]">chevron_right</span>
          <span className="text-[#f8fafc] font-semibold">Novo Pacote de Arquivos</span>
        </nav>
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#141b2b] border border-[#1e293b] rounded-full text-[#94a3b8] text-[12px]">
          <span className="w-2 h-2 rounded-full bg-[#818cf8] animate-pulse"></span>
          <span>Limite: <strong className="text-[#f8fafc] font-semibold">{MAX_SIZE_MB} GB</strong></span>
          <span className="text-[#64748b]">·</span>
          <span className="material-symbols-outlined text-[15px] text-[#818cf8]">verified_user</span>
          <span className="text-[#cbd5e1]">Varredura ativa</span>
        </div>
      </div>

      {/* Page Header Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1e293b] border border-[#334155] flex items-center justify-center text-[#818cf8] shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[26px]">folder_zip</span>
          </div>
          <div>
            <h1 className="text-[26px] sm:text-[28px] text-[#f8fafc] font-bold tracking-tight">Disponibilizar Recursos para Download</h1>
            <p className="text-[14px] text-[#94a3b8] mt-1 leading-relaxed">
              Compartilhe datasets, adaptadores LoRA, pesos quantizados, notebooks e pipelines empacotados em arquivos compactados (<code className="font-mono text-[12px] px-1.5 py-0.5 rounded bg-[#1e293b] text-[#818cf8] border border-[#334155]">.zip</code> ou <code className="font-mono text-[12px] px-1.5 py-0.5 rounded bg-[#1e293b] text-[#818cf8] border border-[#334155]">.rar</code>).
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-[13px] font-medium">
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-auto shrink-0 hover:text-red-400 transition-colors" type="button">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Primary Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isPublishing && inputRef.current?.click()}
        className={`relative bg-[#141b2b] hover:bg-[#1e293b]/70 border-2 border-dashed border-[#334155] hover:border-[#6366f1]/60 rounded-xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer transition-all ${isPublishing ? 'opacity-50 pointer-events-none' : ''} ${isDragging ? 'border-[#818cf8] bg-[#1e293b]/50' : ''}`}
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
        <div className="w-16 h-16 rounded-2xl bg-[#1e293b] border border-[#334155] flex items-center justify-center text-[#818cf8] mb-4 group-hover:scale-105 group-hover:bg-[#6366f1]/20 group-hover:border-[#6366f1]/40 transition-all shadow-inner">
          <span className="material-symbols-outlined text-[36px]">drive_folder_upload</span>
        </div>
        <h2 className="text-[17px] text-[#f8fafc] mb-1 font-semibold">
          Arraste e solte seus arquivos <span className="text-[#818cf8] font-bold">.zip</span> ou <span className="text-[#818cf8] font-bold">.rar</span> aqui
        </h2>
        <p className="text-[13px] text-[#94a3b8] mb-4">
          ou <span className="text-[#818cf8] font-medium underline underline-offset-2">clique para navegar</span> nos diretórios do seu computador
        </p>
        <div className="flex flex-wrap items-center justify-center gap-1 mb-4">
          <span className="font-mono text-[12px] px-2.5 py-1 bg-[#0f172a] border border-[#334155] text-[#cbd5e1] rounded-md font-medium">.ZIP</span>
          <span className="font-mono text-[12px] px-2.5 py-1 bg-[#0f172a] border border-[#334155] text-[#cbd5e1] rounded-md font-medium">.RAR</span>
          <span className="text-[12px] text-[#64748b] ml-1 font-medium">Até {MAX_SIZE_MB} GB por lote</span>
        </div>
        <div className="flex items-center gap-1 bg-[#0f172a] border border-[#334155] text-[#94a3b8] px-4 py-2 rounded-lg max-w-xl text-left">
          <span className="material-symbols-outlined text-[18px] text-[#818cf8] shrink-0">security</span>
          <span className="text-[12px] leading-relaxed">
            Arquivos executáveis diretos (<code className="font-mono text-[11px] bg-[#1e293b] text-[#f8fafc] px-1.5 py-0.5 rounded border border-[#334155]">.exe</code>, <code className="font-mono text-[11px] bg-[#1e293b] text-[#f8fafc] px-1.5 py-0.5 rounded border border-[#334155]">.bat</code>) sofrem bloqueio na triagem automatizada da comunidade.
          </span>
        </div>
      </div>

      {/* Uploaded & Processing Queue */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] text-[#f8fafc] font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#818cf8]">inventory_2</span>
              Arquivos Prontos para o Pacote ({files.length})
            </h3>
            {!isPublishing && (
              <button onClick={() => inputRef.current?.click()} className="text-[#818cf8] hover:text-[#a5b4fc] text-[13px] font-medium flex items-center gap-1 transition-colors" type="button">
                <span className="material-symbols-outlined text-[16px]">add_circle</span> Adicionar outro arquivo
              </button>
            )}
          </div>

          {files.map((f) => (
            <div key={f.id} className="bg-[#141b2b] border border-[#1e293b] rounded-xl p-4 shadow-sm flex flex-col gap-2 transition-all hover:border-[#334155]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-[#1e293b] border border-[#334155] flex items-center justify-center text-[#818cf8] shrink-0">
                    <span className="material-symbols-outlined text-[24px]">
                      {getFileExt(f.name) === '.rar' ? 'archive' : 'folder_zip'}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[14px] text-[#f8fafc] font-semibold truncate">{f.name}</span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#0f172a] border border-[#334155] text-[#94a3b8]">{formatBytes(f.size)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#94a3b8] text-[12px] mt-0.5 flex-wrap">
                      {f.status === 'ready' && <span className="inline-flex items-center gap-1 text-[#818cf8] font-medium"><span className="material-symbols-outlined text-[16px]">verified</span> Pronto</span>}
                      {f.status === 'uploading' && <span className="inline-flex items-center gap-1 text-[#818cf8] font-medium"><span className="material-symbols-outlined text-[16px] animate-spin">sync</span> Enviando...</span>}
                      {f.status === 'done' && <span className="inline-flex items-center gap-1 text-[#4edea3] font-medium"><span className="material-symbols-outlined text-[16px]">check_circle</span> Concluído</span>}
                      {f.status === 'error' && <span className="inline-flex items-center gap-1 text-[#ffb4ab] font-medium"><span className="material-symbols-outlined text-[16px]">error</span> {f.error}</span>}
                    </div>
                  </div>
                </div>
                {!isPublishing && f.status === 'ready' && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => removeFile(f.id)} className="p-1.5 rounded-lg text-[#ffb4ab] hover:bg-[#93000a]/20 transition-colors" title="Remover" type="button">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                )}
              </div>
              {(f.status === 'uploading' || f.status === 'done') && (
                <div className="w-full bg-[#1e293b] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#6366f1] h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${f.progress}%` }}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Package Metadata Form Section */}
      <div className={`bg-[#141b2b] border border-[#1e293b] rounded-xl p-6 shadow-sm flex flex-col gap-6 transition-opacity ${isPublishing ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
          <div>
            <h2 className="text-[18px] text-[#f8fafc] font-semibold">Metadados e Especificações do Recurso</h2>
            <p className="text-[13px] text-[#94a3b8]">Forneça o contexto técnico necessário para que engenheiros utilizem o pacote imediatamente.</p>
          </div>
          <span className="font-mono text-[12px] text-[#a5b4fc] bg-[#1e293b] border border-[#334155] px-2.5 py-1 rounded-lg">ID #RES-{Math.floor(1000 + Math.random() * 9000)}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] text-[#f8fafc] font-semibold flex items-center justify-between">
            <span>Título do Recurso / Pacote <span className="text-[#ffb4ab]">*</span></span>
            <span className="text-[12px] text-[#64748b] font-normal">Máx. 100 caracteres</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0f172a] text-[#f8fafc] text-[14px] px-4 py-2.5 rounded-lg border border-[#334155] outline-none focus:border-[#818cf8] focus:ring-1 focus:ring-[#818cf8] transition-all placeholder:text-[#64748b]"
            maxLength={100}
            placeholder="Ex: Pesos LoRA Mistral 7B para Raciocínio Matemático"
            type="text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] text-[#f8fafc] font-semibold">Categoria do Recurso <span className="text-[#ffb4ab]">*</span></label>
            <div className="relative">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full appearance-none bg-[#0f172a] text-[#f8fafc] text-[14px] px-4 py-2.5 pr-10 rounded-lg border border-[#334155] outline-none focus:border-[#818cf8] focus:ring-1 focus:ring-[#818cf8] transition-all cursor-pointer">
                <option className="bg-[#0f172a] text-[#f8fafc]" value="Pesos & Checkpoints (LoRA / GGUF / SafeTensors)">Pesos &amp; Checkpoints (LoRA / GGUF / SafeTensors)</option>
                <option className="bg-[#0f172a] text-[#f8fafc]" value="Datasets & Benchmarks Estruturados">Datasets &amp; Benchmarks Estruturados</option>
                <option className="bg-[#0f172a] text-[#f8fafc]" value="Scripts, Notebooks & Pipelines de Treino">Scripts, Notebooks &amp; Pipelines de Treino</option>
                <option className="bg-[#0f172a] text-[#f8fafc]" value="Templates de Agentes & Prompts Sistemáticos">Templates de Agentes &amp; Prompts Sistemáticos</option>
                <option className="bg-[#0f172a] text-[#f8fafc]" value="Modelos Quantizados para Inferência Local">Modelos Quantizados para Inferência Local</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none text-[20px]">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] text-[#f8fafc] font-semibold">Licença do Arquivo <span className="text-[#ffb4ab]">*</span></label>
            <div className="relative">
              <select value={license} onChange={(e) => setLicense(e.target.value)} className="w-full appearance-none bg-[#0f172a] text-[#f8fafc] text-[14px] px-4 py-2.5 pr-10 rounded-lg border border-[#334155] outline-none focus:border-[#818cf8] focus:ring-1 focus:ring-[#818cf8] transition-all cursor-pointer">
                <option className="bg-[#0f172a] text-[#f8fafc]" value="Apache 2.0 (Uso Comercial e Livre com Atribuição)">Apache 2.0 (Uso Comercial e Livre com Atribuição)</option>
                <option className="bg-[#0f172a] text-[#f8fafc]" value="MIT License">MIT License</option>
                <option className="bg-[#0f172a] text-[#f8fafc]" value="Creative Commons BY-SA 4.0">Creative Commons BY-SA 4.0</option>
                <option className="bg-[#0f172a] text-[#f8fafc]" value="Uso Acadêmico & Pesquisa Não Comercial">Uso Acadêmico &amp; Pesquisa Não Comercial</option>
                <option className="bg-[#0f172a] text-[#f8fafc]" value="Llama 3 Community License Agreement">Llama 3 Community License Agreement</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none text-[20px]">expand_more</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] text-[#f8fafc] font-semibold">Tags Técnicas &amp; Modelos Base</label>
          <div className="flex flex-wrap items-center gap-1 p-2 bg-[#0f172a] border border-[#334155] rounded-lg min-h-[44px]">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1e293b] border border-[#334155] text-[#818cf8] rounded-md font-mono text-[12px] shadow-sm">
                <span>#{tag}</span>
                <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-[#ffb4ab] transition-colors" type="button">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="flex-1 bg-transparent outline-none text-[13px] text-[#f8fafc] placeholder:text-[#64748b] px-2 py-1 min-w-[140px]"
              placeholder="+ Digite e aperte Enter..."
              type="text"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[14px] text-[#f8fafc] font-semibold">Instruções de Uso &amp; Documentação Breve</label>
            <span className="text-[12px] text-[#64748b]">Suporta sintaxe Markdown</span>
          </div>
          <div className="rounded-lg bg-[#0f172a] border border-[#334155] overflow-hidden flex flex-col focus-within:border-[#818cf8] transition-colors">
            <div className="flex items-center gap-1 px-4 py-1.5 bg-[#141b2b] border-b border-[#1e293b] text-[#94a3b8] text-[12px]">
              <button className="p-1 hover:bg-[#1e293b] hover:text-[#f8fafc] rounded transition-colors" title="Negrito" type="button"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
              <button className="p-1 hover:bg-[#1e293b] hover:text-[#f8fafc] rounded transition-colors" title="Itálico" type="button"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
              <button className="p-1 hover:bg-[#1e293b] hover:text-[#f8fafc] rounded transition-colors" title="Bloco de Código" type="button"><span className="material-symbols-outlined text-[18px]">code</span></button>
              <button className="p-1 hover:bg-[#1e293b] hover:text-[#f8fafc] rounded transition-colors" title="Lista" type="button"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
              <button className="p-1 hover:bg-[#1e293b] hover:text-[#f8fafc] rounded transition-colors" title="Link" type="button"><span className="material-symbols-outlined text-[18px]">link</span></button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-[#f8fafc] font-mono text-[13px] leading-relaxed p-4 outline-none placeholder:text-[#64748b] resize-y"
              placeholder="Explique como carregar os pesos no Hugging Face transformers, parâmetros de inferência recomendados (temperature, top_p) ou detalhes do pré-processamento do dataset..."
              rows={6}
            ></textarea>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]">
          <Link href="/" className="px-4 py-2 rounded-lg bg-[#141b2b] text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f8fafc] transition-colors text-[14px] font-medium">
            Cancelar
          </Link>
          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || isPublishing}
            className="inline-flex items-center gap-2 bg-[#6366f1] text-white font-medium text-[14px] px-6 py-2 rounded-lg hover:bg-[#4f46e5] transition-all shadow-md shadow-[#6366f1]/20 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">{isPublishing ? 'sync' : 'cloud_upload'}</span>
            <span>{isPublishing ? 'Enviando e Publicando...' : 'Publicar Pacote'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
