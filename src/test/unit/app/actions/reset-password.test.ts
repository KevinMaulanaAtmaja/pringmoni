import { describe, it, expect, vi, beforeEach } from 'vitest'

const { sendEmailMock, createLogMock, hashMock } = vi.hoisted(() => ({
  sendEmailMock: vi.fn(),
  createLogMock: vi.fn(),
  hashMock: vi.fn(),
}))

vi.mock('@/lib/email', () => ({
  sendResetPasswordEmail: sendEmailMock,
}))

vi.mock('@/lib/log', () => ({
  createLog: createLogMock,
}))

vi.mock('bcryptjs', () => ({
  default: { hash: hashMock },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { userFixture } from '@/test/helpers/fixtures'
import { forgotPasswordAction } from '@/app/actions/forgot-password'
import { resetPasswordAction } from '@/app/actions/reset-password'
import { resetPasswordConfirmAction } from '@/app/actions/reset-password-confirm'

function form(fields: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

beforeEach(() => {
  vi.resetAllMocks()
  hashMock.mockResolvedValue('hashed-password')
})

describe('forgotPasswordAction', () => {
  it('menolak email kosong tanpa query database', async () => {
    const hasil = await forgotPasswordAction(
      { error: '', success: '' },
      form({ email: '' })
    )

    expect(hasil).toEqual({ error: 'Email wajib diisi', success: '' })
    expect(prismaMock.users.findUnique).not.toHaveBeenCalled()
  })

  it('memberi respons netral saat email tidak terdaftar', async () => {
    prismaMock.users.findUnique.mockResolvedValue(null)

    const hasil = await forgotPasswordAction(
      { error: '', success: '' },
      form({ email: 'tidak-ada@pringmoni.test' })
    )

    expect(hasil).toEqual({
      error: '',
      success: 'Jika email terdaftar, link reset akan dikirim',
    })
    expect(prismaMock.users.update).not.toHaveBeenCalled()
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('menyimpan token, mengirim email, dan mencatat log untuk email terdaftar', async () => {
    const user = userFixture({ email: 'owner@pringmoni.test' })
    prismaMock.users.findUnique.mockResolvedValue(user)
    prismaMock.users.update.mockResolvedValue(user)
    sendEmailMock.mockResolvedValue(undefined)

    const hasil = await forgotPasswordAction(
      { error: '', success: '' },
      form({ email: user.email })
    )

    expect(hasil).toEqual({
      error: '',
      success: 'Link reset password telah dikirim ke email Anda',
    })

    const panggilan = prismaMock.users.update.mock.calls[0][0] as {
      where: { id: number }
      data: { resetToken: string; resetTokenExpiry: Date }
    }
    expect(panggilan.where).toEqual({ id: user.id })
    expect(panggilan.data.resetToken).toMatch(/^[a-f0-9]{64}$/)
    expect(panggilan.data.resetTokenExpiry.getTime()).toBeGreaterThan(
      Date.now() + 59 * 60 * 1000
    )

    expect(sendEmailMock).toHaveBeenCalledWith(user.email, panggilan.data.resetToken)
    expect(createLogMock).toHaveBeenCalledWith(
      'RESET_PASSWORD',
      `User ${user.username} meminta reset password`,
      user.id
    )
  })

  it('membersihkan token dan mengembalikan error saat pengiriman email gagal', async () => {
    const user = userFixture({ email: 'owner@pringmoni.test' })
    prismaMock.users.findUnique.mockResolvedValue(user)
    prismaMock.users.update.mockResolvedValue(user)
    sendEmailMock.mockRejectedValue(new Error('smtp down'))

    const hasil = await forgotPasswordAction(
      { error: '', success: '' },
      form({ email: user.email })
    )

    expect(hasil).toEqual({
      error: 'Gagal mengirim email. Coba lagi nanti.',
      success: '',
    })
    expect(prismaMock.users.update).toHaveBeenNthCalledWith(2, {
      where: { id: user.id },
      data: { resetToken: null, resetTokenExpiry: null },
    })
    expect(createLogMock).not.toHaveBeenCalled()
  })
})

describe('resetPasswordConfirmAction', () => {
  it('menolak token kosong', async () => {
    const hasil = await resetPasswordConfirmAction(
      { error: '', success: false },
      form({ token: '', password: 'password123', confirmPassword: 'password123' })
    )

    expect(hasil).toEqual({ error: 'Token tidak valid', success: false })
    expect(prismaMock.users.findFirst).not.toHaveBeenCalled()
  })

  it('menolak password kurang dari 8 karakter', async () => {
    const hasil = await resetPasswordConfirmAction(
      { error: '', success: false },
      form({ token: 'abc', password: 'pendek', confirmPassword: 'pendek' })
    )

    expect(hasil).toEqual({ error: 'Password minimal 8 karakter', success: false })
    expect(prismaMock.users.findFirst).not.toHaveBeenCalled()
  })

  it('menolak konfirmasi password yang tidak cocok', async () => {
    const hasil = await resetPasswordConfirmAction(
      { error: '', success: false },
      form({ token: 'abc', password: 'password123', confirmPassword: 'password456' })
    )

    expect(hasil).toEqual({ error: 'Konfirmasi password tidak cocok', success: false })
    expect(prismaMock.users.findFirst).not.toHaveBeenCalled()
  })

  it('menolak token yang tidak valid atau kedaluwarsa', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null)

    const hasil = await resetPasswordConfirmAction(
      { error: '', success: false },
      form({ token: 'kedaluwarsa', password: 'password123', confirmPassword: 'password123' })
    )

    expect(hasil).toEqual({
      error: 'Token tidak valid atau sudah kedaluwarsa',
      success: false,
    })
    expect(prismaMock.users.update).not.toHaveBeenCalled()
  })

  it('meng-hash password baru dan menghapus token saat reset berhasil', async () => {
    const user = userFixture({ username: 'kasir1' })
    prismaMock.users.findFirst.mockResolvedValue(user)
    prismaMock.users.update.mockResolvedValue(user)

    const hasil = await resetPasswordConfirmAction(
      { error: '', success: false },
      form({ token: 'token-valid', password: 'password123', confirmPassword: 'password123' })
    )

    expect(hasil).toEqual({ error: '', success: true })
    expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
      where: {
        resetToken: 'token-valid',
        resetTokenExpiry: { gt: expect.any(Date) },
      },
    })
    expect(hashMock).toHaveBeenCalledWith('password123', 10)
    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: {
        password: 'hashed-password',
        resetToken: null,
        resetTokenExpiry: null,
      },
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'RESET_PASSWORD',
      `User ${user.username} berhasil reset password`,
      user.id
    )
  })
})

describe('resetPasswordAction (legacy)', () => {
  it('menolak username kosong', async () => {
    const hasil = await resetPasswordAction(
      { error: '', success: '' },
      form({ username: '' })
    )

    expect(hasil).toEqual({ error: 'Username wajib diisi', success: '' })
    expect(prismaMock.users.findFirst).not.toHaveBeenCalled()
  })

  it('menolak username yang tidak ditemukan', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null)

    const hasil = await resetPasswordAction(
      { error: '', success: '' },
      form({ username: 'tidak-ada' })
    )

    expect(hasil).toEqual({ error: 'Username tidak ditemukan', success: '' })
  })

  it('mengembalikan pesan sukses untuk username terdaftar', async () => {
    prismaMock.users.findFirst.mockResolvedValue(userFixture({ username: 'owner' }))

    const hasil = await resetPasswordAction(
      { error: '', success: '' },
      form({ username: 'owner' })
    )

    expect(hasil).toEqual({
      error: '',
      success: 'Link reset password telah dikirim ke email Anda',
    })
  })
})
