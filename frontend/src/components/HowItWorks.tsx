import { SearchIcon, CartIcon, WhatsAppIcon, HouseIcon, ChevronRightIcon } from './icons'

const steps = [
  { icon: SearchIcon, text: 'Escolha\nseus produtos' },
  { icon: CartIcon, text: 'Revise\nseu carrinho' },
  { icon: WhatsAppIcon, text: 'Finalize pelo\nWhatsApp' },
  { icon: HouseIcon, text: 'Receba dentro\ndo condomínio' },
]

export default function HowItWorks() {
  return (
    <section className="how">
      <div className="section__head">
        <h2 className="section__title">Como funciona?</h2>
      </div>
      <div className="how__steps">
        {steps.map((step, index) => (
          <div className="how__step" key={step.text}>
            <div className="how__icon">
              <step.icon />
            </div>
            <div className="how__text">
              {step.text.split('\n').map((line, i) => (
                <span key={i} className="how__line">
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
            </div>
            {index < steps.length - 1 && (
              <span className="how__arrow">
                <ChevronRightIcon />
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}