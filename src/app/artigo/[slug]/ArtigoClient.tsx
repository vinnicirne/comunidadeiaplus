'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArticleWithAuthor } from '@/lib/services/articleService'
import { toggleArticleLike, deleteArticle } from '@/lib/actions/article'
import { User } from '@supabase/supabase-js'

interface ArtigoClientProps {
  article: ArticleWithAuthor
  user: User | null
  userLiked?: boolean
  userRole?: string
}

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getInitials(name: string | null | undefined) {
  if (!name) return 'M'
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'M'
}

function calculateReadingTime(content: string): number {
  if (!content) return 1
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function renderMarkdown(content: string) {
  if (!content) return ''

  let html = content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Blocos de código ```lang ... ```
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `<div class="my-5 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-sm">
      <div class="flex items-center justify-between px-4 py-2 bg-surface-container border-b border-outline-variant/20 text-on-surface-variant font-mono text-xs">
        <span>${lang || 'código'}</span>
      </div>
      <pre class="p-4 overflow-x-auto text-on-surface font-mono text-sm leading-relaxed scrollbar-none"><code>${code.trim()}</code></pre>
    </div>`
  })

  // Código inline `code`
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-xs border border-outline-variant/20">$1</code>')

  // Imagens Markdown ![alt](url)
  html = html.replace(/!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g, '<div class="my-5 rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm max-w-full"><img src="$2" alt="$1" class="w-full max-h-[500px] object-cover" loading="lazy" /></div>')

  // Headers (H1, H2, H3)
  html = html.replace(/^### (.*$)/gim, '<h3 class="font-headline-sm text-headline-sm font-semibold text-on-surface mt-6 mb-2 tracking-tight">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="font-headline-md text-headline-md font-bold text-on-surface mt-8 mb-3 tracking-tight">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="font-headline-lg text-headline-lg font-bold text-on-surface mt-8 mb-4 tracking-tight">$1</h1>')

  // Citações (> quote)
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-1.5 my-4 text-on-surface-variant italic font-body-md bg-surface-container-low/40 rounded-r-lg">$1</blockquote>')

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-on-surface">$1</strong>')
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="italic text-on-surface">$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold break-all">$1</a>')

  // Listas não ordenadas
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="flex items-start gap-2 ml-2 my-1.5 text-on-surface"><span class="text-primary mt-1.5">•</span><span>$1</span></li>')

  // Quebras de linha
  html = html.replace(/\n/g, '<br />')

  return html
}

