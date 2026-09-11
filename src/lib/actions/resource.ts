'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface ResourceData {
  title: string
  category: string
  license: string
  description: string
  tags: string[]
  file_paths: string[]
}

export async function saveResourceMetadata(data: ResourceData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  if (!data.title || !data.category || !data.license || data.file_paths.length === 0) {
    return { error: 'Preencha todos os campos obrigatórios e adicione pelo menos um arquivo.' }
  }

  const payload = {
    author_id: user.id,
    title: data.title,
    category: data.category,
    license: data.license,
    description: data.description || '',
    tags: data.tags || [],
    file_paths: data.file_paths,
  }

  const result = await supabase
    .from('resources')
    .insert(payload)
    .select()
    .single()

  if (result.error) {
    console.error('Erro ao salvar metadados do recurso:', result.error)
    return { error: 'Falha ao salvar dados do pacote.' }
  }

  // Tentar encontrar a categoria correta no banco pelo NOME
  const { data: catData } = await supabase
    .from('categories')
    .select('id')
    .eq('name', data.category)
    .maybeSingle()

  // Gerar um slug simples baseado no título do recurso
  const baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  const topicSlug = `${baseSlug}-${randomSuffix}`

  // Gerar os links públicos para download
  const downloadLinks = data.file_paths.map(path => {
    const { data: { publicUrl } } = supabase.storage.from('recursos').getPublicUrl(path)
    const fileName = path.split('/').pop() || 'Arquivo'
    return `[Baixar ${fileName}](${publicUrl})`
  }).join('\n\n')

  // Conteúdo do tópico automático
  const autoTopicContent = `**Novo recurso adicionado à comunidade!**\n\n**Licença:** ${data.license}\n**Arquivos inclusos:** ${data.file_paths.length}\n\n${data.description}\n\n### 📦 Links para Download:\n${downloadLinks}`

  let categoryId = catData?.id
  
  // Fallback garantido caso a categoria não seja encontrada (evita o NOT NULL constraint error no Supabase)
  if (!categoryId) {
    const { data: fallbackCat } = await supabase.from('categories').select('id').limit(1).single()
    categoryId = fallbackCat?.id
  }

  // Criar o tópico associado ao recurso
  const topicPayload = {
    title: `[Recurso] ${data.title}`,
    slug: topicSlug,
    content: autoTopicContent,
    category_id: categoryId,
    author_id: user.id,
    is_published: true,
  }

  const { error: topicError } = await supabase.from('topics').insert(topicPayload)
  if (topicError) {
    console.error('Falha crítica ao criar auto-tópico:', topicError)
  }

  revalidatePath('/')
  revalidatePath('/upload-recursos')
  
  return { success: true, id: result.data.id }
}
