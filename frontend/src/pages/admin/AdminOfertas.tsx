import { useEffect, useState } from 'react'
import { apiClient } from '../../lib/api-client'

type OfferRow = {
  id: string
  product_id: string | null
  collected_price: number
  original_price?: number | null
  availability: string
  status: string
  collected_at: string
  products?: {
    id: string
    name: string
    description?: string | null
    brand?: string | null
    category_id?: string | null
    public_image_url?: string | null
    active: boolean
  } | null
}

export default function AdminOfertas() {
  const [offers, setOffers] = useState<OfferRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const loadOffers = async () => {
    setLoading(true)
    try {
      const data = await apiClient.admin.offers.list('pending')
      setOffers((data || []) as OfferRow[])
    } catch {
      setOffers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOffers()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    setSaving(id)
    try {
      await apiClient.admin.offers.update(id, { status })
      await loadOffers()
    } catch {
      alert('Erro ao atualizar status da oferta')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="admin__section">
        <h2 className="admin__section-title">Ofertas</h2>
        <div className="admin__empty">Carregando ofertas...</div>
      </div>
    )
  }

  return (
    <div className="admin__section">
      <div className="admin__section-head">
        <h2 className="admin__section-title">Ofertas coletadas</h2>
      </div>
      <table className="admin__table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Preço coletado</th>
            <th>Disponibilidade</th>
            <th>Status</th>
            <th>Coletado em</th>
            <th style={{ width: 120 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((o) => (
            <tr key={o.id}>
              <td>
                <div style={{ fontWeight: 700 }}>{o.products?.name || 'Produto'}</div>
                <div style={{ fontSize: 12, color: '#6b7c72' }}>{o.products?.brand || ''}</div>
              </td>
              <td>R$ {Number(o.collected_price).toFixed(2)}</td>
              <td>
                <span className={`admin__badge admin__badge--${o.availability === 'available' ? 'published' : 'draft'}`}>
                  {o.availability === 'available' ? 'Disponível' : 'Indisponível'}
                </span>
              </td>
              <td>
                <span className={`admin__badge admin__badge--${o.status === 'pending' ? 'pending' : o.status === 'approved' ? 'approved' : o.status === 'rejected' ? 'rejected' : 'draft'}`}>
                  {o.status === 'pending' ? 'Pendente' : o.status === 'approved' ? 'Aprovada' : o.status === 'rejected' ? 'Rejeitada' : o.status}
                </span>
              </td>
              <td style={{ fontSize: 12, color: '#6b7c72' }}>{new Date(o.collected_at).toLocaleDateString('pt-BR')}</td>
              <td>
                {o.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => updateStatus(o.id, 'approved')}
                      disabled={saving === o.id}
                      className="admin__btn"
                      style={{ padding: '6px 10px', fontSize: 12, background: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' }}
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => updateStatus(o.id, 'rejected')}
                      disabled={saving === o.id}
                      className="admin__btn admin__btn--danger"
                      style={{ padding: '6px 10px', fontSize: 12 }}
                    >
                      Rejeitar
                    </button>
                  </div>
                )}
                {o.status !== 'pending' && (
                  <span style={{ fontSize: 12, color: '#6b7c72' }}>{o.status === 'approved' ? 'Aprovada' : o.status === 'rejected' ? 'Rejeitada' : o.status}</span>
                )}
              </td>
            </tr>
          ))}
          {offers.length === 0 && (
            <tr>
              <td colSpan={6} className="admin__empty">Nenhuma oferta encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
