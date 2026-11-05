import {
  test,
  expect,
  createTestOwner,
  e2eUsername,
  gotoLogin,
  randomPassword,
  submitLogin,
  takeoverDialog,
  type Credentials,
} from '../fixtures'
import type { PrismaClient } from '@prisma/client'
import type { CleanupRegistry } from '../fixtures'

async function buatAkunOwnerSementara(
  db: PrismaClient,
  cleanup: CleanupRegistry
): Promise<Credentials> {
  const username = e2eUsername('takeover')
  const password = randomPassword()

  cleanup.trackUser(username)
  await createTestOwner(db, username, password)

  return { username, password }
}

async function loginSampaiDashboard(
  page: import('@playwright/test').Page,
  credentials: Credentials
) {
  await gotoLogin(page)
  await submitLogin(page, credentials)
  await page.waitForURL('**/dashboard**', { timeout: 20000 })
}

test.describe('Modul 1.5 - Ambil alih sesi', () => {
  test.describe.configure({ mode: 'serial' })

  test('menampilkan konfirmasi lalu mengeluarkan sesi perangkat lama', async ({
    browser,
    db,
    cleanup,
  }) => {
    const credentials = await buatAkunOwnerSementara(db, cleanup)
    const contextLama = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    })
    const contextBaru = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    })

    try {
      const pageLama = await contextLama.newPage()
      await loginSampaiDashboard(pageLama, credentials)
      await pageLama.goto('/dashboard/pesanan')

      const pageBaru = await contextBaru.newPage()
      await gotoLogin(pageBaru)
      await submitLogin(pageBaru, credentials)

      const dialog = takeoverDialog(pageBaru)
      await expect(dialog).toBeVisible({ timeout: 15000 })
      await dialog.getByRole('button', { name: 'Ya, ambil alih' }).click()
      await pageBaru.waitForURL('**/dashboard**', { timeout: 20000 })

      await pageLama.goto('/dashboard')
      const dialogDiambilAlih = pageLama
        .getByRole('dialog')
        .filter({ hasText: 'Sesi diambil alih' })
      await expect(dialogDiambilAlih).toBeVisible({ timeout: 20000 })
      await dialogDiambilAlih.getByRole('button', { name: 'Mengerti' }).click()
      await expect(pageLama).toHaveURL(/\/login$/)
    } finally {
      await contextLama.close()
      await contextBaru.close()
    }
  })

  test('menekan Batal tidak mengeluarkan sesi perangkat lama', async ({
    browser,
    db,
    cleanup,
  }) => {
    const credentials = await buatAkunOwnerSementara(db, cleanup)
    const contextLama = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    })
    const contextBaru = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    })

    try {
      const pageLama = await contextLama.newPage()
      await loginSampaiDashboard(pageLama, credentials)
      await pageLama.goto('/dashboard')

      const pageBaru = await contextBaru.newPage()
      await gotoLogin(pageBaru)
      await submitLogin(pageBaru, credentials)

      const dialog = takeoverDialog(pageBaru)
      await expect(dialog).toBeVisible({ timeout: 15000 })
      await dialog.getByRole('button', { name: 'Batal' }).click()
      await expect(dialog).toBeHidden()
      await expect(pageBaru).toHaveURL(/\/login$/)

      await pageLama.goto('/dashboard/pesanan')
      await expect(pageLama).toHaveURL(/\/dashboard\/pesanan/)
      await expect(
        pageLama.getByRole('heading', { name: /Pesanan/ }).first()
      ).toBeVisible({ timeout: 15000 })
    } finally {
      await contextLama.close()
      await contextBaru.close()
    }
  })
})
