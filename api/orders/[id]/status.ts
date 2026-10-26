import { getSupabaseAdmin } from '../../_shared/supabase'
import { validateOrderStatus } from '../../_shared/validation'

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
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'ID do pedido não fornecido' })
      return
    }

    // Validar entrada
    const validation = validateOrderStatus(req.body)
    if (!validation.success) {
      res.status(400).json({ error: validation.error })
      return
    }

    const { order_token } = validation.data
    const supabase = getSupabaseAdmin()

    // Buscar pedido
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, order_token')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) throw new Error(`Erro ao buscar pedido: ${fetchError.message}`)
    if (!order) {
      res.status(404).json({ error: 'Pedido não encontrado' })
      return
    }

    // Verificar order_token
    if (order.order_token !== order_token) {
      res.status(401).json({ error: 'Token do pedido inválido' })
      return
    }

    // Apenas transição CRIADO → ENCAMINHADO_WHATSAPP é permitida por token público
    if (order.status !== 'CRIADO') {
      res.status(409).json({ error: `Pedido não está em estado CRIADO (atual: ${order.status})` })
      return
    }

    // Transicionar para ENCAMINHADO_WHATSAPP
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'ENCAMINHADO_WHATSAPP', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) throw new Error(`Erro ao atualizar status do pedido: ${updateError.message}`)

    res.status(200).json({
      order_id: order.id,
      status: 'ENCAMINHADO_WHATSAPP',
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
}
