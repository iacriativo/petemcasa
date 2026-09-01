import { DeliveryIcon, WhatsAppIcon, ShieldIcon } from './icons'

const items = [
  { icon: DeliveryIcon, text: 'Entrega dentro do condomínio' },
  { icon: WhatsAppIcon, text: 'Finalize pelo WhatsApp' },
  { icon: ShieldIcon, text: 'Prático, rápido e seguro' },
]

export default function Benefits() {
  return (
    <section className="benefits">
      <div className="benefits__band">
        {items.map((item) => (
          <div className="benefits__item" key={item.text}>
            <item.icon className="benefits__icon" />
            <div className="benefits__text">{item.text}</div>
          </div>
        ))}
      </div>
    </section>
  )
}