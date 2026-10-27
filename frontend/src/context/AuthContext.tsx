import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '../lib/api-client'

interface AuthContextType {
  user: { email: string } | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'pet-em-casa-admin-token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiClient.auth.login(email, password)
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  const value = {
    user: token ? { email: 'admin' } : null,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
