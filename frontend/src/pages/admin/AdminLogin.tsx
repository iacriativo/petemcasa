import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PawHouseIcon } from '../../components/icons'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: err } = await signIn(email, password)
    setSubmitting(false)
    if (err) {
      setError('E-mail ou senha inválidos')
      return
    }
    navigate('/admin')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f4f7f5' }}>
      <div className="admin__form">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <PawHouseIcon style={{ width: 28, height: 28, color: '#1d7a4a' }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#14382a' }}>Pet em Casa</div>
            <div style={{ fontSize: 12, color: '#6b7c72' }}>Acesso Administrativo</div>
          </div>
        </div>
        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 10, marginBottom: 16, fontSize: 13, border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="admin__form-group">
            <label className="admin__form-label">E-mail</label>
            <input
              className="admin__form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@condominio.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="admin__form-group">
            <label className="admin__form-label">Senha</label>
            <input
              className="admin__form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="admin__btn admin__btn--primary"
            style={{ width: '100%', marginTop: 8 }}
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#6b7c72' }}>
          Acesso restrito ao administrador do condomínio.
        </p>
      </div>
    </div>
  )
}
