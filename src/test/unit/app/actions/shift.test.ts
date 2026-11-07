import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, createLogMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  createLogMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/log', () => ({ createLog: createLogMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import {
  autoCloseShifts,
  bukaShift,
  getDaftarKasir,
  getDaftarKasirLengkap,
  getJadwalShift,
  getKasKeluarAktif,
  getRiwayatShift,
  getShiftAktif,
  getSisaPesanan,
  hapusJadwalShift,
  hapusKasKeluar,
  simpanJadwalShift,
  tambahKasKeluar,
  tutupShift,
  updateJadwalShift,
} from '@/app/actions/shift'

const SHIFT_ROW = {
  id: 9,
  kasirId: 2,
  tanggal: new Date('2026-11-05T00:00:00.000Z'),
  waktuMasuk: new Date('2026-11-05T01:00:00.000Z'),
  waktuKeluar: null,
  uangAwal: 100000,
  uangAkhir: null,
  statusShift: 'ACTIVE',
  totalTransaksi: 0,
  totalPendapatan: 0,
  totalTunai: 0,
  totalNonTunai: 0,
  selisihKas: null,
  keterangan: null,
  jadwalShiftId: 1,
  autoClosed: false,
  kasir: { username: 'kasir1' },
  jadwalShift: { id: 1, nama: 'Pagi', jamMulai: 0, jamSelesai: 1440 },
  kasKeluar: [],
}

const TOTALS = {
  total_transaksi: 2,
  total_pendapatan: '60000',
  total_tunai: '50000',
  total_non_tunai: '10000',
}

beforeEach(() => {
  vi.resetAllMocks()

  authMock.mockResolvedValue(sessionUntuk('cashier', { id: '2', username: 'kasir1' }))
  prismaMock.$queryRaw.mockResolvedValue([TOTALS])
  prismaMock.shiftKasir.findFirst.mockResolvedValue(null)
  prismaMock.shiftKasir.findMany.mockResolvedValue([])
  prismaMock.shiftKasir.findUnique.mockResolvedValue(null)
  prismaMock.shiftKasir.create.mockResolvedValue({ id: 10 })
  prismaMock.shiftKasir.update.mockResolvedValue({})
  prismaMock.shiftKasir.count.mockResolvedValue(0)
  prismaMock.jadwalShift.findMany.mockResolvedValue([])
  prismaMock.jadwalShift.findUnique.mockResolvedValue(null)
  prismaMock.jadwalShift.create.mockResolvedValue({})
  prismaMock.jadwalShift.update.mockResolvedValue({})
  prismaMock.jadwalShift.delete.mockResolvedValue({})
  prismaMock.jadwalShift.aggregate.mockResolvedValue({ _max: { urutan: 0 } })
  prismaMock.pesanan.count.mockResolvedValue(0)
  prismaMock.kasKeluar.aggregate.mockResolvedValue({ _sum: { nominal: 5000 } })
  prismaMock.kasKeluar.findMany.mockResolvedValue([])
  prismaMock.kasKeluar.findFirst.mockResolvedValue(null)
  prismaMock.kasKeluar.create.mockResolvedValue({
    id: 1,
    nominal: 10000,
    keterangan: 'Beli es',
    createdAt: new Date('2026-11-05T02:00:00.000Z'),
    user: { username: 'kasir1' },
  })
  prismaMock.kasKeluar.delete.mockResolvedValue({})
  prismaMock.users.findUnique.mockResolvedValue({ username: 'kasir1' })
  createLogMock.mockResolvedValue(undefined)
})

describe('autoCloseShifts', () => {
  it('tidak melakukan apa pun saat tidak ada shift basi', async () => {
    await expect(autoCloseShifts()).resolves.toBe(0)
    expect(prismaMock.shiftKasir.update).not.toHaveBeenCalled()
  })

  it('menutup shift basi dengan selisih nol dan mencatat log', async () => {
    prismaMock.shiftKasir.findMany.mockResolvedValue([
      { id: 5, uangAwal: 100000, kasir: { username: 'kasir1' } },
    ])

    await expect(autoCloseShifts()).resolves.toBe(1)

    expect(prismaMock.shiftKasir.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: expect.objectContaining({
        statusShift: 'CLOSED',
        uangAkhir: 145000,
        selisihKas: 0,
        autoClosed: true,
        aktifKey: null,
        slotAktifKey: null,
      }),
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'AUTO_CLOSE_SHIFT',
      expect.stringContaining('kasir1'),
      null
    )
  })
})

