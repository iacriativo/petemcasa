import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { ChevronRightIcon, PlusIcon } from '../components/icons'

type CatalogProduct = {
  product_id: string
  publication_id: string
  name: string
  description?: string | null
  brand?: string | null
  category_id: string
  category_name: string
  category_slug: string
  public_image_url?: string | null
  sale_price: number
  availability: string
}

export default function Catalog() {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: supabaseError } = await supabase
        .from('public_catalog')
        .select('*')
        .order('name', { ascending: true })

      if (supabaseError) throw supabaseError
      setProducts((data || []) as CatalogProduct[])
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar catálogo')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleAdd = (p: CatalogProduct) => {
    addItem({
      product_id: p.product_id,
      product_name: p.name,
      unit_price: Number(p.sale_price),
      image_url: p.public_image_url ?? undefined,
      quantity: 1,
    })
    navigate('/')
  }

  if (loading) {
    return (
      <div className="screen" style={{ paddingTop: 60, display: 'flex', justifyContent: 'center', paddingBottom: 200 }}>
        <div style={{ color: '#6b7c72', fontSize: 14 }}>Carregando catálogo...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="screen" style={{ paddingTop: 60, paddingBottom: 200, textAlign: 'center' }}>
        <div style={{ color: '#c7443e', fontSize: 14, marginBottom: 12 }}>{error}</div>
        <button onClick={loadProducts} className="btn-retry">Tentar novamente</button>
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
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#14382a', marginLeft: 8 }}>Catálogo</h1>
      </div>

      <div style={{ padding: '0 20' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {products.map((p) => (
            <article
              key={p.product_id}
              onClick={() => navigate(`/produto/${p.product_id}`)}
              style={{
                background: '#ffffff',
                border: '1px solid #dcebe2',
                borderRadius: 14,
                boxShadow: '0 2px 10px rgba(20, 56, 42, 0.06)',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ height: 132, background: '#f3faf6', display: 'grid', placeItems: 'center', position: 'relative' }}>
                {p.public_image_url ? (
                  <img
                    src={p.public_image_url}
                    alt={p.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : null}
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: '#c7443e',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '4px 8px',
                    borderRadius: 8,
                  }}
                >
                  {'-15%'}
                </span>
              </div>
              <div style={{ padding: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: '#23362c', marginBottom: 6, minHeight: 34 }}>{p.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: '#1d7a4a' }}>R$ {Number(p.sale_price).toFixed(2)}</span>
                </div>
                <div style={{ fontSize: 11, color: '#6b7c72', marginTop: 6 }}>{p.category_name}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleAdd(p) }}
                style={{
                  position: 'absolute',
                  right: 10,
                  bottom: 12,
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: '#1d7a4a',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 4px 10px rgba(29, 122, 74, 0.35)',
                }}
              >
                <PlusIcon style={{ width: 20, height: 20 }} />
              </button>
            </article>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20', marginTop: 20 }}>
        <span
          style={{ fontSize: 11, color: '#6b7c72', fontWeight: 500 }}
        >
          {products.length} produto(s) disponível(is)
        </span>
      </div>
    </main>
  )
}
