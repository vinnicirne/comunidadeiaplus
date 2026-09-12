import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminAuditoriaPage() {
  const supabase = createClient();
  
  const [
    { data: recentReports },
    { data: blockedUsers },
    { data: recentTopics },
  ] = await Promise.all([
    supabase.from('reports').select('*, reporter:profiles(*), topic:topics(*)').order('created_at', { ascending: false }).limit(10),
    supabase.from('profiles').select('*').eq('is_blocked', true).order('updated_at', { ascending: false }).limit(10),
    supabase.from('topics').select('*, author:profiles(*)').order('created_at', { ascending: false }).limit(10),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Auditoria & Logs</h2>
          <p className="text-xs text-slate-400">
            Registro de eventos, moderações, denúncias e bloqueios em tempo real.
          </p>
        </div>
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Voltar ao Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Denúncias recentes */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-400">report</span>
              Denúncias Recentes
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{recentReports?.length || 0}</span>
          </div>
          <div className="flex flex-col gap-2">
            {(!recentReports || recentReports.length === 0) ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhuma denúncia registrada.</p>
            ) : (
              recentReports.map((rep: any) => (
                <div key={rep.id} className="text-xs p-2 rounded bg-[#0f172a] border border-[#1e293b] flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate">{rep.reason || 'Denúncia'}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${rep.status === 'resolved' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
                      {rep.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Por: @{rep.reporter?.username || 'anônimo'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Usuários Bloqueados */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-rose-400">block</span>
              Usuários Bloqueados
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{blockedUsers?.length || 0}</span>
          </div>
          <div className="flex flex-col gap-2">
            {(!blockedUsers || blockedUsers.length === 0) ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhum usuário bloqueado.</p>
            ) : (
              blockedUsers.map((u: any) => (
                <div key={u.id} className="text-xs p-2 rounded bg-[#0f172a] border border-[#1e293b] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">@{u.username}</span>
                    <span className="text-[10px] text-slate-400">{u.full_name || 'Sem nome'}</span>
                  </div>
                  <span className="text-[10px] text-rose-400 font-semibold uppercase">Bloqueado</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Publicações Recentes */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-indigo-400">post_add</span>
              Tópicos Recentes
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{recentTopics?.length || 0}</span>
          </div>
          <div className="flex flex-col gap-2">
            {(!recentTopics || recentTopics.length === 0) ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhum tópico publicado.</p>
            ) : (
              recentTopics.map((t: any) => (
                <div key={t.id} className="text-xs p-2 rounded bg-[#0f172a] border border-[#1e293b] flex flex-col gap-1">
                  <span className="font-semibold text-slate-200 truncate">{t.title}</span>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>@{t.author?.username || 'autor'}</span>
                    <span>{new Date(t.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
