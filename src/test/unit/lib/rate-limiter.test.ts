import { describe, it, expect, vi, afterEach } from 'vitest'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/rate-limiter'

function idBaru() {
  return `test-${crypto.randomUUID()}`
}

afterEach(() => {
  vi.useRealTimers()
})

describe('rate limiter login', () => {
  it('cek saja tidak menambah hitungan percobaan', () => {
    const id = idBaru()
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(id).allowed).toBe(true)
    }
    expect(checkRateLimit(id).remainingAttempts).toBe(5)
  })

  it('memblokir setelah 5 percobaan gagal', () => {
    const id = idBaru()
    for (let i = 0; i < 4; i++) recordFailedAttempt(id)

    expect(checkRateLimit(id).allowed).toBe(true)
    expect(checkRateLimit(id).remainingAttempts).toBe(1)

    recordFailedAttempt(id)
    const hasil = checkRateLimit(id)
    expect(hasil.allowed).toBe(false)
    expect(hasil.blockedUntil).toBeGreaterThan(Date.now())
  })

  it('batalkan dialog (tanpa record) tidak dihitung gagal', () => {
    const id = idBaru()
    recordFailedAttempt(id)
    recordFailedAttempt(id)

    // Pengguna menekan Masuk lagi lalu membatalkan dialog "Ambil alih sesi?":
    // server hanya memanggil checkRateLimit, tidak mencatat kegagalan.
    expect(checkRateLimit(id).allowed).toBe(true)
    expect(checkRateLimit(id).allowed).toBe(true)
    expect(checkRateLimit(id).remainingAttempts).toBe(3)
  })

  it('resetRateLimit membersihkan hitungan gagal', () => {
    const id = idBaru()
    recordFailedAttempt(id)
    recordFailedAttempt(id)
    recordFailedAttempt(id)

    resetRateLimit(id)

    expect(checkRateLimit(id).allowed).toBe(true)
    expect(checkRateLimit(id).remainingAttempts).toBe(5)
  })

  it('membuka blokir otomatis setelah 5 menit', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-05T10:00:00Z'))

    const id = idBaru()
    for (let i = 0; i < 5; i++) recordFailedAttempt(id)
    expect(checkRateLimit(id).allowed).toBe(false)

    vi.advanceTimersByTime(5 * 60 * 1000 + 1)

    const hasil = checkRateLimit(id)
    expect(hasil.allowed).toBe(true)
    expect(hasil.remainingAttempts).toBe(5)
  })

  it('mereset hitungan setelah jendela 15 menit lewat', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-05T10:00:00Z'))

    const id = idBaru()
    for (let i = 0; i < 4; i++) recordFailedAttempt(id)
    expect(checkRateLimit(id).remainingAttempts).toBe(1)

    vi.advanceTimersByTime(15 * 60 * 1000 + 1)
    recordFailedAttempt(id)

    expect(checkRateLimit(id).remainingAttempts).toBe(4)
  })

  it('checkRateLimit membersihkan entri yang lewat jendela 15 menit', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-05T10:00:00Z'))

    const id = idBaru()
    recordFailedAttempt(id)
    recordFailedAttempt(id)
    expect(checkRateLimit(id).remainingAttempts).toBe(3)

    vi.advanceTimersByTime(15 * 60 * 1000 + 1)

    const hasil = checkRateLimit(id)
    expect(hasil).toEqual({ allowed: true, remainingAttempts: 5, blockedUntil: null })
    expect(checkRateLimit(id).remainingAttempts).toBe(5)
  })

  it('mencatat ulang tidak menambah hitungan saat masih diblokir', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-05T10:00:00Z'))

    const id = idBaru()
    for (let i = 0; i < 5; i++) recordFailedAttempt(id)
    expect(checkRateLimit(id).allowed).toBe(false)

    recordFailedAttempt(id)
    recordFailedAttempt(id)

    vi.advanceTimersByTime(5 * 60 * 1000 + 1)
    expect(checkRateLimit(id).allowed).toBe(true)
    expect(checkRateLimit(id).remainingAttempts).toBe(5)
  })
})