describe('bukaShift', () => {
  const jadwalPagi = { id: 1, nama: 'Pagi', jamMulai: 0, jamSelesai: 1440 }

  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(bukaShift(100000)).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('menolak waiter', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    await expect(bukaShift(100000)).resolves.toEqual({
      error: 'Hanya kasir yang dapat membuka atau menutup shift',
    })
  })

  it('menolak owner tanpa kasir target', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))

    await expect(bukaShift(100000)).resolves.toEqual({
      error: 'Hanya kasir yang dapat membuka atau menutup shift',
    })
  })

  it('menolak bila shift kasir masih aktif', async () => {
    prismaMock.shiftKasir.findFirst.mockResolvedValue({ id: 9 })

    const hasil = await bukaShift(100000)

    expect((hasil as { error: string }).error).toContain('Shift kamu masih aktif')
  })

  it('menolak bila jadwal shift belum diatur', async () => {
    const hasil = await bukaShift(100000)

    expect((hasil as { error: string }).error).toContain('Jadwal shift belum diatur')
  })

  it('menolak nominal bukan bilangan bulat', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue([jadwalPagi])

    const hasil = await bukaShift(1.5)

    expect(hasil).toEqual({ error: 'Nominal harus berupa angka bulat rupiah' })
    expect(prismaMock.shiftKasir.create).not.toHaveBeenCalled()
  })

  it('mengubah nominal negatif menjadi nol', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue([jadwalPagi])

    const hasil = await bukaShift(-50000)

    expect(hasil).toEqual({ success: true, shiftId: 10 })
    expect(prismaMock.shiftKasir.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ uangAwal: 0 }),
      })
    )
  })

  it('menolak slot yang sudah diisi kasir lain', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue([jadwalPagi])
    prismaMock.shiftKasir.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 2, kasir: { username: 'kasir2' } })

    const hasil = await bukaShift(100000)

    expect((hasil as { error: string }).error).toContain('Slot Pagi sedang diisi kasir kasir2')
  })

  it('meminta konfirmasi saat shift slot ini sudah ditutup hari ini', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue([jadwalPagi])
    prismaMock.shiftKasir.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 5,
        waktuKeluar: new Date('2026-11-05T09:00:00.000Z'),
        uangAkhir: 150000,
      })

    const hasil = await bukaShift(100000)

    expect(hasil).toMatchObject({
      perluKonfirmasiReopen: true,
      shiftTertutup: { id: 5, uangAkhir: 150000 },
    })
    expect(prismaMock.shiftKasir.create).not.toHaveBeenCalled()
  })

  it('membuka shift kasir dan mencatat log', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue([jadwalPagi])

    const hasil = await bukaShift(100000)

    expect(hasil).toEqual({ success: true, shiftId: 10 })
    expect(prismaMock.shiftKasir.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kasirId: 2,
          uangAwal: 100000,
          statusShift: 'ACTIVE',
          aktifKey: 2,
          jadwalShiftId: 1,
          slotAktifKey: 'slot:1',
          sumberShiftId: null,
        }),
      })
    )
    expect(createLogMock).toHaveBeenCalledWith(
      'OPEN_SHIFT',
      expect.stringContaining('oleh kasir1')
    )
  })

  it('membuka ulang shift yang sudah ditutup hari ini setelah konfirmasi', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue([jadwalPagi])
    prismaMock.shiftKasir.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 5,
        waktuKeluar: new Date('2026-11-05T09:00:00.000Z'),
        uangAkhir: 150000,
      })

    const hasil = await bukaShift(100000, null, true)

    expect(hasil).toEqual({ success: true, shiftId: 10 })
    expect(createLogMock).toHaveBeenCalledTimes(2)
    expect(createLogMock).toHaveBeenNthCalledWith(
      2,
      'OPEN_SHIFT',
      expect.stringContaining('dibuka ulang')
    )
  })

  it('membuka shift untuk kasir target sebagai owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
    prismaMock.jadwalShift.findMany.mockResolvedValue([jadwalPagi])
    prismaMock.users.findUnique.mockResolvedValue({ username: 'kasirTarget' })

    const hasil = await bukaShift(50000, null, false, 2, 1)

    expect(hasil).toEqual({ success: true, shiftId: 10 })
    expect(prismaMock.shiftKasir.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kasirId: 2, uangAwal: 50000 }),
      })
    )
    expect(createLogMock).toHaveBeenCalledWith(
      'OPEN_SHIFT',
      expect.stringContaining('oleh Owner')
    )
  })

  it('menolak shift sumber yang tidak valid', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue([jadwalPagi])
    prismaMock.shiftKasir.findUnique.mockResolvedValue(null)

    const hasil = await bukaShift(100000, 99)

    expect(hasil).toEqual({ error: 'Shift sumber uang kas tidak valid atau belum ditutup' })
  })

  it('menolak shift sumber milik kasir sendiri', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue([jadwalPagi])
    prismaMock.shiftKasir.findUnique.mockResolvedValue({
      id: 99,
      statusShift: 'CLOSED',
      uangAkhir: 100000,
      kasirId: 2,
    })

    const hasil = await bukaShift(100000, 99)

    expect(hasil).toEqual({ error: 'Shift sumber uang kas harus milik kasir lain' })
  })

  it('mencatat sumber serah terima shift saat valid', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue([jadwalPagi])
    prismaMock.shiftKasir.findUnique.mockResolvedValue({
      id: 99,
      statusShift: 'CLOSED',
      uangAkhir: 100000,
      kasirId: 3,
    })

    const hasil = await bukaShift(100000, 99)

    expect(hasil).toEqual({ success: true, shiftId: 10 })
    expect(prismaMock.shiftKasir.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sumberShiftId: 99 }),
      })
    )
    expect(createLogMock).toHaveBeenCalledWith(
      'OPEN_SHIFT',
      expect.stringContaining('serah terima shift #99')
    )
  })

  it('mengembalikan error khusus saat create melanggar unique constraint', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue([jadwalPagi])
    prismaMock.shiftKasir.create.mockRejectedValue(
      Object.assign(new Error('duplicate'), { code: 'P2002' })
    )

    const hasil = await bukaShift(100000)

    expect((hasil as { error: string }).error).toContain('Shift kamu masih aktif')
  })

  it('mengembalikan error umum saat terjadi kegagalan tak terduga', async () => {
    prismaMock.jadwalShift.findMany.mockRejectedValue(new Error('boom'))

    const hasil = await bukaShift(100000)

    expect(hasil).toEqual({ error: 'Terjadi kesalahan saat membuka shift' })
  })
})

