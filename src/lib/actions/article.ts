'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function saveDraft(data: {
  id?: string
  title: string
  subtitle?: string
  content: string
  category_id?: string
  tags?: string[]
  cover_image_url?: string
  slug?: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  // Gera slug provisório se não existir
  let slug = data.slug
  if (!slug && data.title) {
    const baseSlug = data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80)
    slug = `${baseSlug}-${Date.now()}`
  }

  const payload = {
    author_id: user.id,
    title: data.title || 'Artigo sem título',
    subtitle: data.subtitle,
    content: data.content,
    category_id: data.category_id || null,
    tags: data.tags || [],
    cover_image_url: data.cover_image_url || null,
    slug,
    status: 'draft',
    updated_at: new Date().toISOString()
  }

  let result
  if (data.id) {
    // Atualiza rascunho existente
    result = await supabase
      .from('articles')
      .update(payload)
      .eq('id', data.id)
      .eq('author_id', user.id)
      .select()
      .single()
  } else {
    // Cria novo rascunho
    result = await supabase
      .from('articles')
      .insert(payload)
      .select()
      .single()
  }

  if (result.error) {
    console.error('Erro ao salvar rascunho:', result.error)
    return { error: `Erro no banco de dados (Salvar): ${result.error.message || JSON.stringify(result.error)}` }
  }

  revalidatePath('/meus-artigos')
  return { success: true, article: result.data }
}

export async function publishArticle(data: {
  id?: string
  title: string
  subtitle: string
  content: string
  category_id: string
  tags: string[]
  cover_image_url: string
  slug: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (!data.title || !data.content || !data.category_id) {
    return { error: 'Preencha todos os campos obrigatórios para publicar.' }
  }

  const payload = {
    author_id: user.id,
    title: data.title,
    subtitle: data.subtitle,
    content: data.content,
    category_id: data.category_id,
    tags: data.tags,
    cover_image_url: data.cover_image_url,
    slug: data.slug,
    status: 'published',
    updated_at: new Date().toISOString()
  }

  let result
  if (data.id) {
    result = await supabase
      .from('articles')
      .update(payload)
      .eq('id', data.id)
      .eq('author_id', user.id)
      .select()
      .single()
  } else {
    result = await supabase
      .from('articles')
      .insert(payload)
      .select()
      .single()
  }

  if (result.error) {
    console.error('Erro ao publicar artigo:', result.error)
    return { error: `Erro no banco de dados (Publicar): ${result.error.message || JSON.stringify(result.error)}` }
  }

  revalidatePath('/')
  revalidatePath('/meus-artigos')
  
  // Como redirect joga uma exceção que o Next pega, é seguro retornar aqui
  return { success: true, slug: result.data.slug }
}

export async function deleteArticle(articleId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', articleId)
    .eq('author_id', user.id)

  if (error) {
    console.error('Erro ao excluir artigo:', error)
    return { error: `Erro ao excluir: ${error.message}` }
  }

  revalidatePath('/meus-artigos')
  revalidatePath('/blog')
  return { success: true }
}

export async function toggleArticleLike(articleId: string, slug: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  // Tenta gerenciar na tabela likes
  let hasLiked = false
  try {
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('topic_id', articleId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      await supabase.from('likes').delete().eq('id', existing.id)
      hasLiked = false
    } else {
      await supabase.from('likes').insert({ topic_id: articleId, user_id: user.id })
      hasLiked = true
    }
  } catch (_) {
    hasLiked = true
  }

  // Atualiza o contador de likes_count no artigo
  const { data: currentArticle } = await supabase
    .from('articles')
    .select('likes_count')
    .eq('id', articleId)
    .single()

  const currentCount = currentArticle?.likes_count || 0
  const newCount = hasLiked ? currentCount + 1 : Math.max(0, currentCount - 1)

  await supabase
    .from('articles')
    .update({ likes_count: newCount })
    .eq('id', articleId)

  revalidatePath(`/artigo/${slug}`)
  revalidatePath('/blog')
  revalidatePath('/')
  return { success: true, liked: hasLiked, likesCount: newCount }
}

export async function uploadArticleCover(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const file = formData.get('file') as File | null
  if (!file || !(file instanceof File)) {
    return { error: 'Nenhum arquivo de imagem válido recebido.' }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: 'O arquivo excede o limite máximo de 10MB.' }
  }

  const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return { error: 'Formato inválido. Envie imagens PNG, JPG, WebP ou GIF.' }
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp'
  const fileName = `cover_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload para o bucket articles
  const { error } = await supabase.storage
    .from('articles')
    .upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: true,
    })

  if (error) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceKey) {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
      const adminUpload = await adminClient.storage
        .from('articles')
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '31536000',
          upsert: true,
        })

      if (adminUpload.error) {
        console.error('Erro de upload via adminClient:', adminUpload.error)
        return { error: `Falha ao fazer upload da imagem: ${adminUpload.error.message}` }
      }
    } else {
      console.error('Erro de upload da capa:', error)
      return { error: `Falha ao fazer upload da imagem: ${error.message}` }
    }
  }

  const { data: { publicUrl } } = supabase.storage.from('articles').getPublicUrl(fileName)
  return { success: true, url: publicUrl }
}


