import { describe, it, expect, vi } from 'vitest'

const { authMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => ({ get: () => null })) }))

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
  it('menyimpan meja kursi dengan nomor dan token otomatis', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja } = await import('@/app/actions/meja')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

    const idAwal = (await prisma.meja.findFirst({ orderBy: { id: 'desc' }, select: { id: true } }))
      ?.id ?? 0
    let mejaId: number | null = null

    try {
      const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))
      expect(hasil).toEqual({ success: true })

      const row = await prisma.meja.findFirst({
        where: { id: { gt: idAwal }, nomorMeja: { startsWith: 'K' } },
        orderBy: { id: 'asc' },
      })
      expect(row).not.toBeNull()

      mejaId = row!.id
      expect(row?.kapasitas).toBe(4)
      expect(row?.statusMeja).toBe('kosong')
      expect(row?.nomorMeja).toMatch(/^K\d{3,}$/)
      expect(row?.tokenMeja).toMatch(/^[0-9A-F]{8}$/)
    } finally {
      if (mejaId !== null) {
        await prisma.meja.deleteMany({ where: { id: mejaId } })
      }
    }
  })

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

  it('menolak tipe meja yang tidak valid tanpa menulis baris', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja } = await import('@/app/actions/meja')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

    const sebelum = await prisma.meja.count()

    const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'bar' }))
    expect(hasil).toEqual({ error: 'Tipe meja wajib dipilih' })

    const sesudah = await prisma.meja.count()
    expect(sesudah).toBe(sebelum)
  })

  it('memperbarui kapasitas meja yang ada', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja, updateMeja } = await import('@/app/actions/meja')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

    let mejaId: number | null = null

    try {
      const dibuat = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))
      expect(dibuat).toEqual({ success: true })

      const row = await prisma.meja.findFirst({
        where: { nomorMeja: { startsWith: 'K' } },
        orderBy: { id: 'desc' },
      })
      mejaId = row!.id

      const diubah = await updateMeja(mejaId, formDataMeja({ kapasitas: '10' }))
      expect(diubah).toEqual({ success: true })

      const terbaru = await prisma.meja.findUnique({ where: { id: mejaId } })
      expect(terbaru?.kapasitas).toBe(10)
    } finally {
      if (mejaId !== null) {
        await prisma.meja.deleteMany({ where: { id: mejaId } })
      }
    }
  })

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

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

    const sebelum = await getNextNomorMeja('kursi')
    expect(sebelum).toMatch(/^K\d{3}$/)

    let mejaId: number | null = null
    try {
      const dibuat = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))
      expect(dibuat).toEqual({ success: true })

      const row = await prisma.meja.findFirst({
        where: { nomorMeja: { startsWith: 'K' } },
        orderBy: { id: 'desc' },
      })
      mejaId = row!.id
      expect(row?.nomorMeja).toBe(sebelum)
    } finally {
      if (mejaId !== null) {
        await prisma.meja.deleteMany({ where: { id: mejaId } })
      }
    }
  })

  it('tidak menulis meja saat kapasitas tidak valid', async () => {
    const prisma = (await import('@/lib/prisma')).default
    const { createMeja } = await import('@/app/actions/meja')

    authMock.mockResolvedValue({
      user: { id: '1', username: 'owner', role: 'owner' },
    })

    const jumlahSebelum = await prisma.meja.count({ where: { nomorMeja: { startsWith: 'K' } } })

    const hasil = await createMeja(null, formDataMeja({ kapasitas: '25', tipeMeja: 'kursi' }))
    expect(hasil).toEqual({ error: 'Kapasitas harus antara 1-20 orang' })

    const jumlahSesudah = await prisma.meja.count({ where: { nomorMeja: { startsWith: 'K' } } })
    expect(jumlahSesudah).toBe(jumlahSebelum)
  })

  it.each([null, 'cashier', 'waiter', 'kitchen'] as const)(
    'menolak session %s saat membuat meja',
    async (role) => {
      const prisma = (await import('@/lib/prisma')).default
      const { createMeja } = await import('@/app/actions/meja')

      authMock.mockResolvedValue(role ? { user: { id: '1', username: role, role } } : null)

      const jumlahSebelum = await prisma.meja.count({ where: { nomorMeja: { startsWith: 'K' } } })

      const hasil = await createMeja(null, formDataMeja({ kapasitas: '4', tipeMeja: 'kursi' }))
      expect(hasil).toEqual({ error: 'Unauthorized' })

      const jumlahSesudah = await prisma.meja.count({ where: { nomorMeja: { startsWith: 'K' } } })
      expect(jumlahSesudah).toBe(jumlahSebelum)
    }
  )
})
