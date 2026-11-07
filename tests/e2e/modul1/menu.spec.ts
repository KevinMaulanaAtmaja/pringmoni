import { test, expect, e2eName } from '../fixtures'

const SEARCH = 'Cari...'

test.describe('Modul 1.4 - Manajemen Menu', () => {
  test('menampilkan halaman menu, tab, dan aksi utama', async ({ page }) => {
    await page.goto('/dashboard/menu', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { name: 'Kelola Menu' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Menu' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Voucher' })).toBeVisible()
    await expect(page.getByPlaceholder(SEARCH)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Tambah Menu' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Tambah Kategori' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Stok Harian' })).toBeVisible()
  })

  test('membuat kategori & menu, mengubah stok/nama, lalu menghapusnya', async ({
    page,
    cleanup,
  }) => {
    const kategori = e2eName('Kategori')
    const menu = e2eName('Menu')
    const menuSetelahEdit = `${menu}_EDIT`

    cleanup.trackKategori(kategori)
    cleanup.trackMenu(menu)
    cleanup.trackMenu(menuSetelahEdit)

    await page.goto('/dashboard/menu', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Kelola Menu' })).toBeVisible()

    // 1. Buat kategori test.
    await page.getByRole('button', { name: 'Tambah Kategori' }).click()
    const dialogKategori = page
      .getByRole('dialog')
      .filter({ hasText: 'Kelola Kategori Menu' })
    await expect(dialogKategori).toBeVisible()
    await dialogKategori.locator('#namaKategori').fill(kategori)
    await dialogKategori
      .getByRole('button', { name: 'Tambah', exact: true })
      .click()
    await expect(dialogKategori).toBeHidden({ timeout: 15000 })

    // 2. Buat menu dengan kategori tersebut.
    await page.getByRole('button', { name: 'Tambah Menu' }).click()
    const dialogMenu = page
      .getByRole('dialog')
      .filter({ hasText: 'Tambah Menu Baru' })
    await expect(dialogMenu).toBeVisible()

    await dialogMenu.locator('#namaMenu').fill(menu)
    await dialogMenu.locator('#harga').fill('25')

    await dialogMenu.getByRole('combobox').first().click()
    await page.getByRole('option', { name: kategori, exact: true }).click()

    await dialogMenu.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: 'Tersedia', exact: true }).click()

    await dialogMenu.locator('#stokManual').fill('5')
    await dialogMenu.getByRole('button', { name: 'Simpan' }).click()
    await expect(dialogMenu).toBeHidden({ timeout: 20000 })

    // 3. Cari dan verifikasi data menu.
    const search = page.getByPlaceholder(SEARCH)
    await search.fill(menu)

    const row = page.getByRole('row').filter({ hasText: menu })
    await expect(row).toBeVisible({ timeout: 15000 })
    await expect(row).toContainText(kategori)
    await expect(row).toContainText('Rp 25.000')
    await expect(row).toContainText('Tersedia')
    await expect(row.getByRole('button', { name: '5', exact: true })).toBeVisible()

    // 4. Ubah stok harian lewat edit inline.
    await row.getByRole('button', { name: '5', exact: true }).click()
    const inputStok = row.locator('input[type="number"]')
    await expect(inputStok).toBeVisible()
    await inputStok.fill('7')
    await row.getByRole('button', { name: 'Simpan', exact: true }).click()
    await expect(
      row.getByRole('button', { name: '7', exact: true })
    ).toBeVisible({ timeout: 15000 })

    // 5. Ubah nama menu lewat dialog edit.
    await row.getByRole('button').nth(1).click()
    const dialogEdit = page
      .getByRole('dialog')
      .filter({ hasText: 'Edit Menu' })
    await expect(dialogEdit).toBeVisible()
    await dialogEdit.locator('#namaMenu').fill(menuSetelahEdit)
    await dialogEdit.getByRole('button', { name: 'Simpan' }).click()
    await expect(dialogEdit).toBeHidden({ timeout: 20000 })

    await search.fill(menuSetelahEdit)
    const rowEdit = page.getByRole('row').filter({ hasText: menuSetelahEdit })
    await expect(rowEdit).toBeVisible({ timeout: 15000 })

    // 6. Hapus menu.
    await rowEdit.getByRole('button').last().click()
    const dialogHapusMenu = page
      .getByRole('dialog')
      .filter({ hasText: 'Konfirmasi Hapus Menu' })
    await expect(dialogHapusMenu).toBeVisible()
    await dialogHapusMenu.getByRole('button', { name: 'Hapus' }).click()
    await expect(
      page.getByRole('row').filter({ hasText: menuSetelahEdit })
    ).toHaveCount(0, { timeout: 15000 })

    // 7. Hapus kategori.
    await page.getByRole('button', { name: 'Tambah Kategori' }).click()
    const dialogKategoriKedua = page
      .getByRole('dialog')
      .filter({ hasText: 'Kelola Kategori Menu' })
    await expect(dialogKategoriKedua).toBeVisible()

    const barisKategori = dialogKategoriKedua
      .locator('div.flex.items-center.justify-between')
      .filter({ hasText: kategori })
    await expect(barisKategori).toBeVisible()
    await barisKategori.getByRole('button').last().click()

    const dialogHapusKategori = page
      .getByRole('dialog')
      .filter({ hasText: 'Konfirmasi Hapus Kategori' })
    await expect(dialogHapusKategori).toBeVisible()
    await dialogHapusKategori.getByRole('button', { name: 'Hapus' }).click()
    await expect(
      dialogKategoriKedua.getByText(kategori, { exact: true })
    ).toHaveCount(0, { timeout: 15000 })
  })
})