describe('tutupShift', () => {
  beforeEach(() => {
    prismaMock.shiftKasir.findFirst.mockResolvedValue(SHIFT_ROW)
  })

  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(tutupShift(145000)).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('menolak waiter', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    await expect(tutupShift(145000)).resolves.toEqual({
      error: 'Hanya kasir yang dapat membuka atau menutup shift',
    })
  })

  it('menolak nominal tidak valid', async () => {
    await expect(tutupShift(1.5)).resolves.toEqual({
      error: 'Nominal harus berupa angka bulat rupiah',
    })
  })

  it('menolak saat tidak ada shift aktif', async () => {
    prismaMock.shiftKasir.findFirst.mockResolvedValue(null)

    await expect(tutupShift(145000)).resolves.toEqual({
      error: 'Shift belum dibuka. Masukkan uang awal dan buka shift terlebih dahulu.',
    })
  })

  it('menolak selisih kas tanpa keterangan', async () => {
    const hasil = await tutupShift(140000)

    expect((hasil as { error: string }).error).toContain('Selisih kas Rp-5.000 tidak boleh kosong')
    expect(prismaMock.shiftKasir.update).not.toHaveBeenCalled()
  })

  it('meminta konfirmasi saat masih ada pesanan berjalan', async () => {
    prismaMock.pesanan.count.mockResolvedValue(2)

    const hasil = await tutupShift(145000)

    expect(hasil).toEqual({
      warning: 'Masih ada 2 pesanan belum lunas/proses. Yakin ingin menutup shift?',
      sisaPesanan: 2,
    })
  })

  it('menutup shift dengan selisih nol', async () => {
    const hasil = await tutupShift(145000)

    expect(hasil).toEqual({
      success: true,
      ringkasan: {
        totalTransaksi: 2,
        totalPendapatan: 60000,
        totalTunai: 50000,
        totalNonTunai: 10000,
        totalKasKeluar: 5000,
        uangHarapAkhir: 145000,
        selisihKas: 0,
      },
    })
    expect(prismaMock.shiftKasir.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: expect.objectContaining({
        statusShift: 'CLOSED',
        uangAkhir: 145000,
        selisihKas: 0,
        keterangan: null,
        aktifKey: null,
        slotAktifKey: null,
      }),
    })
    expect(createLogMock).toHaveBeenCalledWith(
      'CLOSE_SHIFT',
      expect.stringContaining('sesuai')
    )
  })

  it('menutup shift dengan selisih kurang dan keterangan', async () => {
    const hasil = await tutupShift(140000, ' kurang setor ')

    expect(hasil).toMatchObject({ success: true, ringkasan: { selisihKas: -5000 } })
    expect(prismaMock.shiftKasir.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ keterangan: 'kurang setor' }),
      })
    )
    expect(createLogMock).toHaveBeenCalledWith(
      'CLOSE_SHIFT',
      expect.stringContaining('kurang Rp5.000')
    )
  })

  it('menutup shift dengan selisih lebih', async () => {
    const hasil = await tutupShift(150000, 'lebih')

    expect(hasil).toMatchObject({ success: true, ringkasan: { selisihKas: 5000 } })
    expect(createLogMock).toHaveBeenCalledWith(
      'CLOSE_SHIFT',
      expect.stringContaining('lebih Rp5.000')
    )
  })

  it('menutup shift setelah konfirmasi sisa pesanan', async () => {
    prismaMock.pesanan.count.mockResolvedValue(1)

    const hasil = await tutupShift(145000, null, true)

    expect((hasil as { success: true }).success).toBe(true)
    expect(prismaMock.shiftKasir.update).toHaveBeenCalled()
  })

  it('mengembalikan error umum saat rekap gagal', async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error('db down'))

    const hasil = await tutupShift(145000)

    expect(hasil).toEqual({ error: 'Terjadi kesalahan saat menutup shift' })
  })
})

