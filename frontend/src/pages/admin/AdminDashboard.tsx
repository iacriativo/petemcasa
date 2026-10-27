import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../../lib/api-client'
import { ChevronRightIcon } from '../../components/icons'

type Stat = { label: string; value: number; color: string }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [offers, products, orders, cats] = await Promise.all([
          apiClient.admin.offers.list(),
          apiClient.admin.products.list(),
          apiClient.admin.orders.list(),
          apiClient.admin.categories.list(),
        ])

        const offerList = offers || []
        const productList = products || []
        const orderList = orders || []
        const catList = cats || []

        setStats([
          { label: 'Ofertas pendentes', value: offerList.filter((o: any) => o.status === 'pending').length, color: '#b45309' },
          { label: 'Produtos ativos', value: productList.filter((p: any) => p.active).length, color: '#15803d' },
          { label: 'Pedidos recentes', value: orderList.length, color: '#1d4ed8' },
          { label: 'Categorias', value: catList.length, color: '#7c3aed' },
        ])
      } catch {
        setStats([
          { label: 'Ofertas pendentes', value: 0, color: '#b45309' },
          { label: 'Produtos ativos', value: 0, color: '#15803d' },
          { label: 'Pedidos recentes', value: 0, color: '#1d4ed8' },
          { label: 'Categorias', value: 0, color: '#7c3aed' },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="admin__empty">Carregando indicadores...</div>
    )
  }

  return (
    <div className="admin__section">
      <div className="admin__section-head">
        <h2 className="admin__section-title">Visão geral</h2>
      </div>
      <div className="admin__grid">
        {stats.map((s) => (
          <div className="admin__stat" key={s.label}>
            <div className="admin__stat-label">{s.label}</div>
            <div className="admin__stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="admin__section-head">
        <h2 className="admin__section-title">Ofertas aguardando revisão</h2>
        <Link to="/admin/ofertas" className="admin__btn">Ver todas <ChevronRightIcon /></Link>
      </div>
      <div className="admin__empty">
        Acesse <strong>Ofertas</strong> para revisar e aprovar novas oportunidades coletadas.
      </div>

      <div className="admin__section-head">
        <h2 className="admin__section-title">Pedidos recentes</h2>
        <Link to="/admin/pedidos" className="admin__btn">Ver todos <ChevronRightIcon /></Link>
      </div>
      <div className="admin__empty">
        Acesse <strong>Pedidos</strong> para acompanhar os pedidos criados pelos moradores.
      </div>
    </div>
  )
}
