import { ChevronRightIcon, PlusIcon } from './icons'
import ProductArt from './ProductArt'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'

type Offer = {
  product_id: string
  name: string
  sale_price: number
  public_image_url?: string | null
  availability: string
}

export default function Offers() {
  const { addItem } = useCart()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  const loadOffers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('public_catalog')
        .select('product_id, name, sale_price, public_image_url, availability')
        .order('sale_price', { ascending: true })
        .limit(4)

      if (error) throw error
      setOffers((data || []) as Offer[])
    } catch {
      setOffers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOffers()
  }, [loadOffers])

  const navigate = useNavigate()

  const handleAdd = useCallback((e: React.MouseEvent, offer: Offer) => {
    e.stopPropagation()
    addItem({
      product_id: offer.product_id,
      product_name: offer.name,
      unit_price: offer.sale_price,
      image_url: offer.public_image_url ?? undefined,
      quantity: 1,
    })
  }, [addItem])

  if (loading) {
    return (
      <section className="offers">
        <div className="section__head">
          <h2 className="section__title">Ofertas para seu pet</h2>
          <span className="section__link">
            Ver todas <ChevronRightIcon />
          </span>
        </div>
        <div className="offers__scroll">
          {[1, 2, 3, 4].map((i) => (
            <article className="offer-card" key={`skeleton-${i}`}>
              <div className="offer-card__img">
                <ProductArt kind="racao" />
              </div>
              <div className="offer-card__body">
                <h3 className="offer-card__name" style={{ color: '#dcebe2' }}>&nbsp;</h3>
                <div className="offer-card__price">
                  <span className="offer-card__current" style={{ color: '#dcebe2' }}>&nbsp;</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="offers">
      <div className="section__head">
        <h2 className="section__title">Ofertas para seu pet</h2>
        <Link to="/catalogo" className="section__link">
          Ver todas <ChevronRightIcon />
        </Link>
      </div>
      <div className="offers__scroll">
          {offers.map((offer) => (
            <article
              className="offer-card"
              key={offer.product_id}
              onClick={() => navigate(`/produto/${offer.product_id}`)}
              style={{ cursor: 'pointer' }}
            >
            <div className="offer-card__img">
              {offer.public_image_url ? (
                <img src={offer.public_image_url} alt={offer.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <ProductArt kind="racao" />
              )}
            </div>
            <div className="offer-card__body">
              <h3 className="offer-card__name">{offer.name}</h3>
              <div className="offer-card__price">
                <span className="offer-card__current">R$ {offer.sale_price.toFixed(2)}</span>
              </div>
            </div>
            <button
              className="offer-card__add"
              type="button"
              onClick={(e) => handleAdd(e, offer)}
              aria-label={`Adicionar ${offer.name}`}
            >
              <PlusIcon />
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}