'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MinhasDiscussoesClientProps {
  initialTab?: 'discussions' | 'comments' | 'saved';
  profile?: any;
  user?: any;
  topics?: any[];
  comments?: any[];
  savedTopics?: any[];
}

export default function MinhasDiscussoesClient({
  initialTab = 'discussions',
  profile,
  user,
  topics = [],
  comments = [],
  savedTopics = [],
}: MinhasDiscussoesClientProps) {
  const [activeTab, setActiveTab] = useState<'discussions' | 'comments' | 'saved'>(initialTab);

  const username = profile?.username || user?.email?.split('@')[0] || 'membro';
  const fullName = profile?.full_name || username;
  const avatarUrl = profile?.avatar_url;
  const bio = profile?.bio || 'Membro da Comunidade IA PLUS';
  const role = profile?.role || 'user';

  return (
    <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
      <div className="flex flex-col w-full">
        {/* Profile Header Hero Card */}
        <div className="relative bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-lg">
          <div className="h-28 w-full bg-gradient-to-r from-primary via-primary-container to-secondary relative overflow-hidden flex items-end justify-end p-space-md">
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
          </div>

          {/* User Meta & Info Block */}
          <div className="px-space-lg pb-space-lg pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-space-md gap-space-md">
              <div className="relative w-24 h-24 shrink-0">
                <div className="w-24 h-24 rounded-full bg-surface-container-lowest p-1 shadow-md">
                  {avatarUrl ? (
                    <img alt="Avatar" className="w-full h-full object-cover rounded-full bg-surface-container" src={avatarUrl} />
                  ) : (
                    <div className="w-full h-full rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-2xl">
                      {username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-space-xs pt-2">
                <div className="inline-flex items-center gap-1 px-space-sm py-1 bg-surface-container-high rounded-full text-primary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>{role === 'admin' ? 'Administrador' : 'Membro'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                {fullName}
              </h1>
              <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                <span className="font-code-md">@{username}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-xl">
                {bio}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Strip */}
        <div className="flex items-center gap-space-xs bg-surface-container-low p-1.5 rounded-xl mb-space-lg shadow-sm">
          <button
            onClick={() => setActiveTab('discussions')}
            className={`flex-1 py-2 px-space-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'discussions'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">post_add</span>
            <span>Minhas discussões</span>
            <span className="px-1.5 py-0.2 rounded-full text-label-sm font-label-sm bg-surface-container text-on-surface-variant">
              {topics.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-2 px-space-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'comments'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">forum</span>
            <span>Comentários</span>
            <span className="px-1.5 py-0.2 rounded-full text-label-sm font-label-sm bg-surface-container text-on-surface-variant">
              {comments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 px-space-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'saved'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">bookmark</span>
            <span>Salvos / Curtidos</span>
            <span className="px-1.5 py-0.2 rounded-full text-label-sm font-label-sm bg-surface-container text-on-surface-variant">
              {savedTopics.length}
            </span>
          </button>
        </div>

        {/* Tab Content: MINHAS DISCUSSÕES */}
        {activeTab === 'discussions' && (
          <div className="flex flex-col gap-space-md">
            {topics.length === 0 ? (
              <div className="p-space-xl text-center bg-surface-container-lowest rounded-xl font-body-md text-on-surface-variant shadow-sm flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-[36px] text-outline">forum</span>
                <p>Você ainda não criou nenhuma discussão.</p>
                <Link
                  href="/criar-topico"
                  className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Criar primeira discussão</span>
                </Link>
              </div>
            ) : (
              topics.map((topic) => (
                <article
                  key={topic.id}
                  className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col gap-space-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-outline">
                      {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    {topic.category && (
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                        {topic.category.name}
                      </span>
                    )}
                  </div>

                  <Link href={`/topico/${topic.slug}`}>
                    <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors">
                      {topic.title}
                    </h2>
                  </Link>

                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                    {topic.content}
                  </p>

                  <div className="flex items-center gap-space-md pt-space-xs text-outline font-label-sm text-label-sm">
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">code</span>
                      <span>{topic.likes_count || 0}</span>
                    </span>
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">forum</span>
                      <span>{topic.comments_count || 0} respostas</span>
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* Tab Content: COMENTÁRIOS */}
        {activeTab === 'comments' && (
          <div className="flex flex-col gap-space-md">
            {comments.length === 0 ? (
              <div className="p-space-xl text-center bg-surface-container-lowest rounded-xl font-body-md text-on-surface-variant shadow-sm flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-[36px] text-outline">chat_bubble</span>
                <p>Você ainda não comentou em nenhuma discussão.</p>
              </div>
            ) : (
              comments.map((c) => (
                <article
                  key={c.id}
                  className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col gap-space-sm"
                >
                  <div className="flex items-center justify-between text-body-sm text-outline">
                    <span>Em: {c.topic?.title || 'Discussão'}</span>
                    <span>{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">
                    {c.content}
                  </p>
                  {c.topic?.slug && (
                    <Link
                      href={`/topico/${c.topic.slug}`}
                      className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1 pt-1"
                    >
                      <span>Ver contexto</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  )}
                </article>
              ))
            )}
          </div>
        )}

        {/* Tab Content: SALVOS */}
        {activeTab === 'saved' && (
          <div className="flex flex-col gap-space-md">
            {savedTopics.length === 0 ? (
              <div className="p-space-xl text-center bg-surface-container-lowest rounded-xl font-body-md text-on-surface-variant shadow-sm flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-[36px] text-outline">bookmark_border</span>
                <p>Você ainda não curtiu ou salvou nenhuma discussão.</p>
              </div>
            ) : (
              savedTopics.map((item: any) => (
                <article
                  key={item.id}
                  className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col gap-space-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-outline">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    {item.category && (
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                        {item.category.name}
                      </span>
                    )}
                  </div>

                  <Link href={`/topico/${item.slug}`}>
                    <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors">
                      {item.title}
                    </h2>
                  </Link>

                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                    {item.content}
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
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
