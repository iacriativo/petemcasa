import { getDataStore } from '../_shared/datastore'
import type { VercelRequest, VercelResponse } from '../_shared/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  try {
    const dataStore = getDataStore()
    const productId = req.query.product_id

    if (productId) {
      const item = await dataStore.catalog.get(productId)
      if (!item) {
        res.status(404).json({ error: 'Produto não encontrado' })
        return
      }
      res.status(200).json(item)
    } else {
      const items = await dataStore.catalog.list()
      res.status(200).json(items)
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
}
