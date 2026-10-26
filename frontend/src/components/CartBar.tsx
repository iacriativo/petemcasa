import { CartIcon, WhatsAppIcon } from './icons'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function CartBar() {
  const { items, itemCount, total } = useCart()
  const navigate = useNavigate()

  const openCheckout = () => {
    if (items.length === 0) return
    navigate('/pedido')
  }

  return (
    <div className="cartbar">
      <div className="cartbar__card">
        <div className="cartbar__top">
          <div className="cartbar__left">
            <span className="cartbar__cart" onClick={openCheckout}>
              <CartIcon />
              {itemCount > 0 && <span className="cartbar__count">{itemCount}</span>}
            </span>
            <div onClick={openCheckout} style={{ cursor: 'pointer' }}>
              <div className="cartbar__label">Meu carrinho</div>
              <div className="cartbar__summary">{itemCount} itens • R$ {total.toFixed(2)}</div>
            </div>
          </div>
          <div className="cartbar__total">R$ {total.toFixed(2)}</div>
        </div>
        <button className="cartbar__btn" type="button" onClick={openCheckout} disabled={items.length === 0}>
          <WhatsAppIcon />
          {items.length === 0 ? 'Carrinho vazio' : 'Finalizar pelo WhatsApp'}
        </button>
        <div className="cartbar__sub">{items.length === 0 ? 'Adicione produtos' : 'Conversar e concluir pedido'}</div>
      </div>
    </div>
  )
}