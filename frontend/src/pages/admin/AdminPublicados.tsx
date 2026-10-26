import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type PublicationRow = {
  id: string
  product_id: string
  sale_price: number
  availability: string
  status: string
  published_at?: string | null
  unpublished_at?: string | null
  products: {
    id: string
    name: string
    public_image_url?: string | null
  } | null
}

export default function AdminPublicados() {
  const [publications, setPublications] = useState<PublicationRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('publications')
      .select(`
        id, product_id, sale_price, availability, status, published_at, unpublished_at,
        products (id, name, public_image_url)
      `)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setPublications([])
        } else {
          setPublications((data || []) as unknown as PublicationRow[])
        }
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="admin__section">
        <h2 className="admin__section-title">Publicados</h2>
        <div className="admin__empty">Carregando publicações...</div>
      </div>
    )
  }

  return (
    <div className="admin__section">
      <div className="admin__section-head">
        <h2 className="admin__section-title">Publicações</h2>
      </div>
      <table className="admin__table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Preço de venda</th>
            <th>Disponibilidade</th>
            <th>Status</th>
            <th>Publicado em</th>
          </tr>
        </thead>
        <tbody>
          {publications.map((p) => (
            <tr key={p.id}>
              <td>
                <div style={{ fontWeight: 700 }}>{p.products?.name || 'Produto'}</div>
              </td>
              <td>R$ {Number(p.sale_price).toFixed(2)}</td>
              <td>
                <span className={`admin__badge admin__badge--${p.availability === 'available' ? 'published' : 'draft'}`}>
                  {p.availability === 'available' ? 'Disponível' : 'Indisponível'}
                </span>
              </td>
              <td>
                <span className={`admin__badge admin__badge--${p.status === 'published' ? 'published' : 'draft'}`}>
                  {p.status === 'published' ? 'Publicado' : p.status === 'unpublished' ? 'Não publicado' : 'Rascunho'}
                </span>
              </td>
              <td style={{ fontSize: 12, color: '#6b7c72' }}>
                {p.published_at ? new Date(p.published_at).toLocaleDateString('pt-BR') : '-'}
              </td>
            </tr>
          ))}
          {publications.length === 0 && (
            <tr>
              <td colSpan={5} className="admin__empty">Nenhuma publicação encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
