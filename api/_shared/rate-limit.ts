import { getSupabaseAdmin } from './supabase'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

const RATE_LIMIT_WINDOW_MINUTES = 1
const RATE_LIMIT_MAX_REQUESTS = 10

function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  const forwarded = headers['x-forwarded-for']
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded : [forwarded]
    return ips[0].split(',')[0].trim()
  }
  const realIp = headers['x-real-ip']
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp
  }
  return '0.0.0.0'
}

export async function checkRateLimit(clientIp: string): Promise<RateLimitResult> {
  const supabase = getSupabaseAdmin()
  const now = new Date()
  const windowStart = new Date(now.getTime() - (now.getTime() % (RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)))

  const { data: existing, error: fetchError } = await supabase
    .from('rate_guard')
    .select('*')
    .eq('client_ip', clientIp)
    .gte('window_start', windowStart.toISOString())
    .order('window_start', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) throw new Error(`Erro ao verificar rate limiting: ${fetchError.message}`)

  if (existing) {
    if (existing.request_count >= RATE_LIMIT_MAX_REQUESTS) {
      const resetAt = new Date(existing.window_start)
      resetAt.setMinutes(resetAt.getMinutes() + RATE_LIMIT_WINDOW_MINUTES)
      return { allowed: false, remaining: 0, resetAt }
    }

    const { error: updateError } = await supabase
      .from('rate_guard')
      .update({ request_count: existing.request_count + 1, updated_at: now.toISOString() })
      .eq('id', existing.id)

    if (updateError) throw new Error(`Erro ao atualizar rate limiting: ${updateError.message}`)

    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - existing.request_count - 1, resetAt: windowStart }
  }

  const { error: insertError } = await supabase
    .from('rate_guard')
    .insert([{ client_ip: clientIp, window_start: windowStart.toISOString(), request_count: 1 }])

  if (insertError) throw new Error(`Erro ao criar registro de rate limiting: ${insertError.message}`)

  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: windowStart }
}

export function extractClientIp(headers: Record<string, string | string[] | undefined>): string {
  return getClientIp(headers)
}
