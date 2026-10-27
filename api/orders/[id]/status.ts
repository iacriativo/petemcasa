import { getDataStore } from '../../_shared/datastore'
import { validateOrderStatus } from '../../_shared/validation'
import type { VercelRequest, VercelResponse } from '../../_shared/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'ID do pedido não fornecido' })
      return
    }

    const validation = validateOrderStatus(req.body)
    if (!validation.success) {
      res.status(400).json({ error: validation.error })
      return
    }

    const { order_token } = validation.data
    const dataStore = getDataStore()

    const order = await dataStore.orders.get(id)

    if (!order) {
      res.status(404).json({ error: 'Pedido não encontrado' })
      return
    }

    if (order.order_token !== order_token) {
      res.status(401).json({ error: 'Token do pedido inválido' })
      return
    }

    if (order.status !== 'CRIADO') {
      res.status(409).json({ error: `Pedido não está em estado CRIADO (atual: ${order.status})` })
      return
    }

    await dataStore.orders.updateStatus(id, 'ENCAMINHADO_WHATSAPP', order_token)

    res.status(200).json({
      order_id: order.id,
      status: 'ENCAMINHADO_WHATSAPP',
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
}
