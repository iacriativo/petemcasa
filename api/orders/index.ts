import { getDataStore } from '../_shared/datastore'
import { validateCreateOrder, type CreateOrderInput } from '../_shared/validation'
import { calculatePricing } from '../_shared/pricing'
import { buildWhatsAppMessage } from '../_shared/whatsapp'
import { checkRateLimit, extractClientIp } from '../_shared/rate-limit'
import type { VercelRequest, VercelResponse } from '../_shared/types'

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
    const clientIp = extractClientIp(req.headers)
    const rateLimit = await checkRateLimit(clientIp)
    if (!rateLimit.allowed) {
      res.status(429).json({ error: 'Muitas tentativas. Tente novamente mais tarde.' })
      return
    }

    const validation = validateCreateOrder(req.body)
    if (!validation.success) {
      res.status(400).json({ error: validation.error })
      return
    }

    const { client_order_token, pet_name, block, unit_number, items } = validation.data as CreateOrderInput
    const dataStore = getDataStore()

    const existingOrder = await dataStore.orders.getByClientToken(client_order_token)

    if (existingOrder) {
      const orderItems = await dataStore.orderItems.list(existingOrder.id)

      const whatsApp = await buildWhatsAppMessage(
        existingOrder.id,
        orderItems.map((i) => ({ product_name: i.product_name_snapshot, quantity: i.quantity })),
        existingOrder.total
      )

      res.status(200).json({
        order_id: existingOrder.id,
        order_token: existingOrder.order_token,
        wa_url: whatsApp.wa_url,
      })
      return
    }

    const pricing = await calculatePricing(items)

    const orderToken = crypto.randomUUID()
    const order = await dataStore.orders.create({
      pet_name,
      block,
      unit_number,
      total: pricing.total,
      client_order_token,
      order_token: orderToken,
      status: 'CRIADO',
    })

    for (const item of pricing.items) {
      await dataStore.orderItems.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        product_name_snapshot: item.product_name,
      })
    }

    const whatsApp = await buildWhatsAppMessage(
      order.id,
      pricing.items.map((i) => ({ product_name: i.product_name, quantity: i.quantity })),
      pricing.total
    )

    res.status(201).json({
      order_id: order.id,
      order_token: order.order_token,
      wa_url: whatsApp.wa_url,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
}
