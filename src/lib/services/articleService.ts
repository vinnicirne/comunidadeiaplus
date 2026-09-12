import { createClient } from '@/lib/supabase/server'
import { Article, Profile } from '@/types/database'

export interface ArticleWithAuthor extends Article {
  author: Profile
}

export async function getPublishedArticles(): Promise<ArticleWithAuthor[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching published articles:', error)
    return []
  }

  // Busca os profiles manualmente
  if (data && data.length > 0) {
    const authorIds = Array.from(new Set(data.map((a: any) => a.author_id)))
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', authorIds)
      
    if (profiles) {
      const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))
      return data.map((a: any) => ({ ...a, author: profileMap[a.author_id] })) as unknown as ArticleWithAuthor[]
    }
  }

  return data as unknown as ArticleWithAuthor[]
}

export async function getMyArticles(userId: string): Promise<Article[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('author_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching user articles:', error)
    return []
  }

  return data as Article[]
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithAuthor | null> {
  const supabase = createClient()
  
  // Primeiro tenta buscar sem join para ver se a tabela existe
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    console.error('Error fetching article by slug:', error)
    return null
  }

  // Tenta buscar o profile separadamente já que a FK pode estar apontando pra auth.users
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.author_id)
    .single()

  return { ...data, author: profile } as unknown as ArticleWithAuthor
}

export async function incrementArticleViews(articleId: string): Promise<void> {
  const supabase = createClient()
  
  // Como o Supabase RPC (increment) pode não estar configurado, vamos ler e atualizar
  // Idealmente deveriamos usar rpc('increment_views', { row_id: articleId })
  try {
    const { data } = await supabase.from('articles').select('views_count').eq('id', articleId).single()
    if (data) {
      await supabase.from('articles').update({ views_count: (data.views_count || 0) + 1 }).eq('id', articleId)
    }
  } catch (error) {
    console.error('Error incrementing views:', error)
  }
}
