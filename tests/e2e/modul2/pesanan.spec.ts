import type { Browser, Page } from '@playwright/test'
import {
  test,
  expect,
  createTestKategori,
  createTestMeja,
  createTestMenu,
  createTestPesanan,
  e2eName,
  getTestUser,
  loginAs,
  testAccount,
  type Credentials,
} from '../fixtures'

async function sesiLogin(browser: Browser, credentials: Credentials) {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  })
  const page = await context.newPage()
  await loginAs(page, credentials)

  return { context, page }
}

function kartuPesanan(page: Page, pesananId: number) {
  return page
    .locator('.rounded-xl.border-2')
    .filter({ hasText: `#${pesananId}` })
}

test.describe('Modul 2 - Pesanan', () => {
  test.describe.configure({ mode: 'serial' })

  test('2.1 membuat pesanan lewat QR customer, memotong stok, dan mengunci meja', async ({
    browser,
    db,
    cleanup,
    page,
  }) => {
    const namaPelanggan = e2eName('QR')
    const kategori = await createTestKategori(db, {
      namaKategori: e2eName('KategoriQR'),
    })
    const menu = await createTestMenu(db, {
      kategoriId: kategori.id,
      namaMenu: e2eName('MenuQR'),
      stokManual: 5,
    })
    const meja = await createTestMeja(db)

    cleanup.trackKategori(kategori.namaKategori)
    cleanup.trackMenu(menu.namaMenu)
    cleanup.trackMeja(meja.nomorMeja)
    cleanup.trackPesananByCustomer(namaPelanggan)

    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    })

    try {
      const customer = await context.newPage()
      await customer.goto(`/${meja.tokenMeja}`)
      await customer
        .getByPlaceholder('Cari menu...')
        .fill(menu.namaMenu)
      await expect(
        customer.getByText(menu.namaMenu, { exact: true })
      ).toBeVisible({ timeout: 30000 })

      await customer.getByText(menu.namaMenu, { exact: true }).click()
      await expect(
        customer.getByRole('button', { name: /^Tambah Rp/ })
      ).toBeVisible()
      await customer.getByRole('button', { name: /^Tambah Rp/ }).click()

      await customer.locator('[data-cart-button]').click()
      const keranjang = customer
        .getByRole('dialog')
        .filter({ hasText: 'Keranjang' })
      await expect(keranjang).toBeVisible()
      await keranjang.getByRole('button', { name: 'Checkout' }).click()

      await customer.waitForURL(`**/${meja.tokenMeja}/checkout`)

      const tombolKonfirmasi = customer.getByRole('button', {
        name: 'Konfirmasi Pembayaran',
      })
      await expect(tombolKonfirmasi).toBeDisabled()

      await customer.locator('#nama').fill(namaPelanggan)
      await expect(tombolKonfirmasi).toBeDisabled()

      await customer.getByRole('button', { name: 'Tunai' }).click()
      await expect(tombolKonfirmasi).toBeEnabled()
      await tombolKonfirmasi.click()

      await customer.waitForURL(/\/pembayaran\/tunai/)
    } finally {
      await context.close()
    }

    const pesanan = await db.pesanan.findFirst({
      where: { namaPelanggan },
      include: { detailPesanan: true },
    })

    expect(pesanan).not.toBeNull()
    expect(pesanan?.statusPesanan).toBe('menunggu')
    expect(pesanan?.statusPembayaran).toBe('menunggu')
    expect(pesanan?.metodePembayaran).toBe('tunai')
    expect(pesanan?.kasirId).toBeNull()
    expect(pesanan?.detailPesanan).toHaveLength(1)

    const menuTersimpan = await db.menu.findUnique({
      where: { id: menu.id },
      select: { stokManual: true },
    })
    expect(menuTersimpan?.stokManual).toBe(4)

    const mejaTersimpan = await db.meja.findUnique({
      where: { id: meja.id },
      select: { statusMeja: true },
    })
    expect(mejaTersimpan?.statusMeja).toBe('terpakai')

    await page.goto('/dashboard/pesanan')
    await expect(
      page.getByRole('heading', { name: 'Kelola Pesanan' })
    ).toBeVisible()
    await expect(kartuPesanan(page, pesanan!.id)).toBeVisible({
      timeout: 20000,
    })
  })

  test('2.1 checkout dengan keranjang kosong menampilkan state Keranjang Kosong', async ({
    browser,
    db,
    cleanup,
  }) => {
    const meja = await createTestMeja(db)
    cleanup.trackMeja(meja.nomorMeja)

    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    })

    try {
      const customer = await context.newPage()
      await customer.goto(`/${meja.tokenMeja}/checkout`)

      await expect(
        customer.getByRole('heading', { name: 'Keranjang Kosong' })
      ).toBeVisible()
      await expect(
        customer.getByRole('button', { name: 'Kembali ke Menu' })
      ).toBeVisible()
    } finally {
      await context.close()
    }
  })

  test('2.1 membuat pesanan manual lewat kasir dan mencatat kasirId', async ({
    browser,
    db,
    cleanup,
  }) => {
    // Akun tetap hasil seed: tidak ada user baru yang dibuat per test.
    const staff = testAccount('cashier')
    const kasir = await getTestUser(db, 'cashier')

    const namaPelanggan = e2eName('Manual')
    const kategori = await createTestKategori(db, {
      namaKategori: e2eName('KategoriManual'),
    })
    const menu = await createTestMenu(db, {
      kategoriId: kategori.id,
      namaMenu: e2eName('MenuManual'),
      stokManual: 5,
    })
    const meja = await createTestMeja(db)

    cleanup.trackKategori(kategori.namaKategori)
    cleanup.trackMenu(menu.namaMenu)
    cleanup.trackMeja(meja.nomorMeja)
    cleanup.trackPesananByCustomer(namaPelanggan)

    const { context, page } = await sesiLogin(browser, staff)

    try {
      await page.goto('/dashboard/kasir/pesanan-baru')
      await expect(
        page.getByRole('heading', { name: 'Buat Pesanan Baru' })
      ).toBeVisible({ timeout: 20000 })

      const tombolBuat = page.getByRole('button', { name: 'Buat Pesanan' })
      await expect(tombolBuat).toBeDisabled()

      await page.getByPlaceholder('Nama pelanggan').fill(namaPelanggan)

      await page.getByRole('combobox').click()
      await page
        .getByRole('option')
        .filter({ hasText: meja.nomorMeja })
        .click()
      await expect(page.getByRole('combobox')).toContainText(meja.nomorMeja)

      // Cari menu agar tidak bergantung pada urutan 8 menu pertama di grid.
      await page.getByPlaceholder('Cari menu...').fill(menu.namaMenu)
      const tombolMenu = page
        .locator('button')
        .filter({ hasText: menu.namaMenu })
        .first()
      await expect(tombolMenu).toBeVisible({ timeout: 20000 })
      await tombolMenu.click()

      // Pastikan item benar-benar masuk keranjang sebelum submit.
      const keranjang = page.locator('div.w-96')
      await expect(
        keranjang.getByText(menu.namaMenu, { exact: true })
      ).toBeVisible({ timeout: 20000 })

      await page.getByRole('button', { name: 'Tunai', exact: true }).click()
      await expect(tombolBuat).toBeEnabled()

      // Tangkap alert dari createPesanan supaya penyebab gagal terlihat jelas.
      const navigasi = page.waitForURL(
        /\/dashboard\/kasir\/pesanan-baru\/\d+$/,
        { timeout: 60000 }
      )
      await tombolBuat.click()
      await Promise.race([
        navigasi,
        new Promise<void>((_, reject) => {
          page.once('dialog', async (dialog) => {
            const pesan = dialog.message()
            await dialog.accept()
            reject(new Error(`createPesanan gagal: ${pesan}`))
          })
        }),
      ])
      const pesananId = Number(page.url().match(/(\d+)$/)?.[1])
      expect(Number.isFinite(pesananId)).toBe(true)

      const pesanan = await db.pesanan.findUnique({
        where: { id: pesananId },
        include: { detailPesanan: true },
      })

      expect(pesanan?.namaPelanggan).toBe(namaPelanggan)
      expect(pesanan?.kasirId).toBe(kasir.id)
      expect(pesanan?.statusPesanan).toBe('menunggu')
      expect(pesanan?.metodePembayaran).toBe('tunai')
      expect(pesanan?.detailPesanan).toHaveLength(1)

      const menuTersimpan = await db.menu.findUnique({
        where: { id: menu.id },
        select: { stokManual: true },
      })
      expect(menuTersimpan?.stokManual).toBe(4)

      const mejaTersimpan = await db.meja.findUnique({
        where: { id: meja.id },
        select: { statusMeja: true },
      })
      expect(mejaTersimpan?.statusMeja).toBe('terpakai')
    } finally {
      await context.close()
    }
  })

  test('2.2 waiter menandai semua item dan pesanan selesai mengosongkan meja', async ({
    browser,
    db,
    cleanup,
  }) => {
    // Akun tetap hasil seed: tidak ada user baru yang dibuat per test.
    const staff = testAccount('waiter')
    const waiter = await getTestUser(db, 'waiter')

    const namaPelanggan = e2eName('WaiterSelesai')
    const kategori = await createTestKategori(db, {
      namaKategori: e2eName('KategoriWaiter'),
    })
    const menu = await createTestMenu(db, {
      kategoriId: kategori.id,
      namaMenu: e2eName('MenuWaiter'),
    })
    const meja = await createTestMeja(db)

    cleanup.trackKategori(kategori.namaKategori)
    cleanup.trackMenu(menu.namaMenu)
    cleanup.trackMeja(meja.nomorMeja)
    cleanup.trackPesananByCustomer(namaPelanggan)

    const pesanan = await createTestPesanan(db, {
      mejaId: meja.id,
      namaPelanggan,
      statusPembayaran: 'berhasil',
      metodePembayaran: 'tunai',
      items: [
        { menuId: menu.id, jumlah: 1, hargaSaatPesan: Number(menu.harga) },
      ],
    })

    const { context, page } = await sesiLogin(browser, staff)

    try {
      await page.goto('/dashboard/pesanan')
      const kartu = kartuPesanan(page, pesanan.id)
      await expect(kartu).toBeVisible({ timeout: 20000 })

      await kartu.getByRole('button', { name: 'Tandai Item' }).click()
      const dialog = page
        .getByRole('dialog')
        .filter({ hasText: `Tandai Item - Pesanan #${pesanan.id}` })
      await expect(dialog).toBeVisible()

      const checkbox = dialog.locator('[role="checkbox"]')
      await expect(checkbox).toHaveCount(1)
      await checkbox.first().click()

      await expect(
        dialog.getByRole('button', { name: /^Selesai \(1\/1\)/ })
      ).toBeVisible()
      await dialog.getByRole('button', { name: /^Selesai \(1\/1\)/ }).click()
      await expect(dialog).toBeHidden({ timeout: 20000 })

      await expect
        .poll(
          async () => {
            const tersimpan = await db.pesanan.findUnique({
              where: { id: pesanan.id },
              select: { statusPesanan: true, waiterId: true },
            })
            return tersimpan
          },
          { timeout: 20000 }
        )
        .toMatchObject({ statusPesanan: 'selesai', waiterId: waiter.id })

      const detail = await db.detailPesanan.findMany({
        where: { pesananId: pesanan.id },
        select: { statusAntar: true },
      })
      expect(detail.every((item) => item.statusAntar === 'diantar')).toBe(true)

      const mejaTersimpan = await db.meja.findUnique({
        where: { id: meja.id },
        select: { statusMeja: true },
      })
      expect(mejaTersimpan?.statusMeja).toBe('kosong')
    } finally {
      await context.close()
    }
  })

  test('2.2 guard: menandai sebagian item tidak menyelesaikan pesanan', async ({
    browser,
    db,
    cleanup,
  }) => {
    const staff = testAccount('waiter')

    const namaPelanggan = e2eName('WaiterSebagian')
    const kategori = await createTestKategori(db, {
      namaKategori: e2eName('KategoriSebagian'),
    })
    const menuA = await createTestMenu(db, {
      kategoriId: kategori.id,
      namaMenu: e2eName('MenuSebagianA'),
    })
    const menuB = await createTestMenu(db, {
      kategoriId: kategori.id,
      namaMenu: e2eName('MenuSebagianB'),
    })
    const meja = await createTestMeja(db)

    cleanup.trackKategori(kategori.namaKategori)
    cleanup.trackMenu(menuA.namaMenu)
    cleanup.trackMenu(menuB.namaMenu)
    cleanup.trackMeja(meja.nomorMeja)
    cleanup.trackPesananByCustomer(namaPelanggan)

    const pesanan = await createTestPesanan(db, {
      mejaId: meja.id,
      namaPelanggan,
      statusPembayaran: 'berhasil',
      metodePembayaran: 'tunai',
      items: [
        { menuId: menuA.id, jumlah: 1, hargaSaatPesan: Number(menuA.harga) },
        { menuId: menuB.id, jumlah: 1, hargaSaatPesan: Number(menuB.harga) },
      ],
    })

    const { context, page } = await sesiLogin(browser, staff)

    try {
      await page.goto('/dashboard/pesanan')
      const kartu = kartuPesanan(page, pesanan.id)
      await expect(kartu).toBeVisible({ timeout: 20000 })

      await kartu.getByRole('button', { name: 'Tandai Item' }).click()
      const dialog = page
        .getByRole('dialog')
        .filter({ hasText: `Tandai Item - Pesanan #${pesanan.id}` })
      await expect(dialog).toBeVisible()

      const checkbox = dialog.locator('[role="checkbox"]')
      await expect(checkbox).toHaveCount(2)
      await checkbox.first().click()

      let pesanAlert = ''
      page.once('dialog', async (dialogAlert) => {
        pesanAlert = dialogAlert.message()
        await dialogAlert.accept()
      })
      await dialog.getByRole('button', { name: /^Selesai \(1\/2\)/ }).click()
      await expect.poll(() => pesanAlert).toContain(
        'Tandai semua item sudah diterima terlebih dahulu!'
      )

      await expect(dialog).toBeVisible()

      const tersimpan = await db.pesanan.findUnique({
        where: { id: pesanan.id },
        select: { statusPesanan: true },
      })
      expect(tersimpan?.statusPesanan).toBe('menunggu')

      await dialog.getByRole('button', { name: 'Tutup' }).click()
    } finally {
      await context.close()
    }
  })

  test('2.3 membatalkan pesanan mengisi deletedAt dan mengosongkan meja', async ({
    browser,
    db,
    cleanup,
  }) => {
    const staff = testAccount('waiter')

    const namaPelanggan = e2eName('Batal')
    const kategori = await createTestKategori(db, {
      namaKategori: e2eName('KategoriBatal'),
    })
    const menu = await createTestMenu(db, {
      kategoriId: kategori.id,
      namaMenu: e2eName('MenuBatal'),
    })
    const meja = await createTestMeja(db)

    cleanup.trackKategori(kategori.namaKategori)
    cleanup.trackMenu(menu.namaMenu)
    cleanup.trackMeja(meja.nomorMeja)
    cleanup.trackPesananByCustomer(namaPelanggan)

    const pesanan = await createTestPesanan(db, {
      mejaId: meja.id,
      namaPelanggan,
      items: [
        { menuId: menu.id, jumlah: 1, hargaSaatPesan: Number(menu.harga) },
      ],
    })

    const { context, page } = await sesiLogin(browser, staff)

    try {
      await page.goto(`/dashboard/pesanan/${pesanan.id}`)
      await expect(
        page.getByRole('heading', { name: `Detail Pesanan #${pesanan.id}` })
      ).toBeVisible({ timeout: 20000 })

      page.once('dialog', async (dialog) => {
        await dialog.accept()
      })
      await page.getByRole('button', { name: 'Batalkan' }).click()

      await expect
        .poll(
          async () => {
            const tersimpan = await db.pesanan.findUnique({
              where: { id: pesanan.id },
              select: {
                statusPesanan: true,
                statusPembayaran: true,
                deletedAt: true,
              },
            })
            return tersimpan
          },
          { timeout: 20000 }
        )
        .toMatchObject({
          statusPesanan: 'dibatalkan',
          statusPembayaran: 'dibatalkan',
        })

      const tersimpan = await db.pesanan.findUnique({
        where: { id: pesanan.id },
        select: { deletedAt: true },
      })
      expect(tersimpan?.deletedAt).not.toBeNull()

      const mejaTersimpan = await db.meja.findUnique({
        where: { id: meja.id },
        select: { statusMeja: true },
      })
      expect(mejaTersimpan?.statusMeja).toBe('kosong')
    } finally {
      await context.close()
    }
  })

  test('2.3 owner hanya bisa melihat detail pesanan (read-only)', async ({
    db,
    cleanup,
    page,
  }) => {
    const namaPelanggan = e2eName('OwnerReadOnly')
    const kategori = await createTestKategori(db, {
      namaKategori: e2eName('KategoriOwner'),
    })
    const menu = await createTestMenu(db, {
      kategoriId: kategori.id,
      namaMenu: e2eName('MenuOwner'),
    })
    const meja = await createTestMeja(db)

    cleanup.trackKategori(kategori.namaKategori)
    cleanup.trackMenu(menu.namaMenu)
    cleanup.trackMeja(meja.nomorMeja)
    cleanup.trackPesananByCustomer(namaPelanggan)

    const pesanan = await createTestPesanan(db, {
      mejaId: meja.id,
      namaPelanggan,
      items: [
        { menuId: menu.id, jumlah: 1, hargaSaatPesan: Number(menu.harga) },
      ],
    })

    await page.goto(`/dashboard/pesanan/${pesanan.id}`)
    await expect(
      page.getByRole('heading', { name: `Detail Pesanan #${pesanan.id}` })
    ).toBeVisible({ timeout: 20000 })

    await expect(
      page.getByRole('button', { name: 'Selesai', exact: true })
    ).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'Batalkan', exact: true })
    ).toHaveCount(0)
    await expect(page.getByText(menu.namaMenu)).toBeVisible()
  })

  test('2.3 status diproses tampil di kartu, filter, pencarian, dan detail', async ({
    db,
    cleanup,
    page,
  }) => {
    const namaPelanggan = e2eName('Diproses')
    const kategori = await createTestKategori(db, {
      namaKategori: e2eName('KategoriDiproses'),
    })
    const menu = await createTestMenu(db, {
      kategoriId: kategori.id,
      namaMenu: e2eName('MenuDiproses'),
    })
    const meja = await createTestMeja(db)

    cleanup.trackKategori(kategori.namaKategori)
    cleanup.trackMenu(menu.namaMenu)
    cleanup.trackMeja(meja.nomorMeja)
    cleanup.trackPesananByCustomer(namaPelanggan)

    const pesanan = await createTestPesanan(db, {
      mejaId: meja.id,
      namaPelanggan,
      statusPesanan: 'diproses',
      statusPembayaran: 'berhasil',
      metodePembayaran: 'tunai',
      items: [
        { menuId: menu.id, jumlah: 2, hargaSaatPesan: Number(menu.harga) },
      ],
    })

    await page.goto('/dashboard/pesanan')
    await expect(
      page.getByRole('heading', { name: 'Kelola Pesanan' })
    ).toBeVisible()
    await expect(kartuPesanan(page, pesanan.id)).toBeVisible({
      timeout: 20000,
    })

    await page.getByRole('button', { name: 'Diproses', exact: true }).click()
    await expect(kartuPesanan(page, pesanan.id)).toBeVisible()

    await page.getByRole('button', { name: 'Menunggu', exact: true }).click()
    await expect(kartuPesanan(page, pesanan.id)).toHaveCount(0)

    await page.getByRole('button', { name: 'Semua', exact: true }).click()
    const pencarian = page.getByPlaceholder('Cari #id / meja...')
    await pencarian.fill(`#${pesanan.id}`)
    await expect(kartuPesanan(page, pesanan.id)).toBeVisible()

    await kartuPesanan(page, pesanan.id)
      .getByRole('button', { name: 'Detail' })
      .click()
    const dialog = page
      .getByRole('dialog')
      .filter({ hasText: `Detail Pesanan #${pesanan.id}` })
    await expect(dialog).toBeVisible({ timeout: 20000 })
    await expect(dialog.getByText(menu.namaMenu)).toBeVisible()
    await expect(
      dialog
        .getByText(`Rp ${(Number(menu.harga) * 2).toLocaleString('id-ID')}`)
        .first()
    ).toBeVisible()

    await dialog.getByRole('button', { name: 'Tutup' }).click()
  })
})
