import { getDataStore } from '../../_shared/datastore'
import { withAdminAuth } from '../../_shared/admin-handler'
import type { VercelRequest, VercelResponse } from '../../_shared/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withAdminAuth(req, res, async (req, res) => {
    const dataStore = getDataStore()

    if (req.method === 'GET') {
      const items = await dataStore.publications.list()
      res.status(200).json(items)
      return
    }

    if (req.method === 'POST') {
      const body = (req.body || {}) as any
      const created = await dataStore.publications.create(body)
      res.status(201).json(created)
      return
    }

    res.status(405).json({ error: 'Método não permitido' })
  })
}
