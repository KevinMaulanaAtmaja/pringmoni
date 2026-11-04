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

/**
 * Cek apakah identifier masih boleh mencoba login. Fungsi ini TIDAK menambah
 * hitungan — percobaan hanya dicatat lewat `recordFailedAttempt`. Dengan begitu
 * aksi yang dibatalkan pengguna (mis. menutup dialog "Ambil alih sesi?" tanpa
 * jadi login) tidak ikut terhitung sebagai percobaan gagal.
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean
  remainingAttempts: number
  blockedUntil: number | null
} {
  const key = getKey(identifier)
  const now = Date.now()
  const entry = store.get(key)

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, blockedUntil: null }
  }

  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, remainingAttempts: 0, blockedUntil: entry.blockedUntil }
  }

  if (entry.blockedUntil && now >= entry.blockedUntil) {
    store.delete(key)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, blockedUntil: null }
  }

  if (now - entry.firstAttempt > WINDOW_MS) {
    store.delete(key)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, blockedUntil: null }
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - entry.attempts),
    blockedUntil: null,
  }
}

/** Catat satu percobaan login yang gagal (username/password salah). */
export function recordFailedAttempt(identifier: string): void {
  const key = getKey(identifier)
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    store.set(key, { attempts: 1, firstAttempt: now, blockedUntil: null })
    return
  }

  if (entry.blockedUntil && now < entry.blockedUntil) return

  entry.attempts += 1
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION_MS
    console.log(`[RATE LIMIT] User "${identifier}" diblokir ${BLOCK_DURATION_MS / 60000} menit setelah ${entry.attempts} percobaan`)
  }
  store.set(key, entry)
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
