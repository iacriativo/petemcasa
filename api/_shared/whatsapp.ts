import { getDataStore } from './datastore'

export interface WhatsAppMessage {
  order_id: string
  wa_url: string
  message: string
}

export async function buildWhatsAppMessage(orderId: string, items: { product_name: string; quantity: number }[], total: number): Promise<WhatsAppMessage> {
  const dataStore = getDataStore()
  const settings = await dataStore.settings.get()

  if (!settings) {
    throw new Error('Configuração do condomínio não encontrada')
  }

  const condominio = settings.condominium_name
  const whatsappNumber = settings.whatsapp_number

  const itensTexto = items.map((i) => `• ${i.quantity}x ${i.product_name}`).join('\n')

  const message = `🐾 *PET EM CASA — NOVO PEDIDO*

🏢 Condomínio: ${condominio}
🆔 Pedido: #${orderId}

📦 *Itens:*
${itensTexto}

💰 *Total: R$ ${total.toFixed(2)}*

Olá! Gostaria de finalizar este pedido.

Aguardo a confirmação e as orientações para pagamento.

Obrigado!`

  const encodedMessage = encodeURIComponent(message)
  const wa_url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

  return { order_id: orderId, wa_url, message }
}
