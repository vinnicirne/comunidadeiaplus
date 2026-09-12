'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PesquisarClientProps {
  initialTopics: any[];
  initialArticles: any[];
  categories: any[];
}

export default function PesquisarClient({ initialTopics, initialArticles, categories }: PesquisarClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const combinedItems = [
    ...initialTopics.map((t) => ({ ...t, itemType: 'topic' })),
    ...initialArticles.map((a) => ({ ...a, itemType: 'article' })),
  ];

  const filteredItems = combinedItems.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' ||
      item.category?.slug === activeCategory ||
      item.category_id === activeCategory;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesCategory;

    const title = (item.title || '').toLowerCase();
    const content = (item.content || item.subtitle || '').toLowerCase();
    const author = (item.author?.username || item.author?.full_name || '').toLowerCase();

    return matchesCategory && (title.includes(term) || content.includes(term) || author.includes(term));
  });

  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Banner de Busca */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg sm:p-space-xl shadow-sm">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm tracking-wide uppercase font-semibold">
              <span className="material-symbols-outlined text-[16px]">manage_search</span>
              <span>Mecanismo de Descoberta Técnica</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              Pesquisar na comunidade
            </h1>

            {/* Input Search */}
            <div className="relative flex items-center w-full">
              <span className="material-symbols-outlined absolute left-space-md text-outline text-[20px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Pesquisar termos, ferramentas, modelos ou discussões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface placeholder:text-outline text-label-md font-label-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 p-1 rounded-full text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categorias Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-colors shrink-0 ${
              activeCategory === 'all'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Todas as Categorias
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-colors shrink-0 ${
                activeCategory === cat.slug
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Contador de Resultados */}
        <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
          <span>
            {filteredItems.length === 1
              ? '1 resultado encontrado'
              : `${filteredItems.length} resultados encontrados`}
          </span>
        </div>

        {/* Lista de Resultados */}
        <div className="flex flex-col gap-space-md">
          {filteredItems.length === 0 ? (
            <div className="p-space-xl text-center bg-surface-container-lowest rounded-xl font-body-md text-on-surface-variant shadow-sm">
              Nenhuma discussão ou artigo encontrado para sua busca.
            </div>
          ) : (
            filteredItems.map((item) => {
              const targetUrl = item.itemType === 'article' ? `/artigo/${item.slug}` : `/topico/${item.slug}`;

              return (
                <article
                  key={`${item.itemType}-${item.id}`}
                  className="bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 rounded-xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs text-body-sm text-outline">
                      <span className="font-semibold text-on-surface">
                        @{item.author?.username || 'membro'}
                      </span>
                      <span>·</span>
                      <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {item.category && (
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                        {item.category.name}
                      </span>
                    )}
                  </div>

                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors">
                    <Link href={targetUrl}>{item.title}</Link>
                  </h2>

                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    {item.itemType === 'article' ? item.subtitle || item.content : item.content}
                  </p>

                  <div className="flex items-center gap-space-md pt-space-xs text-outline font-label-sm text-label-sm">
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">code</span>
                      <span>{item.likes_count || 0}</span>
                    </span>
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">forum</span>
                      <span>{item.comments_count || 0} respostas</span>
                    </span>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
