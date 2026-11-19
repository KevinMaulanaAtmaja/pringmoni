//menguji modul dengan menebak lngsung ke database
import { describe, it, expect, vi } from 'vitest'
//hanya mock dan cache, prisma dan postgresql tetap urlTestDatabaseValid
const { authMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => ({ get: () => null })) }))
//untuk pengaman, Jika TEST_DATABASE_URL tidak ada di .env, test otomatis di-skip
function urlTestDatabaseValid(): boolean {
  try {
    return Boolean(process.env.TEST_DATABASE_URL && new URL(process.env.TEST_DATABASE_URL).hostname)
  } catch {
    return false
  }
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? ''

const describeIntegration = urlTestDatabaseValid() ? describe : describe.skip

function formDataMeja(nilai: Record<string, string>): FormData {
  const data = new FormData()
  Object.entries(nilai).forEach(([kunci, isi]) => data.set(kunci, isi))
  return data
}

describeIntegration('Integrasi TC-02: meja', () => {
  //Menguji apakah data benar-benar masuk ke database dengan format yang benar.
  it('menyimpan meja kursi dengan nomor dan token otomatis', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja } = await import('@/app/actions/meja')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })
    //Catat ID terakhir sebelum test untuk mencari data baru nanti
    const idAwal = (await prisma.meja.findFirst({ orderBy: { id: 'desc' }, select: { id: true } }))
      ?.id ?? 0
    let mejaId: number | null = null

    try {
      const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))
      expect(hasil).toEqual({ success: true })
      //Ambil data yang baru saja dibuat dari database asli
      const row = await prisma.meja.findFirst({
        where: { id: { gt: idAwal }, nomorMeja: { startsWith: 'K' } },
        orderBy: { id: 'asc' },
      })
      expect(row).not.toBeNull()

      mejaId = row!.id
      expect(row?.kapasitas).toBe(4)
      expect(row?.statusMeja).toBe('kosong')
      expect(row?.nomorMeja).toMatch(/^K\d{3,}$/) //memastikan nomor di database benar-benar berawalan K diikuti minimal 3 angka
      expect(row?.tokenMeja).toMatch(/^[0-9A-F]{8}$/) //Memastikan token berformat 8 karakter
    } finally { //Menghapus data yang dibuat agar database tetap bersih.
      if (mejaId !== null) {
        await prisma.meja.deleteMany({ where: { id: mejaId } })
      }
    }
  })

  //sama tapi memastikan format nomornya L
  it('menyimpan meja lesehan dengan prefix L', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja } = await import('@/app/actions/meja')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

    let mejaId: number | null = null

    try {
      const hasil = await createMeja(null, formDataMeja({ kapasitas: '6', tipeMeja: 'lesehan' }))
      expect(hasil).toEqual({ success: true })

      const row = await prisma.meja.findFirst({
        where: { nomorMeja: { startsWith: 'L' } },
        orderBy: { id: 'desc' },
      })
      expect(row).not.toBeNull()

      mejaId = row!.id
      expect(row?.kapasitas).toBe(6)
      expect(row?.statusMeja).toBe('kosong')
      expect(row?.nomorMeja).toMatch(/^L\d{3,}$/)
      expect(row?.tokenMeja).toMatch(/^[0-9A-F]{8}$/)
    } finally {
      if (mejaId !== null) {
        await prisma.meja.deleteMany({ where: { id: mejaId } })
      }
    }
  })

//Membuktikan bahwa validasi tipe gagal sehingga TIDAK ADA data baru yang masuk ke database.
  it('menolak tipe meja yang tidak valid tanpa menulis baris', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja } = await import('@/app/actions/meja')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })
//Hitung jumlah data sebelum fungsi dipanggil
    const sebelum = await prisma.meja.count()

    const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'bar' }))
    expect(hasil).toEqual({ error: 'Tipe meja wajib dipilih' })
//Hitung jumlah data sesudah, pastikan angkanya sama (tidak ada insert)
    const sesudah = await prisma.meja.count()
    expect(sesudah).toBe(sebelum)
  })
