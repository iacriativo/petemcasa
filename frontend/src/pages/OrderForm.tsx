import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ChevronRightIcon } from '../components/icons'

export default function OrderForm() {
  const navigate = useNavigate()
  const { items, total, itemCount, clear } = useCart()
  const [petName, setPetName] = useState('')
  const [block, setBlock] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!petName.trim() || !block.trim() || !unitNumber.trim()) {
      setError('Preencha Nome do Pet, Bloco e Número da unidade')
      return
    }

    if (items.length === 0) {
      setError('O carrinho está vazio')
      return
    }

    setSubmitting(true)
    try {
      const client_order_token = crypto.randomUUID()

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_order_token,
          pet_name: petName.trim(),
          block: block.trim(),
          unit_number: unitNumber.trim(),
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pedido')
      }

      clear()
      navigate(`/pedido/sucesso/${data.order_id}?wa_url=${encodeURIComponent(data.wa_url)}`)
    } catch (err: any) {
      setError(err.message || 'Erro interno ao criar pedido')
    } finally {
      setSubmitting(false)
    }
  }, [items, petName, block, unitNumber, clear, navigate])

  if (items.length === 0) {
    return (
      <div className="screen" style={{ paddingTop: 60, paddingBottom: 200, textAlign: 'center' }}>
        <div style={{ fontSize: 24, marginBottom: 12 }}>🛒</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#14382a', marginBottom: 8 }}>Seu carrinho está vazio</h2>
        <p style={{ fontSize: 14, color: '#6b7c72', marginBottom: 20 }}>Adicione produtos antes de finalizar o pedido.</p>
        <button
          onClick={() => navigate('/')}
          style={{ background: '#1d7a4a', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          Ver catálogo
        </button>
      </div>
    )
  }

  return (
    <main className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '0 20' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: '1px solid #dcebe2',
            borderRadius: 10,
            width: 40,
            height: 40,
            display: 'grid',
            placeItems: 'center',
            color: '#23362c',
            cursor: 'pointer',
          }}
        >
          <ChevronRightIcon style={{ transform: 'rotate(180deg)', width: 20, height: 20 }} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#14382a', marginLeft: 8 }}>Finalizar pedido</h1>
      </div>

      <div style={{ padding: '0 20' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#23362c', marginBottom: 6 }}>
              Nome do seu pet
            </label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Ex: Thor"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 15,
                border: '1px solid #dcebe2',
                borderRadius: 12,
                background: '#ffffff',
                color: '#23362c',
                boxShadow: '0 2px 10px rgba(20, 56, 42, 0.06)',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#23362c', marginBottom: 6 }}>
              Bloco
            </label>
            <input
              type="text"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              placeholder="Ex: A"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 15,
                border: '1px solid #dcebe2',
                borderRadius: 12,
                background: '#ffffff',
                color: '#23362c',
                boxShadow: '0 2px 10px rgba(20, 56, 42, 0.06)',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#23362c', marginBottom: 6 }}>
              Número da unidade
            </label>
            <input
              type="text"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              placeholder="Ex: 101"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 15,
                border: '1px solid #dcebe2',
                borderRadius: 12,
                background: '#ffffff',
                color: '#23362c',
                boxShadow: '0 2px 10px rgba(20, 56, 42, 0.06)',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#23362c' }}>Itens ({itemCount})</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1d7a4a' }}>R$ {total.toFixed(2)}</span>
            </div>
            <div style={{ border: '1px solid #dcebe2', borderRadius: 12, padding: 12, background: '#f3faf6' }}>
              {items.map((item) => (
                <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#23362c', marginBottom: 6 }}>
                  <span>{item.quantity}x {item.product_name}</span>
                  <span style={{ fontWeight: 700 }}>R$ {(item.unit_price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: '#fdecea', color: '#c7443e', padding: 10, borderRadius: 10, fontSize: 13, marginBottom: 16, border: '1px solid #f5c6c3' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              background: '#1d7a4a',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: 16,
              fontSize: 16,
              fontWeight: 700,
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              boxShadow: submitting ? 'none' : '0 6px 16px rgba(29, 122, 74, 0.3)',
            }}
          >
            {submitting ? 'Criando pedido...' : 'Criar pedido'}
          </button>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 11.5, color: '#6b7c72' }}>
            O pedido será enviado ao WhatsApp do condomínio para confirmação.
          </div>
        </form>
      </div>
    </main>
  )
}
