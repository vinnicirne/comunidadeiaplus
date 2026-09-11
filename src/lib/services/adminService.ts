import { Profile, Category, Topic, Comment, Report, AdminKPIs, ReportActionTaken } from '@/types/database'
import { supabase } from '@/lib/supabase/client'

// Dados iniciais coerentes com o PRD da COMUNIDADE IAPLUS
let mockProfiles: Profile[] = [
  {
    id: 'usr-1',
    username: 'joaosilva',
    full_name: 'João Silva',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    bio: 'Desenvolvedor e entusiasta de IA e Vibe Coding.',
    role: 'admin',
    is_blocked: false,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'usr-2',
    username: 'mariasantos',
    full_name: 'Maria Santos',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    bio: 'Engenheira de Software focada em React e LLMs.',
    role: 'user',
    is_blocked: false,
    created_at: '2026-03-02T14:30:00Z',
    updated_at: '2026-03-02T14:30:00Z',
  },
  {
    id: 'usr-3',
    username: 'pedroalves',
    full_name: 'Pedro Alves',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    bio: 'Criador de conteúdo e automações com IA.',
    role: 'user',
    is_blocked: false,
    created_at: '2026-03-03T09:15:00Z',
    updated_at: '2026-03-03T09:15:00Z',
  },
  {
    id: 'usr-4',
    username: 'spambot99',
    full_name: 'Super Promoções IA',
    avatar_url: null,
    bio: 'Compre créditos de IA mais baratos aqui!',
    role: 'user',
    is_blocked: false,
    created_at: '2026-03-10T22:10:00Z',
    updated_at: '2026-03-10T22:10:00Z',
  },
]

let mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'IA Geral',
    slug: 'ia-geral',
    description: 'Discussões gerais, novidades e modelos de IA.',
    icon: '🤖',
    is_active: true,
    display_order: 1,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    topics_count: 14,
  },
  {
    id: 'cat-2',
    name: 'Programação',
    slug: 'programacao',
    description: 'Vibe coding, desenvolvimento de software e agentes.',
    icon: '💻',
    is_active: true,
    display_order: 2,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    topics_count: 28,
  },
  {
    id: 'cat-3',
    name: 'Imagens e Vídeos',
    slug: 'imagens-e-videos',
    description: 'Modelos de difusão, geração de mídia e arte digital.',
    icon: '🎨',
    is_active: true,
    display_order: 3,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    topics_count: 19,
  },
  {
    id: 'cat-4',
    name: 'Negócios',
    slug: 'negocios',
    description: 'Automação corporativa, SaaS, produtividade e vendas.',
    icon: '💼',
    is_active: true,
    display_order: 4,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    topics_count: 11,
  },
]

let mockTopics: Topic[] = [
  {
    id: 'top-1',
    author_id: 'usr-1',
    category_id: 'cat-2',
    title: 'Qual a melhor IA para criar aplicativos atualmente?',
    slug: 'qual-a-melhor-ia-para-criar-aplicativos-atualmente',
    content: 'Estou começando a desenvolver aplicativos usando IA. Queria saber qual ferramenta vocês recomendam e por quê.',
    is_published: true,
    views_count: 342,
    likes_count: 124,
    comments_count: 38,
    created_at: '2026-03-05T11:20:00Z',
    updated_at: '2026-03-05T11:20:00Z',
    author: mockProfiles[0],
    category: mockCategories[1],
  },
  {
    id: 'top-2',
    author_id: 'usr-2',
    category_id: 'cat-2',
    title: 'Claude 3.7 Sonnet vs Gemini 2.0 Flash para desenvolvimento Fullstack',
    slug: 'claude-vs-gemini-para-desenvolvimento-fullstack',
    content: 'Fiz benchmarks criando um CRUD em Next.js e Supabase. O Claude gerou menos erros de tipagem, mas o Gemini foi 3x mais rápido.',
    is_published: true,
    views_count: 512,
    likes_count: 89,
    comments_count: 21,
    created_at: '2026-03-06T15:45:00Z',
    updated_at: '2026-03-06T15:45:00Z',
    author: mockProfiles[1],
    category: mockCategories[1],
  },
  {
    id: 'top-3',
    author_id: 'usr-4',
    category_id: 'cat-4',
    title: 'GANHE 10 MIL POR MÊS NO AUTOMÁTICO CLICANDO AQUI',
    slug: 'ganhe-10-mil-por-mes-no-automatico',
    content: 'Acesse o link suspeito e compre meu curso milagroso de IA antes que acabe.',
    is_published: false,
    views_count: 12,
    likes_count: 0,
    comments_count: 1,
    created_at: '2026-03-10T22:15:00Z',
    updated_at: '2026-03-10T22:15:00Z',
    author: mockProfiles[3],
    category: mockCategories[3],
  },
]

