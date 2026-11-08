import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { sendMailMock } = vi.hoisted(() => ({ sendMailMock: vi.fn() }))

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail: sendMailMock }),
  },
}))

import { sendResetPasswordEmail } from '@/lib/email'

beforeEach(() => {
  vi.resetAllMocks()
  sendMailMock.mockResolvedValue({ messageId: '1' })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('sendResetPasswordEmail', () => {
  it('mengirim email reset dengan tautan token dan pengirim Gmail', async () => {
    vi.stubEnv('NEXTAUTH_URL', 'https://pringmoni.test')
    vi.stubEnv('GMAIL_EMAIL', 'noreply@pringmoni.test')

    await sendResetPasswordEmail('user@example.com', 'abc123')

    expect(sendMailMock).toHaveBeenCalledTimes(1)
    const arg = sendMailMock.mock.calls[0][0]
    expect(arg).toMatchObject({
      from: '"Pringmoni" <noreply@pringmoni.test>',
      to: 'user@example.com',
      subject: 'Reset Password - Pringmoni',
    })
    expect(arg.html).toContain('https://pringmoni.test/reset-password/abc123')
    expect(arg.html).toContain('Reset Password')
  })

  it('memakai localhost saat NEXTAUTH_URL tidak diset', async () => {
    vi.stubEnv('NEXTAUTH_URL', '')
    vi.stubEnv('GMAIL_EMAIL', 'noreply@pringmoni.test')

    await sendResetPasswordEmail('user@example.com', 'token-x')

    expect(sendMailMock.mock.calls[0][0].html).toContain(
      'http://localhost:3000/reset-password/token-x'
    )
  })

  it('meneruskan error pengiriman ke pemanggil', async () => {
    sendMailMock.mockRejectedValue(new Error('SMTP gagal'))

    await expect(sendResetPasswordEmail('user@example.com', 'x')).rejects.toThrow('SMTP gagal')
  })
})
