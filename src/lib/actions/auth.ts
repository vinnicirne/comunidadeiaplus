'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/'

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(next)
}

export async function signUp(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  const full_name = formData.get('full_name') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle(next = '/') {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${next}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function createTopic(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/criar-topico')
  }

  const title = (formData.get('title') as string).trim()
  const content = (formData.get('content') as string).trim()
  const category_id = formData.get('category_id') as string
  const tagsRaw = (formData.get('tags') as string) || ''

  if (!title || !content || !category_id) {
    redirect('/criar-topico?error=Preencha todos os campos obrigatórios.')
  }

  // Validação de Permissão para Blog
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const { data: category } = await supabase.from('categories').select('slug').eq('id', category_id).single()

  if (category && (category.slug === 'blog' || category.slug === 'artigos')) {
    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      redirect('/criar-topico?error=Apenas administradores podem publicar no Blog.')
    }
  }

  // Gera slug único baseado no título
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)

  const slug = `${baseSlug}-${Date.now()}`

  const { data: topic, error } = await supabase
    .from('topics')
    .insert({
      author_id: user.id,
      category_id,
      title,
      slug,
      content,
      is_published: true,
    })
    .select()
    .single()

  if (error) {
    // Fallback amigável se banco não estiver conectado
    console.error('Supabase error:', error)
    redirect('/criar-topico?error=Não foi possível publicar. Verifique o banco.')
  }

  revalidatePath('/')
  redirect(`/topico/${topic.slug}`)
}

export async function updateProfile(data: {
  full_name?: string
  bio?: string
  avatar_url?: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Usuário não autenticado.' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name?.trim() || null,
      bio: data.bio?.trim() || null,
      avatar_url: data.avatar_url?.trim() || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Erro ao atualizar perfil:', error)
    return { error: `Erro no banco: ${error.message}` }
  }

  revalidatePath('/minhas-discussoes')
  revalidatePath('/salvos')
  return { success: true }
}

