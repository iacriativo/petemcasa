import { WhatsAppIcon, BagIcon } from './icons'

export default function Banner() {
  return (
    <section className="banner">
      <div className="banner__card">
        <div className="banner__copy">
          <h2 className="banner__title">
            Tudo que seu pet precisa,
            <br />
            <em>você encontra aqui!</em>
          </h2>
          <span className="banner__cta">
            <WhatsAppIcon />
            Compre e finalize pelo WhatsApp
          </span>
        </div>
        <div className="banner__art">
          <BagIcon />
        </div>
      </div>
    </section>
  )
}