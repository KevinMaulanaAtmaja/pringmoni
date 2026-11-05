import { test, expect } from '../fixtures'

const SEARCH = 'Cari...'

async function openAddDialog(page: import('@playwright/test').Page) {
  const addButton = page.getByRole('button', { name: /Tambah/ })
  await expect(addButton).toBeVisible({ timeout: 15000 })
  await addButton.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  return dialog
}

test.describe('Modul 1 - Manajemen Meja', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/meja')
    await expect(page.getByRole('heading', { name: 'Kelola Meja' })).toBeVisible({ timeout: 15000 })
  })

  test('should display meja management page', async ({ page }) => {
    await expect(page.getByPlaceholder(SEARCH)).toBeVisible()
    await expect(page.getByRole('button', { name: /Tambah/ })).toBeVisible()
    await page.screenshot({ path: 'test-results/screenshots/meja-page.png', fullPage: true })
  })

  test('should open add meja form', async ({ page }) => {
    const dialog = await openAddDialog(page)
    await expect(dialog.getByText('Tambah Meja Baru')).toBeVisible()
    await expect(dialog.locator('#tipeMeja')).toBeVisible()
    await expect(dialog.locator('#kapasitas')).toBeVisible()
    await page.screenshot({ path: 'test-results/screenshots/add-meja-form.png', fullPage: true })
  })

  test('should create, find, and delete a meja', async ({ page, cleanup }) => {
    const dialog = await openAddDialog(page)

    await dialog.locator('#tipeMeja').click()
    await page.getByRole('option', { name: /Kursi/ }).click()

    const nomor = dialog.getByText(/^K\d{3}$/)
    await expect(nomor).toBeVisible({ timeout: 15000 })
    const nomorMeja = (await nomor.textContent())!.trim()
    cleanup.trackMeja(nomorMeja)

    await dialog.locator('#kapasitas').fill('4')
    await dialog.getByRole('button', { name: 'Simpan' }).click()
    await expect(dialog).toBeHidden({ timeout: 30_000 })

    await page.getByPlaceholder(SEARCH).fill(nomorMeja)
    const row = page.getByRole('row').filter({ hasText: nomorMeja })
    await expect(row).toBeVisible({ timeout: 30_000 })
    await expect(row).toContainText('4 org')
    await page.screenshot({ path: 'test-results/screenshots/create-meja-result.png', fullPage: true })

    await row.getByRole('button').last().click()
    const deleteDialog = page.getByRole('dialog').filter({ hasText: 'Konfirmasi Hapus Meja' })
    await expect(deleteDialog).toBeVisible()
    await deleteDialog.getByRole('button', { name: 'Hapus' }).click()
    await expect(page.getByRole('row').filter({ hasText: nomorMeja })).toHaveCount(0, { timeout: 15000 })
  })
})
