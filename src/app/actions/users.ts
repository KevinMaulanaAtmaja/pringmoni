'use server'

import prisma from '@/lib/prisma'
import { RoleUser } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export type UserWithRole = {
  id: number
  username: string
  email: string | null
  role: RoleUser
  status: boolean
  createdAt: Date
}

export async function getUsers(): Promise<UserWithRole[]> {
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
}

export async function updateUser(data: {
  id: number
  username: string
  email?: string
  role: RoleUser
  status: boolean
  password?: string
}) {
  const updateData: any = {
    username: data.username,
    email: data.email || null,
    role: data.role,
    status: data.status,
  }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  await prisma.users.update({
    where: { id: data.id },
    data: updateData,
  })
  revalidatePath('/dashboard/users')
}

export async function deleteUser(id: number) {
  await prisma.users.delete({
    where: { id },
  })
  revalidatePath('/dashboard/users')
}

export async function toggleUserStatus(id: number, status: boolean) {
  await prisma.users.update({
    where: { id },
    data: { status },
  })
  revalidatePath('/dashboard/users')
}
