import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendResetPasswordEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password/${token}`

  await transporter.sendMail({
    from: `"Pringmoni" <${process.env.GMAIL_EMAIL}>`,
    to,
    subject: 'Reset Password - Pringmoni',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Reset Password</h2>
        <p>Klik tombol di bawah untuk mereset password Anda:</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          Link ini berlaku selama 1 jam. Abaikan email ini jika Anda tidak meminta reset password.
        </p>
      </div>
    `,
  })
}
