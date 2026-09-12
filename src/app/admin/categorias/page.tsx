'use client'

import { useEffect, useState } from 'react'
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Power,
  X,
  Check,
  Sparkles,
} from 'lucide-react'
import { adminService } from '@/lib/services/adminService'
import { Category } from '@/types/database'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '🤖',
  })

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = await adminService.getCategories()
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '🤖',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '🤖',
    })
    setIsModalOpen(true)
  }

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.slug.trim()) return

    if (editingCategory) {
      const updated = await adminService.updateCategory(editingCategory.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        icon: formData.icon,
      })
      if (updated) {
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      }
    } else {
      const created = await adminService.createCategory(formData)
      if (created) {
        setCategories((prev) => [...prev, created])
      }
    }

    setIsModalOpen(false)
  }

  const handleToggleActive = async (id: string) => {
    setActionId(id)
    try {
      const updated = await adminService.toggleCategoryActive(id)
      if (updated) {
        setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      }
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) {
      return
    }
    setActionId(id)
    try {
      await adminService.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gestão de Categorias</h2>
          <p className="text-xs text-slate-400">
            Defina as áreas temáticas da COMUNIDADE IAPLUS para organizar os tópicos e discussões.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Categories Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Carregando categorias...
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                category.is_active
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
                      {category.icon || '📁'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{category.name}</span>
                        {!category.is_active && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            Inativa
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-indigo-400 font-mono">/{category.slug}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      category.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {category.is_active ? 'Ativa' : 'Desativada'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                  {category.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400">
                  <strong className="text-slate-200">{category.topics_count || 0}</strong> discussões
                </span>

                <div className="flex items-center gap-2">
                  {/* Ativar/Desativar */}
                  <button
                    onClick={() => handleToggleActive(category.id)}
                    disabled={actionId === category.id}
                    className={`p-1.5 rounded-lg transition-colors ${
                      category.is_active
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    } disabled:opacity-40`}
                    title={category.is_active ? 'Desativar categoria' : 'Ativar categoria'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {/* Editar */}
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Editar categoria"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Excluir */}
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={actionId === category.id}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors disabled:opacity-40"
                    title="Excluir categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Criar/Editar Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-indigo-400" />
                <span>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Ícone</label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🤖"
                  className="w-full text-center py-2 bg-slate-950 border border-slate-800 rounded-xl text-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="col-span-3">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Agentes & Automação"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                Slug (URL amigável)
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="ex: agentes-e-automacao"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                Descrição
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva sobre o que os membros devem discutir nesta categoria..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20"
              >
                {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
