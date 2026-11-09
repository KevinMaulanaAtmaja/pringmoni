import type { Browser, Locator, Page } from '@playwright/test'
import type { PrismaClient } from '@prisma/client'
import {
  test,
  expect,
  createTestKategori,
  createTestMeja,
  createTestMenu,
  createTestPesanan,
  e2eName,
  ensureTestShift,
  getTestUser,
  loginAs,
  testAccount,
  type CleanupRegistry,
  type Credentials,
} from '../fixtures'

/**
 * Modul 3 - Pembayaran (PBI-3.1, 3.2, 3.3).
 *
 * Semua test memakai akun kasir sementara + shift ACTIVE yang dibuat lewat
 * Prisma, sehingga tidak bergantung pada alur buka shift (Modul 7) dan tidak
 * menyentuh data asli.
 */

async function sesiLogin(browser: Browser, credentials: Credentials) {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  })
  const page = await context.newPage()
  await loginAs(page, credentials)

  return { context, page }
}

function rupiah(nilai: number) {
  const angka = nilai.toLocaleString('id-ID').replace(/\./g, '\\.')
  return new RegExp(`Rp\\s*${angka}`)
}

async function kasirDenganShift(db: PrismaClient) {
  // Akun kasir tetap hasil seed + shift ACTIVE yang dipakai ulang.
  const credentials = testAccount('cashier')
  const kasir = await getTestUser(db, 'cashier')
  const shift = await ensureTestShift(db, kasir.id)

  return {
    kasir,
    shift,
    credentials: credentials satisfies Credentials,
  }
}

type PesananOverrides = Omit<
  Parameters<typeof createTestPesanan>[1],
  'mejaId' | 'items' | 'namaPelanggan'
>

async function siapkanPesanan(
  db: PrismaClient,
  cleanup: CleanupRegistry,
  options: {
    label: string
    harga?: number
    pesanan?: PesananOverrides
  }
) {
  const label = options.label
  const harga = options.harga ?? 27_000
  const namaPelanggan = e2eName(`Pelanggan${label}`)
  const kategori = await createTestKategori(db, {
    namaKategori: e2eName(`Kategori${label}`),
  })
  const menu = await createTestMenu(db, {
    kategoriId: kategori.id,
    namaMenu: e2eName(`Menu${label}`),
    harga,
  })
  const meja = await createTestMeja(db)

  cleanup.trackKategori(kategori.namaKategori)
  cleanup.trackMenu(menu.namaMenu)
  cleanup.trackMeja(meja.nomorMeja)
  cleanup.trackPesananByCustomer(namaPelanggan)

  const pesanan = await createTestPesanan(db, {
    ...options.pesanan,
    mejaId: meja.id,
    namaPelanggan,
    items: [{ menuId: menu.id, jumlah: 1, hargaSaatPesan: harga }],
  })

  return { namaPelanggan, kategori, menu, meja, pesanan }
}

function kartuBelumBayar(page: Page, teks: string) {
  return page.locator('.rounded-xl.border-2').filter({ hasText: teks }).first()
}

async function bukaKasir(page: Page) {
  await page.goto('/dashboard/kasir')
  await expect(page.getByRole('heading', { name: 'Kelola Kasir' })).toBeVisible({
    timeout: 20_000,
  })
  await expect(page.getByText('Shift Aktif', { exact: true })).toBeVisible({
    timeout: 20_000,
  })
}

async function bukaPembayaran(page: Page, namaPelanggan: string) {
  const kartu = kartuBelumBayar(page, namaPelanggan)
  await expect(kartu).toBeVisible({ timeout: 20_000 })

  await kartu.getByRole('button', { name: 'Proses pembayaran' }).click()

  const dialog = page.getByRole('dialog')
  await expect(
    dialog.getByRole('heading', { name: /Pembayaran - Meja/ })
  ).toBeVisible()

  return dialog
}

async function cetakStrukDanPastikanPopup(page: Page, tombol: Locator) {
  const popupPromise = page.waitForEvent('popup', { timeout: 15_000 })
  await tombol.click()
  const popup = await popupPromise

  expect(popup, 'klik Cetak Struk harus membuka tab dokumen struk').toBeTruthy()
  await popup.close()
}

