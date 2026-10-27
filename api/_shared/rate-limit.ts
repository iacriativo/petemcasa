import { getDataStore } from './datastore'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

export async function checkRateLimit(clientIp: string): Promise<RateLimitResult> {
  const dataStore = getDataStore()
  return dataStore.rateGuard.check(clientIp)
}

export function extractClientIp(headers: Record<string, string | string[] | undefined>): string {
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
