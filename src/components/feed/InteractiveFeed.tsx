'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { toggleTopicLike, toggleTopicSave } from '@/lib/actions/topic';

interface FeedItem {
  id: string;
  title: string;
  content: string;
  subtitle?: string;
  slug: string;
  created_at: string;
  updated_at?: string;
  type: 'topic' | 'article';
  likes_count: number;
  comments_count: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author?: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export default function InteractiveFeed({ items, currentFilter }: { items: FeedItem[]; currentFilter: string }) {
  // Estado local para votos e bookmarks com persistência otimista
  const [votes, setVotes] = useState<Record<string, { count: number; state: 1 | 0 }>>(() => {
    const initial: Record<string, { count: number; state: 1 | 0 }> = {};
    items.forEach((item) => {
      initial[item.id] = { count: item.likes_count || 0, state: 0 };
    });
    return initial;
  });

  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();

  const handleVote = (item: FeedItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const current = votes[item.id] || { count: item.likes_count || 0, state: 0 };
    const hasVoted = current.state === 1;
    const delta = hasVoted ? -1 : 1;
    const newCount = Math.max(0, current.count + delta);
    const newState: 1 | 0 = hasVoted ? 0 : 1;

    setVotes((prev) => ({
      ...prev,
      [item.id]: { count: newCount, state: newState },
    }));

    if (item.type === 'topic') {
      startTransition(async () => {
        try {
          await toggleTopicLike(item.id, item.slug);
        } catch (err) {
          console.error('Erro ao registrar voto:', err);
        }
      });
    }
  };

  const toggleBookmark = (item: FeedItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isBookmarked = !!bookmarked[item.id];
    setBookmarked((prev) => ({
      ...prev,
      [item.id]: !isBookmarked,
    }));

    if (item.type === 'topic') {
      startTransition(async () => {
        try {
          await toggleTopicSave(item.id, item.slug);
        } catch (err) {
          console.error('Erro ao salvar tópico:', err);
        }
      });
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 60) return `há ${Math.max(1, diffMin)} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `há ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      return `há ${diffDays} d`;
    } catch {
      return 'recentemente';
    }
  };

  const getFilterBtnClass = (filterKey: string) => {
    const isActive = currentFilter === filterKey;
    return isActive
      ? "filter-btn active flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-primary shadow-xs font-label-md text-label-md font-semibold transition-colors"
      : "filter-btn flex items-center gap-space-xs px-space-md py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md font-medium transition-colors";
  };

  // Top autores reais extraídos dos items do feed para seção mobile
  const authorContributions = items.reduce((acc, item) => {
    const authorName = item.author?.full_name || item.author?.username;
    if (authorName && authorName !== 'membro' && authorName !== 'Membro') {
      if (!acc[authorName]) {
        acc[authorName] = {
          name: authorName,
          username: item.author?.username || 'membro',
          avatar_url: item.author?.avatar_url,
          count: 0,
          likes: 0,
        };
      }
      acc[authorName].count += 1;
      acc[authorName].likes += item.likes_count || 0;
    }
    return acc;
  }, {} as Record<string, { name: string; username: string; avatar_url?: string; count: number; likes: number }>);

  const topAuthors = Object.values(authorContributions)
    .sort((a, b) => b.likes + b.count * 2 - (a.likes + a.count * 2))
    .slice(0, 2);

