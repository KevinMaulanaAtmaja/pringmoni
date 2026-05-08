'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function resetPasswordConfirmAction(
  prevState: { error: string; success: boolean },
  formData: FormData
) {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!token) {
    return { error: 'Token tidak valid', success: false }
  }

  if (!password || password.length < 8) {
    return { error: 'Password minimal 8 karakter', success: false }
  }

  if (password !== confirmPassword) {
    return { error: 'Konfirmasi password tidak cocok', success: false }
  }

  const user = await prisma.users.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  })

  if (!user) {
    return { error: 'Token tidak valid atau sudah kedaluwarsa', success: false }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.users.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  })

  return { error: '', success: true }
}
