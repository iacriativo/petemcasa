import { getDataStore } from '../../../_shared/datastore'
import { withAdminAuth } from '../../../_shared/admin-handler'
import type { VercelRequest, VercelResponse } from '../../../_shared/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withAdminAuth(req, res, async (req, res) => {
    const { id } = req.query
    if (!id) {
      res.status(400).json({ error: 'ID não fornecido' })
      return
    }

    const dataStore = getDataStore()

    if (req.method === 'PATCH') {
      const body = (req.body || {}) as any
      const updated = await dataStore.products.update(id, body)
      if (!updated) {
        res.status(404).json({ error: 'Produto não encontrado' })
        return
      }
      res.status(200).json(updated)
      return
    }

    res.status(405).json({ error: 'Método não permitido' })
  })
}