describe('kas keluar', () => {
  it('menolak tambah kas keluar tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(tambahKasKeluar(10000, 'Beli es')).resolves.toEqual({
      error: 'Unauthorized',
    })
  })

  it('menolak tambah kas keluar oleh waiter', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    await expect(tambahKasKeluar(10000, 'Beli es')).resolves.toEqual({
      error: 'Unauthorized',
    })
  })

  it('menolak nominal kas keluar tidak valid', async () => {
    await expect(tambahKasKeluar(-1, 'Beli es')).resolves.toEqual({
      error: 'Nominal uang kas tidak valid',
    })
  })

  it('menolak kas keluar saat shift belum dibuka', async () => {
    await expect(tambahKasKeluar(10000, 'Beli es')).resolves.toEqual({
      error: 'Shift belum dibuka',
    })
  })

  it('mencatat kas keluar pada shift aktif', async () => {
    prismaMock.shiftKasir.findFirst.mockResolvedValue({ id: 9 })

    const hasil = await tambahKasKeluar(10000, ' Beli es ')

    expect(hasil).toEqual({
      success: true,
      item: {
        id: 1,
        nominal: 10000,
        keterangan: 'Beli es',
        createdAt: '2026-11-05T02:00:00.000Z',
        userName: 'kasir1',
      },
    })
    expect(prismaMock.kasKeluar.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { shiftId: 9, nominal: 10000, keterangan: 'Beli es', userId: 2 },
      })
    )
    expect(createLogMock).toHaveBeenCalledWith(
      'KAS_KELUAR',
      expect.stringContaining('Beli es')
    )
  })

  it('mengembalikan error saat shift aktif tidak ditemukan', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { id: '2' }))
    prismaMock.shiftKasir.findFirst.mockResolvedValue(null)

    await expect(getKasKeluarAktif()).resolves.toEqual({
      error: 'Shift belum dibuka. Masukkan uang awal dan buka shift terlebih dahulu.',
    })
  })

  it('mengembalikan daftar kas keluar dan totalnya', async () => {
    prismaMock.shiftKasir.findFirst.mockResolvedValue({ id: 9 })
    prismaMock.kasKeluar.findMany.mockResolvedValue([
      {
        id: 1,
        nominal: 10000,
        keterangan: 'Beli es',
        createdAt: new Date('2026-11-05T02:00:00.000Z'),
        user: { username: 'kasir1' },
      },
      {
        id: 2,
        nominal: 5000,
        keterangan: 'Gas',
        createdAt: new Date('2026-11-05T03:00:00.000Z'),
        user: null,
      },
    ])

    await expect(getKasKeluarAktif()).resolves.toEqual({
      items: [
        {
          id: 1,
          nominal: 10000,
          keterangan: 'Beli es',
          createdAt: '2026-11-05T02:00:00.000Z',
          userName: 'kasir1',
        },
        {
          id: 2,
          nominal: 5000,
          keterangan: 'Gas',
          createdAt: '2026-11-05T03:00:00.000Z',
          userName: null,
        },
      ],
      total: 15000,
    })
  })

  it('menolak hapus kas keluar yang bukan milik shift aktif', async () => {
    prismaMock.shiftKasir.findFirst.mockResolvedValue({ id: 9 })

    await expect(hapusKasKeluar(1)).resolves.toEqual({
      error: 'Catatan kas keluar tidak ditemukan atau bukan milik shift aktif ini',
    })
  })

  it('menghapus kas keluar milik shift aktif', async () => {
    prismaMock.shiftKasir.findFirst.mockResolvedValue({ id: 9 })
    prismaMock.kasKeluar.findFirst.mockResolvedValue({ id: 1, shiftId: 9 })

    await expect(hapusKasKeluar(1)).resolves.toEqual({ success: true })
    expect(prismaMock.kasKeluar.delete).toHaveBeenCalledWith({ where: { id: 1 } })
  })
})

