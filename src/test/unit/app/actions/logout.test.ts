import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, signOutMock, redirectMock, createLogMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  signOutMock: vi.fn(),
  redirectMock: vi.fn(),
  createLogMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: authMock,
  signOut: signOutMock,
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

vi.mock('@/lib/log', () => ({
  createLog: createLogMock,
}))

import { logoutAction } from '@/app/actions/logout'

beforeEach(() => {
  vi.resetAllMocks()
  redirectMock.mockImplementation(() => {
    throw new Error('NEXT_REDIRECT:/login')
  })
})

describe('logoutAction', () => {
  it('mencatat logout memakai username lalu signOut dan redirect ke login', async () => {
    authMock.mockResolvedValue({ user: { username: 'owner' } })
    signOutMock.mockResolvedValue(undefined)

    await expect(logoutAction()).rejects.toThrow('NEXT_REDIRECT:/login')

    expect(createLogMock).toHaveBeenCalledWith('LOGOUT', 'User owner logout dari sistem')
    expect(signOutMock).toHaveBeenCalledWith({ redirect: false })
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })

  it('memakai name bila username tidak tersedia', async () => {
    authMock.mockResolvedValue({ user: { name: 'Kasir Satu' } })
    signOutMock.mockResolvedValue(undefined)

    await expect(logoutAction()).rejects.toThrow('NEXT_REDIRECT:/login')

    expect(createLogMock).toHaveBeenCalledWith('LOGOUT', 'User Kasir Satu logout dari sistem')
  })

  it('memakai Unknown bila tidak ada session', async () => {
    authMock.mockResolvedValue(null)
    signOutMock.mockResolvedValue(undefined)

    await expect(logoutAction()).rejects.toThrow('NEXT_REDIRECT:/login')

    expect(createLogMock).toHaveBeenCalledWith('LOGOUT', 'User Unknown logout dari sistem')
    expect(signOutMock).toHaveBeenCalledWith({ redirect: false })
  })
})
