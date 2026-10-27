import { useEffect, useState } from 'react'
import { apiClient } from '../../lib/api-client'

type OrderRow = {
  id: string
  pet_name: string
  block: string
  unit_number: string
  total: number
  status: string
  created_at: string
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.admin.orders.list()
      .then((data) => setOrders((data || []) as OrderRow[]))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      CRIADO: 'Criado',
      ENCAMINHADO_WHATSAPP: 'Encaminhado WhatsApp',
      EM_ATENDIMENTO: 'Em atendimento',
      CONFIRMADO: 'Confirmado',
      CONCLUIDO: 'Concluído',
      CANCELADO: 'Cancelado',
    }
    return map[s] || s
  }

  if (loading) {
    return (
      <div className="admin__section">
        <h2 className="admin__section-title">Pedidos</h2>
        <div className="admin__empty">Carregando pedidos...</div>
      </div>
    )
  }

  return (
    <div className="admin__section">
      <div className="admin__section-head">
        <h2 className="admin__section-title">Pedidos</h2>
      </div>
      <table className="admin__table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Pet</th>
            <th>Bloco / Unidade</th>
            <th>Total</th>
            <th>Status</th>
            <th>Criado em</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <div style={{ fontWeight: 700 }}>{o.id}</div>
              </td>
              <td>{o.pet_name}</td>
              <td>{o.block} / {o.unit_number}</td>
              <td>R$ {Number(o.total).toFixed(2)}</td>
              <td>
                <span className={`admin__badge admin__badge--${o.status === 'CRIADO' ? 'pending' : o.status === 'CONFIRMADO' ? 'published' : o.status === 'CONCLUIDO' ? 'approved' : 'draft'}`}>
                  {statusLabel(o.status)}
                </span>
              </td>
              <td style={{ fontSize: 12, color: '#6b7c72' }}>{new Date(o.created_at).toLocaleString('pt-BR')}</td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="admin__empty">Nenhum pedido encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
