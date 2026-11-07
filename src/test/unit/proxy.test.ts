import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const authMock = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: (...args: unknown[]) => authMock(...args),
}))

import { proxy } from '@/proxy'

function makeRequest(pathname: string, cookie?: string) {
  return new NextRequest(
    `http://localhost:3000${pathname}`,
    cookie ? { headers: { cookie } } : undefined
  )
}

function session(role?: string, extra: { takenOver?: boolean } = {}) {
  return role ? { user: { role, ...extra } } : null
}

async function run(
  pathname: string,
  role?: string,
  extra?: { takenOver?: boolean },
  cookie?: string
) {
  authMock.mockResolvedValue(session(role, extra))
  const res = await proxy(makeRequest(pathname, cookie))
  return {
    status: res.status,
    location: res.headers.get('location'),
    setCookie: res.headers.get('set-cookie'),
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
      '/dashboard/shift',
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
      '/dashboard/users',
      '/dashboard/laporan',
      '/dashboard/logging',
      '/dashboard/meja',
      '/dashboard/shift',
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
      '/dashboard/logging',
      '/dashboard/shift',
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
    expect((await run('/dashboard/shift', 'cashier')).status).toBe(200)

    for (const path of [
      '/dashboard/menu',
      '/dashboard/users',
      '/dashboard/laporan',
      '/dashboard/stok-bahan',
      '/dashboard/logging',
    ]) {
      const res = await run(path, 'cashier')
      expect(res.status, path).toBe(307)
      expect(res.location, path).toContain('/dashboard')
    }
  })

  it('kitchen can access dashboard, pesanan and menu only', async () => {
    for (const path of ['/dashboard', '/dashboard/pesanan', '/dashboard/menu']) {
      const res = await run(path, 'kitchen')
      expect(res.status, path).toBe(200)
      expect(res.location, path).toBeNull()
    }

    for (const path of [
      '/dashboard/kasir',
      '/dashboard/meja',
      '/dashboard/shift',
      '/dashboard/stok-bahan',
      '/dashboard/users',
      '/dashboard/laporan',
      '/dashboard/logging',
    ]) {
      const res = await run(path, 'kitchen')
      expect(res.status, path).toBe(307)
      expect(res.location, path).toContain('/dashboard')
    }
  })

  it('shift route is limited to owner and cashier', async () => {
    expect((await run('/dashboard/shift', 'owner')).status).toBe(200)
    expect((await run('/dashboard/shift', 'cashier')).status).toBe(200)

    for (const role of ['waiter', 'kitchen']) {
      const res = await run('/dashboard/shift', role)
      expect(res.status, role).toBe(307)
      expect(res.location, role).toContain('/dashboard')
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

  it('taken over session clears auth cookies and redirects to login', async () => {
    const res = await run(
      '/dashboard',
      'owner',
      { takenOver: true },
      'authjs.session-token=lama; __Secure-authjs.session-token=lama; pm_device=abc'
    )

    expect(res.status).toBe(307)
    expect(res.location).toContain('/login?takenOver=1')

    const setCookie = res.setCookie ?? ''
    expect(setCookie).toContain('authjs.session-token')
    expect(setCookie).toContain('__Secure-authjs.session-token')
  })

  it('taken over session can still open login without redirect loop', async () => {
    const res = await run('/login', 'owner', { takenOver: true })
    expect(res.status).toBe(200)
    expect(res.location).toBeNull()
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
