'use server'

import prisma from '@/lib/prisma'
import { RoleUser } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

export type UserWithRole = {
  id: number
  username: string
  email: string | null
  role: RoleUser
  status: boolean
  createdAt: Date
}

async function requireOwner() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') {
    throw new Error('Unauthorized')
  }
}

export async function getUsers(): Promise<UserWithRole[]> {
  await requireOwner()
  const users = await prisma.users.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      password: false,
    },
    orderBy: { createdAt: 'desc' },
  })
  return users
}

export async function createUser(data: {
  username: string
  email?: string
  password: string
  role: RoleUser
}) {
  await requireOwner()
  if (data.password.length < 8) {
    return { error: "Password minimal 8 karakter" }
  }
  
  if (!/[A-Z]/.test(data.password)) {
    return { error: "Password harus mengandung huruf besar (A-Z)" }
  }
  
  if (!/[a-z]/.test(data.password)) {
    return { error: "Password harus mengandung huruf kecil (a-z)" }
  }
  
  if (!/[0-9]/.test(data.password)) {
    return { error: "Password harus mengandung angka (0-9)" }
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.password)) {
    return { error: "Password harus mengandung simbol (!@#$%^&*)" }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)
  
  await prisma.users.create({
    data: {
      username: data.username,
      email: data.email || null,
      password: hashedPassword,
      role: data.role,
      status: true,
    },
  })
  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function updateUser(data: {
  id: number
  username: string
  email?: string
  role: RoleUser
  status: boolean
  password?: string
}) {
  await requireOwner()
  const updateData: {
    username: string
    email: string | null
    role: RoleUser
    status: boolean
    password?: string
  } = {
    username: data.username,
    email: data.email || null,
    role: data.role,
    status: data.status,
  }

  if (data.password) {
    if (data.password.length < 8) {
      return { error: "Password minimal 8 karakter" }
    }
    
    if (!/[A-Z]/.test(data.password)) {
      return { error: "Password harus mengandung huruf besar (A-Z)" }
    }
    
    if (!/[a-z]/.test(data.password)) {
      return { error: "Password harus mengandung huruf kecil (a-z)" }
    }
    
    if (!/[0-9]/.test(data.password)) {
      return { error: "Password harus mengandung angka (0-9)" }
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.password)) {
      return { error: "Password harus mengandung simbol (!@#$%^&*)" }
    }
    
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  await prisma.users.update({
    where: { id: data.id },
    data: updateData,
  })
  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function deleteUser(id: number) {
  await requireOwner()
  // Check if user is owner
  const user = await prisma.users.findUnique({
    where: { id },
    select: { role: true },
  })
  
  if (!user) {
    return { error: "User tidak ditemukan" }
  }
  
  if (user.role === 'owner') {
    return { error: "Akun owner tidak dapat dihapus" }
  }
  
  await prisma.users.delete({
    where: { id },
  })
  revalidatePath('/dashboard/users')
}

export async function toggleUserStatus(id: number, status: boolean) {
  await requireOwner()
  await prisma.users.update({
    where: { id },
    data: { status },
  })
  revalidatePath('/dashboard/users')
}

export async function getKasirUsers() {
  await requireOwner()
  try {
    const users = await prisma.users.findMany({
      where: { role: 'cashier', status: true },
      select: { id: true, username: true },
      orderBy: { username: 'asc' },
    })
    return users
  } catch (error) {
    console.error("getKasirUsers error:", error)
    return []
  }
}
