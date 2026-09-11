'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ── LIKE em tópico ──────────────────────────────────────────────────────────
export async function toggleTopicLike(topicId: string, slug: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verifica se já curtiu
  const { data: existing } = await supabase
    .from('topic_likes')
    .select('id')
    .eq('topic_id', topicId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('topic_likes').delete().eq('id', existing.id)
    await supabase.rpc('decrement_topic_likes', { topic_id: topicId })
  } else {
    await supabase.from('topic_likes').insert({ topic_id: topicId, user_id: user.id })
    await supabase.rpc('increment_topic_likes', { topic_id: topicId })
  }

  revalidatePath(`/topico/${slug}`)
}

// ── SALVAR tópico ────────────────────────────────────────────────────────────
export async function toggleTopicSave(topicId: string, slug: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: existing } = await supabase
    .from('saved_topics')
    .select('id')
    .eq('topic_id', topicId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('saved_topics').delete().eq('id', existing.id)
  } else {
    await supabase.from('saved_topics').insert({ topic_id: topicId, user_id: user.id })
  }

  revalidatePath(`/topico/${slug}`)
}

// ── COMENTAR ────────────────────────────────────────────────────────────────
export async function postComment(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const topicId = formData.get('topic_id') as string
  const slug = formData.get('slug') as string
  const content = (formData.get('content') as string)?.trim()
  const parentId = (formData.get('parent_id') as string) || null

  if (!content || content.length < 3) {
    return { error: 'Comentário muito curto.' }
  }

  const { error } = await supabase.from('comments').insert({
    topic_id: topicId,
    author_id: user.id,
    content,
    parent_id: parentId || null,
  })

  if (error) {
    console.error('Erro ao postar comentário:', error)
    return { error: 'Não foi possível enviar o comentário.' }
  }

  // Incrementa contador de comentários
  try { await supabase.rpc('increment_topic_comments', { topic_id: topicId }) } catch (_) {}

  revalidatePath(`/topico/${slug}`)
}

// ── LIKE em comentário ───────────────────────────────────────────────────────
export async function toggleCommentLike(commentId: string, slug: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: existing } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('comment_likes').delete().eq('id', existing.id)
    await supabase.rpc('decrement_comment_likes', { comment_id: commentId })
  } else {
    await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id })
    await supabase.rpc('increment_comment_likes', { comment_id: commentId })
  }

  revalidatePath(`/topico/${slug}`)
}

// ── DENUNCIAR ────────────────────────────────────────────────────────────────
export async function reportContent(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const topicId = formData.get('topic_id') as string | null
  const commentId = formData.get('comment_id') as string | null
  const reason = formData.get('reason') as string
  const details = (formData.get('details') as string) || ''
  const slug = formData.get('slug') as string

  await supabase.from('reports').insert({
    reporter_id: user.id,
    topic_id: topicId || null,
    comment_id: commentId || null,
    reason,
    details,
    status: 'pending',
  })

  revalidatePath(`/topico/${slug}`)
}
