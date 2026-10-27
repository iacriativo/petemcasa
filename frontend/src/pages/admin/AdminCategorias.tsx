import { useState, useEffect } from 'react'
import { apiClient } from '../../lib/api-client'

type CategoryRow = {
  id: string
  name: string
  slug: string
  parent_id?: string | null
  active: boolean
  sort_order: number
  created_at: string
}

export default function AdminCategorias() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = await apiClient.admin.categories.list()
      setCategories((data || []) as CategoryRow[])
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const toggleActive = async (id: string, current: boolean) => {
    setSaving(id)
    try {
      await apiClient.admin.categories.update(id, { active: !current })
      await loadCategories()
    } catch {
      alert('Erro ao atualizar categoria')
    } finally {
      setSaving(null)
    }
  }

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newSlug.trim()) return
    setSaving('new')
    try {
      await apiClient.admin.categories.create({ name: newName.trim(), slug: newSlug.trim(), active: true })
      setNewName('')
      setNewSlug('')
      await loadCategories()
    } catch {
      alert('Erro ao criar categoria')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="admin__section">
        <h2 className="admin__section-title">Categorias</h2>
        <div className="admin__empty">Carregando categorias...</div>
      </div>
    )
  }

  return (
    <div className="admin__section">
      <div className="admin__section-head">
        <h2 className="admin__section-title">Categorias</h2>
      </div>

      <form onSubmit={createCategory} style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="admin__form-input"
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da categoria"
          required
        />
        <input
          className="admin__form-input"
          type="text"
          value={newSlug}
          onChange={(e) => setNewSlug(e.target.value)}
          placeholder="slug-da-categoria"
          required
        />
        <button type="submit" className="admin__btn admin__btn--primary" disabled={saving === 'new'}>
          {saving === 'new' ? 'Criando...' : 'Criar categoria'}
        </button>
      </form>

      <table className="admin__table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Slug</th>
            <th>Ativa</th>
            <th style={{ width: 120 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
              </td>
              <td style={{ fontSize: 12, color: '#6b7c72', fontFamily: 'monospace' }}>{c.slug}</td>
              <td>
                <button
                  onClick={() => toggleActive(c.id, c.active)}
                  disabled={saving === c.id}
                  className="admin__btn"
                  style={{ padding: '6px 10px', fontSize: 12, background: c.active ? '#dcfce7' : '#f1f5f9', color: c.active ? '#15803d' : '#64748b', borderColor: c.active ? '#bbf7d0' : '#e2e8f0' }}
                >
                  {c.active ? 'Ativa' : 'Inativa'}
                </button>
              </td>
              <td></td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={4} className="admin__empty">Nenhuma categoria encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
