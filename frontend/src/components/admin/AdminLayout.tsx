import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ChevronRightIcon, HouseIcon } from '../icons'

const adminItems = [
  { to: '/admin', label: 'Dashboard', icon: HouseIcon },
  { to: '/admin/ofertas', label: 'Ofertas', icon: ChevronRightIcon },
  { to: '/admin/produtos', label: 'Produtos', icon: ChevronRightIcon },
  { to: '/admin/categorias', label: 'Categorias', icon: ChevronRightIcon },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ChevronRightIcon },
  { to: '/admin/publicados', label: 'Publicados', icon: ChevronRightIcon },
  { to: '/admin/configuracoes', label: 'Configurações', icon: ChevronRightIcon },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">
          <div className="admin__brand-icon">
            <HouseIcon />
          </div>
          <div className="admin__brand-text">
            <div className="admin__brand-name">Pet em Casa</div>
            <div className="admin__brand-sub">Admin</div>
          </div>
        </div>
        <nav className="admin__nav">
          {adminItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive: active }) =>
                  'admin__nav-item' + (active || isActive ? ' admin__nav-item--active' : '')
                }
              >
                <Icon className="admin__nav-icon" />
                <span className="admin__nav-label">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="admin__footer">
          <button
            className="admin__logout"
            onClick={() => { signOut(); navigate('/admin/login') }}
          >
            Sair
          </button>
          {user && (
            <div className="admin__user">
              <div className="admin__user-email">{user.email}</div>
            </div>
          )}
        </div>
      </aside>
      <div className="admin__content">
        <header className="admin__header">
          <h1 className="admin__title">{adminItems.find((i) => location.pathname.startsWith(i.to))?.label || 'Admin'}</h1>
        </header>
        <main className="admin__main">{children}</main>
      </div>
    </div>
  )
}
