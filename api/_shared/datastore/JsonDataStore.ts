import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type {
  DataStore,
  Category, CategoryInput,
  Product, ProductInput,
  Source,
  Offer, OfferInput,
  Publication,
  Order, OrderInput,
  OrderItem,
  AppSettings,
  RateGuardEntry,
  CatalogItem,
  PricedItem, PricingResult,
} from './interface'

const DATA_DIR = process.env.JSON_DATA_PATH || join(process.cwd(), 'data')
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 10

function now(): string {
  return new Date().toISOString()
}

function roundDateToMinute(d: Date): Date {
  return new Date(d.getTime() - (d.getTime() % (RATE_LIMIT_WINDOW_MS)))
}

async function readJsonArray<T>(filename: string): Promise<T[]> {
  try {
    const content = await fs.readFile(join(DATA_DIR, filename), 'utf-8')
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed as T[] : []
  } catch (e: any) {
    if (e.code === 'ENOENT') return []
    throw e
  }
}

async function writeJsonArray<T>(filename: string, data: T[]): Promise<void> {
  const tmpFile = `${filename}.${randomUUID()}.tmp`
  const tmpPath = join(DATA_DIR, tmpFile)
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  await fs.rename(tmpPath, join(DATA_DIR, filename))
}

async function findOne<T extends { id: string }>(arr: T[], id: string): Promise<T | null> {
  return arr.find((item) => item.id === id) || null
}

function generateId(): string {
  return randomUUID()
}

export class JsonDataStore implements DataStore {
  private initialized = false

  constructor(dataDir?: string) {
    if (dataDir) {
      Object.defineProperty(this, '_dataDir', { value: dataDir, writable: false })
    }
  }

  private get dataDir(): string {
    return (this as any)._dataDir || DATA_DIR
  }

  async init(): Promise<void> {
    if (this.initialized) return
    try {
      await fs.mkdir(this.dataDir, { recursive: true })
    } catch {}
    this.initialized = true
  }

  get categories() {
    return {
      list: async (): Promise<Category[]> => {
        await this.init()
        return readJsonArray<Category>('categories.json')
      },
      get: async (id: string): Promise<Category | null> => {
        await this.init()
        const items = await readJsonArray<Category>('categories.json')
        return findOne(items, id)
      },
      create: async (input: CategoryInput): Promise<Category> => {
        await this.init()
        const items = await readJsonArray<Category>('categories.json')
        const item: Category = {
          id: generateId(),
          name: input.name,
          slug: input.slug,
          parent_id: input.parent_id || null,
          active: input.active ?? true,
          sort_order: input.sort_order ?? 0,
          created_at: now(),
          updated_at: now(),
        }
        items.push(item)
        await writeJsonArray('categories.json', items)
        return item
      },
      update: async (id: string, input: Partial<CategoryInput>): Promise<Category | null> => {
        await this.init()
        const items = await readJsonArray<Category>('categories.json')
        const idx = items.findIndex((i) => i.id === id)
        if (idx < 0) return null
        const existing = items[idx]
        const updated: Category = {
          ...existing,
          ...input,
          parent_id: input.parent_id !== undefined ? (input.parent_id ?? null) : existing.parent_id,
          updated_at: now(),
        }
        items[idx] = updated
        await writeJsonArray('categories.json', items)
        return updated
      },
    }
  }

  get products() {
    return {
      list: async (): Promise<Product[]> => {
        await this.init()
        return readJsonArray<Product>('products.json')
      },
      get: async (id: string): Promise<Product | null> => {
        await this.init()
        const items = await readJsonArray<Product>('products.json')
        return findOne(items, id)
      },
      create: async (input: ProductInput): Promise<Product> => {
        await this.init()
        const items = await readJsonArray<Product>('products.json')
        const item: Product = {
          id: generateId(),
          name: input.name,
          description: input.description || null,
          brand: input.brand || null,
          category_id: input.category_id || null,
          public_image_url: input.public_image_url || null,
          active: input.active ?? true,
          created_at: now(),
          updated_at: now(),
        }
        items.push(item)
        await writeJsonArray('products.json', items)
        return item
      },
      update: async (id: string, input: Partial<ProductInput>): Promise<Product | null> => {
        await this.init()
        const items = await readJsonArray<Product>('products.json')
        const idx = items.findIndex((i) => i.id === id)
        if (idx < 0) return null
        const updated: Product = {
          ...items[idx],
          ...input,
          active: input.active !== undefined ? input.active : items[idx].active,
          updated_at: now(),
        }
        items[idx] = updated
        await writeJsonArray('products.json', items)
        return updated
      },
    }
  }

