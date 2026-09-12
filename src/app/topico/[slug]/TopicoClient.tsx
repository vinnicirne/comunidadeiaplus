'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import {
  toggleTopicLike,
  toggleTopicSave,
  postComment,
  toggleCommentLike,
  reportContent,
} from '@/lib/actions/topic'

// ── Types ──────────────────────────────────────────────────────────────────
interface Author {
  id?: string
  username?: string
  full_name?: string
  avatar_url?: string | null
  role?: string
}

interface Comment {
  id: string
  topic_id: string
  parent_id: string | null
  content: string
  likes_count: number
  created_at: string
  is_deleted: boolean
  author?: Author
  replies?: Comment[]
}

interface Topic {
  id: string
  slug: string
  title: string
  content: string
  likes_count: number
  comments_count: number
  created_at: string
  category?: { name: string; slug: string; icon?: string }
  author?: Author
}

// ── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ author, size = 10 }: { author?: Author; size?: number }) {
  const letter = author?.username?.slice(0, 1).toUpperCase() || author?.full_name?.slice(0, 1).toUpperCase() || 'A'
  if (author?.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className={`w-${size} h-${size} rounded-full object-cover shadow-sm shrink-0`} src={author.avatar_url} alt={author.username} />
    )
  }
  return (
    <div className={`w-${size} h-${size} rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-sm uppercase shadow-sm shrink-0`}>
      {letter}
    </div>
  )
}

