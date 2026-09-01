import { DeliveryIcon } from './icons'
import HeroArt from './HeroArt'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__card">
          <DeliveryIcon className="hero__card-icon" />
          <div className="hero__card-text">
            Exclusivo para
            <br />
            moradores do
            <br />
            condomínio
          </div>
        </div>
        <div className="hero__copy">
          <h1 className="hero__title">
            Seu pet bem cuidado,
            <br />
            <em>sem sair de casa.</em>
          </h1>
          <p className="hero__sub">Tudo fresquinho e perto de você</p>
        </div>
        <div className="hero__art">
          <HeroArt />
        </div>
      </div>
    </section>
  )
}