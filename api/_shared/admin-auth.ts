import type { VercelRequest, VercelResponse } from './types'

export function getAdminToken(req: VercelRequest): string | null {
  const authHeader = req.headers['authorization']
  if (!authHeader) return null
  const token = Array.isArray(authHeader) ? authHeader[0] : authHeader
  if (!token || !token.startsWith('Bearer ')) return null
  return token.substring(7)
}

export async function requireAdmin(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  const token = getAdminToken(req)
  if (!token) {
    res.status(401).json({ error: 'Token de autenticação não fornecido' })
    return false
  }

  const envToken = process.env.ADMIN_TOKEN
  if (!envToken || token !== envToken) {
    res.status(401).json({ error: 'Token inválido' })
    return false
  }

  return true
}

export function setAdminHeaders(res: VercelResponse): VercelResponse {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res
}