  get sources() {
    return {
      list: async (): Promise<Source[]> => {
        await this.init()
        return readJsonArray<Source>('sources.json')
      },
      get: async (id: string): Promise<Source | null> => {
        await this.init()
        const items = await readJsonArray<Source>('sources.json')
        return findOne(items, id)
      },
    }
  }

  get offers() {
    return {
      list: async (status?: string): Promise<Offer[]> => {
        await this.init()
        const items = await readJsonArray<Offer>('offers.json')
        return status ? items.filter((i) => i.status === status) : items
      },
      get: async (id: string): Promise<Offer | null> => {
        await this.init()
        const items = await readJsonArray<Offer>('offers.json')
        return findOne(items, id)
      },
      create: async (input: OfferInput): Promise<Offer> => {
        await this.init()
        const items = await readJsonArray<Offer>('offers.json')
        const item: Offer = {
          id: generateId(),
          product_id: input.product_id || null,
          source_id: input.source_id,
          source_url: input.source_url,
          collected_price: input.collected_price,
          original_price: input.original_price || null,
          promotion_data: input.promotion_data || null,
          availability: input.availability || 'unknown',
          status: 'pending',
          collected_at: input.collected_at || now(),
          last_verified_at: null,
          expires_at: input.expires_at || null,
          created_at: now(),
          updated_at: now(),
        }
        items.push(item)
        await writeJsonArray('offers.json', items)
        return item
      },
      update: async (id: string, input: Partial<Offer>): Promise<Offer | null> => {
        await this.init()
        const items = await readJsonArray<Offer>('offers.json')
        const idx = items.findIndex((i) => i.id === id)
        if (idx < 0) return null
        items[idx] = { ...items[idx], ...input, updated_at: now() }
        await writeJsonArray('offers.json', items)
        return items[idx]
      },
    }
  }

  get publications() {
    return {
      list: async (): Promise<Publication[]> => {
        await this.init()
        return readJsonArray<Publication>('publications.json')
      },
      get: async (productId: string): Promise<Publication | null> => {
        await this.init()
        const items = await readJsonArray<Publication>('publications.json')
        return items.find((p) => p.product_id === productId && p.status === 'published') || null
      },
      create: async (input: Partial<Publication>): Promise<Publication> => {
        await this.init()
        const items = await readJsonArray<Publication>('publications.json')
        const item: Publication = {
          id: generateId(),
          offer_id: input.offer_id || '',
          product_id: input.product_id || '',
          sale_price: input.sale_price || 0,
          availability: (input.availability as any) || 'available',
          pricing_type: (input.pricing_type as any) || 'markup',
          pricing_value: input.pricing_value ?? 30,
          status: (input.status as any) || 'draft',
          published_at: input.published_at || null,
          unpublished_at: input.unpublished_at || null,
          created_at: now(),
          updated_at: now(),
        }
        items.push(item)
        await writeJsonArray('publications.json', items)
        return item
      },
      update: async (id: string, input: Partial<Publication>): Promise<Publication | null> => {
        await this.init()
        const items = await readJsonArray<Publication>('publications.json')
        const idx = items.findIndex((i) => i.id === id)
        if (idx < 0) return null
        items[idx] = { ...items[idx], ...input, updated_at: now() }
        await writeJsonArray('publications.json', items)
        return items[idx]
      },
    }
  }

