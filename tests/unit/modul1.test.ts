import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as userActions from '../../src/app/actions/users'
import * as mejaActions from '../../src/app/actions/meja'
import prisma from '../../src/lib/prisma'
import { auth } from '../../src/lib/auth'

vi.mock('../../src/lib/prisma')
vi.mock('../../src/lib/auth')

const mockPrisma = prisma as any
const mockAuth = auth as any

describe('User Management (Modul 1) - Whitebox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 1, username: 'admin', role: 'owner', email: 'admin@test.com' } })
    mockPrisma.users.findMany.mockResolvedValue([])
    mockPrisma.users.create.mockResolvedValue({ id: 1, username: 'test', email: 'test@test.com', role: 'owner', status: true, createdAt: new Date() })
    mockPrisma.users.update.mockResolvedValue({ id: 1, username: 'updated', email: 'updated@test.com', role: 'owner', status: true, createdAt: new Date() })
    mockPrisma.users.delete.mockResolvedValue({ id: 1 })
  })

  describe('getUsers', () => {
    it('should fetch users list', async () => {
      const result = await userActions.getUsers()
      expect(result).toBeDefined()
    })
  })

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass123!',
        role: 'owner' as const,
      }
      const result = await userActions.createUser(userData)
      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('username')
      expect(result).toHaveProperty('email')
    })

    it('should reject password less than 8 characters', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'short',
        role: 'owner' as const,
      }
      const result = await userActions.createUser(userData)
      expect(result).toHaveProperty('error')
    })

    it('should reject password without uppercase', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'lowercase123!',
        role: 'owner' as const,
      }
      const result = await userActions.createUser(userData)
      expect(result).toHaveProperty('error')
    })
  })

  describe('updateUser', () => {
    it('should update user password', async () => {
      const userData = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'NewPass123!',
        role: 'owner' as const,
        status: true,
      }
      const result = await userActions.updateUser(userData)
      expect(result).toHaveProperty('success')
    })
  })

  describe('deleteUser', () => {
    it('should delete user that is not owner', async () => {
      const userData = {
        id: 2,
        username: 'waiter',
        email: 'waiter@test.com',
        role: 'waiter',
      }
      const result = await userActions.deleteUser(userData.id)
      expect(result).toHaveProperty('success')
    })

    it('should not delete owner user', async () => {
      const userData = {
        id: 1,
        username: 'owner',
        email: 'owner@test.com',
        role: 'owner' as const,
      }
      const result = await userActions.deleteUser(userData.id)
      expect(result).toHaveProperty('error')
    })
  })

  describe('toggleUserStatus', () => {
    it('should toggle user status', async () => {
      const result = await userActions.toggleUserStatus(1, true)
      expect(result).toHaveProperty('success')
    })
  })

  describe('getKasirUsers', () => {
    it('should fetch cashier users', async () => {
      const result = await userActions.getKasirUsers()
      expect(result).toBeDefined()
    })
  })
})

describe('Meja Management (Modul 1) - Whitebox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 1, username: 'admin', role: 'owner', email: 'admin@test.com' } })
    mockPrisma.$queryRaw.mockResolvedValue([])
    mockPrisma.$executeRaw.mockResolvedValue({})
  })

  describe('getMeja', () => {
    it('should fetch meja list', async () => {
      const result = await mejaActions.getMeja()
      expect(result).toBeDefined()
    })
  })

  describe('createMeja', () => {
    it('should create meja with valid data', async () => {
      const formData = new FormData()
      formData.set('kapasitas', '5')
      formData.set('tipeMeja', 'kursi')

      const result = await mejaActions.createMeja(null, formData)
      expect(result).toHaveProperty('success')
    })

    it('should reject invalid kapasitas', async () => {
      const formData = new FormData()
      formData.set('kapasitas', '0')
      formData.set('tipeMeja', 'kursi')

      const result = await mejaActions.createMeja(null, formData)
      expect(result).toHaveProperty('error')
    })
  })
})