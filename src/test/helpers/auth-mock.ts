import { vi } from 'vitest'

export type TestRole = 'owner' | 'cashier' | 'waiter' | 'kitchen' | 'gudang'

export type TestSessionUser = {
  id: string
  username: string
  role: TestRole
  takenOver?: boolean
}

export type TestSession = {
  user: TestSessionUser
}

export function sessionUntuk(
  role: TestRole | null,
  overrides: Partial<TestSessionUser> = {}
): TestSession | null {
  if (!role) return null

  return {
    user: {
      id: '1',
      username: role,
      role,
      ...overrides,
    },
  }
}

export function createAuthMock() {
  return vi.fn()
}
