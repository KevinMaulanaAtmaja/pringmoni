import { describe, it, expect } from 'vitest'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from './rate-limiter'

function idBaru() {
  return `test-${crypto.randomUUID()}`
}

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
})
