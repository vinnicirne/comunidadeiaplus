'use client'

import { useEffect, useState } from 'react'
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Power,
  X,
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
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Gestão de Categorias</h2>
          <p className="text-xs text-on-surface-variant">
            Defina as áreas temáticas da Comunidade IA PLUS para organizar os tópicos e discussões.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Categories Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-on-surface-variant">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Carregando categorias...
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                category.is_active
                  ? 'bg-surface-container-lowest border-outline-variant/40 hover:border-outline-variant shadow-sm'
                  : 'bg-surface-container/30 border-outline-variant/20 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-center text-2xl shadow-inner">
                      {category.icon || '📁'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                        <span>{category.name}</span>
                        {!category.is_active && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                            Inativa
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-primary font-mono">/{category.slug}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      category.is_active
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-surface-container text-on-surface-variant border border-outline-variant/30'
                    }`}
                  >
                    {category.is_active ? 'Ativa' : 'Desativada'}
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed min-h-[36px]">
                  {category.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-outline-variant/30">
                <span className="text-[11px] text-on-surface-variant">
                  <strong className="text-on-surface font-semibold">{category.topics_count || 0}</strong> discussões
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Ativar/Desativar */}
                  <button
                    onClick={() => handleToggleActive(category.id)}
                    disabled={actionId === category.id}
                    className={`p-1.5 rounded-lg transition-colors ${
                      category.is_active
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    } disabled:opacity-40`}
                    title={category.is_active ? 'Desativar categoria' : 'Ativar categoria'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {/* Editar */}
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Editar categoria"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Excluir */}
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={actionId === category.id}
                    className="p-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 transition-colors disabled:opacity-40"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-primary" />
                <span>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1">
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">Ícone</label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🤖"
                  className="w-full text-center py-2 bg-surface-container/60 border border-outline-variant/40 rounded-xl text-lg text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="col-span-3">
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Agentes & Automação"
                  className="w-full px-3.5 py-2 bg-surface-container/60 border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">
                Slug (URL amigável)
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="ex: agentes-e-automacao"
                className="w-full px-3.5 py-2 bg-surface-container/60 border border-outline-variant/40 rounded-xl text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">
                Descrição
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva sobre o que os membros devem discutir nesta categoria..."
                className="w-full px-3.5 py-2 bg-surface-container/60 border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex gap-2 pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-on-primary transition-colors shadow-sm"
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