export default function ArtigoClient({
  article,
  user,
  userLiked = false,
  userRole = 'member',
}: ArtigoClientProps) {
  const router = useRouter()
  const isAuthor = user?.id === article.author_id
  const isAdmin = userRole === 'admin'
  const canManage = isAuthor || isAdmin

  const [liked, setLiked] = useState(userLiked)
  const [likesCount, setLikesCount] = useState(article.likes_count || 0)
  const [isPending, startTransition] = useTransition()
  const [shareCopied, setShareCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const readingTime = calculateReadingTime(article.content)

  const handleLike = () => {
    if (!user) {
      window.location.href = `/login?next=/artigo/${article.slug}`
      return
    }

    const nextLiked = !liked
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1)
    setLiked(nextLiked)
    setLikesCount(nextCount)

    startTransition(async () => {
      try {
        const res = await toggleArticleLike(article.id, article.slug)
        if (res?.likesCount !== undefined) {
          setLikesCount(res.likesCount)
        }
      } catch (err) {
        console.error('Erro ao curtir artigo:', err)
      }
    })
  }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `Confira este artigo na Comunidade IA PLUS: ${article.title}`,
          url,
        })
      } catch (_) {}
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2500)
    }
  }

  const handleDeleteArticle = async () => {
    if (!confirm('Deseja realmente excluir este artigo? Esta ação é irreversível.')) return
    setIsDeleting(true)
    startTransition(async () => {
      const res = await deleteArticle(article.id)
      if (res?.error) {
        alert(res.error)
        setIsDeleting(false)
      } else {
        router.push('/blog')
      }
    })
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col gap-space-lg">
        {/* Breadcrumb de Navegação */}
        <nav className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant flex-wrap">
          <Link className="hover:text-primary transition-colors" href="/">
            Início
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <Link className="hover:text-primary transition-colors" href="/blog">
            Blog da Comunidade
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span className="text-on-surface font-semibold truncate max-w-xs">{article.title}</span>
        </nav>

        {/* Card do Artigo */}
        <article className="flex flex-col w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden">
          {/* Imagem de Capa */}
          {article.cover_image_url && (
            <div className="w-full h-[280px] sm:h-[380px] relative bg-surface-container-low overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt={article.title}
                src={article.cover_image_url}
              />
            </div>
          )}

          <div className="p-space-lg md:p-space-xl flex flex-col gap-space-md">
            {/* Header do Artigo */}
            <div className="flex flex-col gap-space-sm border-b border-outline-variant/15 pb-space-lg">
              {/* Tags & Status */}
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex flex-wrap items-center gap-space-xs">
                  {article.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-code-md text-code-md"
                    >
                      #{tag}
                    </span>
                  ))}
                  {article.status !== 'published' && (
                    <span className="px-2.5 py-0.5 rounded-md bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm font-semibold">
                      Rascunho Privado
                    </span>
                  )}
                </div>

                {/* Ações de Autor / Moderação */}
                {canManage && (
                  <div className="flex items-center gap-space-xs">
                    <Link
                      href={`/escrever-artigo?id=${article.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container text-primary font-label-sm text-label-sm font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>Editar</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleDeleteArticle}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error font-label-sm text-label-sm font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span>{isDeleting ? 'Excluindo...' : 'Excluir'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Título Principal */}
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mt-1">
                {article.title}
              </h1>

              {/* Subtítulo */}
              {article.subtitle && (
                <h2 className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  {article.subtitle}
                </h2>
              )}

              {/* Informações do Autor e Métricas */}
              <div className="flex items-center justify-between pt-space-sm mt-space-sm flex-wrap gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  {article.author?.avatar_url ? (
                    <img
                      src={article.author.avatar_url}
                      alt={article.author.full_name || 'Autor'}
                      className="w-11 h-11 rounded-full object-cover shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold font-label-lg shadow-sm shrink-0">
                      {getInitials(article.author?.full_name || article.author?.username)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {article.author?.full_name || article.author?.username || 'Autor da Comunidade'}
                    </span>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                      <span>{formatDate(article.updated_at || article.created_at)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">schedule</span>
                        {readingTime} min de leitura
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        {article.views_count || 0} visualizações
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo Markdown Renderizado */}
            <div
              className="mt-space-md text-on-surface font-body-md text-body-md leading-relaxed markdown-body"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
            />

            {/* Barra Inferior de Ações e Upvotes Neurais </> */}
            <div className="flex flex-wrap items-center justify-between gap-space-md border-t border-outline-variant/15 pt-space-xl mt-space-xl pb-space-sm">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-primary hover:underline font-label-md text-label-md font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Voltar ao Blog</span>
              </Link>

              <div className="flex items-center gap-space-sm">
                {/* Botão Neural de Voto </> */}
                <button
                  onClick={handleLike}
                  disabled={isPending}
                  className={`inline-flex items-center gap-2 px-space-lg py-2 rounded-xl border transition-all ${
                    liked
                      ? 'border-primary text-on-primary bg-primary font-bold shadow-xs'
                      : 'border-outline-variant/40 bg-surface-container-low hover:border-primary text-primary hover:bg-primary hover:text-on-primary'
                  }`}
                  type="button"
                  title={user ? (liked ? 'Remover voto' : 'Votar neste artigo') : 'Faça login para votar'}
                >
                  <span className="font-mono text-xs font-bold leading-none select-none">&lt;/&gt;</span>
                  <span className="font-label-md text-label-md">{likesCount} Votos</span>
                </button>

                {/* Compartilhar */}
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-space-lg py-2 rounded-xl border border-outline-variant/40 bg-surface-container-low hover:border-primary text-on-surface-variant hover:text-primary transition-colors"
                  type="button"
                  title="Compartilhar artigo"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {shareCopied ? 'check' : 'share'}
                  </span>
                  <span className="font-label-md text-label-md font-medium">
                    {shareCopied ? 'Copiado!' : 'Compartilhar'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
