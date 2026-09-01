import { ChevronRightIcon, PlusIcon } from './icons'
import ProductArt, { type ProductKind } from './ProductArt'

type Offer = {
  name: string
  kind: ProductKind
  oldPrice?: string
  currentPrice: string
  discount?: string
}

const offers: Offer[] = [
  {
    name: 'Premier Ambientes Internos Cães Adultos 10,1kg',
    kind: 'racao',
    oldPrice: 'R$ 229,90',
    currentPrice: 'R$ 195,42',
    discount: '-15%',
  },
  {
    name: 'Petisco Natural Palitos de Frango 500g',
    kind: 'petisco',
    oldPrice: 'R$ 39,90',
    currentPrice: 'R$ 35,91',
    discount: '-10%',
  },
  {
    name: 'Brinquedo Corda com Bola M',
    kind: 'brinquedo',
    currentPrice: 'R$ 29,90',
  },
  {
    name: 'Shampoo Hipoalergênico 500ml',
    kind: 'higiene',
    oldPrice: 'R$ 29,90',
    currentPrice: 'R$ 26,31',
    discount: '-12%',
  },
]

export default function Offers() {
  return (
    <section className="offers">
      <div className="section__head">
        <h2 className="section__title">Ofertas para seu pet</h2>
        <span className="section__link">
          Ver todas <ChevronRightIcon />
        </span>
      </div>
      <div className="offers__scroll">
        {offers.map((offer) => (
          <article className="offer-card" key={offer.name}>
            <div className="offer-card__img">
              {offer.discount && <span className="offer-card__discount">{offer.discount}</span>}
              <ProductArt kind={offer.kind} />
            </div>
            <div className="offer-card__body">
              <h3 className="offer-card__name">{offer.name}</h3>
              <div className="offer-card__price">
                {offer.oldPrice && <span className="offer-card__old">{offer.oldPrice}</span>}
                <span className="offer-card__current">{offer.currentPrice}</span>
              </div>
            </div>
            <button className="offer-card__add" type="button" aria-label={`Adicionar ${offer.name}`}>
              <PlusIcon />
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}