let mockComments: Comment[] = [
  {
    id: 'com-1',
    topic_id: 'top-1',
    author_id: 'usr-2',
    parent_id: null,
    content: 'Eu acho o Claude muito superior para arquitetura de código e React.',
    is_deleted: false,
    likes_count: 19,
    created_at: '2026-03-05T11:35:00Z',
    updated_at: '2026-03-05T11:35:00Z',
    author: mockProfiles[1],
    topic: {
      id: 'top-1',
      title: 'Qual a melhor IA para criar aplicativos atualmente?',
      slug: 'qual-a-melhor-ia-para-criar-aplicativos-atualmente',
    },
  },
  {
    id: 'com-2',
    topic_id: 'top-1',
    author_id: 'usr-3',
    parent_id: 'com-1',
    content: 'Concordo! E usando em conjunto com o Cursor fica imbatível.',
    is_deleted: false,
    likes_count: 12,
    created_at: '2026-03-05T11:42:00Z',
    updated_at: '2026-03-05T11:42:00Z',
    author: mockProfiles[2],
    topic: {
      id: 'top-1',
      title: 'Qual a melhor IA para criar aplicativos atualmente?',
      slug: 'qual-a-melhor-ia-para-criar-aplicativos-atualmente',
    },
  },
  {
    id: 'com-3',
    topic_id: 'top-2',
    author_id: 'usr-4',
    parent_id: null,
    content: 'Quer IA de graça? Acesse meu link no perfil e ganhe bônus!',
    is_deleted: false,
    likes_count: 0,
    created_at: '2026-03-10T22:20:00Z',
    updated_at: '2026-03-10T22:20:00Z',
    author: mockProfiles[3],
    topic: {
      id: 'top-2',
      title: 'Claude 3.7 Sonnet vs Gemini 2.0 Flash para desenvolvimento Fullstack',
      slug: 'claude-vs-gemini-para-desenvolvimento-fullstack',
    },
  },
]

let mockReports: Report[] = [
  {
    id: 'rep-1',
    reporter_id: 'usr-2',
    topic_id: 'top-3',
    comment_id: null,
    reason: 'spam',
    details: 'Tópico de golpe/venda de curso falso.',
    status: 'pending',
    action_taken: null,
    reviewed_by: null,
    created_at: '2026-03-10T22:30:00Z',
    resolved_at: null,
    reporter: mockProfiles[1],
    topic: mockTopics[2],
  },
  {
    id: 'rep-2',
    reporter_id: 'usr-1',
    topic_id: null,
    comment_id: 'com-3',
    reason: 'propaganda',
    details: 'Comentário divulgando link de afiliado sem contexto.',
    status: 'pending',
    action_taken: null,
    reviewed_by: null,
    created_at: '2026-03-10T22:35:00Z',
    resolved_at: null,
    reporter: mockProfiles[0],
    comment: mockComments[2],
  },
]

const isRealSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return url && !url.includes('mock') && !url.includes('seu-projeto')
}

