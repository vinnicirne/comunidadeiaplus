'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { deleteTopic, deleteComment, toggleTopicSave } from '@/lib/actions/topic'
import { updateProfile } from '@/lib/actions/auth'

interface MinhasDiscussoesClientProps {
  initialTab?: 'discussions' | 'comments' | 'saved'
  profile?: any
  user?: any
  topics?: any[]
  comments?: any[]
  savedTopics?: any[]
}

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function MinhasDiscussoesClient({
  initialTab = 'discussions',
  profile,
  user,
  topics: initialTopics = [],
  comments: initialComments = [],
  savedTopics: initialSavedTopics = [],
}: MinhasDiscussoesClientProps) {
  const [activeTab, setActiveTab] = useState<'discussions' | 'comments' | 'saved'>(initialTab)
  const [searchFilter, setSearchFilter] = useState('')

  const [topics, setTopics] = useState<any[]>(initialTopics)
  const [comments, setComments] = useState<any[]>(initialComments)
  const [savedTopics, setSavedTopics] = useState<any[]>(initialSavedTopics)

  // Profile Edit State
  const [userProfile, setUserProfile] = useState(profile)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [fullNameInput, setFullNameInput] = useState(profile?.full_name || '')
  const [bioInput, setBioInput] = useState(profile?.bio || '')
  const [isSavingProfile, startProfileTransition] = useTransition()

  // Deletion State
  const [itemToDelete, setItemToDelete] = useState<{ type: 'topic' | 'comment'; id: string; title: string } | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  const username = userProfile?.username || user?.email?.split('@')[0] || 'membro'
  const fullName = userProfile?.full_name || username
  const avatarUrl = userProfile?.avatar_url
  const bio = userProfile?.bio || 'Membro participante da Comunidade IA PLUS'
  const role = userProfile?.role || 'user'

  const totalTopicLikes = topics.reduce((acc, t) => acc + (t.likes_count || 0), 0)

  // Filtered lists
  const query = searchFilter.toLowerCase().trim()

  const filteredTopics = query
    ? topics.filter(t => t.title?.toLowerCase().includes(query) || t.content?.toLowerCase().includes(query))
    : topics

  const filteredComments = query
    ? comments.filter(c => c.content?.toLowerCase().includes(query) || c.topic?.title?.toLowerCase().includes(query))
    : comments

  const filteredSaved = query
    ? savedTopics.filter(s => s.title?.toLowerCase().includes(query) || s.content?.toLowerCase().includes(query))
    : savedTopics

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return

    startDeleteTransition(async () => {
      if (itemToDelete.type === 'topic') {
        const res = await deleteTopic(itemToDelete.id)
        if (res.success) {
          setTopics(prev => prev.filter(t => t.id !== itemToDelete.id))
          setSavedTopics(prev => prev.filter(s => s.id !== itemToDelete.id))
        } else {
          alert(res.error || 'Erro ao excluir discussão')
        }
      } else if (itemToDelete.type === 'comment') {
        const res = await deleteComment(itemToDelete.id)
        if (res.success) {
          setComments(prev => prev.filter(c => c.id !== itemToDelete.id))
        } else {
          alert(res.error || 'Erro ao excluir comentário')
        }
      }
      setItemToDelete(null)
    })
  }

  const handleRemoveSaved = async (topicId: string, slug: string) => {
    setSavedTopics(prev => prev.filter(s => s.id !== topicId))
    try {
      await toggleTopicSave(topicId, slug)
    } catch (e) {
      console.error('Erro ao remover dos salvos:', e)
    }
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    startProfileTransition(async () => {
      const res = await updateProfile({
        full_name: fullNameInput,
        bio: bioInput,
      })
      if (res.success) {
        setUserProfile((prev: any) => ({
          ...prev,
          full_name: fullNameInput,
          bio: bioInput,
        }))
        setIsEditingProfile(false)
      } else {
        alert(res.error || 'Erro ao atualizar perfil')
      }
    })
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-space-md lg:px-space-lg py-space-lg text-on-surface">
      <div className="flex flex-col w-full gap-space-lg">
        
        {/* Profile Header Hero Card */}
        <div className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-32 w-full bg-gradient-to-r from-primary via-primary-container to-secondary relative overflow-hidden flex items-end justify-end p-space-md">
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          </div>

          {/* User Meta & Info Block */}
          <div className="px-space-md sm:px-space-lg pb-space-lg pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-space-md gap-space-md">
              {/* Avatar */}
              <div className="relative w-24 h-24 shrink-0">
                <div className="w-24 h-24 rounded-full bg-surface-container-lowest p-1.5 shadow-md border border-outline-variant/30">
                  {avatarUrl ? (
                    <img alt="Avatar" className="w-full h-full object-cover rounded-full bg-surface-container" src={avatarUrl} />
                  ) : (
                    <div className="w-full h-full rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-2xl">
                      {username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions & Role Badge */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-surface-container-low border border-outline-variant/30 rounded-full text-primary font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>{role === 'admin' ? 'Administrador' : 'Membro'}</span>
                </div>
                
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface font-label-sm text-label-sm font-medium transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Editar Perfil</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                {fullName}
              </h1>
              <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                <span className="font-mono text-primary font-medium">@{username}</span>
                <span>·</span>
                <span>{user?.email}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
                {bio}
              </p>
            </div>
          </div>
        </div>

        {/* Activity Highlights Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: Discussões Criadas */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Minhas Discussões</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">forum</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {topics.length}
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm font-medium">
                Criadas
              </span>
            </div>
          </div>
          
          {/* Card 2: Comentários */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Comentários</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {comments.length}
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm font-medium">
                Respostas
              </span>
            </div>
          </div>
          
          {/* Card 3: Salvos / Curtidos */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Salvos & Curtidos</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">bookmark</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {savedTopics.length}
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm font-medium">
                Guardados
              </span>
            </div>
          </div>
          
          {/* Card 4: Likes Recebidos */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-medium">Upvotes Recebidos</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary font-mono font-bold text-xs">
                &lt;/&gt;
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {totalTopicLikes}
              </span>
              <span className="text-primary text-[11px] font-medium flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">thumb_up_alt</span>
                <span>Reconhecimento</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Management Panel */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
          
          {/* Tabs Navigation Header */}
          <div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low border-b border-surface-container">
            <div className="flex items-center gap-space-xs overflow-x-auto">
              <button
                onClick={() => setActiveTab('discussions')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-colors ${
                  activeTab === 'discussions'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">forum</span>
                <span>Minhas Discussões</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'discussions' ? 'bg-primary/15 text-primary' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {topics.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('comments')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-colors ${
                  activeTab === 'comments'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                <span>Comentários</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'comments' ? 'bg-primary/15 text-primary' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {comments.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-colors ${
                  activeTab === 'saved'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">bookmark</span>
                <span>Salvos & Curtidos</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'saved' ? 'bg-primary/15 text-primary' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {savedTopics.length}
                </span>
              </button>
            </div>

            <Link
              href="/criar-topico"
              className="inline-flex items-center gap-1.5 text-primary font-label-sm text-label-sm font-semibold hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Criar nova discussão</span>
            </Link>
          </div>

          {/* Search Filter Toolbar */}
          <div className="p-space-md bg-surface-container-lowest border-b border-surface-container">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm pl-9 pr-4 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-primary transition-all"
                placeholder="Filtrar por título, texto ou comentário..."
                type="text"
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="divide-y divide-surface-container">
            
            {/* TAB: MINHAS DISCUSSÕES */}
            {activeTab === 'discussions' && (
              filteredTopics.length === 0 ? (
                <div className="p-space-xl text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[24px]">forum</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                      {searchFilter.trim() ? 'Nenhuma discussão encontrada para a busca' : 'Você ainda não criou discussões'}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Inicie conversas técnicas sobre LLMs, agentes autônomos ou arquiteturas de IA.
                    </span>
                  </div>
                  <Link
                    href="/criar-topico"
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Criar primeira discussão</span>
                  </Link>
                </div>
              ) : (
                filteredTopics.map((topic) => (
                  <article
                    key={topic.id}
                    className="p-space-md sm:p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {topic.category && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                            {topic.category.name}
                          </span>
                        )}
                        <span className="text-on-surface-variant font-label-sm text-label-sm">·</span>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">
                          Publicado em {formatDate(topic.created_at)}
                        </span>
                      </div>

                      <Link href={`/topico/${topic.slug}`}>
                        <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors line-clamp-1 mt-0.5">
                          {topic.title}
                        </h2>
                      </Link>

                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {topic.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-space-md shrink-0 pt-space-xs sm:pt-0">
                      {/* Metrics */}
                      <div className="flex items-center gap-space-md text-center">
                        <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm" title="Upvotes">
                          <span className="material-symbols-outlined text-[16px] text-primary">code</span>
                          <span className="font-semibold text-on-surface">{topic.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm" title="Respostas">
                          <span className="material-symbols-outlined text-[16px]">forum</span>
                          <span className="font-semibold text-on-surface">{topic.comments_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm" title="Visualizações">
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span className="font-semibold text-on-surface">{topic.views_count || 0}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/topico/${topic.slug}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container border border-outline-variant/30 transition-colors"
                          title="Acessar discussão"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </Link>

                        <button
                          onClick={() => setItemToDelete({ type: 'topic', id: topic.id, title: topic.title })}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-outline-variant/30 transition-colors"
                          title="Excluir discussão"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )
            )}

            {/* TAB: COMENTÁRIOS */}
            {activeTab === 'comments' && (
              filteredComments.length === 0 ? (
                <div className="p-space-xl text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                      {searchFilter.trim() ? 'Nenhum comentário encontrado' : 'Você ainda não comentou'}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Explore as discussões na comunidade e contribua com insights técnicos.
                    </span>
                  </div>
                </div>
              ) : (
                filteredComments.map((c) => (
                  <article
                    key={c.id}
                    className="p-space-md sm:p-space-lg flex flex-col sm:flex-row sm:items-start justify-between gap-space-md hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                        <span>Em: <strong className="text-on-surface font-semibold">{c.topic?.title || 'Discussão'}</strong></span>
                        <span>·</span>
                        <span>{formatDate(c.created_at)}</span>
                      </div>

                      <p className="font-body-md text-body-md text-on-surface whitespace-pre-line">
                        {c.content}
                      </p>

                      {c.topic?.slug && (
                        <Link
                          href={`/topico/${c.topic.slug}`}
                          className="text-primary font-label-sm text-label-sm hover:underline inline-flex items-center gap-1 pt-1 font-semibold"
                        >
                          <span>Ver contexto na discussão</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-space-xs sm:pt-0">
                      <button
                        onClick={() => setItemToDelete({ type: 'comment', id: c.id, title: `Comentário em "${c.topic?.title || 'Discussão'}"` })}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-outline-variant/30 transition-colors"
                        title="Excluir comentário"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </article>
                ))
              )
            )}

            {/* TAB: SALVOS & CURTIDOS */}
            {activeTab === 'saved' && (
              filteredSaved.length === 0 ? (
                <div className="p-space-xl text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[24px]">bookmark</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                      {searchFilter.trim() ? 'Nenhum item salvo encontrado' : 'Nenhuma discussão salva'}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Curta ou salve discussões que você deseja consultar mais tarde.
                    </span>
                  </div>
                  <Link
                    href="/explorar"
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">explore</span>
                    <span>Explorar discussões</span>
                  </Link>
                </div>
              ) : (
                filteredSaved.map((item: any) => (
                  <article
                    key={item.id}
                    className="p-space-md sm:p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.category && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                            {item.category.name}
                          </span>
                        )}
                        <span className="text-on-surface-variant font-label-sm text-label-sm">·</span>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      <Link href={`/topico/${item.slug}`}>
                        <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors line-clamp-1 mt-0.5">
                          {item.title}
                        </h2>
                      </Link>

                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-space-md shrink-0 pt-space-xs sm:pt-0">
                      {/* Metrics */}
                      <div className="flex items-center gap-space-md text-center">
                        <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm" title="Upvotes">
                          <span className="material-symbols-outlined text-[16px] text-primary">code</span>
                          <span className="font-semibold text-on-surface">{item.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm" title="Respostas">
                          <span className="material-symbols-outlined text-[16px]">forum</span>
                          <span className="font-semibold text-on-surface">{item.comments_count || 0}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/topico/${item.slug}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container border border-outline-variant/30 transition-colors"
                          title="Acessar discussão"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </Link>

                        <button
                          onClick={() => handleRemoveSaved(item.id, item.slug)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-amber-600 hover:bg-surface-container border border-outline-variant/30 transition-colors"
                          title="Remover dos salvos"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">bookmark_remove</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )
            )}

          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant/30 shadow-2xl p-space-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Editar Perfil</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm font-semibold text-on-surface">Nome Completo</label>
                <input
                  type="text"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  className="bg-surface-container-low text-on-surface font-body-sm text-body-sm px-3 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-primary"
                  placeholder="Seu nome ou apelido"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm font-semibold text-on-surface">Biografia</label>
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  rows={3}
                  className="bg-surface-container-low text-on-surface font-body-sm text-body-sm px-3 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-primary resize-none"
                  placeholder="Escreva sobre seus interesses em IA, desenvolvimento..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded-lg font-label-md text-label-md font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-label-md text-label-md font-semibold bg-primary hover:bg-primary-container text-on-primary shadow-sm transition-all disabled:opacity-50"
                >
                  {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant/30 shadow-2xl p-space-lg flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {itemToDelete.type === 'topic' ? 'Excluir Discussão' : 'Excluir Comentário'}
              </h3>
            </div>
            
            <p className="font-body-md text-body-md text-on-surface-variant">
              Tem certeza que deseja excluir <strong className="text-on-surface font-semibold">"{itemToDelete.title}"</strong>? Esta ação é definitiva e não poderá ser desfeita.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg font-label-md text-label-md font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-label-md text-label-md font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all disabled:opacity-50"
                type="button"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
