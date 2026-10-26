import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Home from './components/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import OrderForm from './pages/OrderForm'
import OrderSuccess from './pages/OrderSuccess'
import AdminLayout from './components/admin/AdminLayout'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOfertas from './pages/admin/AdminOfertas'
import AdminProdutos from './pages/admin/AdminProdutos'
import AdminCategorias from './pages/admin/AdminCategorias'
import AdminPedidos from './pages/admin/AdminPedidos'
import AdminPublicados from './pages/admin/AdminPublicados'
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes'
import AdminLogin from './pages/admin/AdminLogin'

export default function App() {
  return (
    <Router>
      <CartProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/produto/:product_id" element={<ProductDetail />} />
            <Route path="/pedido" element={<OrderForm />} />
            <Route path="/pedido/sucesso/:order_id" element={<OrderSuccess />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="ofertas" element={<AdminOfertas />} />
                      <Route path="produtos" element={<AdminProdutos />} />
                      <Route path="categorias" element={<AdminCategorias />} />
                      <Route path="pedidos" element={<AdminPedidos />} />
                      <Route path="publicados" element={<AdminPublicados />} />
                      <Route path="configuracoes" element={<AdminConfiguracoes />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </CartProvider>
    </Router>
  )
}
