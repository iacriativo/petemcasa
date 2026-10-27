import type { VercelRequest, VercelResponse } from '../../_shared/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  try {
    const { email, password } = (req.body || {}) as { email?: string; password?: string }
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminToken = process.env.ADMIN_TOKEN

    if (!adminEmail || !adminPassword || !adminToken) {
      res.status(500).json({ error: 'Configuração de administrador não encontrada' })
      return
    }

    if (email !== adminEmail || password !== adminPassword) {
      res.status(401).json({ error: 'Credenciais inválidas' })
      return
    }

    res.status(200).json({ token: adminToken })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
}
