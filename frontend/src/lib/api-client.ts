interface ApiClientOptions {
  method?: string
  body?: unknown
  token?: string
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function apiFetch<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error((error as any).error || `HTTP ${response.status}`)
  }

  return response.json() as Promise<T>
}

function getAdminToken(): string | null {
  return localStorage.getItem('pet-em-casa-admin-token')
}

export const apiClient = {
  // Público
  catalog: {
    list: () => apiFetch<any[]>('/api/catalog'),
    get: (productId: string) => apiFetch<any>(`/api/catalog?product_id=${productId}`),
  },

  // Pedidos (público)
  orders: {
    create: (input: any) => apiFetch<{ order_id: string; order_token: string; wa_url: string }>('/api/orders', { method: 'POST', body: input }),
    updateStatus: (orderId: string, token: string) =>
      apiFetch<{ order_id: string; status: string }>(`/api/orders/${orderId}/status`, { method: 'POST', body: { order_token: token } }),
  },

  // Admin auth
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ token: string }>('/api/admin/auth/login', { method: 'POST', body: { email, password } }),
  },

  // Admin
  admin: {
    categories: {
      list: () => apiFetch<any[]>('/api/admin/categories', { token: getAdminToken() || undefined }),
      create: (input: any) => apiFetch<any>('/api/admin/categories', { method: 'POST', body: input, token: getAdminToken() || undefined }),
      update: (id: string, input: any) => apiFetch<any>(`/api/admin/categories/${id}`, { method: 'PATCH', body: input, token: getAdminToken() || undefined }),
    },
    products: {
      list: () => apiFetch<any[]>('/api/admin/products', { token: getAdminToken() || undefined }),
      create: (input: any) => apiFetch<any>('/api/admin/products', { method: 'POST', body: input, token: getAdminToken() || undefined }),
      update: (id: string, input: any) => apiFetch<any>(`/api/admin/products/${id}`, { method: 'PATCH', body: input, token: getAdminToken() || undefined }),
    },
    offers: {
      list: (status?: string) => apiFetch<any[]>(`/api/admin/offers${status ? `?status=${status}` : ''}`, { token: getAdminToken() || undefined }),
      update: (id: string, input: any) => apiFetch<any>(`/api/admin/offers/${id}`, { method: 'PATCH', body: input, token: getAdminToken() || undefined }),
    },
    publications: {
      list: () => apiFetch<any[]>('/api/admin/publications', { token: getAdminToken() || undefined }),
      create: (input: any) => apiFetch<any>('/api/admin/publications', { method: 'POST', body: input, token: getAdminToken() || undefined }),
      update: (id: string, input: any) => apiFetch<any>(`/api/admin/publications/${id}`, { method: 'PATCH', body: input, token: getAdminToken() || undefined }),
    },
    orders: {
      list: () => apiFetch<any[]>('/api/admin/orders', { token: getAdminToken() || undefined }),
      update: (id: string, status: string) => apiFetch<any>(`/api/admin/orders/${id}`, { method: 'PATCH', body: { status }, token: getAdminToken() || undefined }),
    },
    settings: {
      get: () => apiFetch<any>('/api/admin/settings', { token: getAdminToken() || undefined }),
      update: (input: any) => apiFetch<any>('/api/admin/settings', { method: 'PATCH', body: input, token: getAdminToken() || undefined }),
    },
  },
}
