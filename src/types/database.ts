export type UserRole = 'user' | 'moderator' | 'admin'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  role: UserRole
  is_blocked: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  topics_count?: number
}

export interface Topic {
  id: string
  author_id: string
  category_id: string
  title: string
  slug: string
  content: string
  is_published: boolean
  views_count: number
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  author?: Profile
  category?: Category
}

export interface Comment {
  id: string
  topic_id: string
  author_id: string
  parent_id: string | null
  content: string
  is_deleted: boolean
  likes_count: number
  created_at: string
  updated_at: string
  author?: Profile
  topic?: {
    id: string
    title: string
    slug: string
  }
}

export type ReportReason =
  | 'spam'
  | 'ofensivo'
  | 'propaganda'
  | 'conteudo_inadequado'
  | 'outro'

export type ReportStatus = 'pending' | 'resolved' | 'ignored'
export type ReportActionTaken = 'ignored' | 'content_deleted' | 'user_blocked'

export interface Report {
  id: string
  reporter_id: string
  topic_id: string | null
  comment_id: string | null
  reason: ReportReason
  details: string | null
  status: ReportStatus
  action_taken: ReportActionTaken | null
  reviewed_by: string | null
  created_at: string
  resolved_at: string | null
  reporter?: Profile
  topic?: Topic
  comment?: Comment
}

export interface AdminKPIs {
  totalUsers: number
  activeUsers: number
  blockedUsers: number
  totalTopics: number
  publishedTopics: number
  hiddenTopics: number
  totalComments: number
  pendingReports: number
}

export interface Article {
  id: string
  author_id: string
  title: string
  subtitle: string | null
  content: string
  slug: string
  cover_image_url: string | null
  tags: string[]
  is_published: boolean
  published_at: string | null
  views_count: number
  likes_count: number
  created_at: string
  updated_at: string
  author?: Profile
}
