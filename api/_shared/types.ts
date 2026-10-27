export interface VercelRequest {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
  query: Record<string, string>
}

export interface VercelResponse {
  status(code: number): VercelResponse
  json(data: unknown): VercelResponse
  setHeader(name: string, value: string): VercelResponse
  end(data?: any): void
}
