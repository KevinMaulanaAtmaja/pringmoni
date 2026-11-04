import { describe, it, expect } from 'vitest'
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '../../src/app/actions/users'

describe('User Management (Modul 1)', () => {
  it('should create a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'StrongPass123!',
      role: 'owner' as const,
    }
    const result = await createUser(userData)
    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('username')
    expect(result).toHaveProperty('email')
    expect(result).toHaveProperty('role')
  })

  it('should update an existing user', async () => {
    const userData = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'StrongPass123!',
      role: 'owner' as const,
      status: true,
    }
    const result = await updateUser(userData)
    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('id')
  })

  it('should delete a user', async () => {
    const userData = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'StrongPass123!',
      role: 'owner',
    }
    const result = await deleteUser(userData.id)
    expect(result).toHaveProperty('success')
  })

  it('should toggle user status', async () => {
    const userData = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'StrongPass123!',
      role: 'owner',
    }
    const result = await toggleUserStatus(userData.id, true)
    expect(result).toHaveProperty('success')
  })
})
