interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  blockedUntil: number | null
}

const globalStoreKey = '__rateLimiterStore'
const globalStore = (globalThis as unknown as { [key: string]: Map<string, RateLimitEntry> })[globalStoreKey]
const store = globalStore ?? new Map<string, RateLimitEntry>()
if (!(globalThis as unknown as { [key: string]: unknown })[globalStoreKey]) {
  (globalThis as unknown as { [key: string]: Map<string, RateLimitEntry> })[globalStoreKey] = store
}

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000
const BLOCK_DURATION_MS = 5 * 60 * 1000

function getKey(identifier: string): string {
  return `login:${identifier}`
}

export function checkRateLimit(identifier: string): {
  allowed: boolean
  remainingAttempts: number
  blockedUntil: number | null
} {
  const key = getKey(identifier)
  const now = Date.now()
  const entry = store.get(key)

  if (!entry) {
    store.set(key, { attempts: 1, firstAttempt: now, blockedUntil: null })
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, blockedUntil: null }
  }

  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, remainingAttempts: 0, blockedUntil: entry.blockedUntil }
  }

  if (entry.blockedUntil && now >= entry.blockedUntil) {
    store.set(key, { attempts: 1, firstAttempt: now, blockedUntil: null })
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, blockedUntil: null }
  }

  if (now - entry.firstAttempt > WINDOW_MS) {
    store.set(key, { attempts: 1, firstAttempt: now, blockedUntil: null })
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, blockedUntil: null }
  }

  entry.attempts += 1

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION_MS
    console.log(`[RATE LIMIT] User "${identifier}" diblokir ${BLOCK_DURATION_MS / 60000} menit setelah ${entry.attempts} percobaan`)
    store.set(key, entry)
    return { allowed: false, remainingAttempts: 0, blockedUntil: entry.blockedUntil }
  }

  store.set(key, entry)
  const remaining = MAX_ATTEMPTS - entry.attempts
  return { allowed: true, remainingAttempts: remaining, blockedUntil: null }
}

export function recordFailedAttempt(_identifier: string): void {
  // checkRateLimit already pre-increments
}

export function resetRateLimit(identifier: string): void {
  const key = getKey(identifier)
  store.delete(key)
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.blockedUntil && now >= entry.blockedUntil) {
      store.delete(key)
    } else if (now - entry.firstAttempt > WINDOW_MS + BLOCK_DURATION_MS) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)