describe('jadwal shift', () => {
  it('menolak get jadwal oleh non-owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    await expect(getJadwalShift()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('mengembalikan daftar jadwal untuk owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))
    prismaMock.jadwalShift.findMany.mockResolvedValue([
      { id: 1, nama: 'Pagi', jamMulai: 480, jamSelesai: 960, urutan: 1, aktif: true },
    ])

    await expect(getJadwalShift()).resolves.toEqual({
      jadwal: [{ id: 1, nama: 'Pagi', jamMulai: 480, jamSelesai: 960, urutan: 1, aktif: true }],
    })
  })

  it('menolak simpan jadwal oleh waiter', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    await expect(
      simpanJadwalShift({ nama: 'Pagi', jamMulai: 480, jamSelesai: 960 })
    ).resolves.toEqual({ error: 'Unauthorized' })
  })

  it.each([
    [{ nama: '', jamMulai: 480, jamSelesai: 960 }, 'Nama slot harus diisi (maks 40 karakter)'],
    [{ nama: 'Pagi', jamMulai: -1, jamSelesai: 960 }, 'Jam mulai harus antara 00:00–23:59'],
    [{ nama: 'Pagi', jamMulai: 480, jamSelesai: 0 }, 'Jam selesai harus antara 00:01–24:00'],
    [{ nama: 'Pagi', jamMulai: 960, jamSelesai: 480 }, 'Jam selesai harus lebih besar dari jam mulai'],
  ] as const)('menolak jadwal tidak valid', async (input, pesan) => {
    authMock.mockResolvedValue(sessionUntuk('owner'))

    await expect(simpanJadwalShift({ ...input })).resolves.toEqual({ error: pesan })
  })

  it('menolak jadwal yang bentrok dengan slot lain', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))
    prismaMock.jadwalShift.findMany.mockResolvedValue([
      { id: 2, nama: 'Sore', jamMulai: 900, jamSelesai: 1000 },
    ])

    const hasil = await simpanJadwalShift({
      nama: 'Pagi',
      jamMulai: 480,
      jamSelesai: 960,
    })

    expect((hasil as { error: string }).error).toContain('Bentrok dengan slot "Sore"')
  })

  it('menolak saat slot aktif sudah mencapai batas', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))
    prismaMock.jadwalShift.findMany.mockResolvedValue(
      Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        nama: `Slot ${i + 1}`,
        jamMulai: i * 60,
        jamSelesai: (i + 1) * 60,
      }))
    )

    const hasil = await simpanJadwalShift({
      nama: 'Slot baru',
      jamMulai: 1000,
      jamSelesai: 1100,
    })

    expect(hasil).toEqual({ error: 'Maksimal 8 slot jadwal aktif' })
  })

  it('menyimpan jadwal baru dengan urutan otomatis', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))
    prismaMock.jadwalShift.aggregate.mockResolvedValue({ _max: { urutan: 2 } })

    const hasil = await simpanJadwalShift({
      nama: ' Pagi ',
      jamMulai: 480,
      jamSelesai: 960,
    })

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.jadwalShift.create).toHaveBeenCalledWith({
      data: {
        nama: 'Pagi',
        jamMulai: 480,
        jamSelesai: 960,
        urutan: 3,
        aktif: true,
      },
    })
  })

  it('memperbarui jadwal yang valid', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))
    prismaMock.jadwalShift.findMany.mockResolvedValue([
      { id: 1, nama: 'Pagi', jamMulai: 480, jamSelesai: 960 },
    ])

    const hasil = await updateJadwalShift(1, {
      nama: 'Pagi Baru',
      jamMulai: 480,
      jamSelesai: 960,
      urutan: 2,
    })

    expect(hasil).toEqual({ success: true })
    expect(prismaMock.jadwalShift.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        nama: 'Pagi Baru',
        jamMulai: 480,
        jamSelesai: 960,
        urutan: 2,
        aktif: true,
      },
    })
  })

  it('menolak hapus jadwal yang sudah dipakai', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))
    prismaMock.shiftKasir.count.mockResolvedValue(1)

    const hasil = await hapusJadwalShift(1)

    expect((hasil as { error: string }).error).toContain('Slot sudah digunakan riwayat shift')
    expect(prismaMock.jadwalShift.delete).not.toHaveBeenCalled()
  })

  it('menghapus jadwal yang belum dipakai', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))

    await expect(hapusJadwalShift(1)).resolves.toEqual({ success: true })
    expect(prismaMock.jadwalShift.delete).toHaveBeenCalledWith({ where: { id: 1 } })
  })
})

