'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  Eye,
  AlertCircle,
  X,
} from 'lucide-react'
import { adminService } from '@/lib/services/adminService'
import { Profile } from '@/types/database'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async (query = '') => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getUsers(query)
      setUsers(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários. Verifique o console.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(searchTerm)
  }, [searchTerm])

  const handleToggleBlock = async (userId: string) => {
    setActionLoadingId(userId)
    try {
      const updated = await adminService.toggleBlockUser(userId)
      if (updated) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
        if (selectedUser?.id === userId) setSelectedUser(updated)
      }
    } catch (err: any) {
      alert(`Falha ao alterar bloqueio: ${err.message}`)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente o usuário @${username}?`)) {
      return
    }
    setActionLoadingId(userId)
    try {
      await adminService.deleteUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      if (selectedUser?.id === userId) setSelectedUser(null)
    } catch (err: any) {
      alert(`Falha ao excluir usuário: ${err.message}`)
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Gestão de Usuários</h2>
          <p className="text-xs text-on-surface-variant">
            Controle de permissões, bloqueio e administração dos membros da comunidade.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar por nome ou @username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container/60 border border-outline-variant/40 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container/50 text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Permissão</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Membro Desde</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Carregando membros...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-error bg-error/5">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-error" />
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                    Nenhum usuário encontrado para a busca &ldquo;{searchTerm}&rdquo;.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-9 h-9 rounded-full object-cover border border-outline-variant/40"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs uppercase">
                            {user.username.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-on-surface flex items-center gap-1.5">
                            <span>{user.full_name || user.username}</span>
                            {user.role === 'admin' && (
                              <Shield className="w-3.5 h-3.5 text-primary" />
                            )}
                          </div>
                          <span className="text-on-surface-variant text-[11px]">@{user.username}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          user.role === 'admin'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-surface-container text-on-surface-variant border border-outline-variant/30'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                          user.is_blocked
                            ? 'bg-error/10 text-error border border-error/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.is_blocked ? 'bg-error' : 'bg-emerald-500'
                          }`}
                        ></span>
                        {user.is_blocked ? 'Bloqueado' : 'Ativo'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Ver Perfil */}
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                          title="Ver detalhes do perfil"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Bloquear / Desbloquear */}
                        <button
                          onClick={() => handleToggleBlock(user.id)}
                          disabled={actionLoadingId === user.id || user.role === 'admin'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.is_blocked
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          } disabled:opacity-40`}
                          title={user.is_blocked ? 'Desbloquear usuário' : 'Bloquear usuário'}
                        >
                          {user.is_blocked ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </button>

                        {/* Excluir Usuário */}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          disabled={actionLoadingId === user.id || user.role === 'admin'}
                          className="p-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 transition-colors disabled:opacity-40"
                          title="Excluir usuário permanentemente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Perfil */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute right-4 top-4 text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              {selectedUser.avatar_url ? (
                <img
                  src={selectedUser.avatar_url}
                  alt={selectedUser.username}
                  className="w-14 h-14 rounded-full object-cover border border-outline-variant/40"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xl text-primary uppercase">
                  {selectedUser.username.slice(0, 2)}
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-on-surface">{selectedUser.full_name || selectedUser.username}</h3>
                <p className="text-xs text-primary font-medium">@{selectedUser.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/30">
                    {selectedUser.role}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedUser.is_blocked
                        ? 'bg-error/10 text-error border border-error/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {selectedUser.is_blocked ? 'Bloqueado' : 'Ativo'}
                  </span>
                </div>
              </div>
            </div>

            {selectedUser.bio && (
              <div className="p-3.5 rounded-xl bg-surface-container/50 border border-outline-variant/30 text-xs text-on-surface">
                <span className="text-[10px] uppercase font-semibold text-on-surface-variant block mb-1">
                  Biografia
                </span>
                {selectedUser.bio}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs text-on-surface-variant">
              <div className="p-3 rounded-xl bg-surface-container/40 border border-outline-variant/30">
                <span className="text-[10px] uppercase text-on-surface-variant/80 block">ID do Usuário</span>
                <span className="font-mono text-on-surface truncate block text-[11px] mt-0.5">{selectedUser.id}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container/40 border border-outline-variant/30">
                <span className="text-[10px] uppercase text-on-surface-variant/80 block">Cadastro</span>
                <span className="text-on-surface block text-[11px] mt-0.5">
                  {new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-outline-variant/30">
              <button
                onClick={() => handleToggleBlock(selectedUser.id)}
                disabled={selectedUser.role === 'admin'}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  selectedUser.is_blocked
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                } disabled:opacity-40`}
              >
                {selectedUser.is_blocked ? 'Desbloquear Acesso' : 'Bloquear Usuário'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
