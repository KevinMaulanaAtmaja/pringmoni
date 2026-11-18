interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  blockedUntil: number | null
}

export type RateLimitNamespace = "login" | "voice" | "transcribe"

interface ProfilRateLimit {
  maks: number
  jendelaMs: number
  blokirMs: number
}

const PROFIL: Record<RateLimitNamespace, ProfilRateLimit> = {
  login: { maks: 5, jendelaMs: 15 * 60 * 1000, blokirMs: 5 * 60 * 1000 },
  voice: { maks: 10, jendelaMs: 10 * 60 * 1000, blokirMs: 10 * 60 * 1000 },
  transcribe: { maks: 5, jendelaMs: 10 * 60 * 1000, blokirMs: 10 * 60 * 1000 },
}

const globalStoreKey = "__rateLimiterStore"
const globalStore = (globalThis as unknown as { [key: string]: Map<string, RateLimitEntry> })[globalStoreKey]
const store = globalStore ?? new Map<string, RateLimitEntry>()
if (!(globalThis as unknown as { [key: string]: unknown })[globalStoreKey]) {
  (globalThis as unknown as { [key: string]: unknown })[globalStoreKey] = store
}

function getKey(identifier: string, namespace: RateLimitNamespace): string {
  return `${namespace}:${identifier}`
}

function profilDariKunci(key: string): ProfilRateLimit {
  const namespace = key.split(":")[0] as RateLimitNamespace
  return PROFIL[namespace] ?? PROFIL.login
}

export function checkRateLimit(
  identifier: string,
  namespace: RateLimitNamespace = "login"
): {
  allowed: boolean
  remainingAttempts: number
  blockedUntil: number | null
} {
  const profil = PROFIL[namespace]
  const key = getKey(identifier, namespace)
  const now = Date.now()
  const entry = store.get(key)

  if (!entry) {
    return { allowed: true, remainingAttempts: profil.maks, blockedUntil: null }
  }

  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, remainingAttempts: 0, blockedUntil: entry.blockedUntil }
  }

  if (entry.blockedUntil && now >= entry.blockedUntil) {
    store.delete(key)
    return { allowed: true, remainingAttempts: profil.maks, blockedUntil: null }
  }

  if (now - entry.firstAttempt > profil.jendelaMs) {
    store.delete(key)
    return { allowed: true, remainingAttempts: profil.maks, blockedUntil: null }
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, profil.maks - entry.attempts),
    blockedUntil: null,
  }
}

export interface HasilConsumeRateLimit {
  allowed: boolean
  remainingAttempts: number
  retryAfterDetik: number
  blockedUntil: number | null
}

export function consumeRateLimit(
  identifier: string,
  namespace: RateLimitNamespace = "voice"
): HasilConsumeRateLimit {
  const profil = PROFIL[namespace]
  const key = getKey(identifier, namespace)
  const now = Date.now()
  const entry = store.get(key)

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterDetik: Math.max(1, Math.ceil((entry.blockedUntil - now) / 1000)),
      blockedUntil: entry.blockedUntil,
    }
  }

  if (!entry || now - entry.firstAttempt > profil.jendelaMs) {
    store.set(key, { attempts: 1, firstAttempt: now, blockedUntil: null })
    return {
      allowed: true,
      remainingAttempts: profil.maks - 1,
      retryAfterDetik: 0,
      blockedUntil: null,
    }
  }

  entry.attempts += 1
  if (entry.attempts > profil.maks) {
    entry.blockedUntil = entry.firstAttempt + profil.jendelaMs
    store.set(key, entry)
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterDetik: Math.max(1, Math.ceil((entry.blockedUntil - now) / 1000)),
      blockedUntil: entry.blockedUntil,
    }
  }

  store.set(key, entry)
  return {
    allowed: true,
    remainingAttempts: Math.max(0, profil.maks - entry.attempts),
    retryAfterDetik: 0,
    blockedUntil: null,
  }
}

export function recordFailedAttempt(
  identifier: string,
  namespace: RateLimitNamespace = "login"
): void {
  const profil = PROFIL[namespace]
  const key = getKey(identifier, namespace)
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now - entry.firstAttempt > profil.jendelaMs) {
    store.set(key, { attempts: 1, firstAttempt: now, blockedUntil: null })
    return
  }

  if (entry.blockedUntil && now < entry.blockedUntil) return

  entry.attempts += 1
  if (entry.attempts >= profil.maks) {
    entry.blockedUntil = now + profil.blokirMs
    console.log(`[RATE LIMIT] User "${identifier}" diblokir ${profil.blokirMs / 60000} menit setelah ${entry.attempts} percobaan`)
  }
  store.set(key, entry)
}

export function resetRateLimit(
  identifier: string,
  namespace: RateLimitNamespace = "login"
): void {
  store.delete(getKey(identifier, namespace))
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    const profil = profilDariKunci(key)
    if (entry.blockedUntil && now >= entry.blockedUntil) {
      store.delete(key)
    } else if (now - entry.firstAttempt > profil.jendelaMs + profil.blokirMs) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)
