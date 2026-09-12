'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  // Estado local para votos e bookmarks
  const [votes, setVotes] = useState<Record<string, { count: number; state: 1 | 0 | -1 }>>(() => {
    const initial: Record<string, { count: number; state: 1 | 0 | -1 }> = {};
    items.forEach((item) => {
      initial[item.id] = { count: item.likes_count || 0, state: 0 };
    });
    return initial;
  });

  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  const handleVote = (id: string, direction: 1 | -1, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVotes((prev) => {
      const current = prev[id] || { count: 0, state: 0 };
      let newCount = current.count;
      let newState: 1 | 0 | -1 = 0;

      if (current.state === direction) {
        // Desfazer voto
        newState = 0;
        newCount -= direction;
      } else {
        // Se estava votado no oposto, corrige a diferença
        if (current.state !== 0) {
          newCount += direction * 2;
        } else {
          newCount += direction;
        }
        newState = direction;
      }

      return {
        ...prev,
        [id]: { count: newCount, state: newState },
      };
    });
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
      ? "filter-btn active flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-primary shadow-sm font-label-md text-label-md font-medium transition-colors"
      : "filter-btn flex items-center gap-space-xs px-space-md py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md font-medium transition-colors";
  };

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
              {items.length} tópicos
            </span>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg shadow-sm transition-all duration-200 hover:shadow active:scale-[0.99]"
            href="/criar-topico"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Criar discussão</span>
          </Link>
        </div>

        {/* Filter Pill Tabs & Visual Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-1.5 rounded-xl">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto" id="feed-filters">
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
          {/* Feed Quick Search / View Density */}
          <div className="hidden md:flex items-center gap-space-xs px-space-xs text-on-surface-variant">
            <span className="font-label-sm text-label-sm">Ordem por atividade</span>
            <span className="material-symbols-outlined text-[18px]">swap_vert</span>
          </div>
        </div>
      </section>

      {/* Discussion Stream Stack */}
      <div className="flex flex-col gap-space-md">
        {items.length === 0 ? (
          <div className="p-space-xl text-center bg-surface-container-lowest rounded-xl font-body-md text-on-surface-variant shadow-sm">
            Nenhuma discussão encontrada para este filtro.
          </div>
        ) : (
          items.map((item) => {
            const voteData = votes[item.id] || { count: item.likes_count || 0, state: 0 };
            const isBookmarked = !!bookmarked[item.id];
            const targetUrl = item.type === 'article' ? `/artigo/${item.slug}` : `/topico/${item.slug}`;

            return (
              <article
                key={`${item.type}-${item.id}`}
                className="group bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 rounded-xl p-space-md sm:p-space-lg shadow-sm hover:shadow flex gap-space-md sm:gap-space-lg"
              >
                {/* Vertical Vote Rail */}
                <div className="flex flex-col items-center justify-start shrink-0 bg-surface-container-low group-hover:bg-surface-container-lowest px-2 py-space-sm rounded-lg transition-colors">
                  <button
                    aria-label="Curtir"
                    onClick={(e) => handleVote(item.id, 1, e)}
                    className={`vote-up transition-colors p-0.5 ${
                      voteData.state === 1 ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                    }`}
                    type="button"
                    title="Curtir"
                  >
                    <span className="material-symbols-outlined text-[18px]">code</span>
                  </button>
                  <span className="font-label-md text-label-md font-semibold text-on-surface py-0.5 vote-count">
                    {voteData.count}
                  </span>
                  <button
                    aria-label="Votar negativo"
                    onClick={(e) => handleVote(item.id, -1, e)}
                    className={`vote-down transition-colors p-0.5 ${
                      voteData.state === -1 ? 'text-error font-bold' : 'text-on-surface-variant hover:text-error'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </button>
                </div>

                {/* Main Topic Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-space-xs">
                  {/* Author / Meta Header */}
                  <div className="flex items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-xs min-w-0">
                      {item.author?.avatar_url ? (
                        <img
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                          src={item.author.avatar_url}
                          alt="Avatar"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                          {item.author?.username?.slice(0, 1)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                        {item.author?.full_name || item.author?.username || 'Lucas Mendonça'}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-code-md truncate">
                        @{item.author?.username || 'lucasml'}
                      </span>
                      <span className="text-on-surface-variant text-body-sm shrink-0">·</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant shrink-0">
                        {formatTimeAgo(item.created_at)}
                      </span>
                    </div>

                    {item.category && (
                      <Link
                        className="shrink-0 inline-flex items-center gap-1 font-label-sm text-label-sm text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full font-medium hover:bg-primary-fixed transition-colors"
                        href={`/categoria/${item.category.slug}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <span>{item.category.name}</span>
                      </Link>
                    )}
                    {item.type === 'article' && !item.category && (
                      <Link
                        className="shrink-0 inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full font-medium hover:bg-secondary-fixed transition-colors"
                        href="/blog"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        <span>Artigo</span>
                      </Link>
                    )}
                  </div>

                  {/* Topic Title */}
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors tracking-tight mt-0.5">
                    <Link className="block focus:outline-none" href={targetUrl}>
                      {item.title}
                    </Link>
                  </h2>

                  {/* Snippet / Context */}
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    {item.type === 'article' ? item.subtitle || item.content : item.content}
                  </p>

                  {/* Topic Badges & Bottom Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs mt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.category && (
                        <span className="font-code-md text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
                          {item.category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-space-md text-on-surface-variant">
                      <button
                        aria-label="Curtir"
                        onClick={(e) => handleVote(item.id, 1, e)}
                        className={`flex items-center gap-1.5 py-0.5 px-2 rounded-lg transition-colors font-label-sm text-label-sm ${
                          voteData.state === 1 ? 'text-primary bg-primary/10 font-semibold' : 'hover:bg-surface-container hover:text-primary'
                        }`}
                        type="button"
                        title="Curtir"
                      >
                        <span className="material-symbols-outlined text-[16px]">code</span>
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
                        onClick={(e) => toggleBookmark(item.id, e)}
                        className={`bookmark-btn flex items-center transition-colors ${
                          isBookmarked ? 'text-primary' : 'hover:text-primary'
                        }`}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isBookmarked ? 'bookmark' : 'bookmark_border'}
                        </span>
                      </button>
                      <button
                        aria-label="Compartilhar"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(`${window.location.origin}${targetUrl}`);
                          }
                        }}
                        className="flex items-center hover:text-primary transition-colors"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Pagination & Feed Utility Footer */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md mt-space-xl pt-space-lg bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm">
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            Mostrando <span className="font-semibold text-on-surface font-code-md">1–{items.length}</span> de{' '}
            <span className="font-semibold text-on-surface font-code-md">{items.length}</span> discussões
          </div>
          <nav aria-label="Paginação de tópicos" className="flex items-center gap-1">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40"
              disabled
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md font-semibold"
              type="button"
            >
              1
            </button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors font-label-md text-label-md"
              type="button"
            >
              2
            </button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors font-label-md text-label-md"
              type="button"
            >
              3
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant font-code-md text-code-md">
              ...
            </span>
            <button
              className="px-space-sm h-8 rounded-lg flex items-center gap-1 text-on-surface-variant hover:bg-surface-container transition-colors font-label-md text-label-md"
              type="button"
            >
              <span>Próximo</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </nav>
        </div>
      )}

      {/* Secondary Integrated Context Section: Mobile/Tablet view */}
      <section className="xl:hidden flex flex-col gap-space-md mt-space-xl">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              <span>Regras da Comunidade</span>
            </h3>
            <span className="font-code-md text-label-sm text-on-surface-variant">v2.4</span>
          </div>
          <ul className="space-y-space-xs text-body-sm font-body-sm text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
              <span>Traga evidências ou snippets técnicos ao refutar benchmarks de LLMs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
              <span>Sinalize prompts gerados e versões exatas dos modelos (ex: Claude 3.5 Sonnet Oct-24).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
              <span>Respeite licenças open-weight e termos de serviço de APIs.</span>
            </li>
          </ul>
        </div>

        {/* Contribuidores da Semana */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">military_tech</span>
              <span>Contribuidores da Semana</span>
            </h3>
            <span className="font-label-sm text-label-sm text-primary font-medium">Ranking Top 5</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <div className="flex items-center gap-space-sm p-2 rounded-lg bg-surface-container-low">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                BR
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                  Beatriz Rocha
                </span>
                <span className="font-code-md text-label-sm text-on-surface-variant">+1.240 pts</span>
              </div>
              <span className="material-symbols-outlined text-tertiary-container text-[18px]">
                workspace_premium
              </span>
            </div>
            <div className="flex items-center gap-space-sm p-2 rounded-lg bg-surface-container-low">
              <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs">
                GS
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                  Gabriel Salles
                </span>
                <span className="font-code-md text-label-sm text-on-surface-variant">+980 pts</span>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">workspace_premium</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
