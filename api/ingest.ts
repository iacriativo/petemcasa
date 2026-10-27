import { getDataStore } from './_shared/datastore'
import type { VercelRequest, VercelResponse } from './_shared/types'

const INGESTION_TOKEN = process.env.COLLECTOR_INGESTION_TOKEN

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
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
    const authHeader = req.headers['authorization']
    const token = Array.isArray(authHeader) ? authHeader[0] : authHeader

    if (!token || !token.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token de ingestão não fornecido' })
      return
    }

    const providedToken = token.substring(7)
    if (!INGESTION_TOKEN || providedToken !== INGESTION_TOKEN) {
      res.status(401).json({ error: 'Token de ingestão inválido' })
      return
    }

    const offers = req.body

    if (!Array.isArray(offers) || offers.length === 0) {
      res.status(400).json({ error: 'Body deve conter um array de ofertas' })
      return
    }

    const dataStore = getDataStore()
    const inserted = []
    const errors: { source_url: string; error: string }[] = []

    for (const offer of offers) {
      try {
        const created = await dataStore.offers.create({
          product_id: offer.product_id || null,
          source_id: offer.source_id,
          source_url: offer.source_url,
          collected_price: offer.collected_price,
          original_price: offer.original_price || null,
          promotion_data: offer.promotion_data || null,
          availability: offer.availability || 'unknown',
          collected_at: offer.collected_at || new Date().toISOString(),
          expires_at: offer.expires_at || null,
        })
        inserted.push({ id: created.id, status: created.status })
      } catch (err: any) {
        errors.push({ source_url: offer.source_url, error: err.message })
      }
    }

    res.status(201).json({
      inserted: inserted.length,
      errors: errors.length,
      data: inserted,
      error_details: errors,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
}
