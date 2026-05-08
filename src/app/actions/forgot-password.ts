'use server'

import prisma from '@/lib/prisma'
import { sendResetPasswordEmail } from '@/lib/email'
import crypto from 'crypto'

export async function forgotPasswordAction(
  prevState: { error: string; success: string },
  formData: FormData
) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email wajib diisi', success: '' }
  }

  const user = await prisma.users.findUnique({
    where: { email },
  })

  if (!user) {
    return { error: '', success: 'Jika email terdaftar, link reset akan dikirim' }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.users.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpiry: expiry,
    },
  })

  try {
    await sendResetPasswordEmail(user.email!, token)
  } catch {
    await prisma.users.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    })
    return { error: 'Gagal mengirim email. Coba lagi nanti.', success: '' }
  }

  return { error: '', success: 'Link reset password telah dikirim ke email Anda' }
}
