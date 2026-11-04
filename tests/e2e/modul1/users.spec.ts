import { test, expect } from '@playwright/test'

const SEARCH = 'Cari...'

async function openAddDialog(page: import('@playwright/test').Page) {
  const addButton = page.getByRole('button', { name: /Tambah/ })
  await expect(addButton).toBeVisible({ timeout: 15000 })
  await addButton.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  return dialog
}

test.describe('Modul 1 - Manajemen User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/users')
    await expect(page.getByRole('heading', { name: 'Kelola Akun' })).toBeVisible({ timeout: 15000 })
  })

  test('should display users management page', async ({ page }) => {
    await expect(page.getByPlaceholder(SEARCH)).toBeVisible()
    await expect(page.getByRole('button', { name: /Tambah/ })).toBeVisible()
    await page.screenshot({ path: 'test-results/screenshots/users-page.png', fullPage: true })
  })

  test('should open add user form', async ({ page }) => {
    const dialog = await openAddDialog(page)
    await expect(dialog.getByText('Tambah Akun Baru')).toBeVisible()
    await expect(dialog.locator('#username')).toBeVisible()
    await expect(dialog.locator('#email')).toBeVisible()
    await expect(dialog.locator('#password')).toBeVisible()
    await page.screenshot({ path: 'test-results/screenshots/add-user-form.png', fullPage: true })
  })

  test('should create, find, and delete a user', async ({ page }) => {
    const username = `testuser${Date.now()}`
    const dialog = await openAddDialog(page)

    await dialog.locator('#username').fill(username)
    await dialog.locator('#email').fill(`${username}@test.com`)
    await dialog.locator('#password').fill('TestPass123!')

    await dialog.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Waiter' }).click()

    await dialog.getByRole('button', { name: 'Simpan' }).click()
    await expect(dialog).toBeHidden({ timeout: 15000 })

    await page.getByPlaceholder(SEARCH).fill(username)
    const row = page.getByRole('row').filter({ hasText: username })
    await expect(row).toBeVisible({ timeout: 15000 })
    await expect(row).toContainText(`${username}@test.com`)
    await page.screenshot({ path: 'test-results/screenshots/create-user-result.png', fullPage: true })

    await row.getByRole('button').last().click()
    const deleteDialog = page.getByRole('dialog').filter({ hasText: 'Konfirmasi Hapus Akun' })
    await expect(deleteDialog).toBeVisible()
    await deleteDialog.getByRole('button', { name: 'Hapus' }).click()
    await expect(page.getByRole('row').filter({ hasText: username })).toHaveCount(0, { timeout: 15000 })
  })

  test('should search and filter users', async ({ page }) => {
    await page.getByPlaceholder(SEARCH).fill('owner')
    await expect(page.getByRole('row').filter({ hasText: /owner/i }).first()).toBeVisible()
    await page.screenshot({ path: 'test-results/screenshots/search-users.png', fullPage: true })
  })
})
