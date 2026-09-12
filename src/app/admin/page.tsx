'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminService } from '@/lib/services/adminService'
import { AdminKPIs, Topic, Report, Category } from '@/types/database'

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<AdminKPIs | null>(null)
  const [recentTopics, setRecentTopics] = useState<Topic[]>([])
  const [pendingReports, setPendingReports] = useState<Report[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('🤖')
  const [savingCategory, setSavingCategory] = useState(false)

  const loadData = async () => {
    try {
      const [kpiData, topicsData, reportsData, categoriesData] = await Promise.all([
        adminService.getKPIs(),
        adminService.getTopics(),
        adminService.getReports('pending'),
        adminService.getCategories(),
      ])
      setKpis(kpiData)
      setRecentTopics(topicsData.slice(0, 5))
      setPendingReports(reportsData.slice(0, 4))
      setCategories(categoriesData.slice(0, 4))
    } catch (err) {
      console.error('Falha ao carregar dados do dashboard admin:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => {
      setToastMsg('')
    }, 3500)
  }

  const handleModeration = async (reportId: string, actionDesc: string) => {
    try {
      const action = actionDesc.toLowerCase().includes('ignorar') 
        ? 'ignored' 
        : actionDesc.toLowerCase().includes('bloquear') 
          ? 'user_blocked' 
          : 'content_deleted'

      await adminService.resolveReport(reportId, action as any)
      setPendingReports((prev) => prev.filter((r) => r.id !== reportId))
      showToast(`Decisão registrada: ${actionDesc}`)
      // Atualiza KPIs após moderação
      adminService.getKPIs().then(setKpis)
    } catch (e: any) {
      alert(`Falha ao moderar denúncia: ${e.message}`)
    }
  }

  const salvarNovaCategoria = async () => {
    if (!newCategoryName.trim()) {
      alert('Por favor, informe o nome da categoria.')
      return
    }
    setSavingCategory(true)
    try {
      const slug = newCategoryName
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

      const created = await adminService.createCategory({
        name: newCategoryName.trim(),
        slug,
        description: newCategoryDesc.trim(),
        icon: newCategoryIcon.trim() || '🤖',
      })

      if (created) {
        showToast(`Categoria "${created.name}" criada com sucesso!`)
        setIsModalOpen(false)
        setNewCategoryName('')
        setNewCategoryDesc('')
        setNewCategoryIcon('🤖')
        const updatedCats = await adminService.getCategories()
        setCategories(updatedCats.slice(0, 4))
      }
    } catch (e: any) {
      alert(`Erro ao salvar categoria: ${e.message}`)
    } finally {
      setSavingCategory(false)
    }
  }

  if (loading || !kpis) {
    return (
      <div className="flex items-center justify-center h-80 text-on-surface-variant">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium">Carregando métricas do fórum...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full gap-6 max-w-7xl mx-auto">
      {/* Header da Página */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl text-on-surface font-bold tracking-tight">
              Dashboard de Moderação e Controle
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold">
              Tempo Real
            </span>
          </div>
          <p className="text-[14px] text-on-surface-variant">
            Visão consolidada de métricas operacionais, controle de conteúdo e fila de moderação.
          </p>
        </div>

        {/* Ações Rápidas de Topo */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a 
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-lowest border border-error/30 hover:bg-error/10 text-error text-[13px] font-medium transition-all shadow-sm" 
            href="#fila-moderacao"
          >
            <span className="material-symbols-outlined text-[18px]">report_problem</span>
            <span>Ver denúncias ({kpis.pendingReports})</span>
            {kpis.pendingReports > 0 && (
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            )}
          </a>
          <button 
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-[13px] font-semibold transition-all shadow-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Nova Categoria</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Principais de Indicadores (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Usuários Cadastrados */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 hover:border-outline-variant rounded-2xl p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Usuários Cadastrados
              </span>
              <span className="text-3xl text-on-surface font-bold mt-1">{kpis.totalUsers}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">group</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex flex-col gap-1 border-t border-outline-variant/30">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[12px] font-semibold">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Ativos: {kpis.activeUsers}</span>
            </div>
            <p className="text-[12px] text-on-surface-variant">
              Bloqueados: <span className="text-error font-medium">{kpis.blockedUsers}</span>
            </p>
            <Link 
              className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline font-medium mt-1 transition-colors" 
              href="/admin/usuarios"
            >
              Gerenciar usuários <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Card 2: Tópicos Criados */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 hover:border-outline-variant rounded-2xl p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Tópicos Criados
              </span>
              <span className="text-3xl text-on-surface font-bold mt-1">{kpis.totalTopics}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">forum</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex flex-col gap-1 border-t border-outline-variant/30">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[12px] font-semibold">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Publicados: {kpis.publishedTopics}</span>
            </div>
            <p className="text-[12px] text-on-surface-variant">
              Ocultos: <span className="text-amber-500 font-medium">{kpis.hiddenTopics} tópicos</span>
            </p>
            <Link 
              className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline font-medium mt-1 transition-colors" 
              href="/admin/topicos"
            >
              Ver tópicos <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Card 3: Comentários */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 hover:border-outline-variant rounded-2xl p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Comentários
              </span>
              <span className="text-3xl text-on-surface font-bold mt-1">{kpis.totalComments}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex flex-col gap-1 border-t border-outline-variant/30">
            <div className="flex items-center gap-1 text-primary text-[12px] font-semibold">
              <span className="material-symbols-outlined text-[16px]">insights</span>
              <span>Engajamento do Fórum</span>
            </div>
            <p className="text-[12px] text-on-surface-variant">
              Discussões ativas na plataforma
            </p>
            <Link 
              className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline font-medium mt-1 transition-colors" 
              href="/admin/comentarios"
            >
              Ver comentários <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Card 4: Denúncias Pendentes */}
        <div className="bg-surface-container-lowest border border-error/30 hover:border-error/50 rounded-2xl p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] text-error uppercase tracking-wider font-bold">
                  Fila de Moderação
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl text-on-surface font-bold">{kpis.pendingReports}</span>
                  {kpis.pendingReports > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-error/10 text-error border border-error/20 text-[11px] font-bold">
                      Urgente
                    </span>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-error/10 border border-error/20 text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
            </div>
            <p className="text-[12px] text-on-surface-variant mt-2">
              <strong className={kpis.pendingReports > 0 ? 'text-error font-semibold' : 'text-on-surface'}>
                {kpis.pendingReports > 0 ? `${kpis.pendingReports} ocorrências` : 'Nenhuma'}
              </strong> aguardando análise
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/30">
            <Link 
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-error hover:bg-error/90 text-on-error text-[13px] font-semibold transition-all shadow-sm" 
              href="#fila-moderacao"
            >
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              Resolver agora
            </Link>
          </div>
        </div>
      </div>

      {/* Seção Principal: Fila de Denúncias Urgentes */}
      <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm flex flex-col gap-4" id="fila-moderacao">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse"></div>
            <h2 className="text-lg text-on-surface font-semibold">
              Fila de Denúncias Urgentes
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-error/10 text-error border border-error/20 text-[11px] font-bold">
              {pendingReports.length} Aguardando Decisão
            </span>
          </div>
          <Link 
            href="/admin/denuncias" 
            className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            Ver todas as denúncias <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {pendingReports.length === 0 ? (
            <div className="p-8 text-center bg-surface-container/40 border border-outline-variant/30 rounded-xl flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-[36px]">task_alt</span>
              <p className="text-base text-on-surface font-semibold">Fila de denúncias limpa!</p>
              <p className="text-[13px] text-on-surface-variant">Todas as ocorrências do fórum foram analisadas e decididas.</p>
            </div>
          ) : (
            pendingReports.map((report) => (
              <article key={report.id} className="bg-surface-container/50 border border-outline-variant/40 rounded-xl p-4 flex flex-col gap-3 transition-all hover:border-outline-variant">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface font-semibold uppercase tracking-wide text-[10px]">
                      {report.topic ? 'Tópico' : 'Comentário'}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-error/10 text-error border border-error/20 font-semibold text-[11px]">
                      {report.reason}
                    </span>
                    <span className="text-on-surface-variant flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[14px]">flag</span>
                      Denunciado por <strong className="text-on-surface">@{report.reporter?.username || 'membro'}</strong>
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium text-[11px]">
                    Status: Pendente
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 pl-1">
                  <div className="flex items-center gap-1 text-on-surface-variant text-[12px]">
                    <span>Alvo afetado:</span>
                    {report.topic?.slug ? (
                      <Link 
                        className="text-primary hover:underline font-medium" 
                        href={`/topico/${report.topic.slug}`}
                        target="_blank"
                      >
                        {report.topic.title}
                      </Link>
                    ) : (
                      <span className="font-medium text-on-surface">
                        {report.topic?.title || 'Comentário em discussão'}
                      </span>
                    )}
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 mt-1">
                    <p className="text-[14px] text-on-surface font-medium italic">
                      &ldquo;{report.topic?.title || report.comment?.content}&rdquo;
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/30">
                  <div className="flex items-center gap-1 text-on-surface-variant text-[11px]">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">verified_user</span>
                    <span>Análise requerida</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-[12px] font-medium transition-colors" 
                      onClick={() => handleModeration(report.id, 'conteúdo excluído')}
                    >
                      <span className="material-symbols-outlined text-[16px] text-error">delete</span>
                      Excluir
                    </button>
                    <button 
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-error hover:bg-error/90 text-on-error text-[12px] font-semibold transition-colors shadow-sm" 
                      onClick={() => handleModeration(report.id, 'usuário bloqueado')}
                    >
                      <span className="material-symbols-outlined text-[16px]">block</span>
                      Bloquear
                    </button>
                    <button 
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-[12px] font-medium transition-colors" 
                      onClick={() => handleModeration(report.id, 'denúncia ignorada')}
                    >
                      Ignorar
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Grid de 2 Colunas: Atividade Recente & Gestão Rápida de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Atividade Recente da Comunidade (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">history</span>
                </div>
                <div>
                  <h3 className="text-base text-on-surface font-semibold">Últimos Tópicos</h3>
                  <p className="text-[12px] text-on-surface-variant">Publicações recentes no fórum</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-surface-container border border-outline-variant/40 text-on-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Ao Vivo
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              {recentTopics.length === 0 ? (
                <p className="text-xs text-on-surface-variant py-4 text-center">Nenhum tópico recente encontrado.</p>
              ) : (
                recentTopics.map((topic) => (
                  <div key={topic.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-container/50 border border-transparent hover:border-outline-variant/40 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-xs font-semibold uppercase">
                      {topic.author?.username?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-on-surface leading-snug">
                        <strong className="font-semibold text-on-surface">@{topic.author?.username}</strong> publicou: 
                        <Link 
                          className="text-primary hover:underline font-medium ml-1" 
                          href={`/topico/${topic.slug}`}
                        >
                          {topic.title}
                        </Link>
                      </p>
                      <span className="text-[11px] text-on-surface-variant">
                        {topic.comments_count} respostas • {topic.category?.name || 'Geral'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-outline-variant/30">
            <Link 
              className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline font-medium transition-colors" 
              href="/admin/topicos"
            >
              Ver todos os tópicos <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>
        </div>

        {/* Coluna Direita: Gestão Rápida de Categorias (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">category</span>
                </div>
                <div>
                  <h3 className="text-base text-on-surface font-semibold">Categorias Ativas</h3>
                  <p className="text-[12px] text-on-surface-variant">Estrutura de temas</p>
                </div>
              </div>
              <button 
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-[11px] font-semibold transition-colors" 
                onClick={() => setIsModalOpen(true)}
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Nova
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {categories.length === 0 ? (
                <p className="text-xs text-on-surface-variant py-4 text-center">Nenhuma categoria encontrada.</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container/40 border border-outline-variant/30 hover:border-outline-variant/50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg flex-shrink-0">{cat.icon || '📁'}</span>
                      <div className="truncate">
                        <div className="text-[13px] text-on-surface font-semibold truncate">{cat.name}</div>
                        <div className="text-[11px] text-on-surface-variant truncate">/{cat.slug}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-surface-container text-on-surface-variant'}`}>
                      {cat.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-4 mt-2 flex items-center justify-between border-t border-outline-variant/30">
            <Link 
              className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline font-medium transition-colors" 
              href="/admin/categorias"
            >
              Gerenciar todas as categorias <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${toastMsg ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-highest border border-outline-variant/50 text-on-surface rounded-xl shadow-xl text-[13px] font-medium">
          <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      </div>

      {/* Modal Nova Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="text-lg text-on-surface font-bold">Adicionar Nova Categoria</h3>
              <button 
                className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" 
                onClick={() => setIsModalOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] text-on-surface-variant font-medium block mb-1">Ícone (Emoji)</label>
                <input 
                  className="w-20 px-3 py-2 rounded-xl bg-surface-container/60 border border-outline-variant/40 text-on-surface text-center text-lg focus:outline-none focus:border-primary" 
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  maxLength={4}
                />
              </div>
              <div>
                <label className="text-[12px] text-on-surface-variant font-medium block mb-1">Nome da Categoria</label>
                <input 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[13px]" 
                  placeholder="Ex: Agentes Autônomos" 
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[12px] text-on-surface-variant font-medium block mb-1">Descrição Breve</label>
                <textarea 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[13px]" 
                  placeholder="Descreva o escopo da categoria..." 
                  rows={2}
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30">
              <button 
                className="px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-[13px] font-medium transition-colors" 
                onClick={() => setIsModalOpen(false)}
                disabled={savingCategory}
              >
                Cancelar
              </button>
              <button 
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-[13px] font-semibold transition-colors shadow-sm disabled:opacity-50" 
                onClick={salvarNovaCategoria}
                disabled={savingCategory}
              >
                {savingCategory ? 'Criando...' : 'Criar Categoria'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