  get orders() {
    return {
      create: async (input: OrderInput): Promise<Order> => {
        await this.init()
        const items = await readJsonArray<Order>('orders.json')
        const order: Order = {
          id: generateId(),
          pet_name: input.pet_name,
          block: input.block,
          unit_number: input.unit_number,
          total: input.total,
          status: (input.status as any) || 'CRIADO',
          client_order_token: input.client_order_token,
          order_token: input.order_token || generateId(),
          whatsapp_sent_at: input.whatsapp_sent_at ?? null,
          created_at: now(),
          updated_at: now(),
        }
        items.push(order)
        await writeJsonArray('orders.json', items)

        if (input.order_token) {
          order.order_token = input.order_token
        }
        return order
      },
      getByClientToken: async (token: string): Promise<Order | null> => {
        await this.init()
        const items = await readJsonArray<Order>('orders.json')
        return items.find((o) => o.client_order_token === token) || null
      },
      get: async (orderId: string): Promise<Order | null> => {
        await this.init()
        const items = await readJsonArray<Order>('orders.json')
        return findOne(items, orderId)
      },
      getByOrderToken: async (token: string): Promise<Order | null> => {
        await this.init()
        const items = await readJsonArray<Order>('orders.json')
        return items.find((o) => o.order_token === token) || null
      },
      updateStatus: async (id: string, status: string, orderToken?: string): Promise<Order | null> => {
        await this.init()
        const items = await readJsonArray<Order>('orders.json')
        const idx = items.findIndex((i) => i.id === id)
        if (idx < 0) return null

        if (orderToken && items[idx].order_token !== orderToken) {
          return null
        }

        items[idx] = {
          ...items[idx],
          status: status as any,
          updated_at: now(),
        }
        await writeJsonArray('orders.json', items)
        return items[idx]
      },
      list: async (): Promise<Order[]> => {
        await this.init()
        return readJsonArray<Order>('orders.json')
      },
    }
  }

  get orderItems() {
    return {
      list: async (orderId: string): Promise<OrderItem[]> => {
        await this.init()
        const items = await readJsonArray<OrderItem>('order_items.json')
        return items.filter((i) => i.order_id === orderId)
      },
      create: async (input: Omit<OrderItem, 'id' | 'created_at'>): Promise<OrderItem> => {
        await this.init()
        const items = await readJsonArray<OrderItem>('order_items.json')
        const item: OrderItem = {
          id: generateId(),
          order_id: input.order_id,
          product_id: input.product_id,
          quantity: input.quantity,
          unit_price: input.unit_price,
          subtotal: input.subtotal,
          product_name_snapshot: input.product_name_snapshot,
          created_at: now(),
        }
        items.push(item)
        await writeJsonArray('order_items.json', items)
        return item
      },
    }
  }

  get settings() {
    return {
      get: async (): Promise<AppSettings | null> => {
        await this.init()
        const items = await readJsonArray<AppSettings>('app_settings.json')
        return items.find((s) => s.id === 1) || null
      },
      update: async (input: Partial<AppSettings>): Promise<AppSettings | null> => {
        await this.init()
        const items = await readJsonArray<AppSettings>('app_settings.json')
        let idx = items.findIndex((s) => s.id === 1)
        if (idx < 0) {
          const created: AppSettings = {
            id: 1,
            condominium_name: input.condominium_name || '',
            whatsapp_number: input.whatsapp_number || '',
            admin_user_id: input.admin_user_id || null,
            created_at: now(),
            updated_at: now(),
          }
          items.push(created)
          await writeJsonArray('app_settings.json', items)
          return created
        }
        items[idx] = { ...items[idx], ...input, updated_at: now() }
        await writeJsonArray('app_settings.json', items)
        return items[idx]
      },
    }
  }

  get rateGuard() {
    return {
      check: async (clientIp: string): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> => {
        await this.init()
        const items = await readJsonArray<RateGuardEntry>('rate_guard.json')
        const nowDate = new Date()
        const windowStart = roundDateToMinute(nowDate)

        const existing = items.find(
          (r) => r.client_ip === clientIp && new Date(r.window_start) <= nowDate &&
            new Date(r.window_start) >= new Date(windowStart.getTime()) &&
            new Date(r.window_start).getTime() + RATE_LIMIT_WINDOW_MS > nowDate.getTime()
        )

        if (existing) {
          if (existing.request_count >= RATE_LIMIT_MAX_REQUESTS) {
            const resetAt = new Date(existing.window_start)
            resetAt.setMinutes(resetAt.getMinutes() + 1)
            return { allowed: false, remaining: 0, resetAt }
          }

          existing.request_count += 1
          existing.updated_at = now()
          const idx = items.findIndex((i) => i.id === existing.id)
          items[idx] = existing
          await writeJsonArray('rate_guard.json', items)

          return {
            allowed: true,
            remaining: RATE_LIMIT_MAX_REQUESTS - existing.request_count,
            resetAt: windowStart,
          }
        }

        const entry: RateGuardEntry = {
          id: generateId(),
          client_ip: clientIp,
          window_start: windowStart.toISOString(),
          request_count: 1,
          created_at: now(),
          updated_at: now(),
        }
        items.push(entry)
        await writeJsonArray('rate_guard.json', items)

        return {
          allowed: true,
          remaining: RATE_LIMIT_MAX_REQUESTS - 1,
          resetAt: windowStart,
        }
      },
    }
  }

