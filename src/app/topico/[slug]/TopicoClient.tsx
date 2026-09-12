'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  toggleTopicLike,
  toggleTopicSave,
  postComment,
  toggleCommentLike,
  reportContent,
  deleteTopic,
  deleteComment,
  updateTopic,
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
  author_id?: string
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
  author_id?: string
  category?: { name: string; slug: string; icon?: string }
  author?: Author
}

// ── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ author, size = 10 }: { author?: Author; size?: number }) {
  const letter = author?.username?.slice(0, 1).toUpperCase() || author?.full_name?.slice(0, 1).toUpperCase() || 'M'
  if (author?.avatar_url) {
    return (
      <img
        className={`w-${size} h-${size} rounded-full object-cover shadow-sm shrink-0`}
        src={author.avatar_url}
        alt={author.username || 'Avatar'}
      />
    )
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0`}
    >
      {letter}
    </div>
  )
}

// ── Markdown Parser Robusto ──────────────────────────────────────────────────
function renderMarkdown(content: string) {
  if (!content) return ''

  let html = content
    // Escapar tags HTML perigosas básicas mantendo texto
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Blocos de código ```lang ... ```
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `<div class="my-4 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-sm">
      <div class="flex items-center justify-between px-4 py-2 bg-surface-container border-b border-outline-variant/20 text-on-surface-variant font-mono text-xs">
        <span>${lang || 'código'}</span>
      </div>
      <pre class="p-4 overflow-x-auto text-on-surface font-mono text-sm leading-relaxed scrollbar-none"><code>${code.trim()}</code></pre>
    </div>`
  })

  // Código inline `code`
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-xs border border-outline-variant/20">$1</code>')

  // Imagens Markdown ![alt](url)
  html = html.replace(/!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g, '<div class="my-4 rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm max-w-full"><img src="$2" alt="$1" class="w-full max-h-[500px] object-cover" loading="lazy" /></div>')

  // Headers (H1, H2, H3)
  html = html.replace(/^### (.*$)/gim, '<h3 class="font-headline-sm text-headline-sm font-semibold text-on-surface mt-4 mb-2 tracking-tight">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="font-headline-md text-headline-md font-bold text-on-surface mt-6 mb-3 tracking-tight">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="font-headline-lg text-headline-lg font-bold text-on-surface mt-6 mb-3 tracking-tight">$1</h1>')

  // Citações (> quote)
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-1 my-3 text-on-surface-variant italic font-body-md">$1</blockquote>')

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-on-surface">$1</strong>')
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="italic text-on-surface">$1</em>')

  // Links e Botões de Download
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, (_match, text, url) => {
    if (text.toLowerCase().includes('baixar') || text.toLowerCase().includes('download')) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 my-2 bg-primary text-on-primary rounded-lg font-label-md shadow-sm hover:opacity-90 transition-opacity no-underline"><span class="material-symbols-outlined text-[18px]">download</span> ${text}</a>`
    }
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold break-all">${text}</a>`
  })

  // Listas não ordenadas
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="flex items-start gap-2 ml-2 my-1 text-on-surface"><span class="text-primary mt-1.5">•</span><span>$1</span></li>')

  // Quebras de linha normais
  html = html.replace(/\n/g, '<br />')

  return html
}

