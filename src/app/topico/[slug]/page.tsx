import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Share2,
  Flag,
  Clock,
  Shield,
  Bot,
  CornerDownRight,
} from 'lucide-react'
import { adminService } from '@/lib/services/adminService'

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    slug: string
  }
}

export default async function TopicPage({ params }: Props) {
  const topics = await adminService.getTopics()
  const topic = topics.find((t) => t.slug === params.slug)

  if (!topic) {
    notFound()
  }

  const allComments = await adminService.getComments()
  const topicComments = allComments.filter((c) => c.topic_id === topic.id && !c.is_deleted)

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para as Discussões</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-indigo-400 font-semibold hover:border-indigo-500/50 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        </div>
      </header>

      {/* Main Topic Container */}
      <main className="max-w-4xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
        {/* Main Topic Card */}
        <article className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {topic.author?.avatar_url ? (
                <img
                  src={topic.author.avatar_url}
                  alt={topic.author.username}
                  className="w-11 h-11 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                  {topic.author?.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-bold text-sm text-white">
                  {topic.author?.full_name || topic.author?.username}
                </div>
                <div className="text-xs text-slate-400">
                  @{topic.author?.username} ·{' '}
                  {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              {topic.category?.icon} {topic.category?.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            {topic.title}
          </h1>

          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line border-t border-b border-slate-800/80 py-6">
            {topic.content}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold border border-slate-700 transition-colors">
                <ThumbsUp className="w-4 h-4 text-cyan-400" />
                <span>{topic.likes_count} Curtidas</span>
              </button>
              <span className="flex items-center gap-1.5 text-slate-300">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>{topic.comments_count} Comentários</span>
              </span>
            </div>

            <button className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors">
              <Flag className="w-3.5 h-3.5" />
              <span>Denunciar</span>
            </button>
          </div>
        </article>

        {/* Comments Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <span>Respostas da Comunidade ({topicComments.length})</span>
          </h3>

          <div className="space-y-3">
            {topicComments.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/30 border border-slate-800 text-center text-slate-400 text-xs">
                Nenhum comentário nesta discussão ainda. Seja o primeiro a responder!
              </div>
            ) : (
              topicComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 ${
                    comment.parent_id ? 'ml-6 border-l-2 border-l-indigo-500/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">
                        @{comment.author?.username}
                      </span>
                      {comment.author?.role === 'admin' && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Admin
                        </span>
                      )}
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-500">
                        {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <button className="text-slate-500 hover:text-rose-400 transition-colors">
                      <Flag className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                      <ThumbsUp className="w-3 h-3 text-cyan-400" />
                      <span>{comment.likes_count}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                      <CornerDownRight className="w-3 h-3 text-indigo-400" />
                      <span>Responder</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
