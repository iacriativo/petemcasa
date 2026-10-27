import { getDataStore } from '../../_shared/datastore'
import { withAdminAuth } from '../../_shared/admin-handler'
import type { VercelRequest, VercelResponse } from '../../_shared/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withAdminAuth(req, res, async (req, res) => {
    const dataStore = getDataStore()

    if (req.method === 'GET') {
      const settings = await dataStore.settings.get()
      if (!settings) {
        res.status(404).json({ error: 'Configuração não encontrada' })
        return
      }
      res.status(200).json(settings)
      return
    }

    if (req.method === 'PATCH') {
      const body = (req.body || {}) as any
      const updated = await dataStore.settings.update(body)
      res.status(200).json(updated)
      return
    }

    res.status(405).json({ error: 'Método não permitido' })
  })
}