  return (
    <div className="flex flex-col w-full">
      {/* Feed Header & Controller Strip */}
      <section className="flex flex-col gap-space-md mb-space-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div className="flex items-baseline gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
              Discussões
            </h1>
            <span className="font-code-md text-code-md text-on-surface-variant bg-surface-container px-space-xs py-0.5 rounded">
              {items.length} {items.length === 1 ? 'publicação' : 'publicações'}
            </span>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg shadow-sm transition-all duration-200 hover:shadow active:scale-[0.99] font-semibold"
            href="/criar-topico"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Criar discussão</span>
          </Link>
        </div>

        {/* Filter Pill Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-1.5 rounded-xl">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none" id="feed-filters">
            <Link href="/?filter=recentes" className={getFilterBtnClass('recentes')}>
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span>Mais recentes</span>
            </Link>
            <Link href="/?filter=comentadas" className={getFilterBtnClass('comentadas')}>
              <span className="material-symbols-outlined text-[18px]">mode_comment</span>
              <span>Mais comentadas</span>
            </Link>
            <Link href="/?filter=alta" className={getFilterBtnClass('alta')}>
              <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
              <span>Em alta</span>
            </Link>
            <Link href="/?filter=sem-resposta" className={getFilterBtnClass('sem-resposta')}>
              <span className="material-symbols-outlined text-[18px]">help_outline</span>
              <span>Sem resposta</span>
            </Link>
          </div>

          <Link
            href="/discussoes-em-alta"
            className="hidden md:flex items-center gap-1 text-primary hover:underline font-label-sm text-label-sm font-medium px-2 py-1"
          >
            <span>Ver ranking completo</span>
            <span className="font-mono text-xs font-bold">&lt;/&gt;</span>
          </Link>
        </div>
      </section>

      {/* Discussion Stream Stack */}
      <div className="flex flex-col gap-space-md">
        {items.length === 0 ? (
          <div className="p-space-xl text-center bg-surface-container-lowest rounded-xl font-body-md text-on-surface-variant shadow-sm border border-outline-variant/30 flex flex-col items-center gap-space-sm">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/60">forum</span>
            <p>Nenhuma discussão encontrada para este filtro.</p>
            <Link href="/criar-topico" className="text-primary hover:underline font-semibold text-label-md">
              Inicie uma agora mesmo!
            </Link>
          </div>
        ) : (
          items.map((item) => {
            const voteData = votes[item.id] || { count: item.likes_count || 0, state: 0 };
            const isBookmarked = !!bookmarked[item.id];
            const targetUrl = item.type === 'article' ? `/artigo/${item.slug}` : `/topico/${item.slug}`;

            return (
              <article
                key={`${item.type}-${item.id}`}
                className="group bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 rounded-xl p-space-md sm:p-space-lg shadow-sm hover:shadow-md flex gap-space-md sm:gap-space-lg border border-outline-variant/20"
              >
                {/* Vertical Vote Rail com Neural Code </> */}
                <div className="flex flex-col items-center justify-start shrink-0 bg-surface-container-low group-hover:bg-surface-container px-2 py-space-sm rounded-lg transition-colors self-start">
                  <button
                    aria-label="Votar"
                    onClick={(e) => handleVote(item, e)}
                    className={`vote-up transition-colors p-1 rounded ${
                      voteData.state === 1
                        ? 'text-primary bg-primary/20 font-bold'
                        : 'text-on-surface-variant hover:text-primary hover:bg-primary/10'
                    }`}
                    type="button"
                    title={voteData.state === 1 ? 'Remover voto' : 'Votar'}
                  >
                    <span className="font-mono text-xs font-bold leading-none select-none">
                      &lt;/&gt;
                    </span>
                  </button>
                  <span className="font-label-md text-label-md font-semibold text-on-surface py-0.5 vote-count select-none">
                    {voteData.count}
                  </span>
                </div>

                {/* Main Topic Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-space-xs">
                  {/* Author / Meta Header */}
                  <div className="flex items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-xs min-w-0">
                      {item.author?.avatar_url ? (
                        <img
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                          src={item.author.avatar_url}
                          alt="Avatar"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                          {item.author?.username?.slice(0, 1)?.toUpperCase() || 'M'}
                        </div>
                      )}
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                        {item.author?.full_name || item.author?.username || 'Membro'}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-code-md truncate">
                        @{item.author?.username || 'membro'}
                      </span>
                      <span className="text-on-surface-variant text-body-sm shrink-0">·</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant shrink-0">
                        {formatTimeAgo(item.created_at)}
                      </span>
                    </div>

                    {item.category && (
                      <Link
                        className="shrink-0 inline-flex items-center gap-1 font-label-sm text-label-sm text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium hover:bg-primary/20 transition-colors"
                        href={`/categoria/${item.category.slug}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <span>{item.category.name}</span>
                      </Link>
                    )}
                    {item.type === 'article' && !item.category && (
                      <Link
                        className="shrink-0 inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-medium hover:bg-secondary/20 transition-colors"
                        href="/blog"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        <span>Artigo</span>
                      </Link>
                    )}
                  </div>

                  {/* Topic Title */}
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors tracking-tight mt-0.5">
                    <Link className="block focus:outline-none hover:underline" href={targetUrl}>
                      {item.title}
                    </Link>
                  </h2>

                  {/* Snippet / Context */}
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                    {item.type === 'article' ? item.subtitle || item.content : item.content}
                  </p>

                  {/* Bottom Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs mt-1 border-t border-outline-variant/10">
                    <div className="flex items-center gap-space-md text-on-surface-variant">
                      <button
                        aria-label="Votar"
                        onClick={(e) => handleVote(item, e)}
                        className={`flex items-center gap-1.5 py-0.5 px-2 rounded-lg transition-colors font-label-sm text-label-sm ${
                          voteData.state === 1
                            ? 'text-primary bg-primary/10 font-semibold'
                            : 'hover:bg-surface-container hover:text-primary'
                        }`}
                        type="button"
                        title={voteData.state === 1 ? 'Remover voto' : 'Votar'}
                      >
                        <span className="font-mono text-xs font-bold leading-none">&lt;/&gt;</span>
                        <span>{voteData.count}</span>
                      </button>

                      <Link
                        className="flex items-center gap-1 hover:text-primary transition-colors font-label-sm text-label-sm"
                        href={targetUrl}
                      >
                        <span className="material-symbols-outlined text-[16px]">forum</span>
                        <span>{item.comments_count || 0} respostas</span>
                      </Link>

                      <button
                        aria-label="Salvar discussão"
                        onClick={(e) => toggleBookmark(item, e)}
                        className={`bookmark-btn flex items-center gap-1 font-label-sm text-label-sm transition-colors ${
                          isBookmarked ? 'text-primary font-semibold' : 'hover:text-primary'
                        }`}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isBookmarked ? 'bookmark' : 'bookmark_border'}
                        </span>
                        <span className="hidden sm:inline">{isBookmarked ? 'Salvo' : 'Salvar'}</span>
                      </button>

                      <button
                        aria-label="Compartilhar"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (typeof window !== 'undefined' && navigator.clipboard) {
                            navigator.clipboard.writeText(`${window.location.origin}${targetUrl}`);
                          }
                        }}
                        className="flex items-center gap-1 font-label-sm text-label-sm hover:text-primary transition-colors"
                        type="button"
                        title="Compartilhar link"
                      >
                        <span className="material-symbols-outlined text-[16px]">share</span>
                        <span className="hidden sm:inline">Compartilhar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Feed Status Summary */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm mt-space-lg p-space-md bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-xs">
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            Exibindo <span className="font-semibold text-on-surface font-code-md">{items.length}</span>{' '}
            {items.length === 1 ? 'debate' : 'debates'} da comunidade
          </div>
          <Link
            href="/discussoes-em-alta"
            className="flex items-center gap-1 text-primary hover:underline font-label-sm text-label-sm font-semibold"
          >
            <span>Ver ranking completo de discussões</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* Secondary Context Section for Mobile */}
      <section className="xl:hidden flex flex-col gap-space-md mt-space-xl">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              <span>Diretrizes da Comunidade</span>
            </h3>
          </div>
          <ul className="space-y-space-xs text-body-sm font-body-sm text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
              <span>Traga evidências ou snippets técnicos ao debater benchmarks de IA.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
              <span>Sinalize versões dos modelos e parâmetros utilizados em testes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
              <span>Respeite licenças open-source e termos das APIs de Inteligência Artificial.</span>
            </li>
          </ul>
        </div>

        {/* Membros Ativos Reais */}
        {topAuthors.length > 0 && (
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">military_tech</span>
                <span>Membros em Destaque</span>
              </h3>
              <span className="font-label-sm text-label-sm text-primary font-medium">Atividade Recente</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {topAuthors.map((author) => (
                <div key={author.name} className="flex items-center gap-space-sm p-2 rounded-lg bg-surface-container-low">
                  {author.avatar_url ? (
                    <img src={author.avatar_url} alt={author.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {author.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                      {author.name}
                    </span>
                    <span className="font-code-md text-label-sm text-on-surface-variant">
                      {author.count} tópicos · {author.likes} &lt;/&gt;
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[18px]">workspace_premium</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
