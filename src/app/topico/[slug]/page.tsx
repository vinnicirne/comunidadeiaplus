import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminService } from '@/lib/services/adminService'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    slug: string
  }
}

export default async function TopicPage({ params }: Props) {
  const supabase = createClient()
  
  const [authResult, topics, allComments, categories] = await Promise.all([
    supabase.auth.getUser(),
    adminService.getTopics(),
    adminService.getComments(),
    adminService.getCategories(),
  ])

  const user = authResult.data?.user || null
  const topic = topics.find((t) => t.slug === params.slug)

  if (!topic) {
    notFound()
  }

  const topicComments = allComments.filter((c) => c.topic_id === topic.id && !c.is_deleted)

  return (
    <>
      <Header user={user} />
      <div className="pt-16 min-h-screen">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between">
          <LeftSidebar categories={categories} />
          
          <div className="flex-1 w-full lg:pl-64 xl:pr-80 min-h-screen">
            <main className="w-full max-w-3xl mx-auto px-space-md lg:px-space-lg py-space-lg">
              <div className="flex flex-col w-full gap-space-lg">
                
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

                <article className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16"></div>
                  <div className="flex flex-col gap-space-sm relative z-10">
                    <div className="flex flex-wrap items-center gap-space-sm">
                      {topic.category && (
                        <span className="px-space-sm py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">{topic.category.icon || 'folder'}</span>
                          {topic.category.name}
                        </span>
                      )}
                      <span className="text-outline text-label-sm">·</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                        {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                      {topic.title}
                    </h1>
                  </div>
                  
                  <div className="flex items-center justify-between gap-space-md py-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <div className="relative">
                        {topic.author?.avatar_url ? (
                          <img 
                            className="w-11 h-11 rounded-full object-cover shadow-sm" 
                            alt={topic.author.username} 
                            src={topic.author.avatar_url} 
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-lg uppercase shadow-sm">
                            {topic.author?.username?.slice(0, 1) || 'A'}
                          </div>
                        )}
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
                      <button className="p-space-xs text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Salvar discussão" type="button">
                        <span className="material-symbols-outlined text-[20px]">bookmark_border</span>
                      </button>
                      <button className="p-space-xs text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Mais opções" type="button">
                        <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="font-body-lg text-body-lg text-on-surface leading-relaxed flex flex-col gap-space-md whitespace-pre-wrap">
                    {topic.content}
                  </div>
                  
                  <div className="flex flex-wrap gap-space-xs items-center">
                    {/* Futuras tags podem entrar aqui */}
                  </div>
                  
                  <div className="flex items-center justify-between pt-space-md bg-surface-container-low/40 -mx-space-lg -mb-space-lg px-space-lg py-space-md mt-space-xs">
                    <div className="flex items-center gap-space-xs sm:gap-space-sm">
                      <button className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm hover:bg-primary hover:text-on-primary transition-all" type="button">
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                        <span>{topic.likes_count || 0}</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md shadow-sm hover:text-on-surface hover:bg-surface-container transition-all" type="button">
                        <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                        <span>{topic.comments_count || 0}</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md shadow-sm hover:text-on-surface hover:bg-surface-container transition-all" type="button">
                        <span className="material-symbols-outlined text-[18px]">share</span>
                        <span className="hidden sm:inline">Compartilhar</span>
                      </button>
                    </div>
                    <button className="inline-flex items-center gap-1 text-outline hover:text-error font-label-sm text-label-sm px-space-xs py-1 rounded transition-colors" title="Denunciar conteúdo" type="button">
                      <span className="material-symbols-outlined text-[18px]">flag</span>
                      <span className="hidden md:inline">Denunciar</span>
                    </button>
                  </div>
                </article>

                <section className="flex flex-col gap-space-md mt-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">{topicComments.length} comentários</h2>
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                    </div>
                    <div className="flex items-center gap-space-xs bg-surface-container-low p-0.5 rounded-lg text-label-sm font-label-sm">
                      <button className="px-space-sm py-1 rounded bg-surface-container-lowest text-on-surface font-semibold shadow-sm" type="button">Mais votados</button>
                      <button className="px-space-sm py-1 rounded text-on-surface-variant hover:text-on-surface" type="button">Recentes</button>
                    </div>
                  </div>
                  
                  {user ? (
                    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-sm font-bold shrink-0">
                          {user.email?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 flex flex-col gap-space-xs">
                          <textarea 
                            className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md p-space-sm rounded-lg focus:outline-none focus:bg-surface-container-lowest focus:shadow-inner resize-none transition-all" 
                            placeholder="Escreva um comentário construtivo..." 
                            rows={2}
                          ></textarea>
                          <div className="flex items-center justify-between pt-space-xs">
                            <div className="flex items-center gap-1 text-outline">
                              <button className="p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Negrito" type="button">
                                <span className="material-symbols-outlined text-[18px]">format_bold</span>
                              </button>
                              <button className="p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Código" type="button">
                                <span className="material-symbols-outlined text-[18px]">code</span>
                              </button>
                              <button className="p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Inserir link" type="button">
                                <span className="material-symbols-outlined text-[18px]">link</span>
                              </button>
                            </div>
                            <button className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm" type="button">
                              <span className="material-symbols-outlined text-[16px]">send</span>
                              <span>Comentar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md text-center">
                      <p className="text-on-surface-variant font-body-md mb-3">Faça login para participar da discussão.</p>
                      <Link href="/login" className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm">
                        Entrar na Comunidade
                      </Link>
                    </div>
                  )}
                </section>

                <section className="flex flex-col gap-space-lg">
                  <div className="flex flex-col">
                    {topicComments.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-surface-container-lowest text-center text-on-surface-variant font-body-md">
                        Nenhum comentário nesta discussão ainda. Seja o primeiro a responder!
                      </div>
                    ) : (
                      topicComments.map((comment) => (
                        <div key={comment.id} className={`flex flex-col ${comment.parent_id ? 'relative ml-5 sm:ml-7 pl-4 sm:pl-6 mt-space-sm' : 'mt-space-md'}`}>
                          {comment.parent_id && (
                            <div className="absolute left-0 top-0 bottom-3 w-[2px] bg-surface-container-highest rounded-full"></div>
                          )}
                          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm relative">
                            {comment.parent_id && (
                              <div className="absolute -left-4 sm:-left-6 top-6 w-4 sm:w-6 h-[2px] bg-surface-container-highest"></div>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-space-sm">
                                {comment.author?.avatar_url ? (
                                  <img 
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover" 
                                    alt={comment.author.username} 
                                    src={comment.author.avatar_url} 
                                  />
                                ) : (
                                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-sm uppercase">
                                    {comment.author?.username?.slice(0, 1) || 'A'}
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-space-xs">
                                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                                      {comment.author?.full_name || comment.author?.username}
                                    </span>
                                    <span className="font-body-sm text-body-sm text-outline">@{comment.author?.username}</span>
                                    {comment.author?.role === 'admin' && (
                                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary-container text-on-primary-container">
                                        Admin
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-label-sm text-label-sm text-outline">
                                    {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              </div>
                              <button className="text-outline hover:text-on-surface p-1 rounded hover:bg-surface-container" type="button">
                                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                              </button>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface pl-10 sm:pl-11 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                            <div className="flex items-center gap-space-md pl-10 sm:pl-11 pt-space-xs">
                              <button className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" type="button">
                                <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                                <span>{comment.likes_count || 0}</span>
                              </button>
                              <button className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" type="button">
                                <span className="material-symbols-outlined text-[16px]">reply</span>
                                <span>Responder</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
                
              </div>
            </main>
          </div>

          <RightSidebar categories={categories} />
        </div>
      </div>
    </>
  )
}
