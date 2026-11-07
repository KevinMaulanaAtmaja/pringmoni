import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function main() {
  const username = process.env.E2E_OWNER_USERNAME ?? 'e2e_owner'
  const password = process.env.E2E_OWNER_PASSWORD

  if (!password) {
    console.error(
      '[e2e] E2E_OWNER_PASSWORD belum di-set. Contoh PowerShell: $env:E2E_OWNER_PASSWORD="..."'
    )
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('[e2e] E2E_OWNER_PASSWORD minimal 8 karakter.')
    process.exit(1)
  }

  const prisma = new PrismaClient()

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.users.upsert({
      where: { username },
      update: {
        email: null,
        password: hashedPassword,
        role: 'owner',
        status: true,
      },
      create: {
        username,
        email: null,
        password: hashedPassword,
        role: 'owner',
        status: true,
      },
      select: { id: true, username: true, role: true },
    })

    console.log(
      `[e2e] akun test siap: ${user.username} (id=${user.id}, role=${user.role})`
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('[e2e] gagal menyiapkan akun test:', error)
  process.exit(1)
})