// ── ReportModal ──────────────────────────────────────────────────────────────
function ReportModal({
  topicId,
  commentId,
  slug,
  onClose,
}: {
  topicId?: string
  commentId?: string
  slug: string
  onClose: () => void
}) {
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
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl w-full max-w-md p-space-lg flex flex-col gap-space-md" onClick={e => e.stopPropagation()}>
        {sent ? (
          <div className="flex flex-col items-center gap-space-md py-space-lg text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Denúncia enviada!</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Nossa equipe de moderação irá avaliar o conteúdo reportado.</p>
            <button onClick={onClose} className="px-space-lg py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors" type="button">
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-error text-[20px]">flag</span>
                <span>Denunciar conteúdo</span>
              </h3>
              <button onClick={onClose} type="button" className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold">Motivo *</label>
              <select name="reason" required className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-sm text-body-sm px-space-md py-2.5 rounded-lg outline-none focus:ring-1 focus:ring-primary">
                <option value="">Selecione um motivo...</option>
                <option value="spam">Spam / Conteúdo não relacionado</option>
                <option value="ofensivo">Linguagem ofensiva ou assédio</option>
                <option value="desinformacao">Desinformação / Conteúdo falso</option>
                <option value="violacao_privacidade">Violação de privacidade</option>
                <option value="outro">Outro motivo</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold">Detalhes (opcional)</label>
              <textarea name="details" rows={3} className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-outline font-body-sm text-body-sm p-space-sm rounded-lg outline-none focus:ring-1 focus:ring-primary resize-none" placeholder="Forneça contexto para a moderação..."></textarea>
            </div>
            <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-outline-variant/20">
              <button onClick={onClose} type="button" className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isPending} className="px-space-md py-2 rounded-lg bg-error text-on-error font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-60 font-semibold">
                {isPending ? 'Enviando...' : 'Enviar denúncia'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── CommentBox Reativo com Toolbar Funcional ──────────────────────────────────
function CommentBox({
  topicId,
  slug,
  parentId,
  userInitials,
  onCancel,
  onCommentPosted,
}: {
  topicId: string
  slug: string
  parentId?: string
  userInitials?: string
  onCancel?: () => void
  onCommentPosted?: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = (syntax: string, defaultText = '') => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = textarea.value.substring(start, end) || defaultText

    let replacement = ''
    let cursorOffset = 0

    if (syntax === 'bold') {
      replacement = `**${selected}**`
      cursorOffset = 2
    } else if (syntax === 'italic') {
      replacement = `*${selected}*`
      cursorOffset = 1
    } else if (syntax === 'code') {
      replacement = `\`${selected}\``
      cursorOffset = 1
    } else if (syntax === 'codeblock') {
      replacement = `\n\`\`\`javascript\n${selected || '// seu código aqui'}\n\`\`\`\n`
      cursorOffset = 15
    } else if (syntax === 'link') {
      replacement = `[${selected || 'texto do link'}](https://)`
      cursorOffset = 1
    }

    textarea.setRangeText(replacement, start, end, 'select')
    textarea.focus()
    const newCursor = start + (selected ? replacement.length : cursorOffset)
    textarea.setSelectionRange(newCursor, newCursor)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await postComment(fd)
      if (textareaRef.current) textareaRef.current.value = ''
      if (onCancel) onCancel()
      if (onCommentPosted) onCommentPosted()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
      <input type="hidden" name="topic_id" value={topicId} />
      <input type="hidden" name="slug" value={slug} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}
      <div className="flex items-start gap-space-sm">
        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-label-sm font-bold shrink-0">
          {userInitials || 'M'}
        </div>
        <div className="flex-1 flex flex-col gap-space-xs">
          <textarea
            ref={textareaRef}
            name="content"
            required
            minLength={3}
            className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-body-sm p-space-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20 resize-none transition-all"
            placeholder={parentId ? 'Escreva uma resposta técnica e colaborativa...' : 'Escreva um comentário construtivo...'}
            rows={2}
          />

          <div className="flex items-center justify-between pt-space-xs flex-wrap gap-2">
            {/* Toolbar Funcional */}
            <div className="flex items-center gap-1 text-on-surface-variant">
              <button
                type="button"
                onClick={() => insertMarkdown('bold', 'texto')}
                className="p-1 hover:text-primary rounded hover:bg-surface-container transition-colors"
                title="Negrito (**texto**)"
              >
                <span className="material-symbols-outlined text-[18px]">format_bold</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('italic', 'texto')}
                className="p-1 hover:text-primary rounded hover:bg-surface-container transition-colors"
                title="Itálico (*texto*)"
              >
                <span className="material-symbols-outlined text-[18px]">format_italic</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('code', 'código')}
                className="p-1 hover:text-primary rounded hover:bg-surface-container transition-colors font-mono text-xs font-bold"
                title="Código inline (`código`)"
              >
                &lt;/&gt;
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('codeblock')}
                className="p-1 hover:text-primary rounded hover:bg-surface-container transition-colors"
                title="Bloco de código (```lang)"
              >
                <span className="material-symbols-outlined text-[18px]">data_object</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('link')}
                className="p-1 hover:text-primary rounded hover:bg-surface-container transition-colors"
                title="Link ([texto](url))"
              >
                <span className="material-symbols-outlined text-[18px]">link</span>
              </button>
            </div>

            <div className="flex items-center gap-space-sm ml-auto">
              {onCancel && (
                <button
                  onClick={onCancel}
                  type="button"
                  className="px-space-sm py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm disabled:opacity-60 font-semibold"
              >
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

// ── CommentItem (recursivo com upvotes neurais e exclusão) ─────────────────────
function CommentItem({
  comment,
  topicId,
  slug,
  user,
  userRole,
  depth = 0,
  onDelete,
}: {
  comment: Comment
  topicId: string
  slug: string
  user: any
  userRole: string
  depth?: number
  onDelete?: (commentId: string) => void
}) {
  const [replying, setReplying] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.likes_count || 0)
  const [liked, setLiked] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [, startTransition] = useTransition()
  const maxDepth = 4

  const isAuthorOrAdmin = user && (user.id === comment.author_id || user.id === comment.author?.id || userRole === 'admin')

  const handleLike = () => {
    if (!user) {
      window.location.href = `/login?next=/topico/${slug}`
      return
    }
    const next = liked ? likeCount - 1 : likeCount + 1
    setLiked(!liked)
    setLikeCount(Math.max(0, next))
    startTransition(() => toggleCommentLike(comment.id, slug))
  }

  const handleDelete = async () => {
    if (!confirm('Deseja realmente excluir este comentário?')) return
    setIsDeleting(true)
    try {
      await deleteComment(comment.id, slug)
      if (onDelete) onDelete(comment.id)
    } catch (e) {
      console.error('Erro ao deletar comentário:', e)
      setIsDeleting(false)
    }
  }

  return (
    <div className={`flex flex-col ${depth > 0 ? 'relative ml-4 sm:ml-6 pl-3 sm:pl-5 mt-space-sm' : 'mt-space-md'}`}>
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-3 w-[2px] bg-outline-variant/30 rounded-full"></div>
      )}
      {depth > 0 && (
        <div className="absolute -left-[0px] top-5 w-3 sm:w-5 h-[2px] bg-outline-variant/30"></div>
      )}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xs p-space-md flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <Avatar author={comment.author} size={depth > 0 ? 7 : 8} />
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  {comment.author?.full_name || comment.author?.username || 'Membro'}
                </span>
                <span className="font-body-sm text-body-sm text-outline">@{comment.author?.username || 'membro'}</span>
                {comment.author?.role === 'admin' && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    Admin
                  </span>
                )}
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {new Date(comment.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isAuthorOrAdmin && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-outline hover:text-error p-1 rounded hover:bg-error/10 transition-colors"
                type="button"
                title="Excluir comentário"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            )}
            <button
              onClick={() => setShowReport(true)}
              className="text-outline hover:text-error p-1 rounded hover:bg-surface-container transition-colors"
              type="button"
              title="Denunciar comentário"
            >
              <span className="material-symbols-outlined text-[18px]">flag</span>
            </button>
          </div>
        </div>

        <p className={`font-body-md text-body-md text-on-surface whitespace-pre-wrap ${depth > 0 ? '' : 'pl-9 sm:pl-10'}`}>
          {comment.content}
        </p>

        <div className={`flex items-center gap-space-md pt-space-xs ${depth > 0 ? '' : 'pl-9 sm:pl-10'}`}>
          {/* Upvote com neural code </> */}
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1 font-label-sm text-label-sm py-0.5 px-2 rounded-lg transition-colors ${
              liked ? 'text-primary bg-primary/15 font-bold' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
            }`}
            type="button"
            title="Votar neste comentário"
          >
            <span className="font-mono text-xs font-bold leading-none select-none">&lt;/&gt;</span>
            <span>{likeCount}</span>
          </button>

          {user && depth < maxDepth && (
            <button
              onClick={() => setReplying(!replying)}
              className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">reply</span>
              <span>Responder</span>
            </button>
          )}
        </div>

        {replying && user && (
          <div className={depth > 0 ? '' : 'pl-9 sm:pl-10'}>
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
            <CommentItem
              key={reply.id}
              comment={reply}
              topicId={topicId}
              slug={slug}
              user={user}
              userRole={userRole}
              depth={depth + 1}
              onDelete={onDelete}
            />
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
  topic: initialTopic,
  comments: initialComments,
  user,
  userRole = 'member',
  userLiked = false,
  userSaved = false,
}: {
  topic: Topic
  comments: Comment[]
  user: any
  userRole?: string
  userLiked?: boolean
  userSaved?: boolean
}) {
  const router = useRouter()
  const [topic, setTopic] = useState<Topic>(initialTopic)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [liked, setLiked] = useState(userLiked)
  const [likeCount, setLikeCount] = useState(initialTopic.likes_count || 0)
  const [saved, setSaved] = useState(userSaved)
  const [showReport, setShowReport] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(initialTopic.title)
  const [editContent, setEditContent] = useState(initialTopic.content)
  const [isPending, startTransition] = useTransition()
  const [shareCopied, setShareCopied] = useState(false)

  const isAuthorOrAdmin = user && (user.id === topic.author_id || user.id === topic.author?.id || userRole === 'admin')

  // Construtor de árvore de comentários
  const topLevel = comments.filter(c => !c.parent_id)
  const buildTree = (root: Comment): Comment => {
    const children = comments.filter(c => c.parent_id === root.id)
    return { ...root, replies: children.map(buildTree) }
  }
  const commentTree = topLevel.map(buildTree)

  const handleLike = () => {
    if (!user) {
      window.location.href = `/login?next=/topico/${topic.slug}`
      return
    }
    const next = liked ? likeCount - 1 : likeCount + 1
    setLiked(!liked)
    setLikeCount(Math.max(0, next))
    startTransition(() => toggleTopicLike(topic.id, topic.slug))
  }

  const handleSave = () => {
    if (!user) {
      window.location.href = `/login?next=/topico/${topic.slug}`
      return
    }
    setSaved(!saved)
    startTransition(() => toggleTopicSave(topic.id, topic.slug))
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/topico/${topic.slug}`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: topic.title, url })
      } catch (_) {}
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2500)
    }
  }

  const handleDeleteTopic = async () => {
    if (!confirm('Tem certeza de que deseja excluir permanentemente esta discussão? Todos os comentários serão removidos.')) return
    startTransition(async () => {
      const res = await deleteTopic(topic.id)
      if (res?.error) {
        alert(res.error)
      } else {
        router.push('/minhas-discussoes')
      }
    })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTitle.trim() || !editContent.trim()) return
    startTransition(async () => {
      const res = await updateTopic(topic.id, editTitle, editContent, topic.slug)
      if (res?.error) {
        alert(res.error)
      } else {
        setTopic(prev => ({ ...prev, title: editTitle, content: editContent }))
        setIsEditing(false)
      }
    })
  }

  return (
    <>
      <div className="flex flex-col w-full gap-space-lg">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant flex-wrap">
          <Link className="hover:text-primary transition-colors" href="/">
            Início
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          {topic.category && (
            <>
              <Link
                className="hover:text-primary transition-colors"
                href={topic.category.slug === 'blog' ? '/blog' : `/categoria/${topic.category.slug}`}
              >
                {topic.category.name}
              </Link>
              <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            </>
          )}
          <span className="text-on-surface font-semibold truncate max-w-[200px] sm:max-w-xs">{topic.title}</span>
        </nav>

        {/* Modal/Form de Edição do Tópico */}
        {isEditing && (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Editar Discussão</h3>
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm font-semibold text-on-surface">Título</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface px-space-md py-2 rounded-lg font-headline-sm text-headline-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm font-semibold text-on-surface">Conteúdo (Markdown)</label>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  required
                  rows={8}
                  className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface px-space-md py-space-sm rounded-lg font-mono text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-end gap-space-sm">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors font-semibold shadow-sm"
                >
                  {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Article Container */}
        <article className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm p-space-lg sm:p-space-xl flex flex-col gap-space-lg relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col gap-space-sm relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm flex-wrap">
                {topic.category && (
                  <Link
                    href={topic.category.slug === 'blog' ? '/blog' : `/categoria/${topic.category.slug}`}
                    className="px-space-sm py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>{topic.category.icon || '📂'}</span>
                    <span>{topic.category.name}</span>
                  </Link>
                )}
                <span className="text-outline text-label-sm">·</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                  {new Date(topic.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* Botões do Autor / Moderação */}
              {isAuthorOrAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-2.5 py-1 rounded-lg text-primary hover:bg-primary/10 font-label-sm text-label-sm font-medium transition-colors flex items-center gap-1"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={handleDeleteTopic}
                    className="px-2.5 py-1 rounded-lg text-error hover:bg-error/10 font-label-sm text-label-sm font-medium transition-colors flex items-center gap-1"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Excluir</span>
                  </button>
                </div>
              )}
            </div>

            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              {topic.title}
            </h1>
          </div>

          {/* Author Card */}
          <div className="flex items-center justify-between gap-space-md pb-space-md border-b border-outline-variant/15">
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
                  <span className="font-body-sm text-body-sm text-outline">@{topic.author?.username || 'membro'}</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {topic.author?.role === 'admin' ? 'Administrador' : 'Membro da Comunidade'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-space-xs">
              <button
                onClick={handleSave}
                disabled={!user || isPending}
                className={`p-space-xs rounded-lg transition-colors ${
                  saved
                    ? 'text-primary bg-primary/15'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`}
                title={saved ? 'Remover dos salvos' : 'Salvar discussão'}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]" style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  bookmark
                </span>
              </button>
              <button
                onClick={() => setShowReport(true)}
                className="p-space-xs text-on-surface-variant hover:text-error hover:bg-surface-container rounded-lg transition-colors"
                title="Denunciar conteúdo"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">flag</span>
              </button>
            </div>
          </div>

          {/* Renderizador de Conteúdo Markdown */}
          <div
            className="font-body-lg text-body-lg text-on-surface leading-relaxed flex flex-col gap-space-sm markdown-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(topic.content) }}
          />

          {/* Action Bar Inferior com Upvotes Neurais </> */}
          <div className="flex items-center justify-between pt-space-md border-t border-outline-variant/15 flex-wrap gap-space-sm">
            <div className="flex items-center gap-space-xs sm:gap-space-sm">
              {/* Upvote Neural </> */}
              <button
                onClick={handleLike}
                disabled={isPending}
                className={`inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-lg font-label-md text-label-md shadow-xs transition-all ${
                  liked
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-surface-container-low text-primary hover:bg-primary hover:text-on-primary border border-outline-variant/30'
                }`}
                type="button"
                title={user ? (liked ? 'Remover voto' : 'Votar nesta discussão') : 'Faça login para votar'}
              >
                <span className="font-mono text-xs font-bold leading-none select-none">&lt;/&gt;</span>
                <span>{likeCount}</span>
              </button>

              {/* Comentários count */}
              <a
                href="#comentarios"
                className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface-variant font-label-md text-label-md shadow-xs hover:text-on-surface hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">forum</span>
                <span>{comments.length}</span>
              </a>

              {/* Compartilhar */}
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface-variant font-label-md text-label-md shadow-xs hover:text-on-surface hover:bg-surface-container transition-all"
                type="button"
                title="Compartilhar link"
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
          <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
            <div className="flex items-center gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'}
              </h2>
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
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-space-lg text-center flex flex-col items-center gap-space-sm">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/70">lock</span>
              <p className="text-on-surface-variant font-body-md">Participe da discussão técnica e compartilhe seus insights.</p>
              <Link
                href={`/login?next=/topico/${topic.slug}`}
                className="inline-flex items-center gap-1.5 px-space-lg py-space-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm font-semibold"
              >
                Fazer login para comentar
              </Link>
            </div>
          )}

          {/* Comment Tree */}
          <div className="flex flex-col">
            {commentTree.length === 0 ? (
              <div className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-center text-on-surface-variant font-body-md shadow-xs">
                Nenhum comentário ainda. Seja o primeiro a iniciar a conversa!
              </div>
            ) : (
              commentTree.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  topicId={topic.id}
                  slug={topic.slug}
                  user={user}
                  userRole={userRole}
                  onDelete={(deletedId) => {
                    setComments(prev => prev.filter(item => item.id !== deletedId))
                  }}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Modal de Denúncia */}
      {showReport && (
        <ReportModal topicId={topic.id} slug={topic.slug} onClose={() => setShowReport(false)} />
      )}
    </>
  )
}
