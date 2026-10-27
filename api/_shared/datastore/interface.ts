export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CategoryInput {
  name: string
  slug: string
  parent_id?: string | null
  active?: boolean
  sort_order?: number
}

export interface Product {
  id: string
  name: string
  description: string | null
  brand: string | null
  category_id: string | null
  public_image_url: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface ProductInput {
  name: string
  description?: string | null
  brand?: string | null
  category_id?: string | null
  public_image_url?: string | null
  active?: boolean
}

export interface Source {
  id: string
  name: string
  base_url: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Offer {
  id: string
  product_id: string | null
  source_id: string
  source_url: string
  collected_price: number
  original_price: number | null
  promotion_data: any | null
  availability: 'available' | 'unavailable' | 'unknown'
  status: 'pending' | 'approved' | 'published' | 'rejected' | 'expired' | 'unavailable'
  collected_at: string
  last_verified_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface OfferInput {
  product_id?: string | null
  source_id: string
  source_url: string
  collected_price: number
  original_price?: number | null
  promotion_data?: any | null
  availability?: 'available' | 'unavailable' | 'unknown'
  collected_at?: string
  expires_at?: string | null
}

export interface Publication {
  id: string
  offer_id: string
  product_id: string
  sale_price: number
  availability: 'available' | 'unavailable'
  pricing_type: 'markup' | 'manual'
  pricing_value: number
  status: 'draft' | 'published' | 'unpublished'
  published_at: string | null
  unpublished_at: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  pet_name: string
  block: string
  unit_number: string
  total: number
  status: 'CRIADO' | 'ENCAMINHADO_WHATSAPP' | 'EM_ATENDIMENTO' | 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO'
  client_order_token: string
  order_token: string
  whatsapp_sent_at: string | null
  created_at: string
  updated_at: string
}

export interface OrderInput {
  pet_name: string
  block: string
  unit_number: string
  total: number
  client_order_token: string
  order_token?: string
  status?: string
  whatsapp_sent_at?: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  product_name_snapshot: string
  created_at: string
}

export interface AppSettings {
  id: number
  condominium_name: string
  whatsapp_number: string
  admin_user_id: string | null
  created_at: string
  updated_at: string
}

export interface RateGuardEntry {
  id: string
  client_ip: string
  window_start: string
  request_count: number
  created_at: string
  updated_at: string
}

export interface CatalogItem {
  product_id: string
  publication_id: string
  name: string
  description: string | null
  brand: string | null
  category_id: string
  category_name: string
  category_slug: string
  public_image_url: string | null
  sale_price: number
  availability: string
}

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

export interface DataStore {
  categories: {
    list(): Promise<Category[]>
    get(id: string): Promise<Category | null>
    create(input: CategoryInput): Promise<Category>
    update(id: string, input: Partial<CategoryInput>): Promise<Category | null>
  }
  products: {
    list(): Promise<Product[]>
    get(id: string): Promise<Product | null>
    create(input: ProductInput): Promise<Product>
    update(id: string, input: Partial<ProductInput>): Promise<Product | null>
  }
  sources: {
    list(): Promise<Source[]>
    get(id: string): Promise<Source | null>
  }
  offers: {
    list(status?: string): Promise<Offer[]>
    get(id: string): Promise<Offer | null>
    create(input: OfferInput): Promise<Offer>
    update(id: string, input: Partial<Offer>): Promise<Offer | null>
  }
  publications: {
    list(): Promise<Publication[]>
    get(productId: string): Promise<Publication | null>
    create(input: Partial<Publication>): Promise<Publication>
    update(id: string, input: Partial<Publication>): Promise<Publication | null>
  }
  orders: {
    create(input: OrderInput): Promise<Order>
    getByClientToken(token: string): Promise<Order | null>
    get(orderId: string): Promise<Order | null>
    getByOrderToken(token: string): Promise<Order | null>
    updateStatus(id: string, status: string, orderToken?: string): Promise<Order | null>
    list(): Promise<Order[]>
  }
  orderItems: {
    list(orderId: string): Promise<OrderItem[]>
    create(input: Omit<OrderItem, 'id' | 'created_at'>): Promise<OrderItem>
  }
  settings: {
    get(): Promise<AppSettings | null>
    update(input: Partial<AppSettings>): Promise<AppSettings | null>
  }
  rateGuard: {
    check(clientIp: string): Promise<{ allowed: boolean; remaining: number; resetAt: Date }>
  }
  catalog: {
    list(): Promise<CatalogItem[]>
    get(productId: string): Promise<CatalogItem | null>
  }
  getCatalogForPricing(items: { product_id: string; quantity: number }[]): Promise<PricingResult>
  auth: {
    validateToken(token: string): Promise<boolean>
  }
}
