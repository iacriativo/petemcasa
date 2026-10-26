import { getSupabaseAdmin } from './supabase'

export interface PricedItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  sale_price: number
}

export interface PricingResult {
  items: PricedItem[]
  total: number
}

export async function calculatePricing(items: { product_id: string; quantity: number }[]): Promise<PricingResult> {
  const supabase = getSupabaseAdmin()

  const { data: publications, error } = await supabase
    .from('publications')
    .select(`
      id,
      product_id,
      sale_price,
      pricing_type,
      pricing_value,
      products (
        id,
        name,
        category_id,
        categories (
          id,
          active,
          name
        )
      )
    `)
    .eq('status', 'published')
    .eq('availability', 'available')
    .lte('published_at', new Date().toISOString())
    .or('unpublished_at.is.null,unpublished_at.gt.' + new Date().toISOString())

  if (error) throw new Error(`Erro ao buscar publicações: ${error.message}`)
  if (!publications || publications.length === 0) {
    throw new Error('Nenhuma publicação disponível para precificação')
  }

  const publishedProductIds = new Set(publications.map(p => p.product_id))

  const pricedItems: PricedItem[] = []
  let total = 0

  for (const item of items) {
    if (!publishedProductIds.has(item.product_id)) {
      throw new Error(`Produto ${item.product_id} não está publicado ou não está disponível`)
    }

    const publication = publications.find(p => p.product_id === item.product_id)
    if (!publication) throw new Error(`Publicação não encontrada para o produto ${item.product_id}`)

    const product = (publication as any).products
    if (!product || !product.active) {
      throw new Error(`Produto ${item.product_id} não está ativo`)
    }

    const category = (product as any).categories
    if (!category || !category.active) {
      throw new Error(`Categoria do produto ${item.product_id} não está ativa`)
    }

    let unitPrice: number
    if (publication.pricing_type === 'manual') {
      unitPrice = Number(publication.sale_price)
    } else {
      // markup: preço público = custo × (1 + markup/100)
      const collectedPrice = Number(publication.sale_price)
      const markup = Number(publication.pricing_value) || 30
      unitPrice = collectedPrice * (1 + markup / 100)
    }

    const subtotal = unitPrice * item.quantity
    total += subtotal

    pricedItems.push({
      product_id: item.product_id,
      product_name: product.name,
      quantity: item.quantity,
      unit_price: Math.round(unitPrice * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      sale_price: Math.round(unitPrice * 100) / 100,
    })
  }

  return { items: pricedItems, total: Math.round(total * 100) / 100 }
}
