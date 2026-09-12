import { Profile, Category, Topic, Comment, Report, AdminKPIs, ReportActionTaken, ReportStatus } from '@/types/database'
import { supabase } from '@/lib/supabase/client'

export const adminService = {
  // 1. Dashboard KPIs (100% Supabase Real)
  async getKPIs(): Promise<AdminKPIs> {
    try {
      const [
        { count: usersCount, error: errUsers },
        { count: blockedCount },
        { count: topicsCount, error: errTopics },
        { count: hiddenTopicsCount },
        { count: commentsCount, error: errComments },
        { count: pendingReportsCount, error: errReports },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_blocked', true),
        supabase.from('topics').select('*', { count: 'exact', head: true }),
        supabase.from('topics').select('*', { count: 'exact', head: true }).eq('is_published', false),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ])

      if (errUsers) console.error('Erro ao buscar contagem de usuários:', errUsers.message)
      if (errTopics) console.error('Erro ao buscar contagem de tópicos:', errTopics.message)

      const totalUsers = usersCount || 0
      const blockedUsers = blockedCount || 0
      const totalTopics = topicsCount || 0
      const hiddenTopics = hiddenTopicsCount || 0

      return {
        totalUsers,
        activeUsers: Math.max(0, totalUsers - blockedUsers),
        blockedUsers,
        totalTopics,
        publishedTopics: Math.max(0, totalTopics - hiddenTopics),
        hiddenTopics,
        totalComments: commentsCount || 0,
        pendingReports: pendingReportsCount || 0,
      }
    } catch (e: any) {
      console.error('Falha geral ao buscar KPIs no Supabase:', e.message)
      return {
        totalUsers: 0,
        activeUsers: 0,
        blockedUsers: 0,
        totalTopics: 0,
        publishedTopics: 0,
        hiddenTopics: 0,
        totalComments: 0,
        pendingReports: 0,
      }
    }
  },

  // 2. Usuários (100% Supabase Real)
  async getUsers(search = ''): Promise<Profile[]> {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar usuários no Supabase:', error.message)
      throw new Error(error.message)
    }
    
    return (data || []) as Profile[]
  },

  async toggleBlockUser(userId: string): Promise<Profile | null> {
    const { data: user, error: fetchError } = await supabase
      .from('profiles')
      .select('is_blocked')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      console.error('Erro ao buscar status do usuário:', fetchError?.message)
      throw new Error('Usuário não encontrado ou erro na conexão.')
    }

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ is_blocked: !user.is_blocked })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar bloqueio no Supabase:', updateError.message)
      throw new Error(updateError.message)
    }

    return updated as Profile
  },

  async deleteUser(userId: string): Promise<boolean> {
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    
    if (error) {
      console.error('Erro ao excluir usuário no Supabase:', error.message)
      throw new Error(error.message)
    }
    
    return true
  },

  // 3. Tópicos (100% Supabase Real)
  async getTopics(categoryId = '', search = ''): Promise<Topic[]> {
    let query = supabase
      .from('topics')
      .select('*, author:profiles(*), category:categories(*)')
      .order('created_at', { ascending: false })

    if (categoryId) query = query.eq('category_id', categoryId)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (error) {
      console.error('Erro ao buscar tópicos no Supabase:', error.message)
      return []
    }
    return (data || []) as Topic[]
  },

  async togglePublishTopic(topicId: string): Promise<Topic | null> {
    const { data: current, error: fetchError } = await supabase
      .from('topics')
      .select('is_published')
      .eq('id', topicId)
      .single()

    if (fetchError || !current) {
      console.error('Tópico não encontrado:', fetchError?.message)
      return null
    }

    const nextPublished = !current.is_published
    const { data, error } = await supabase
      .from('topics')
      .update({ is_published: nextPublished, updated_at: new Date().toISOString() })
      .eq('id', topicId)
      .select('*, author:profiles(*), category:categories(*)')
      .single()

    if (error) {
      console.error('Erro ao atualizar publicação do tópico:', error.message)
      return null
    }
    return data as Topic
  },

  async deleteTopic(topicId: string): Promise<boolean> {
    const { error } = await supabase.from('topics').delete().eq('id', topicId)
    if (error) {
      console.error('Erro ao deletar tópico no Supabase:', error.message)
      return false
    }
    return true
  },

  // 4. Comentários (100% Supabase Real)
  async getComments(search = ''): Promise<Comment[]> {
    let query = supabase
      .from('comments')
      .select('*, author:profiles(*), topic:topics(id, title, slug)')
      .order('created_at', { ascending: false })

    if (search) query = query.ilike('content', `%${search}%`)
    const { data, error } = await query
    if (error) {
      console.error('Erro ao buscar comentários no Supabase:', error.message)
      return []
    }
    return (data || []) as Comment[]
  },

  async deleteComment(commentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('comments')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', commentId)

    if (error) {
      console.error('Erro ao deletar comentário no Supabase:', error.message)
      return false
    }
    return true
  },

  // 5. Denúncias (100% Supabase Real)
  async getReports(status: ReportStatus = 'pending'): Promise<Report[]> {
    let query = supabase
      .from('reports')
      .select('*, reporter:profiles(*), topic:topics(*), comment:comments(*)')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) {
      console.error('Erro ao buscar denúncias no Supabase:', error.message)
      return []
    }
    return (data || []) as Report[]
  },

  async resolveReport(reportId: string, action: ReportActionTaken): Promise<boolean> {
    const status = action === 'ignored' ? 'ignored' : 'resolved'
    const resolvedAt = new Date().toISOString()

    const { error } = await supabase
      .from('reports')
      .update({
        status,
        action_taken: action,
        resolved_at: resolvedAt,
      })
      .eq('id', reportId)

    if (error) {
      console.error('Erro ao resolver denúncia no Supabase:', error.message)
      return false
    }
    return true
  },

  // 6. Categorias (100% Supabase Real)
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Erro ao carregar categorias no Supabase:', error.message)
      return []
    }
    return (data || []) as Category[]
  },

  async createCategory(payload: { name: string; slug: string; description: string; icon: string }): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        icon: payload.icon || '🤖',
        is_active: true,
        display_order: 99,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar categoria no Supabase:', error.message)
      throw new Error(error.message)
    }
    return data as Category
  },

  async updateCategory(id: string, payload: Partial<Category>): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar categoria no Supabase:', error.message)
      throw new Error(error.message)
    }
    return data as Category
  },

  async toggleCategoryActive(id: string): Promise<Category | null> {
    const { data: cat, error: fetchError } = await supabase
      .from('categories')
      .select('is_active')
      .eq('id', id)
      .single()

    if (fetchError || !cat) {
      console.error('Categoria não encontrada no Supabase:', fetchError?.message)
      return null
    }

    const { data, error } = await supabase
      .from('categories')
      .update({ is_active: !cat.is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao alternar status da categoria:', error.message)
      return null
    }
    return data as Category
  },

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      console.error('Erro ao excluir categoria no Supabase:', error.message)
      return false
    }
    return true
  },
}
