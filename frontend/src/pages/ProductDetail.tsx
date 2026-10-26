import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { ChevronRightIcon } from '../components/icons'

type ProductDetail = {
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

export default function ProductDetail() {
  const navigate = useNavigate()
  const { product_id } = useParams<{ product_id: string }>()
  const { addItem } = useCart()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const loadProduct = useCallback(async () => {
    if (!product_id) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: supabaseError } = await supabase
        .from('public_catalog')
        .select('*')
        .eq('product_id', product_id)
        .maybeSingle()

      if (supabaseError) throw supabaseError
      if (!data) {
        setError('Produto não encontrado')
        return
      }
      setProduct(data as ProductDetail)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar produto')
    } finally {
      setLoading(false)
    }
  }, [product_id])

  useEffect(() => {
    loadProduct()
  }, [loadProduct])

  const handleAdd = () => {
    if (!product) return
    addItem({
      product_id: product.product_id,
      product_name: product.name,
      unit_price: Number(product.sale_price),
      image_url: product.public_image_url ?? undefined,
      quantity,
    })
    navigate('/')
  }

  if (loading) {
    return (
      <div className="screen" style={{ paddingTop: 60, display: 'flex', justifyContent: 'center', paddingBottom: 200 }}>
        <div style={{ color: '#6b7c72', fontSize: 14 }}>Carregando produto...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="screen" style={{ paddingTop: 60, paddingBottom: 200, textAlign: 'center' }}>
        <div style={{ color: '#c7443e', fontSize: 14, marginBottom: 12 }}>{error || 'Produto não encontrado'}</div>
        <button onClick={() => navigate('/')} style={{ background: '#1d7a4a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>
          Voltar ao catálogo
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
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#14382a', marginLeft: 8 }}>Produto</h1>
      </div>

      <div style={{ padding: '0 20' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1, height: 220, background: '#f3faf6', borderRadius: 14, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            {product.public_image_url ? (
              <img src={product.public_image_url} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : null}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#1d7a4a', fontWeight: 700, display: 'block', marginBottom: 8 }}>
              {product.category_name}
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, color: '#14382a', marginBottom: 10 }}>
              {product.name}
            </h2>
            {product.brand && (
              <span style={{ fontSize: 13, color: '#6b7c72', fontWeight: 600, marginBottom: 10, display: 'block' }}>
                {product.brand}
              </span>
            )}
            {product.description && (
              <p style={{ fontSize: 14, color: '#23362c', lineHeight: 1.5, marginBottom: 16 }}>
                {product.description}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#1d7a4a' }}>R$ {Number(product.sale_price).toFixed(2)}</span>
            </div>
            <div style={{ fontSize: 11, color: '#6b7c72', marginBottom: 16 }}>
              Disponibilidade: <span style={{ fontWeight: 600, color: '#1d7a4a' }}>{product.availability === 'available' ? 'Disponível' : 'Indisponível'}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: '1px solid #dcebe2',
                  background: '#ffffff',
                  color: '#23362c',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                −
              </button>
              <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: '1px solid #dcebe2',
                  background: '#ffffff',
                  color: '#23362c',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={product.availability !== 'available'}
              style={{
                width: '100%',
                marginTop: 16,
                background: product.availability === 'available' ? '#1d7a4a' : '#dcebe2',
                color: product.availability === 'available' ? '#ffffff' : '#6b7c72',
                border: 'none',
                borderRadius: 14,
                padding: 14,
                fontSize: 15,
                fontWeight: 700,
                cursor: product.availability === 'available' ? 'pointer' : 'default',
                boxShadow: product.availability === 'available' ? '0 6px 16px rgba(29, 122, 74, 0.3)' : 'none',
              }}
            >
              {product.availability === 'available' ? `Adicionar ${quantity}x ao carrinho` : 'Indisponível'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
