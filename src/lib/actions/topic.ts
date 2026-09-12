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

// ── EXCLUIR TÓPICO ──────────────────────────────────────────────────────────
export async function deleteTopic(topicId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Usuário não autenticado.' }

  const { data: topic } = await supabase
    .from('topics')
    .select('id, author_id')
    .eq('id', topicId)
    .single()

  if (!topic) return { error: 'Discussão não encontrada.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  if (topic.author_id !== user.id && !isAdmin) {
    return { error: 'Permissão negada. Você não é o autor desta discussão.' }
  }

  // Deletar dependências para manter integridade
  await supabase.from('comments').delete().eq('topic_id', topicId)
  await supabase.from('topic_likes').delete().eq('topic_id', topicId)
  try { await supabase.from('saved_topics').delete().eq('topic_id', topicId) } catch (_) {}
  try { await supabase.from('reports').delete().eq('topic_id', topicId) } catch (_) {}

  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', topicId)

  if (error) {
    console.error('Erro ao excluir tópico:', error)
    return { error: `Erro no banco: ${error.message}` }
  }

  revalidatePath('/minhas-discussoes')
  revalidatePath('/explorar')
  revalidatePath('/')
  return { success: true }
}

// ── EXCLUIR COMENTÁRIO ───────────────────────────────────────────────────────
export async function deleteComment(commentId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Usuário não autenticado.' }

  const { data: comment } = await supabase
    .from('comments')
    .select('id, author_id, topic_id')
    .eq('id', commentId)
    .single()

  if (!comment) return { error: 'Comentário não encontrado.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  if (comment.author_id !== user.id && !isAdmin) {
    return { error: 'Permissão negada. Você não é o autor deste comentário.' }
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Erro ao excluir comentário:', error)
    return { error: `Erro no banco: ${error.message}` }
  }

  if (comment.topic_id) {
    try { await supabase.rpc('decrement_topic_comments', { topic_id: comment.topic_id }) } catch (_) {}
  }

  revalidatePath('/minhas-discussoes')
  return { success: true }
}

