'use client'

import Link from 'next/link'
import { ArticleWithAuthor } from '@/lib/services/articleService'
import { User } from '@supabase/supabase-js'

interface ArtigoClientProps {
  article: ArticleWithAuthor
  user: User | null
}

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getInitials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function ArtigoClient({ article, user }: ArtigoClientProps) {
  const isAuthor = user?.id === article.author_id

  return (
    <main className="w-full max-w-4xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <article className="flex flex-col w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        
        {/* Capa */}
        {article.cover_image_url && (
          <div className="w-full h-[300px] md:h-[400px] relative bg-surface-container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full h-full object-cover" alt={article.title} src={article.cover_image_url} />
          </div>
        )}
        
        <div className="p-space-lg md:p-space-xl flex flex-col gap-space-md">
          {/* Header do Artigo */}
          <div className="flex flex-col gap-space-sm border-b border-outline-variant/50 pb-space-lg">
            <div className="flex flex-wrap items-center gap-space-xs mb-1">
              {article.tags?.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-surface-container-low text-primary font-code-md text-code-md">#{tag}</span>
              ))}
              {article.status !== 'published' && (
                <span className="px-2 py-0.5 rounded-md bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm font-semibold">Rascunho Privado</span>
              )}
            </div>
            
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              {article.title}
            </h1>
            
            {article.subtitle && (
              <h2 className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {article.subtitle}
              </h2>
            )}
            
            <div className="flex items-center justify-between pt-space-sm mt-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-semibold font-label-lg shadow-sm">
                  {getInitials(article.author?.full_name)}
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">{article.author?.full_name || 'Usuário Desconhecido'}</span>
                  <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm mt-0.5">
                    <span>{formatDate(article.published_at || article.updated_at)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">visibility</span> {article.views_count}</span>
                  </div>
                </div>
              </div>
              
              {isAuthor && (
                <Link href={`/escrever-artigo?id=${article.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-sm text-label-sm font-medium transition-colors">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Editar Artigo
                </Link>
              )}
            </div>
          </div>
          
          {/* Conteúdo */}
          <div className="prose prose-slate max-w-none mt-space-md text-on-surface prose-headings:text-on-surface prose-a:text-primary hover:prose-a:text-primary-container font-body-md text-body-md leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
          
          {/* Footer Ações */}
          <div className="flex items-center justify-center gap-space-md border-t border-outline-variant/50 pt-space-xl mt-space-xl pb-space-md">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline hover:border-primary text-on-surface-variant hover:text-primary transition-colors group" type="button">
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">favorite</span>
              <span className="font-label-md text-label-md font-medium">{article.likes_count} Curtidas</span>
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline hover:border-primary text-on-surface-variant hover:text-primary transition-colors group" type="button">
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">share</span>
              <span className="font-label-md text-label-md font-medium">Compartilhar</span>
            </button>
          </div>
          
        </div>
      </article>
    </main>
  )
}