//Membuktikan bahwa fungsi updateMeja benar-benar mengubah data di database
  it('memperbarui kapasitas meja yang ada', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja, updateMeja } = await import('@/app/actions/meja')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

    let mejaId: number | null = null

    try {
      //Buat meja terlebih dahulu sebagai bahan uji
      const dibuat = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))
      expect(dibuat).toEqual({ success: true })

      const row = await prisma.meja.findFirst({
        where: { nomorMeja: { startsWith: 'K' } },
        orderBy: { id: 'desc' },
      })
      mejaId = row!.id
      //update kapasitas menjadi 10
      const diubah = await updateMeja(mejaId, formDataMeja({ kapasitas: '10' }))
      expect(diubah).toEqual({ success: true })
      //memastikan kapasitas benar-benar berubah menjadi 10
      const terbaru = await prisma.meja.findUnique({ where: { id: mejaId } })
      expect(terbaru?.kapasitas).toBe(10)
    } finally {
      if (mejaId !== null) {
        await prisma.meja.deleteMany({ where: { id: mejaId } })
      }
    }
  })

// hapus data tidak permanen, melainkan hanya mengisi deletedAt
  it('melakukan soft delete meja', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja, deleteMeja, getMeja } = await import('@/app/actions/meja')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

    let mejaId: number | null = null

    try {
      await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))
      const row = await prisma.meja.findFirst({
        where: { nomorMeja: { startsWith: 'K' } },
        orderBy: { id: 'desc' },
      })
      mejaId = row!.id

      const dihapus = await deleteMeja(mejaId)
      expect(dihapus).toEqual({ success: true })

      const terbaru = await prisma.meja.findUnique({ where: { id: mejaId } })
      expect(terbaru?.deletedAt).not.toBeNull()
      //memastikan getMeja() tidak menampilkan meja yang sudah dihapus
      const daftar = await getMeja()
      expect(daftar.some((m) => m.id === mejaId)).toBe(false)
    } finally {
      if (mejaId !== null) {
        await prisma.meja.deleteMany({ where: { id: mejaId } })
      }
    }
  })

  it('getNextNomorMeja cocok dengan nomor yang akan dibuat createMeja', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja, getNextNomorMeja } = await import('@/app/actions/meja')
  //Login sebagai owner
    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })
//dapat prediksi nomor meja berikutnya (misal: K005)
    const sebelum = await getNextNomorMeja('kursi')
    expect(sebelum).toMatch(/^K\d{3}$/) //memastikan format prediksinya benar (K diikuti 3 angka)

    let mejaId: number | null = null
    try {
      //buat meja baru secara nyata ke database
      const dibuat = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))
      expect(dibuat).toEqual({ success: true })
      //ambil data yang baru saja dibuat dari database
      const row = await prisma.meja.findFirst({
        where: { nomorMeja: { startsWith: 'K' } },
        orderBy: { id: 'desc' },
      })
      mejaId = row!.id
      //memastikan nomor yang tersimpan di DB sama dengan prediksi awal (K005 === K005).
      expect(row?.nomorMeja).toBe(sebelum)
    } finally {
      if (mejaId !== null) {
        await prisma.meja.deleteMany({ where: { id: mejaId } })
      }
    }
  })

//memastikan saat input salah, database tidak bertambah.
  it('tidak menulis meja saat kapasitas tidak valid', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja } = await import('@/app/actions/meja')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })
//menghitung jumlah baris SEBELUM test
    const jumlahSebelum = await prisma.meja.count({ where: { nomorMeja: { startsWith: 'K' } } })

    const hasil = await createMeja(null, formDataMeja({ kapasitas: '25', tipeMeja: 'kursi' }))
    expect(hasil).toEqual({ error: 'Kapasitas harus antara 1-20 orang' })
//menghitung jumlah baris sesudah test, pastikan angkanya sama tidak ada insert
    const jumlahSesudah = await prisma.meja.count({ where: { nomorMeja: { startsWith: 'K' } } })
    expect(jumlahSesudah).toBe(jumlahSebelum)
  })

//memastikan role selain owner tidak bisa menulis ke database.
  it.each([null, 'cashier', 'waiter', 'kitchen'] as const)(
    'menolak session %s saat membuat meja',
    async (role) => {
      const prisma = (await import('@/lib/prisma')).default
      const { createMeja } = await import('@/app/actions/meja')

      authMock.mockResolvedValue(role ? { user: { id: '1', username: role, role } } : null)

      const jumlahSebelum = await prisma.meja.count({ where: { nomorMeja: { startsWith: 'K' } } })

      const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))
      expect(hasil).toEqual({ error: 'Unauthorized' })
//memastikan jumlah baris tidak bertambah
      const jumlahSesudah = await prisma.meja.count({ where: { nomorMeja: { startsWith: 'K' } } })
      expect(jumlahSesudah).toBe(jumlahSebelum)
    }
  )
})
