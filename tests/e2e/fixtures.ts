/* eslint-disable react-hooks/rules-of-hooks -- fixture Playwright memakai `use`, bukan React hook */
import 'dotenv/config'
import { test as base, expect, type Page } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'

export { expect }

export const E2E_PREFIX = 'E2E_'

export type Credentials = {
  username: string
  password: string
}

type CleanupTask = {
  label: string
  run: (db: PrismaClient) => Promise<void>
}

export function uniqueSuffix(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function e2eName(label: string): string {
  return `${E2E_PREFIX}${label}_${uniqueSuffix()}`
}

export function e2eUsername(label: string): string {
  return `${E2E_PREFIX}${label}_${uniqueSuffix()}`
    .replace(/[^A-Za-z0-9_]/g, '_')
    .slice(0, 40)
}

export function randomPassword(): string {
  return `E2e_${crypto.randomUUID()}!`
}

export function ownerCredentials(): Credentials {
  const username = process.env.E2E_OWNER_USERNAME ?? 'e2e_owner'
  const password = process.env.E2E_OWNER_PASSWORD

  if (!password) {
    throw new Error(
      'E2E_OWNER_PASSWORD belum di-set. PowerShell: $env:E2E_OWNER_PASSWORD="..." ; Git Bash: export E2E_OWNER_PASSWORD=...'
    )
  }

  return { username, password }
}

export class CleanupRegistry {
  private tasks: CleanupTask[] = []

  add(label: string, run: CleanupTask['run']) {
    this.tasks.push({ label, run })
  }

  trackUser(username: string) {
    this.add(`user:${username}`, async (db) => {
      const user = await db.users.findUnique({
        where: { username },
        select: { id: true },
      })

      if (!user) return

      await db.logs.deleteMany({
        where: {
          OR: [
            { userId: user.id },
            { keterangan: { contains: username } },
          ],
        },
      })
      await db.users.delete({ where: { id: user.id } })
    })
  }

  trackKategori(namaKategori: string) {
    this.add(`kategori:${namaKategori}`, async (db) => {
      const kategori = await db.kategoriMenu.findUnique({
        where: { namaKategori },
        select: { id: true, _count: { select: { menus: true } } },
      })

      if (!kategori) return

      if (kategori._count.menus > 0) {
        console.warn(
          `[e2e cleanup] kategori ${namaKategori} masih punya menu; dilewati`
        )
        return
      }

      await db.kategoriMenu.delete({ where: { id: kategori.id } })
    })
  }

  trackMenu(namaMenu: string) {
    this.add(`menu:${namaMenu}`, async (db) => {
      const menus = await db.menu.findMany({
        where: { namaMenu },
        select: { id: true },
      })

      if (menus.length === 0) return

      const ids = menus.map((menu) => menu.id)
      await db.menuFoto.deleteMany({ where: { menuId: { in: ids } } })
      await db.resepMenu.deleteMany({ where: { menuId: { in: ids } } })
      await db.detailPesanan.deleteMany({ where: { menuId: { in: ids } } })
      await db.menu.deleteMany({ where: { id: { in: ids } } })
    })
  }

  trackMeja(nomorMeja: string) {
    this.add(`meja:${nomorMeja}`, async (db) => {
      const meja = await db.meja.findUnique({
        where: { nomorMeja },
        select: { id: true },
      })

      if (!meja) return

      const pesanan = await db.pesanan.findMany({
        where: { mejaId: meja.id },
        select: { id: true },
      })
      const pesananIds = pesanan.map((item) => item.id)

      if (pesananIds.length > 0) {
        await db.refundBukti.deleteMany({
          where: { pesananId: { in: pesananIds } },
        })
        await db.detailPesanan.deleteMany({
          where: { pesananId: { in: pesananIds } },
        })
        await db.pesanan.deleteMany({ where: { id: { in: pesananIds } } })
      }

      await db.meja.delete({ where: { id: meja.id } })
    })
  }

  trackPesananByCustomer(namaPelanggan: string) {
    this.add(`pesanan:${namaPelanggan}`, async (db) => {
      const pesanan = await db.pesanan.findMany({
        where: { namaPelanggan },
        select: { id: true },
      })
      const ids = pesanan.map((item) => item.id)

      if (ids.length === 0) return

      await db.refundBukti.deleteMany({ where: { pesananId: { in: ids } } })
      await db.detailPesanan.deleteMany({ where: { pesananId: { in: ids } } })
      await db.pesanan.deleteMany({ where: { id: { in: ids } } })
    })
  }

  trackVoucher(kode: string) {
    this.add(`voucher:${kode}`, async (db) => {
      const voucher = await db.voucher.findUnique({
        where: { kode },
        select: { id: true },
      })

      if (!voucher) return

      await db.pesanan.updateMany({
        where: { voucherId: voucher.id },
        data: { voucherId: null, diskonVoucher: 0 },
      })
      await db.voucher.delete({ where: { id: voucher.id } })
    })
  }

  async runAll(db: PrismaClient) {
    for (const task of [...this.tasks].reverse()) {
      try {
        await task.run(db)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.warn(`[e2e cleanup] ${task.label} gagal: ${message}`)
      }
    }
  }
}

export async function createTestOwner(
  db: PrismaClient,
  username: string,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10)

  return db.users.create({
    data: {
      username,
      email: null,
      password: hashedPassword,
      role: 'owner',
      status: true,
    },
    select: { id: true, username: true },
  })
}

export async function gotoLogin(page: Page) {
  await page.goto('/login')
  await expect(page.getByText('Welcome Back')).toBeVisible({ timeout: 15000 })
}

export async function submitLogin(page: Page, credentials: Credentials) {
  await page.fill('input[name="username"]', credentials.username)
  await page.fill('input[name="password"]', credentials.password)
  await page.getByRole('button', { name: 'Masuk' }).click()
}

export function takeoverDialog(page: Page) {
  return page.getByRole('dialog').filter({ hasText: 'Ambil alih sesi?' })
}

export async function confirmTakeoverIfVisible(page: Page): Promise<boolean> {
  const dialog = takeoverDialog(page)
  const visible = await dialog
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false)

  if (!visible) return false

  await dialog.getByRole('button', { name: 'Ya, ambil alih' }).click()
  return true
}

export async function loginAs(page: Page, credentials: Credentials) {
  await gotoLogin(page)
  await submitLogin(page, credentials)
  await confirmTakeoverIfVisible(page)
  await page.waitForURL('**/dashboard**', { timeout: 20000 })
}

type E2eFixtures = {
  db: PrismaClient
  cleanup: CleanupRegistry
}

function e2eDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  if (/[?&]connection_limit=/.test(url)) return url
  return `${url}${url.includes('?') ? '&' : '?'}connection_limit=1`
}

export const test = base.extend<E2eFixtures>({
  db: async ({}, use) => {
    const url = e2eDatabaseUrl()
    const db = new PrismaClient(
      url ? { datasources: { db: { url } } } : undefined
    )
    await use(db)
    await db.$disconnect()
  },

  cleanup: async ({ db }, use) => {
    const registry = new CleanupRegistry()
    await use(registry)
    await registry.runAll(db)
  },
})
