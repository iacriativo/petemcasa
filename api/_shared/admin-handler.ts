import { getAdminToken } from './admin-auth'
import type { VercelRequest, VercelResponse } from './types'

export async function withAdminAuth(
  req: VercelRequest,
  res: VercelResponse,
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
): Promise<void> {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const token = getAdminToken(req)
  const adminToken = process.env.ADMIN_TOKEN

  if (!token || !adminToken || token !== adminToken) {
    res.status(401).json({ error: 'Não autorizado' })
    return
  }

  await handler(req, res)
}
