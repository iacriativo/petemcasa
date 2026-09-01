import { CartIcon, WhatsAppIcon } from './icons'

export default function CartBar() {
  return (
    <div className="cartbar">
      <div className="cartbar__card">
        <div className="cartbar__top">
          <div className="cartbar__left">
            <span className="cartbar__cart">
              <CartIcon />
              <span className="cartbar__count">3</span>
            </span>
            <div>
              <div className="cartbar__label">Meu carrinho</div>
              <div className="cartbar__summary">3 itens • R$ 178,90</div>
            </div>
          </div>
          <div className="cartbar__total">R$ 178,90</div>
        </div>
        <button className="cartbar__btn" type="button">
          <WhatsAppIcon />
          Finalizar pelo WhatsApp
        </button>
        <div className="cartbar__sub">Conversar e concluir pedido</div>
      </div>
    </div>
  )
}