import { createClient } from '@/lib/supabase/server'
import { Article, Profile } from '@/types/database'

export interface ArticleWithAuthor extends Article {
  author: Profile
}

export async function getPublishedArticles(): Promise<ArticleWithAuthor[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching published articles:', error)
    return []
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
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('slug', slug)
    .single()

  if (error || !data) {
    console.error('Error fetching article by slug:', error)
    return null
  }

  return data as unknown as ArticleWithAuthor
}
