import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Home from './components/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import OrderForm from './pages/OrderForm'
import OrderSuccess from './pages/OrderSuccess'

export default function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/produto/:product_id" element={<ProductDetail />} />
          <Route path="/pedido" element={<OrderForm />} />
          <Route path="/pedido/sucesso/:order_id" element={<OrderSuccess />} />
        </Routes>
      </CartProvider>
    </Router>
  )
}