// ── ReportModal ──────────────────────────────────────────────────────────────
function ReportModal({
  topicId, commentId, slug, onClose
}: { topicId?: string; commentId?: string; slug: string; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (topicId) fd.set('topic_id', topicId)
    if (commentId) fd.set('comment_id', commentId)
    fd.set('slug', slug)
    startTransition(async () => {
      await reportContent(fd)
      setSent(true)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md p-space-lg flex flex-col gap-space-md" onClick={e => e.stopPropagation()}>
        {sent ? (
          <div className="flex flex-col items-center gap-space-md py-space-lg text-center">
            <span className="material-symbols-outlined text-[48px] text-primary">check_circle</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Denúncia enviada!</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Nossa equipe de moderação vai analisar em breve.</p>
            <button onClick={onClose} className="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md" type="button">Fechar</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-error text-[20px]">flag</span>
                Denunciar conteúdo
              </h3>
              <button onClick={onClose} type="button" className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold">Motivo *</label>
              <select name="reason" required className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-space-sm rounded-lg outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                <option value="">Selecione um motivo...</option>
                <option value="spam">Spam / Conteúdo publicitário</option>
                <option value="ofensivo">Linguagem ofensiva ou discurso de ódio</option>
                <option value="desinformacao">Desinformação / Fake news</option>
                <option value="propaganda">Propaganda enganosa</option>
                <option value="violacao_privacidade">Violação de privacidade</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold">Detalhes (opcional)</label>
              <textarea name="details" rows={3} className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md p-space-sm rounded-lg outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Descreva brevemente o problema..."></textarea>
            </div>
            <div className="flex items-center justify-end gap-space-sm">
              <button onClick={onClose} type="button" className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors">Cancelar</button>
              <button type="submit" disabled={isPending} className="px-space-md py-2 rounded-lg bg-error text-on-error font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-60">
                {isPending ? 'Enviando...' : 'Enviar denúncia'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── CommentBox ───────────────────────────────────────────────────────────────
function CommentBox({
  topicId, slug, parentId, userInitials, onCancel
}: {
  topicId: string; slug: string; parentId?: string; userInitials?: string; onCancel?: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await postComment(fd)
      if (textareaRef.current) textareaRef.current.value = ''
      if (onCancel) onCancel()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container border border-outline-variant rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
      <input type="hidden" name="topic_id" value={topicId} />
      <input type="hidden" name="slug" value={slug} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}
      <div className="flex items-start gap-space-sm">
        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-sm font-bold shrink-0">
          {userInitials || '?'}
        </div>
        <div className="flex-1 flex flex-col gap-space-xs">
          <textarea
            ref={textareaRef}
            name="content"
            required
            minLength={3}
            className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md p-space-sm rounded-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 resize-none transition-all"
            placeholder={parentId ? "Escreva sua resposta..." : "Escreva um comentário construtivo..."}
            rows={2}
          />
          <div className="flex items-center justify-between pt-space-xs">
            <div className="flex items-center gap-1 text-outline">
              <button className="p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Negrito" type="button">
                <span className="material-symbols-outlined text-[18px]">format_bold</span>
              </button>
              <button className="p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Código" type="button">
                <span className="material-symbols-outlined text-[18px]">code</span>
              </button>
              <button className="p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Link" type="button">
                <span className="material-symbols-outlined text-[18px]">link</span>
              </button>
            </div>
            <div className="flex items-center gap-space-sm">
              {onCancel && (
                <button onClick={onCancel} type="button" className="px-space-sm py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-high transition-colors">
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={isPending} className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm disabled:opacity-60">
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>{isPending ? 'Enviando...' : parentId ? 'Responder' : 'Comentar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

// ── CommentItem (recursive) ───────────────────────────────────────────────────
function CommentItem({
  comment, topicId, slug, user, depth = 0
}: {
  comment: Comment; topicId: string; slug: string; user: any; depth?: number
}) {
  const [replying, setReplying] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.likes_count || 0)
  const [liked, setLiked] = useState(false)
  const [isPending, startTransition] = useTransition()
  const maxDepth = 4

  const handleLike = () => {
    if (!user) return
    const next = liked ? likeCount - 1 : likeCount + 1
    setLiked(!liked)
    setLikeCount(next)
    startTransition(() => toggleCommentLike(comment.id, slug))
  }

  return (
    <div className={`flex flex-col ${depth > 0 ? 'relative ml-5 sm:ml-7 pl-4 sm:pl-6 mt-space-sm' : 'mt-space-md'}`}>
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-3 w-[2px] bg-surface-container-high rounded-full"></div>
      )}
      {depth > 0 && (
        <div className="absolute -left-[0px] top-6 w-4 sm:w-6 h-[2px] bg-surface-container-high"></div>
      )}
      <div className="bg-surface-container border border-outline-variant rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <Avatar author={comment.author} size={depth > 0 ? 8 : 9} />
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  {comment.author?.full_name || comment.author?.username}
                </span>
                <span className="font-body-sm text-body-sm text-outline">@{comment.author?.username}</span>
                {comment.author?.role === 'admin' && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary-container text-on-primary-container">Admin</span>
                )}
              </div>
              <span className="font-label-sm text-label-sm text-outline">
                {new Date(comment.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          <button onClick={() => setShowReport(true)} className="text-outline hover:text-error p-1 rounded hover:bg-surface-container transition-colors" type="button" title="Denunciar comentário">
            <span className="material-symbols-outlined text-[18px]">flag</span>
          </button>
        </div>

        <p className={`font-body-md text-body-md text-on-surface whitespace-pre-wrap ${depth > 0 ? '' : 'pl-10 sm:pl-11'}`}>
          {comment.content}
        </p>

        <div className={`flex items-center gap-space-md pt-space-xs ${depth > 0 ? '' : 'pl-10 sm:pl-11'}`}>
          <button
            onClick={handleLike}
            disabled={!user || isPending}
            className={`inline-flex items-center gap-1 font-label-sm text-label-sm transition-colors ${liked ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'}`}
            type="button"
            title={user ? 'Curtir comentário' : 'Faça login para curtir'}
          >
            <span className="material-symbols-outlined text-[16px]" style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
            <span>{likeCount}</span>
          </button>

          {user && depth < maxDepth && (
            <button onClick={() => setReplying(!replying)} className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" type="button">
              <span className="material-symbols-outlined text-[16px]">reply</span>
              <span>Responder</span>
            </button>
          )}
        </div>

        {replying && user && (
          <div className={depth > 0 ? '' : 'pl-10 sm:pl-11'}>
            <CommentBox
              topicId={topicId}
              slug={slug}
              parentId={comment.id}
              userInitials={user.email?.slice(0, 2).toUpperCase()}
              onCancel={() => setReplying(false)}
            />
          </div>
        )}
      </div>

      {/* Replies recursivas */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="flex flex-col">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} topicId={topicId} slug={slug} user={user} depth={depth + 1} />
          ))}
        </div>
      )}

      {showReport && (
        <ReportModal commentId={comment.id} slug={slug} onClose={() => setShowReport(false)} />
      )}
    </div>
  )
}

// ── Main Client Component ────────────────────────────────────────────────────
export default function TopicoClient({
  topic,
  comments,
  user,
  userLiked = false,
  userSaved = false,
}: {
  topic: Topic
  comments: Comment[]
  user: any
  userLiked?: boolean
  userSaved?: boolean
}) {
  const [liked, setLiked] = useState(userLiked)
  const [likeCount, setLikeCount] = useState(topic.likes_count || 0)
  const [saved, setSaved] = useState(userSaved)
  const [showReport, setShowReport] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [shareCopied, setShareCopied] = useState(false)

  // Build comment tree
  const topLevel = comments.filter(c => !c.parent_id)
  const buildTree = (root: Comment): Comment => {
    const children = comments.filter(c => c.parent_id === root.id)
    return { ...root, replies: children.map(buildTree) }
  }
  const commentTree = topLevel.map(buildTree)

  const handleLike = () => {
    if (!user) return
    const next = liked ? likeCount - 1 : likeCount + 1
    setLiked(!liked)
    setLikeCount(next)
    startTransition(() => toggleTopicLike(topic.id, topic.slug))
  }

  const handleSave = () => {
    if (!user) return
    setSaved(!saved)
    startTransition(() => toggleTopicSave(topic.id, topic.slug))
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/topico/${topic.slug}`
    if (navigator.share) {
      try {
        await navigator.share({ title: topic.title, url })
      } catch (_) { /* usuário cancelou */ }
    } else {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2500)
    }
  }

  return (
    <>
      <div className="flex flex-col w-full gap-space-lg">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
          <Link className="hover:text-primary transition-colors" href="/">Início</Link>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          {topic.category && (
            <>
              <Link className="hover:text-primary transition-colors" href={`/categoria/${topic.category.slug}`}>{topic.category.name}</Link>
              <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            </>
          )}
          <span className="text-on-surface font-semibold truncate max-w-[200px] sm:max-w-xs">{topic.title}</span>
        </nav>

        {/* Article */}
        <article className="bg-surface-container border border-outline-variant rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16"></div>
          
          {/* Header */}
          <div className="flex flex-col gap-space-sm relative z-10">
            <div className="flex flex-wrap items-center gap-space-sm">
              {topic.category && (
                <span className="px-space-sm py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <span>{topic.category.icon || '📂'}</span>
                  {topic.category.name}
                </span>
              )}
              <span className="text-outline text-label-sm">·</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                {new Date(topic.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">{topic.title}</h1>
          </div>

          {/* Author */}
          <div className="flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="relative">
                <Avatar author={topic.author} size={11} />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full ring-2 ring-surface-container-lowest"></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    {topic.author?.full_name || topic.author?.username || 'Membro'}
                  </span>
                  <span className="font-body-sm text-body-sm text-outline">@{topic.author?.username}</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {topic.author?.role === 'admin' ? 'Admin' : 'Membro'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                onClick={handleSave}
                disabled={!user || isPending}
                className={`p-space-xs rounded-lg transition-colors ${saved ? 'text-primary bg-primary-fixed' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'}`}
                title={saved ? 'Remover dos salvos' : 'Salvar discussão'}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]" style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}>bookmark</span>
              </button>
              <button
                onClick={() => setShowReport(true)}
                className="p-space-xs text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                title="Mais opções"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">more_horiz</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div 
            className="font-body-lg text-body-lg text-on-surface leading-relaxed flex flex-col gap-space-md whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ 
              __html: topic.content
                // Headers (h3)
                .replace(/### (.*)/g, '<h3 class="font-headline-sm text-headline-sm font-semibold mt-4 mb-2">$1</h3>')
                // Bold
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                // Italic (evitar conflito com bold)
                .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
                // Links/Buttons
                .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, (match, text, url) => {
                  if (text.includes('Baixar')) {
                    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 mt-2 bg-primary text-on-primary rounded-lg font-label-md shadow-sm hover:opacity-90 transition-opacity no-underline"><span class="material-symbols-outlined text-[18px]">download</span> ${text}</a>`;
                  }
                  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold">${text}</a>`;
                })
            }}
          />

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-space-md bg-surface-container-high/40 border-t border-outline-variant -mx-space-lg -mb-space-lg px-space-lg py-space-md mt-space-xs">
            <div className="flex items-center gap-space-xs sm:gap-space-sm">
              {/* Like */}
              <button
                onClick={handleLike}
                disabled={!user || isPending}
                className={`inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-lg font-label-md text-label-md shadow-sm transition-all ${liked ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary hover:bg-primary hover:text-on-primary border border-outline-variant'}`}
                type="button"
                title={user ? (liked ? 'Remover curtida' : 'Curtir') : 'Faça login para curtir'}
              >
                <span className="material-symbols-outlined text-[18px]" style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                <span>{likeCount}</span>
              </button>

              {/* Comentários count */}
              <a
                href="#comentarios"
                className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant font-label-md text-label-md shadow-sm hover:text-on-surface hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                <span>{comments.length}</span>
              </a>

              {/* Compartilhar */}
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant font-label-md text-label-md shadow-sm hover:text-on-surface hover:bg-surface-container-high transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">{shareCopied ? 'check' : 'share'}</span>
                <span className="hidden sm:inline">{shareCopied ? 'Link copiado!' : 'Compartilhar'}</span>
              </button>
            </div>

            {/* Denunciar */}
            <button
              onClick={() => setShowReport(true)}
              className="inline-flex items-center gap-1 text-outline hover:text-error font-label-sm text-label-sm px-space-xs py-1 rounded transition-colors"
              title="Denunciar conteúdo"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">flag</span>
              <span className="hidden md:inline">Denunciar</span>
            </button>
          </div>
        </article>

        {/* Comments Section */}
        <section id="comentarios" className="flex flex-col gap-space-md mt-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">{comments.length} comentários</h2>
              <span className="w-2 h-2 rounded-full bg-primary"></span>
            </div>
          </div>

          {/* New Comment Box */}
          {user ? (
            <CommentBox
              topicId={topic.id}
              slug={topic.slug}
              userInitials={user.email?.slice(0, 2).toUpperCase()}
            />
          ) : (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md text-center">
              <p className="text-on-surface-variant font-body-md mb-3">Faça login para participar da discussão.</p>
              <Link href="/login" className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm">
                Entrar na Comunidade
              </Link>
            </div>
          )}

          {/* Comment Tree */}
          <div className="flex flex-col">
            {commentTree.length === 0 ? (
              <div className="p-8 rounded-2xl bg-surface-container-lowest text-center text-on-surface-variant font-body-md">
                Nenhum comentário ainda. Seja o primeiro a responder!
              </div>
            ) : (
              commentTree.map((c) => (
                <CommentItem key={c.id} comment={c} topicId={topic.id} slug={topic.slug} user={user} />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Report Modal - Tópico */}
      {showReport && (
        <ReportModal topicId={topic.id} slug={topic.slug} onClose={() => setShowReport(false)} />
      )}
    </>
  )
}
