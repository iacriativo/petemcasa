import { useState, useEffect } from 'react'
import { apiClient } from '../../lib/api-client'

type ProductRow = {
  id: string
  name: string
  description?: string | null
  brand?: string | null
  category_id?: string | null
  public_image_url?: string | null
  active: boolean
  created_at: string
}

export default function AdminProdutos() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await apiClient.admin.products.list()
      setProducts((data || []) as ProductRow[])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const toggleActive = async (id: string, current: boolean) => {
    setSaving(id)
    try {
      await apiClient.admin.products.update(id, { active: !current })
      await loadProducts()
    } catch {
      alert('Erro ao atualizar produto')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="admin__section">
        <h2 className="admin__section-title">Produtos</h2>
        <div className="admin__empty">Carregando produtos...</div>
      </div>
    )
  }

  return (
    <div className="admin__section">
      <div className="admin__section-head">
        <h2 className="admin__section-title">Produtos</h2>
      </div>
      <table className="admin__table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Imagem pública</th>
            <th>Ativo</th>
            <th style={{ width: 120 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#6b7c72' }}>{p.brand || '-'}</div>
              </td>
              <td style={{ fontSize: 12, color: '#6b7c72' }}>{p.category_id || '-'}</td>
              <td>
                {p.public_image_url ? (
                  <img src={p.public_image_url} alt={p.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 12, color: '#6b7c72' }}>-</span>
                )}
              </td>
              <td>
                <button
                  onClick={() => toggleActive(p.id, p.active)}
                  disabled={saving === p.id}
                  className="admin__btn"
                  style={{ padding: '6px 10px', fontSize: 12, background: p.active ? '#dcfce7' : '#f1f5f9', color: p.active ? '#15803d' : '#64748b', borderColor: p.active ? '#bbf7d0' : '#e2e8f0' }}
                >
                  {p.active ? 'Ativo' : 'Inativo'}
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={5} className="admin__empty">Nenhum produto encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
