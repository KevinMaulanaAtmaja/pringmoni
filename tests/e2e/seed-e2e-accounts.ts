import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import {
  TEST_ACCOUNTS,
  testAccount,
  type TestAccountKey,
} from './accounts'

/**
 * Seed akun blackbox test untuk SEMUA role + shift aktif kasir.
 *
 * Jalankan sekali (atau saat password berubah):
 *   npm run test:e2e:seed
 *
 * Script ini idempoten: akun yang sudah ada di-update, bukan diduplikasi.
 * Test TIDAK boleh membuat akun login baru; gunakan akun tetap ini.
 */
async function main() {
  const prisma = new PrismaClient()

  try {
    const keys = Object.keys(TEST_ACCOUNTS) as TestAccountKey[]

    for (const key of keys) {
      const account = TEST_ACCOUNTS[key]
      const credentials = testAccount(key)
      const hashedPassword = await bcrypt.hash(credentials.password, 10)

      const user = await prisma.users.upsert({
        where: { username: credentials.username },
        update: {
          email: null,
          password: hashedPassword,
          role: account.role,
          status: true,
        },
        create: {
          username: credentials.username,
          email: null,
          password: hashedPassword,
          role: account.role,
          status: true,
        },
        select: { id: true, username: true, role: true },
      })

      console.log(
        `[e2e] ${key.padEnd(8)} -> ${user.username} (role=${user.role}, id=${user.id})`
      )

      // Kasir butuh shift ACTIVE agar Modul 3 bisa langsung membayar.
      if (key === 'cashier') {
        const shiftAktif = await prisma.shiftKasir.findFirst({
          where: { kasirId: user.id, statusShift: 'ACTIVE' },
          select: { id: true },
        })

        if (shiftAktif) {
          console.log(`[e2e] shift ACTIVE kasir sudah ada: #${shiftAktif.id}`)
        } else {
          const now = new Date()
          const tanggal = new Date(
            Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
          )
          const shift = await prisma.shiftKasir.create({
            data: {
              kasirId: user.id,
              tanggal,
              waktuMasuk: now,
              uangAwal: 100_000,
              statusShift: 'ACTIVE',
              aktifKey: user.id,
            },
            select: { id: true },
          })
          console.log(`[e2e] shift ACTIVE kasir dibuat: #${shift.id}`)
        }
      }
    }

    console.log(
      '[e2e] selesai. Daftar username/password ada di tests/e2e/README.md dan .opencode/BLACKBOX_TEST.md.'
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('[e2e] gagal menyiapkan akun test:', error)
  process.exit(1)
})
