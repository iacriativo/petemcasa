import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function OrderSuccess() {
  const navigate = useNavigate()
  const { order_id } = useParams<{ order_id: string }>()
  const searchParams = new URLSearchParams(window.location.search)
  const waUrl = searchParams.get('wa_url') || ''
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!order_id) {
      navigate('/')
    }
  }, [order_id, navigate])

  const copyOrderId = () => {
    navigator.clipboard.writeText(order_id || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="screen">
      <div style={{ padding: '0 20', paddingTop: 60, textAlign: 'center', paddingBottom: 200 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#14382a', marginBottom: 8 }}>Pedido criado!</h2>
        <p style={{ fontSize: 14, color: '#6b7c72', marginBottom: 24 }}>
          Seu pedido <strong>#{order_id}</strong> foi registrado.
        </p>

        <div style={{ background: '#f3faf6', border: '1px solid #dcebe2', borderRadius: 14, padding: 16, marginBottom: 20, textAlign: 'left' }}>
          <div style={{ fontSize: 12, color: '#6b7c72', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Identificador do pedido
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <code style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#1d7a4a', background: '#ffffff', padding: '8px 12px', borderRadius: 10, border: '1px solid #dcebe2' }}>
              {order_id}
            </code>
            <button
              onClick={copyOrderId}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid #dcebe2',
                background: '#ffffff',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                fontSize: 12,
              }}
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            width: '100%',
            background: '#25d366',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            padding: 16,
            fontSize: 16,
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 6px 16px rgba(37, 211, 102, 0.35)',
          }}
        >
          💬 Abrir WhatsApp para finalizar
        </a>

        <p style={{ marginTop: 16, fontSize: 11.5, color: '#6b7c72' }}>
          Aguarde a confirmação e as orientações de pagamento pelo WhatsApp.
        </p>
      </div>
    </main>
  )
}
