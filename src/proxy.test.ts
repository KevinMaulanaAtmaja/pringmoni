import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const authMock = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: (...args: unknown[]) => authMock(...args),
}))

import { proxy } from '@/proxy'

function makeRequest(pathname: string) {
  return new NextRequest(`http://localhost:3000${pathname}`)
}

function session(role?: string) {
  return role ? { user: { role } } : null
}

async function run(pathname: string, role?: string) {
  authMock.mockResolvedValue(session(role))
  const res = await proxy(makeRequest(pathname))
  return {
    status: res.status,
    location: res.headers.get('location'),
  }
}

describe('proxy route protection', () => {
  beforeEach(() => {
    authMock.mockReset()
  })

  it('public routes are accessible without session', async () => {
    for (const path of [
      '/',
      '/login',
      '/reset-password',
      '/reset-password/abc123',
      '/token-meja',
      '/token-meja/pesanan',
      '/token-meja/checkout',
      '/token-meja/pembayaran',
      '/token-meja/pembayaran/qris',
      '/token-meja/pembayaran-langkah/qris',
    ]) {
      const res = await run(path)
      expect(res.status, path).toBe(200)
      expect(res.location, path).toBeNull()
    }
  })

  it('dashboard routes require session', async () => {
    for (const path of [
      '/dashboard',
      '/dashboard/menu',
      '/dashboard/pesanan',
      '/dashboard/kasir',
      '/dashboard/users',
      '/dashboard/laporan',
    ]) {
      const res = await run(path)
      expect(res.status, path).toBe(307)
      expect(res.location, path).toContain('/login')
    }
  })

  it('owner can access every dashboard route', async () => {
    for (const path of [
      '/dashboard',
      '/dashboard/menu',
      '/dashboard/pesanan',
      '/dashboard/kasir',
      '/dashboard/stok-bahan',
      '/dashboard/resep',
      '/dashboard/users',
      '/dashboard/laporan',
      '/dashboard/logging',
      '/dashboard/meja',
    ]) {
      const res = await run(path, 'owner')
      expect(res.status, path).toBe(200)
      expect(res.location, path).toBeNull()
    }
  })

  it('waiter is limited to pesanan, meja and dashboard index', async () => {
    expect((await run('/dashboard', 'waiter')).status).toBe(200)
    expect((await run('/dashboard/pesanan', 'waiter')).status).toBe(200)
    expect((await run('/dashboard/meja', 'waiter')).status).toBe(200)

    for (const path of [
      '/dashboard/menu',
      '/dashboard/kasir',
      '/dashboard/users',
      '/dashboard/laporan',
      '/dashboard/stok-bahan',
      '/dashboard/resep',
      '/dashboard/logging',
    ]) {
      const res = await run(path, 'waiter')
      expect(res.status, path).toBe(307)
      expect(res.location, path).toContain('/dashboard')
    }
  })

  it('cashier can access kasir but not owner-only routes', async () => {
    expect((await run('/dashboard/kasir', 'cashier')).status).toBe(200)
    expect((await run('/dashboard/pesanan', 'cashier')).status).toBe(200)
    expect((await run('/dashboard/meja', 'cashier')).status).toBe(200)

    for (const path of [
      '/dashboard/menu',
      '/dashboard/users',
      '/dashboard/laporan',
      '/dashboard/stok-bahan',
      '/dashboard/resep',
      '/dashboard/logging',
    ]) {
      const res = await run(path, 'cashier')
      expect(res.status, path).toBe(307)
      expect(res.location, path).toContain('/dashboard')
    }
  })

  it('nested routes use the longest matching role rule', async () => {
    expect(
      (await run('/dashboard/kasir/pesanan-baru/abc', 'cashier')).status
    ).toBe(200)
    expect(
      (await run('/dashboard/kasir/pesanan-baru/abc', 'waiter')).status
    ).toBe(307)
    expect(
      (await run('/dashboard/pesanan/abc', 'waiter')).status
    ).toBe(200)
  })

  it('logged in user is redirected away from login page', async () => {
    const res = await run('/login', 'owner')
    expect(res.status).toBe(307)
    expect(res.location).toContain('/dashboard')
  })

  it('unknown role cannot enter dashboard and is not redirected in a loop', async () => {
    const dashboard = await run('/dashboard', 'admin')
    expect(dashboard.status).toBe(307)
    expect(dashboard.location).toContain('/login')

    const login = await run('/login', 'admin')
    expect(login.status).toBe(200)
    expect(login.location).toBeNull()
  })
})
