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
    return { error: 'Falha ao salvar rascunho.' }
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
    return { error: 'Falha ao publicar artigo.' }
  }

  revalidatePath('/')
  revalidatePath('/meus-artigos')
  
  // Como redirect joga uma exceção que o Next pega, é seguro retornar aqui
  return { success: true, slug: result.data.slug }
}