  get catalog() {
    return {
      list: async (): Promise<CatalogItem[]> => {
        await this.init()
        const categories = await readJsonArray<Category>('categories.json')
        const products = await readJsonArray<Product>('products.json')
        const publications = await readJsonArray<Publication>('publications.json')

        const catMap = new Map(categories.map((c) => [c.id, c]))
        const pubMap = new Map<string, Publication>()

        for (const pub of publications) {
          const isPublished =
            pub.status === 'published' &&
            pub.availability === 'available' &&
            pub.published_at !== null &&
            new Date(pub.published_at) <= new Date() &&
            (pub.unpublished_at === null || new Date(pub.unpublished_at) > new Date())

          if (isPublished) {
            pubMap.set(pub.product_id, pub)
          }
        }

        const result: CatalogItem[] = []
        for (const product of products) {
          if (!product.active) continue
          const pub = pubMap.get(product.id)
          if (!pub) continue

          const category = product.category_id ? catMap.get(product.category_id) : null
          if (category && !category.active) continue

          result.push({
            product_id: product.id,
            publication_id: pub.id,
            name: product.name,
            description: product.description,
            brand: product.brand,
            category_id: product.category_id || '',
            category_name: category?.name || '',
            category_slug: category?.slug || '',
            public_image_url: product.public_image_url,
            sale_price: Number(pub.sale_price),
            availability: pub.availability,
          })
        }

        return result
      },
      get: async (productId: string): Promise<CatalogItem | null> => {
        const items = await this.catalog.list()
        return items.find((i) => i.product_id === productId) || null
      },
    }
  }

  get auth() {
    return {
      validateToken: async (token: string): Promise<boolean> => {
        const adminToken = process.env.ADMIN_TOKEN
        if (!adminToken) return false
        return token === adminToken
      },
    }
  }

  async getCatalogForPricing(items: { product_id: string; quantity: number }[]): Promise<PricingResult> {
    const catalog = await this.catalog.list()
    const pubMap = new Map(catalog.map((c) => [c.product_id, c]))

    const pricedItems: PricedItem[] = []
    let total = 0

    for (const item of items) {
      const pub = pubMap.get(item.product_id)
      if (!pub) {
        throw new Error(`Produto ${item.product_id} não está publicado ou não está disponível`)
      }

      const publications = await readJsonArray<Publication>('publications.json')
      const productPub = publications.find((p) => p.product_id === item.product_id)
      const products = await readJsonArray<Product>('products.json')
      const product = products.find((p) => p.id === item.product_id)
      if (!product || !product.active) {
        throw new Error(`Produto ${item.product_id} não está ativo`)
      }

      const category = product.category_id
        ? (await readJsonArray<Category>('categories.json')).find((c) => c.id === product.category_id)
        : null
      if (category && !category.active) {
        throw new Error(`Categoria do produto ${item.product_id} não está ativa`)
      }

      let unitPrice: number
      if (productPub) {
        if (productPub.pricing_type === 'manual') {
          unitPrice = Number(productPub.sale_price)
        } else {
          const markup = Number(productPub.pricing_value) || 30
          unitPrice = Number(pub.sale_price) * (1 + markup / 100)
        }
      } else {
        unitPrice = Number(pub.sale_price)
      }

      const subtotal = unitPrice * item.quantity
      total += subtotal

      pricedItems.push({
        product_id: item.product_id,
        product_name: pub.name,
        quantity: item.quantity,
        unit_price: Math.round(unitPrice * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        sale_price: Math.round(unitPrice * 100) / 100,
      })
    }

    return { items: pricedItems, total: Math.round(total * 100) / 100 }
  }
}