export const adminService = {
  // 1. Dashboard KPIs
  async getKPIs(): Promise<AdminKPIs> {
    if (isRealSupabaseConfigured()) {
      try {
        const [
          { count: usersCount },
          { count: blockedCount },
          { count: topicsCount },
          { count: hiddenTopicsCount },
          { count: commentsCount },
          { count: pendingReportsCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_blocked', true),
          supabase.from('topics').select('*', { count: 'exact', head: true }),
          supabase.from('topics').select('*', { count: 'exact', head: true }).eq('is_published', false),
          supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
          supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ])

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
      } catch (err) {
        console.warn('Erro ao consultar Supabase, usando fallback local:', err)
      }
    }

    const totalUsers = mockProfiles.length
    const blockedUsers = mockProfiles.filter((u) => u.is_blocked).length
    const totalTopics = mockTopics.length
    const hiddenTopics = mockTopics.filter((t) => !t.is_published).length

    return {
      totalUsers,
      activeUsers: totalUsers - blockedUsers,
      blockedUsers,
      totalTopics,
      publishedTopics: totalTopics - hiddenTopics,
      hiddenTopics,
      totalComments: mockComments.filter((c) => !c.is_deleted).length,
      pendingReports: mockReports.filter((r) => r.status === 'pending').length,
    }
  },

  // 2. Usuários
  async getUsers(search = ''): Promise<Profile[]> {
    if (isRealSupabaseConfigured()) {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (search) {
        query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`)
      }
      const { data } = await query
      if (data) return data as Profile[]
    }

    if (!search) return [...mockProfiles]
    const term = search.toLowerCase()
    return mockProfiles.filter(
      (u) =>
        u.username.toLowerCase().includes(term) ||
        (u.full_name && u.full_name.toLowerCase().includes(term))
    )
  },

  async toggleBlockUser(userId: string): Promise<Profile | null> {
    const user = mockProfiles.find((u) => u.id === userId)
    if (!user) return null
    user.is_blocked = !user.is_blocked
    user.updated_at = new Date().toISOString()

    if (isRealSupabaseConfigured()) {
      await supabase.from('profiles').update({ is_blocked: user.is_blocked }).eq('id', userId)
    }
    return { ...user }
  },

  async deleteUser(userId: string): Promise<boolean> {
    mockProfiles = mockProfiles.filter((u) => u.id !== userId)
    mockTopics = mockTopics.filter((t) => t.author_id !== userId)
    mockComments = mockComments.filter((c) => c.author_id !== userId)

    if (isRealSupabaseConfigured()) {
      await supabase.from('profiles').delete().eq('id', userId)
    }
    return true
  },

  // 3. Tópicos
  async getTopics(categoryId = '', search = ''): Promise<Topic[]> {
    if (isRealSupabaseConfigured()) {
      let query = supabase
        .from('topics')
        .select('*, author:profiles(*), category:categories(*)')
        .order('created_at', { ascending: false })

      if (categoryId) query = query.eq('category_id', categoryId)
      if (search) query = query.ilike('title', `%${search}%`)

      const { data } = await query
      if (data) return data as Topic[]
    }

    return mockTopics.filter((t) => {
      const matchCategory = categoryId ? t.category_id === categoryId : true
      const matchSearch = search ? t.title.toLowerCase().includes(search.toLowerCase()) : true
      return matchCategory && matchSearch
    })
  },

  async togglePublishTopic(topicId: string): Promise<Topic | null> {
    const topic = mockTopics.find((t) => t.id === topicId)
    if (!topic) return null
    topic.is_published = !topic.is_published
    topic.updated_at = new Date().toISOString()

    if (isRealSupabaseConfigured()) {
      await supabase.from('topics').update({ is_published: topic.is_published }).eq('id', topicId)
    }
    return { ...topic }
  },

  async deleteTopic(topicId: string): Promise<boolean> {
    mockTopics = mockTopics.filter((t) => t.id !== topicId)
    mockComments = mockComments.filter((c) => c.topic_id !== topicId)
    mockReports = mockReports.filter((r) => r.topic_id !== topicId)

    if (isRealSupabaseConfigured()) {
      await supabase.from('topics').delete().eq('id', topicId)
    }
    return true
  },

  // 4. Comentários
  async getComments(search = ''): Promise<Comment[]> {
    if (isRealSupabaseConfigured()) {
      let query = supabase
        .from('comments')
        .select('*, author:profiles(*), topic:topics(id, title, slug)')
        .order('created_at', { ascending: false })

      if (search) query = query.ilike('content', `%${search}%`)
      const { data } = await query
      if (data) return data as Comment[]
    }

    return mockComments.filter((c) => {
      if (c.is_deleted) return false
      return search ? c.content.toLowerCase().includes(search.toLowerCase()) : true
    })
  },

  async deleteComment(commentId: string): Promise<boolean> {
    const comment = mockComments.find((c) => c.id === commentId)
    if (comment) {
      comment.is_deleted = true
      comment.updated_at = new Date().toISOString()
    }
    mockReports = mockReports.filter((r) => r.comment_id !== commentId)

    if (isRealSupabaseConfigured()) {
      await supabase.from('comments').delete().eq('id', commentId)
    }
    return true
  },

  // 5. Denúncias (Moderação Rápida)
  async getReports(status: ReportStatus = 'pending'): Promise<Report[]> {
    if (isRealSupabaseConfigured()) {
      const { data } = await supabase
        .from('reports')
        .select('*, reporter:profiles(*), topic:topics(*), comment:comments(*)')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (data) return data as Report[]
    }

    return mockReports.filter((r) => (status ? r.status === status : true))
  },

  async resolveReport(reportId: string, action: ReportActionTaken): Promise<boolean> {
    const report = mockReports.find((r) => r.id === reportId)
    if (!report) return false

    report.status = action === 'ignored' ? 'ignored' : 'resolved'
    report.action_taken = action
    report.resolved_at = new Date().toISOString()

    if (action === 'content_deleted') {
      if (report.topic_id) {
        await this.deleteTopic(report.topic_id)
      } else if (report.comment_id) {
        await this.deleteComment(report.comment_id)
      }
    } else if (action === 'user_blocked') {
      let authorId: string | null = null
      if (report.topic) authorId = report.topic.author_id
      if (report.comment) authorId = report.comment.author_id
      if (authorId) {
        await this.toggleBlockUser(authorId)
      }
      if (report.topic_id) await this.deleteTopic(report.topic_id)
      if (report.comment_id) await this.deleteComment(report.comment_id)
    }

    if (isRealSupabaseConfigured()) {
      await supabase
        .from('reports')
        .update({
          status: report.status,
          action_taken: report.action_taken,
          resolved_at: report.resolved_at,
        })
        .eq('id', reportId)
    }

    return true
  },

  // 6. Categorias
  async getCategories(): Promise<Category[]> {
    if (isRealSupabaseConfigured()) {
      const { data } = await supabase.from('categories').select('*').order('display_order', { ascending: true })
      if (data) return data as Category[]
    }

    return [...mockCategories]
  },

  async createCategory(payload: { name: string; slug: string; description: string; icon: string }): Promise<Category> {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      icon: payload.icon || '🤖',
      is_active: true,
      display_order: mockCategories.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      topics_count: 0,
    }

    mockCategories.push(newCategory)

    if (isRealSupabaseConfigured()) {
      const { data } = await supabase.from('categories').insert(newCategory).select().single()
      if (data) return data as Category
    }

    return newCategory
  },

  async updateCategory(id: string, payload: Partial<Category>): Promise<Category | null> {
    const cat = mockCategories.find((c) => c.id === id)
    if (!cat) return null

    Object.assign(cat, payload, { updated_at: new Date().toISOString() })

    if (isRealSupabaseConfigured()) {
      await supabase.from('categories').update(payload).eq('id', id)
    }

    return { ...cat }
  },

  async toggleCategoryActive(id: string): Promise<Category | null> {
    const cat = mockCategories.find((c) => c.id === id)
    if (!cat) return null
    cat.is_active = !cat.is_active
    cat.updated_at = new Date().toISOString()

    if (isRealSupabaseConfigured()) {
      await supabase.from('categories').update({ is_active: cat.is_active }).eq('id', id)
    }

    return { ...cat }
  },

  async deleteCategory(id: string): Promise<boolean> {
    mockCategories = mockCategories.filter((c) => c.id !== id)

    if (isRealSupabaseConfigured()) {
      await supabase.from('categories').delete().eq('id', id)
    }
    return true
  },
}
