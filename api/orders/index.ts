import { getSupabaseAdmin } from '../_shared/supabase'
import { validateCreateOrder, type CreateOrderInput } from '../_shared/validation'
import { calculatePricing } from '../_shared/pricing'
import { buildWhatsAppMessage } from '../_shared/whatsapp'
import { checkRateLimit, extractClientIp } from '../_shared/rate-limit'

interface VercelRequest {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
  query: Record<string, string>
}

interface VercelResponse {
  status(code: number): VercelResponse
  json(data: unknown): VercelResponse
  setHeader(name: string, value: string): VercelResponse
  end(data?: any): void
}

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
    // 1. Rate limiting
    const clientIp = extractClientIp(req.headers)
    const rateLimit = await checkRateLimit(clientIp)
    if (!rateLimit.allowed) {
      res.status(429).json({ error: 'Muitas tentativas. Tente novamente mais tarde.' })
      return
    }

    // 2. Validar entrada
    const validation = validateCreateOrder(req.body)
    if (!validation.success) {
      res.status(400).json({ error: validation.error })
      return
    }

    const { client_order_token, pet_name, block, unit_number, items } = validation.data as CreateOrderInput
    const supabase = getSupabaseAdmin()

    // 3. Idempotência: verificar se client_order_token já existe
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_token, status, total, created_at')
      .eq('client_order_token', client_order_token)
      .maybeSingle()

    if (fetchError) throw new Error(`Erro ao verificar idempotência: ${fetchError.message}`)

    if (existingOrder) {
      // Pedido já existe — retornar dados existentes
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('product_name_snapshot, quantidade, preco_unitario')
        .eq('order_id', existingOrder.id)

      if (itemsError) throw new Error(`Erro ao buscar itens do pedido: ${itemsError.message}`)

      const whatsApp = await buildWhatsAppMessage(existingOrder.id, (orderItems || []).map(i => ({
        product_name: i.product_name_snapshot,
        quantity: i.quantidade,
      })), existingOrder.total)

      res.status(200).json({
        order_id: existingOrder.id,
        order_token: existingOrder.order_token,
        wa_url: whatsApp.wa_url,
      })
      return
    }

    // 4. Precificação server-side (ignorar total do cliente)
    const pricing = await calculatePricing(items)

    // 5. Inserir pedido (status CRIADO)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        pet_name,
        block,
        unit_number,
        total: pricing.total,
        status: 'CRIADO',
        client_order_token,
      }])
      .select('id, order_token')
      .single()

    if (orderError) throw new Error(`Erro ao criar pedido: ${orderError.message}`)

    // 6. Inserir itens com snapshot
    const orderItems = pricing.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantidade: item.quantity,
      preco_unitario: item.unit_price,
      subtotal: item.subtotal,
      product_name_snapshot: item.product_name,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // Rollback: deletar pedido se falhar ao inserir itens
      await supabase.from('orders').delete().eq('id', order.id)
      throw new Error(`Erro ao criar itens do pedido: ${itemsError.message}`)
    }

    // 7. Montar mensagem WhatsApp
    const whatsApp = await buildWhatsAppMessage(order.id, pricing.items.map(i => ({
      product_name: i.product_name,
      quantity: i.quantity,
    })), pricing.total)

    // 8. Marcar whatsapp_sent_at
    const { error: updateError } = await supabase
      .from('orders')
      .update({ whatsapp_sent_at: new Date().toISOString() })
      .eq('id', order.id)

    if (updateError) throw new Error(`Erro ao atualizar pedido: ${updateError.message}`)

    res.status(201).json({
      order_id: order.id,
      order_token: order.order_token,
      wa_url: whatsApp.wa_url,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
}