test.describe('Modul 3 - Pembayaran', () => {
  test.describe.configure({ mode: 'serial' })

  test('3.1 hitung total memuat subtotal, biaya admin, dan PPN', async ({
    browser,
    db,
    cleanup,
  }) => {
    const kasir = await kasirDenganShift(db)
    const data = await siapkanPesanan(db, cleanup, {
      label: 'Total',
      harga: 31_000,
      pesanan: {
        metodePembayaran: 'qris',
        biayaAdmin: 2_000,
        ppn: 1_500,
      },
    })

    const { context, page } = await sesiLogin(browser, kasir.credentials)

    try {
      await bukaKasir(page)

      const kartu = kartuBelumBayar(page, data.namaPelanggan)
      await expect(kartu).toBeVisible({ timeout: 20_000 })

      // Detail: subtotal item (1 x Rp31.000) dan total termasuk admin + PPN.
      await kartu.getByRole('button', { name: 'Lihat detail' }).click()
      const detail = page.getByRole('dialog')
      await expect(
        detail.getByRole('heading', {
          name: `Detail Pesanan #${data.pesanan.id}`,
        })
      ).toBeVisible()
      await expect(detail.getByText('1x @ Rp 31.000')).toBeVisible()
      await expect(detail.getByText(rupiah(34_500)).first()).toBeVisible()
      await detail.getByRole('button', { name: 'Tutup' }).click()

      // Dialog pembayaran: total tagihan memakai grand total yang sama.
      const dialog = await bukaPembayaran(page, data.namaPelanggan)
      await expect(dialog.getByText('Total Tagihan')).toBeVisible()
      await expect(dialog.getByText(rupiah(34_500)).first()).toBeVisible()
      await expect(dialog.getByText('Customer memilih:')).toBeVisible()

      await dialog.getByRole('button', { name: 'Batal' }).click()
    } finally {
      await context.close()
    }
  })

  test('3.2 pembayaran tunai menghitung kembalian, menyimpan data, dan mencetak struk', async ({
    browser,
    db,
    cleanup,
  }) => {
    const kasir = await kasirDenganShift(db)
    const data = await siapkanPesanan(db, cleanup, {
      label: 'Tunai',
      harga: 27_000,
      pesanan: { metodePembayaran: 'tunai' },
    })

    const { context, page } = await sesiLogin(browser, kasir.credentials)

    try {
      await bukaKasir(page)
      const dialog = await bukaPembayaran(page, data.namaPelanggan)

      // Nominal diisi dalam ribuan: 50 -> Rp50.000, total Rp27.000,
      // sehingga kembalian Rp23.000.
      await dialog.getByPlaceholder('0').fill('50')
      await expect(dialog.getByText(rupiah(50_000)).first()).toBeVisible()
      await expect(dialog.getByText(rupiah(23_000)).first()).toBeVisible()

      await dialog.getByRole('button', { name: 'Bayar Tunai' }).click()
      await expect(
        dialog.getByText('Konfirmasi Pembayaran Tunai')
      ).toBeVisible()
      await expect(dialog.getByText('Kembalian')).toBeVisible()
      await expect(dialog.getByText(rupiah(23_000)).first()).toBeVisible()

      await dialog.getByRole('button', { name: 'Bayar Tunai' }).click()
      await expect(
        dialog.getByRole('heading', { name: 'Pembayaran Berhasil!' })
      ).toBeVisible({ timeout: 20_000 })

      await expect
        .poll(
          async () => {
            const tersimpan = await db.pesanan.findUnique({
              where: { id: data.pesanan.id },
              select: {
                statusPesanan: true,
                statusPembayaran: true,
                metodePembayaran: true,
                jumlahBayar: true,
                kembalian: true,
                biayaAdmin: true,
                ppn: true,
                kasirId: true,
                shiftId: true,
              },
            })

            if (!tersimpan) return null

            return {
              ...tersimpan,
              jumlahBayar: tersimpan.jumlahBayar
                ? Number(tersimpan.jumlahBayar)
                : null,
              kembalian: Number(tersimpan.kembalian),
              biayaAdmin: tersimpan.biayaAdmin
                ? Number(tersimpan.biayaAdmin)
                : null,
              ppn: tersimpan.ppn ? Number(tersimpan.ppn) : null,
            }
          },
          { timeout: 20_000 }
        )
        .toMatchObject({
          statusPesanan: 'diproses',
          statusPembayaran: 'berhasil',
          metodePembayaran: 'tunai',
          jumlahBayar: 50_000,
          kembalian: 23_000,
          biayaAdmin: 0,
          ppn: 0,
          kasirId: kasir.kasir.id,
          shiftId: kasir.shift.id,
        })

      await cetakStrukDanPastikanPopup(
        page,
        dialog.getByRole('button', { name: 'Cetak Struk' })
      )

      await dialog.getByRole('button', { name: 'Tutup' }).click()
      await expect(kartuBelumBayar(page, data.namaPelanggan)).toHaveCount(0)
    } finally {
      await context.close()
    }
  })

  test('3.2 guard: jumlah tunai kurang dari total ditolak dan data tidak berubah', async ({
    browser,
    db,
    cleanup,
  }) => {
    const kasir = await kasirDenganShift(db)
    const data = await siapkanPesanan(db, cleanup, {
      label: 'Kurang',
      harga: 27_000,
      pesanan: { metodePembayaran: 'tunai' },
    })

    const { context, page } = await sesiLogin(browser, kasir.credentials)

    try {
      await bukaKasir(page)
      const dialog = await bukaPembayaran(page, data.namaPelanggan)

      await dialog.getByPlaceholder('0').fill('10')

      let pesanAlert = ''
      page.once('dialog', async (alert) => {
        pesanAlert = alert.message()
        await alert.accept()
      })

      await dialog.getByRole('button', { name: 'Bayar Tunai' }).click()
      await expect.poll(() => pesanAlert).toContain(
        'Jumlah bayar kurang dari total!'
      )

      const tersimpan = await db.pesanan.findUnique({
        where: { id: data.pesanan.id },
        select: {
          statusPesanan: true,
          statusPembayaran: true,
          jumlahBayar: true,
          kasirId: true,
          shiftId: true,
        },
      })

      expect(tersimpan).toMatchObject({
        statusPesanan: 'menunggu',
        statusPembayaran: 'menunggu',
        jumlahBayar: null,
        kasirId: null,
        shiftId: null,
      })

      // Masih di langkah input (belum masuk konfirmasi final).
      await expect(
        dialog.getByText('Konfirmasi Pembayaran Tunai')
      ).toHaveCount(0)
      await dialog.getByRole('button', { name: 'Batal' }).click()
    } finally {
      await context.close()
    }
  })

  test('3.2 pembayaran QRIS lewat halaman konfirmasi tersimpan berhasil', async ({
    browser,
    db,
    cleanup,
  }) => {
    const kasir = await kasirDenganShift(db)
    const data = await siapkanPesanan(db, cleanup, {
      label: 'QRIS',
      harga: 27_000,
      pesanan: { metodePembayaran: 'qris' },
    })

    const { context, page } = await sesiLogin(browser, kasir.credentials)

    try {
      await bukaKasir(page)
      const dialog = await bukaPembayaran(page, data.namaPelanggan)

      // Tangkap alert dari generateQRISCode supaya penyebab gagal terlihat.
      let pesanAlert = ''
      page.once('dialog', async (dialogAlert) => {
        pesanAlert = dialogAlert.message()
        await dialogAlert.accept()
      })

      await dialog.getByRole('button', { name: 'Bayar QRIS' }).click()

      const navigasi = page.waitForURL(
        new RegExp(
          `/dashboard/kasir/pesanan-baru/${data.pesanan.id}\\?metode=qris`
        ),
        { timeout: 30_000 }
      )

      try {
        await navigasi
      } catch (error) {
        if (pesanAlert) {
          throw new Error(`generateQRISCode gagal: ${pesanAlert}`)
        }
        throw error
      }

      await expect(
        page.getByRole('heading', { name: 'Pembayaran QRIS' })
      ).toBeVisible()
      await expect(
        page.getByText('Scan QRIS di atas menggunakan aplikasi pembayaran')
      ).toBeVisible()

      const tombolKonfirmasi = page.getByRole('button', {
        name: 'Konfirmasi Pembayaran',
      })
      try {
        await expect(tombolKonfirmasi).toBeVisible({ timeout: 20_000 })
      } catch (error) {
        console.log('QRIS URL:', page.url())
        console.log(
          'QRIS BODY:',
          (await page.locator('body').innerText()).slice(0, 1500)
        )
        throw error
      }
      await tombolKonfirmasi.click()
      await page.waitForURL('**/dashboard/kasir', { timeout: 20_000 })

      await expect
        .poll(
          async () => {
            const tersimpan = await db.pesanan.findUnique({
              where: { id: data.pesanan.id },
              select: {
                statusPesanan: true,
                statusPembayaran: true,
                metodePembayaran: true,
                jumlahBayar: true,
                kembalian: true,
                kasirId: true,
                shiftId: true,
              },
            })

            if (!tersimpan) return null

            return {
              ...tersimpan,
              jumlahBayar: tersimpan.jumlahBayar
                ? Number(tersimpan.jumlahBayar)
                : null,
              kembalian: Number(tersimpan.kembalian),
            }
          },
          { timeout: 20_000 }
        )
        .toMatchObject({
          statusPesanan: 'diproses',
          statusPembayaran: 'berhasil',
          metodePembayaran: 'qris',
          jumlahBayar: 27_000,
          kembalian: 0,
          kasirId: kasir.kasir.id,
          shiftId: kasir.shift.id,
        })

      await expect(kartuBelumBayar(page, data.namaPelanggan)).toHaveCount(0)
    } finally {
      await context.close()
    }
  })

  test('3.3 riwayat menampilkan pembayaran dan cetak struk', async ({
    browser,
    db,
    cleanup,
  }) => {
    const kasir = await kasirDenganShift(db)
    const data = await siapkanPesanan(db, cleanup, {
      label: 'Riwayat',
      harga: 27_000,
      pesanan: {
        metodePembayaran: 'tunai',
        statusPembayaran: 'berhasil',
        statusPesanan: 'diproses',
        jumlahBayar: 50_000,
        kembalian: 23_000,
        kasirId: kasir.kasir.id,
        shiftId: kasir.shift.id,
      },
    })

    const { context, page } = await sesiLogin(browser, kasir.credentials)

    try {
      await bukaKasir(page)

      await page.getByRole('button', { name: /^Riwayat \(/ }).click()
      await page.getByPlaceholder('Cari #id / meja...').fill(`#${data.pesanan.id}`)

      const baris = page.getByRole('row').filter({ hasText: data.meja.nomorMeja })
      await expect(baris).toBeVisible({ timeout: 20_000 })
      await expect(baris.getByText('Tunai')).toBeVisible()
      await expect(baris.getByText('Berhasil')).toBeVisible()
      await expect(baris.getByText(kasir.kasir.username)).toBeVisible()
      await expect(baris.getByText(rupiah(27_000))).toBeVisible()

      await cetakStrukDanPastikanPopup(
        page,
        baris.getByRole('button', { name: 'Cetak' })
      )

      await baris.getByRole('button', { name: 'Detail' }).click()
      const detail = page.getByRole('dialog')
      await expect(
        detail.getByRole('heading', {
          name: `Detail Pesanan #${data.pesanan.id}`,
        })
      ).toBeVisible()
      await expect(
        detail.getByText(`Pelanggan: ${data.namaPelanggan}`)
      ).toBeVisible()
      await expect(detail.getByText(`Kasir: ${kasir.kasir.username}`)).toBeVisible()
      await expect(detail.getByText(rupiah(27_000)).first()).toBeVisible()

      await detail.getByRole('button', { name: 'Tutup' }).click()
    } finally {
      await context.close()
    }
  })
})
