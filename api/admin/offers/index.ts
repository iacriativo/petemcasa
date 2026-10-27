import { getDataStore } from '../../_shared/datastore'
import { withAdminAuth } from '../../_shared/admin-handler'
import type { VercelRequest, VercelResponse } from '../../_shared/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withAdminAuth(req, res, async (req, res) => {
    const dataStore = getDataStore()

    if (req.method === 'GET') {
      const status = req.query.status
      const items = status ? await dataStore.offers.list(status) : await dataStore.offers.list()
      res.status(200).json(items)
      return
    }

    res.status(405).json({ error: 'Método não permitido' })
  })
}