describe('getDaftarKasir', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(getDaftarKasir()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('mengembalikan username kasir untuk owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))
    prismaMock.users.findMany.mockResolvedValue([{ username: 'kasir1' }, { username: 'kasir2' }])

    await expect(getDaftarKasir()).resolves.toEqual({ kasir: ['kasir1', 'kasir2'] })
  })
})

describe('getDaftarKasirLengkap', () => {
  it('menolak selain owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier'))

    await expect(getDaftarKasirLengkap()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('mengembalikan id dan username kasir aktif', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))
    prismaMock.users.findMany.mockResolvedValue([
      { id: 2, username: 'kasir1' },
      { id: 3, username: 'kasir2' },
    ])

    await expect(getDaftarKasirLengkap()).resolves.toEqual({
      kasir: [
        { id: 2, username: 'kasir1' },
        { id: 3, username: 'kasir2' },
      ],
    })
  })
})

describe('getSisaPesanan', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(getSisaPesanan()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('menghitung pesanan yang belum selesai', async () => {
    prismaMock.pesanan.count.mockResolvedValue(3)

    await expect(getSisaPesanan()).resolves.toEqual({ sisa: 3 })
  })
})

describe('getShiftAktif', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(getShiftAktif()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('mengembalikan canManage false untuk non-kasir', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))

    await expect(getShiftAktif()).resolves.toEqual({
      shift: null,
      canManage: false,
      saranUangAwal: null,
      saranUangAwalSendiri: null,
      shiftLainAktif: null,
      slotSaatIni: null,
    })
  })

  it('menolak id kasir yang tidak valid', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { id: 'bukan-angka' }))

    await expect(getShiftAktif()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('mengembalikan shift null saat kasir belum membuka shift', async () => {
    prismaMock.jadwalShift.findMany.mockResolvedValue([])

    const hasil = await getShiftAktif()

    expect(hasil).toMatchObject({ shift: null, canManage: true, slotSaatIni: null })
  })

  it('mengembalikan shift aktif beserta rekap dan saran uang awal', async () => {
    prismaMock.shiftKasir.findFirst
      .mockResolvedValueOnce(SHIFT_ROW)
      .mockResolvedValueOnce({ id: 8, uangAkhir: '145000', kasir: { username: 'kasir0' } })
      .mockResolvedValueOnce({ id: 9, uangAkhir: '150000' })
      .mockResolvedValueOnce({
        id: 11,
        kasir: { username: 'kasir2' },
        jadwalShift: { nama: 'Pagi' },
      })
    prismaMock.jadwalShift.findMany.mockResolvedValue([
      { id: 1, nama: 'Pagi', jamMulai: 0, jamSelesai: 1440 },
    ])

    const hasil = await getShiftAktif()

    expect(hasil).toMatchObject({
      canManage: true,
      shift: {
        id: 9,
        kasirUsername: 'kasir1',
        totalTransaksi: 2,
        totalPendapatan: 60000,
        totalTunai: 50000,
        totalNonTunai: 10000,
        totalKasKeluar: 5000,
      },
      saranUangAwal: { shiftId: 8, nominal: 145000, dariKasir: 'kasir0' },
      saranUangAwalSendiri: { shiftId: 9, nominal: 150000 },
      shiftLainAktif: { shiftId: 11, kasirUsername: 'kasir2', slotNama: 'Pagi' },
      slotSaatIni: { id: 1, nama: 'Pagi', jamMulai: 0, jamSelesai: 1440 },
    })
  })
})

