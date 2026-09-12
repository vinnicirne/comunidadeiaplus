'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminService } from '@/lib/services/adminService'
import { AdminKPIs, Topic, Report } from '@/types/database'

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<AdminKPIs | null>(null)
  const [recentTopics, setRecentTopics] = useState<Topic[]>([])
  const [pendingReports, setPendingReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [kpiData, topicsData, reportsData] = await Promise.all([
          adminService.getKPIs(),
          adminService.getTopics(),
          adminService.getReports('pending'),
        ])
        setKpis(kpiData)
        setRecentTopics(topicsData.slice(0, 5))
        setPendingReports(reportsData.slice(0, 4))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => {
      setToastMsg('')
    }, 3500)
  }

  const handleModeration = (reportId: string, actionDesc: string) => {
    // Aqui seria a chamada real para a API
    setPendingReports((prev) => prev.filter((r) => r.id !== reportId))
    showToast(`Decisão registrada: ${actionDesc}`)
  }

  const salvarNovaCategoria = () => {
    if (!newCategoryName.trim()) {
      alert('Por favor, informe o nome da categoria.')
      return
    }
    // API Call real...
    showToast(`Categoria "${newCategoryName}" adicionada com sucesso!`)
    setIsModalOpen(false)
    setNewCategoryName('')
    setNewCategoryDesc('')
  }

  if (loading || !kpis) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header da Página */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl text-white font-semibold tracking-tight">Dashboard de Moderação e Controle</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 text-[12px] font-semibold">
              MVP Operacional
            </span>
          </div>
          <p className="text-[15px] text-[#94a3b8]">
            Visão geral de saúde, métricas principais e fila de moderação pendente da IA Comunidade.
          </p>
        </div>

        {/* Ações Rápidas de Topo */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative bg-[#111827] border border-[#334155] rounded-lg shadow-sm">
            <select className="appearance-none bg-transparent pl-4 pr-8 py-2 rounded-lg text-[14px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer" id="period-selector">
              <option className="bg-[#111827] text-slate-200" value="7d">Últimos 7 dias</option>
              <option className="bg-[#111827] text-slate-200" value="today">Hoje</option>
              <option className="bg-[#111827] text-slate-200" value="all">Todo o período</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#94a3b8] text-[18px]">expand_more</span>
          </div>
          <a className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#111827] border border-red-500/30 hover:bg-red-950/50 text-red-400 hover:text-red-300 text-[14px] transition-all shadow-sm" href="#fila-moderacao">
            <span className="material-symbols-outlined text-[18px]">report_problem</span>
            <span>Ver denúncias urgentes</span>
            <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)] animate-pulse"></span>
          </a>
          <button 
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[14px] font-semibold transition-all shadow-md shadow-indigo-500/20"
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
        <div className="bg-[#111827] border border-[#1f2937] hover:border-[#334155] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[12px] text-[#94a3b8] uppercase tracking-wider font-semibold">Usuários Cadastrados</span>
              <span className="text-3xl text-white font-bold mt-1">{kpis.totalUsers}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">group</span>
            </div>
          </div>
          <div className="mt-4 pt-2 flex flex-col gap-1 border-t border-[#1f2937]">
            <div className="flex items-center gap-1 text-emerald-400 text-[12px] font-semibold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>Ativos: {kpis.activeUsers}</span>
            </div>
            <p className="text-[13px] text-[#94a3b8]">
              Bloqueados: <span className="text-red-400 font-medium">{kpis.blockedUsers}</span>
            </p>
            <Link className="inline-flex items-center gap-1 text-[14px] text-[#818cf8] hover:text-indigo-300 font-medium mt-1 transition-colors" href="/admin/usuarios">
              Gerenciar usuários <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Card 2: Tópicos Criados */}
        <div className="bg-[#111827] border border-[#1f2937] hover:border-[#334155] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[12px] text-[#94a3b8] uppercase tracking-wider font-semibold">Tópicos Criados</span>
              <span className="text-3xl text-white font-bold mt-1">{kpis.totalTopics}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#1e293b] border border-[#334155] text-indigo-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">forum</span>
            </div>
          </div>
          <div className="mt-4 pt-2 flex flex-col gap-1 border-t border-[#1f2937]">
            <div className="flex items-center gap-1 text-emerald-400 text-[12px] font-semibold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>Visíveis: {kpis.publishedTopics}</span>
            </div>
            <p className="text-[13px] text-[#94a3b8]">
              Ocultos: <span className="text-amber-400 font-medium">{kpis.hiddenTopics} tópicos</span>
            </p>
            <Link className="inline-flex items-center gap-1 text-[14px] text-[#818cf8] hover:text-indigo-300 font-medium mt-1 transition-colors" href="/admin/topicos">
              Ver tópicos <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Card 3: Comentários */}
        <div className="bg-[#111827] border border-[#1f2937] hover:border-[#334155] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[12px] text-[#94a3b8] uppercase tracking-wider font-semibold">Comentários</span>
              <span className="text-3xl text-white font-bold mt-1">{kpis.totalComments}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
            </div>
          </div>
          <div className="mt-4 pt-2 flex flex-col gap-1 border-t border-[#1f2937]">
            <div className="flex items-center gap-1 text-indigo-300 text-[12px] font-semibold">
              <span className="material-symbols-outlined text-[16px]">insights</span>
              <span>Discussões ativas</span>
            </div>
            <p className="text-[13px] text-[#94a3b8]">
              Engajamento da comunidade
            </p>
            <Link className="inline-flex items-center gap-1 text-[14px] text-[#818cf8] hover:text-indigo-300 font-medium mt-1 transition-colors" href="/admin/comentarios">
              Ver comentários <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Card 4: Denúncias Pendentes (Destaque/Alerta) */}
        <div className="bg-[#111827] border border-red-900/40 hover:border-red-600/60 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[12px] text-red-400 uppercase tracking-wider font-bold">Ação Requerida</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl text-white font-bold">{kpis.pendingReports}</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/40 text-[12px] font-bold">
                    Pendentes
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-950/70 border border-red-500/40 text-red-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
            </div>
            <p className="text-[13px] text-[#94a3b8] mt-2">
              <strong className="text-red-400">{kpis.pendingReports > 0 ? `${kpis.pendingReports} ocorrências` : 'Nenhuma'}</strong> em triagem
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#1f2937]">
            <Link className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[14px] font-semibold transition-all shadow-md shadow-red-900/30" href="#fila-moderacao">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              Resolver agora
            </Link>
          </div>
        </div>
      </div>

      {/* Banner Informativo */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg text-white font-semibold">Heurística Antifraude Automática Ativa</span>
              <span className="px-2 py-0.5 rounded bg-[#1e293b] border border-[#334155] text-slate-300 text-[12px] font-medium">Model v1.4</span>
            </div>
            <p className="text-[13px] text-[#94a3b8] truncate">
              7 tópicos foram colocados em quarentena automática nas últimas 24h para revisão humana. Fila otimizada para respostas em menos de 1h.
            </p>
          </div>
        </div>
      </div>

      {/* Seção Principal: Fila de Denúncias Urgentes */}
      <section className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 shadow-lg flex flex-col gap-4" id="fila-moderacao">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f2937] pb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse"></div>
            <h2 className="text-xl text-white font-semibold">
              Fila de Denúncias Urgentes
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/40 text-[12px] font-bold">
              {pendingReports.length} Críticas Aguardando Decisão
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#94a3b8] text-[12px]">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Tempo médio de resposta atual: <strong className="text-slate-200">38 min</strong></span>
          </div>
        </div>

        <div className="flex flex-col gap-4" id="denuncias-container">
          {pendingReports.length === 0 ? (
             <div className="p-6 text-center bg-[#0f172a] border border-[#334155] rounded-xl flex flex-col items-center justify-center gap-1">
                <span className="material-symbols-outlined text-emerald-400 text-[36px]">task_alt</span>
                <p className="text-lg text-white font-semibold">Fila de denúncias limpa!</p>
                <p className="text-[13px] text-[#94a3b8]">Todas as ocorrências críticas foram analisadas e decididas.</p>
              </div>
          ) : (
            pendingReports.map((report) => (
              <article key={report.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 flex flex-col gap-2 transition-all hover:border-[#475569]">
                <div className="flex flex-wrap items-center justify-between gap-1 text-[12px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-[#0f172a] border border-[#334155] text-slate-300 font-semibold uppercase tracking-wide">
                      {report.topic ? 'Tópico Criado' : 'Comentário'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 font-semibold">
                      {report.reason}
                    </span>
                    <span className="text-[#94a3b8] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">flag</span>
                      Denunciado por <strong className="text-slate-200">@{report.reporter?.username}</strong>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#0f172a] border border-[#334155] text-[#cbd5e1] font-medium">
                    Status: Pendente
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 pl-1">
                  <div className="flex items-center gap-1 text-[#94a3b8] text-[13px]">
                    <span>Alvo afetado:</span>
                    <a className="text-[#818cf8] hover:text-indigo-300 hover:underline font-medium" href="#">
                      {report.topic?.title || 'Comentário em discussão'}
                    </a>
                  </div>
                  <div className="bg-[#0f172a] border border-[#1f2937] rounded-lg p-2 mt-1">
                    <p className="text-[15px] text-slate-200 font-medium selection:bg-red-900/60">
                      &ldquo;{report.topic?.title || report.comment?.content}&rdquo;
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#334155]/60">
                  <div className="flex items-center gap-1 text-[#94a3b8] text-[12px]">
                    <span className="material-symbols-outlined text-[16px] text-amber-400">verified_user</span>
                    <span>Análise requerida</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#0f172a] border border-[#334155] hover:bg-[#131c2e] text-slate-200 hover:text-white text-[14px] transition-colors" 
                      onClick={() => handleModeration(report.id, 'conteúdo excluído')}
                    >
                      <span className="material-symbols-outlined text-[18px] text-red-400">delete</span>
                      Excluir
                    </button>
                    <button 
                      className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[14px] font-semibold transition-colors shadow-sm shadow-red-900/30" 
                      onClick={() => handleModeration(report.id, 'usuário bloqueado')}
                    >
                      <span className="material-symbols-outlined text-[18px]">block</span>
                      Bloquear
                    </button>
                    <button 
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#0f172a] text-[14px] transition-colors" 
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
        <div className="lg:col-span-7 bg-[#111827] border border-[#1f2937] rounded-xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1e293b] border border-[#334155] text-indigo-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">history</span>
                </div>
                <div>
                  <h3 className="text-lg text-white font-semibold">Últimos Tópicos</h3>
                  <p className="text-[13px] text-[#94a3b8]">Publicações recentes na comunidade</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[12px] px-2.5 py-0.5 rounded-full bg-[#1e293b] border border-[#334155] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              {recentTopics.map((topic) => (
                <div key={topic.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-[#1e293b]/70 border border-transparent hover:border-[#334155] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 flex items-center justify-center flex-shrink-0 text-sm font-semibold uppercase">
                    {topic.author?.username?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-slate-200 leading-snug">
                      <strong className="font-semibold text-white">@{topic.author?.username}</strong> publicou: 
                      <a className="text-[#818cf8] hover:text-indigo-300 hover:underline font-medium ml-1" href="#">{topic.title}</a>
                    </p>
                    <span className="text-[13px] text-[#64748b]">{topic.comments_count} respostas • {topic.category?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-[#1f2937]">
            <Link className="inline-flex items-center gap-1 text-[14px] text-[#818cf8] hover:text-indigo-300 font-medium transition-colors" href="/admin/topicos">
              Ver todos os tópicos <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>
        </div>

        {/* Coluna Direita: Gestão Rápida de Categorias (5 Cols) */}
        <div className="lg:col-span-5 bg-[#111827] border border-[#1f2937] rounded-xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1e293b] border border-[#334155] text-slate-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">category</span>
                </div>
                <div>
                  <h3 className="text-lg text-white font-semibold">Categorias</h3>
                  <p className="text-[13px] text-[#94a3b8]">Gestão rápida</p>
                </div>
              </div>
              <button 
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 hover:bg-indigo-500/30 text-indigo-300 text-[12px] font-semibold transition-colors" 
                onClick={() => setIsModalOpen(true)}
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Nova
              </button>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0f172a] border border-[#1f2937] hover:border-[#334155] hover:bg-[#131c2e] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-[20px]">psychology</span>
                  <div>
                    <div className="text-[14px] text-white font-semibold">IA Geral</div>
                    <div className="text-[13px] text-[#94a3b8]">Ativa</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0f172a] border border-[#1f2937] hover:border-[#334155] hover:bg-[#131c2e] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-[20px]">terminal</span>
                  <div>
                    <div className="text-[14px] text-white font-semibold">Programação</div>
                    <div className="text-[13px] text-[#94a3b8]">Ativa</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-2 flex items-center justify-between border-t border-[#1f2937]">
            <Link className="inline-flex items-center gap-1 text-[14px] text-[#818cf8] hover:text-indigo-300 font-medium transition-colors" href="/admin/categorias">
              Gerenciar todas as categorias <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${toastMsg ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-[#334155] text-white rounded-xl shadow-2xl text-[14px]">
          <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      </div>

      {/* Modal Nova Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-[#334155] rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
              <h3 className="text-xl text-white font-semibold">Adicionar Nova Categoria</h3>
              <button className="p-1 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors" onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] text-slate-200 font-medium">Nome da Categoria</label>
              <input 
                className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-[#334155] text-white placeholder:text-[#64748b] focus:outline-none focus:bg-[#131c2e] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[13px]" 
                placeholder="Ex: Agentes Autônomos" 
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <label className="text-[14px] text-slate-200 font-medium mt-1">Descrição Breve</label>
              <textarea 
                className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-[#334155] text-white placeholder:text-[#64748b] focus:outline-none focus:bg-[#131c2e] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[13px]" 
                placeholder="Descreva o escopo..." 
                rows={2}
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#1f2937]">
              <button className="px-4 py-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1e293b] text-[14px] transition-colors" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[14px] font-semibold transition-colors shadow-md shadow-indigo-500/20" onClick={salvarNovaCategoria}>
                Criar Categoria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