describe('getRiwayatShift', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(getRiwayatShift()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('menolak role waiter', async () => {
    authMock.mockResolvedValue(sessionUntuk('waiter'))

    await expect(getRiwayatShift()).resolves.toEqual({
      error: 'Riwayat shift hanya untuk kasir dan owner',
    })
  })

  it('membatasi riwayat milik kasir sendiri', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { id: '2' }))
    prismaMock.shiftKasir.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          ...SHIFT_ROW,
          statusShift: 'CLOSED',
          totalTunai: 50000,
          kasKeluar: [{ id: 1, nominal: '5000' }],
        },
      ])

    const hasil = await getRiwayatShift()

    const where = prismaMock.shiftKasir.findMany.mock.calls[1][0].where
    expect(where.kasirId).toBe(2)
    expect(where.waktuMasuk).toBeUndefined()
    expect(hasil).toMatchObject({
      shifts: [{ uangHarapAkhir: 145000, sumberShiftId: null, sumberShiftKasir: null }],
    })
  })

  it('menolak id kasir yang tidak valid', async () => {
    authMock.mockResolvedValue(sessionUntuk('cashier', { id: 'x' }))

    await expect(getRiwayatShift()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('memfilter berdasarkan username kasir untuk owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))
    prismaMock.shiftKasir.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([])

    await getRiwayatShift({ period: 'today', kasirUsername: 'kasir1' })

    const where = prismaMock.shiftKasir.findMany.mock.calls[1][0].where
    expect(where.kasir).toEqual({ username: 'kasir1' })
    expect(where.waktuMasuk.gte.getHours()).toBe(0)
    expect(where.waktuMasuk.gte.getMinutes()).toBe(0)
  })

  it('menghitung awal minggu sejak Senin', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))
    prismaMock.shiftKasir.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([])

    await getRiwayatShift({ period: 'week' })

    const gte = prismaMock.shiftKasir.findMany.mock.calls[1][0].where.waktuMasuk.gte as Date
    expect((gte.getDay() + 6) % 7).toBe(0)
  })

  it('menghitung awal bulan untuk periode month', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))
    prismaMock.shiftKasir.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([])

    await getRiwayatShift({ period: 'month' })

    const gte = prismaMock.shiftKasir.findMany.mock.calls[1][0].where.waktuMasuk.gte as Date
    expect(gte.getDate()).toBe(1)
  })

  it('tidak memfilter waktu untuk periode all', async () => {
    authMock.mockResolvedValue(sessionUntuk('owner'))
    prismaMock.shiftKasir.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([])

    await getRiwayatShift({ period: 'all', kasirUsername: 'all' })

    const where = prismaMock.shiftKasir.findMany.mock.calls[1][0].where
    expect(where.waktuMasuk).toBeUndefined()
    expect(where.kasir).toBeUndefined()
  })
})
