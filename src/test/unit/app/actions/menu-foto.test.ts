import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, revalidatePathMock, deleteFilesMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  deleteFilesMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('uploadthing/server', () => ({
  UTApi: class {
    deleteFiles = deleteFilesMock
  },
}))
vi.mock('@/lib/prisma', async () => {
  const { prismaMock } = await import('@/test/helpers/prisma-mock')
  return { default: prismaMock }
})

import { prismaMock } from '@/test/helpers/prisma-mock'
import { sessionUntuk } from '@/test/helpers/auth-mock'
import {
  deleteAllMenuFotos,
  deleteMenuFoto,
  getMenuFotos,
  saveMenuFotoUrls,
} from '@/app/actions/menu-foto'

beforeEach(() => {
  vi.resetAllMocks()

  authMock.mockResolvedValue(sessionUntuk('owner', { id: '1', username: 'owner' }))
  prismaMock.menuFoto.create.mockResolvedValue({ id: 1 })
  prismaMock.menuFoto.delete.mockResolvedValue({ id: 1 })
  prismaMock.menuFoto.deleteMany.mockResolvedValue({ count: 1 })
  prismaMock.menuFoto.findMany.mockResolvedValue([])
  prismaMock.menuFoto.findUnique.mockResolvedValue({
    id: 1,
    menuId: 1,
    fotoUrl: 'https://cdn/a.jpg',
    fileKey: 'key-1',
  })
  deleteFilesMock.mockResolvedValue({ success: true })
})

describe('saveMenuFotoUrls', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(saveMenuFotoUrls(1, ['a'], [])).rejects.toThrow('Unauthorized')
    expect(prismaMock.menuFoto.create).not.toHaveBeenCalled()
  })

  it('menolak role selain owner', async () => {
    authMock.mockResolvedValue(sessionUntuk('kitchen'))

    await expect(saveMenuFotoUrls(1, ['a'], [])).rejects.toThrow('Unauthorized')
  })

  it('menyimpan setiap url dengan urutan dan fileKey', async () => {
    await saveMenuFotoUrls(5, ['a.jpg', 'b.jpg'], ['key-a'])

    expect(prismaMock.menuFoto.create).toHaveBeenCalledTimes(2)
    expect(prismaMock.menuFoto.create).toHaveBeenNthCalledWith(1, {
      data: { menuId: 5, fotoUrl: 'a.jpg', fileKey: 'key-a', urutan: 1 },
    })
    expect(prismaMock.menuFoto.create).toHaveBeenNthCalledWith(2, {
      data: { menuId: 5, fotoUrl: 'b.jpg', fileKey: null, urutan: 2 },
    })
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
  })
})

describe('deleteMenuFoto', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(deleteMenuFoto(1)).rejects.toThrow('Unauthorized')
  })

  it('melempar error saat foto tidak ditemukan', async () => {
    prismaMock.menuFoto.findUnique.mockResolvedValue(null)

    await expect(deleteMenuFoto(1)).rejects.toThrow('Foto tidak ditemukan')
    expect(prismaMock.menuFoto.delete).not.toHaveBeenCalled()
  })

  it('menghapus file UploadThing lalu baris database', async () => {
    await deleteMenuFoto(1)

    expect(deleteFilesMock).toHaveBeenCalledWith('key-1')
    expect(prismaMock.menuFoto.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/menu')
  })

  it('tetap menghapus database saat UploadThing gagal', async () => {
    deleteFilesMock.mockRejectedValue(new Error('uploadthing down'))

    await deleteMenuFoto(1)

    expect(prismaMock.menuFoto.delete).toHaveBeenCalledWith({ where: { id: 1 } })
  })

  it('melewati UploadThing bila tidak ada fileKey', async () => {
    prismaMock.menuFoto.findUnique.mockResolvedValue({
      id: 1,
      menuId: 1,
      fotoUrl: 'https://cdn/a.jpg',
      fileKey: null,
    })

    await deleteMenuFoto(1)

    expect(deleteFilesMock).not.toHaveBeenCalled()
    expect(prismaMock.menuFoto.delete).toHaveBeenCalled()
  })
})

describe('getMenuFotos', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(getMenuFotos(1)).rejects.toThrow('Unauthorized')
  })

  it('mengambil foto berdasarkan menu dan urutan', async () => {
    const daftar = [{ id: 1, menuId: 3, fotoUrl: 'a.jpg', urutan: 1 }]
    prismaMock.menuFoto.findMany.mockResolvedValue(daftar)

    const hasil = await getMenuFotos(3)

    expect(hasil).toEqual(daftar)
    expect(prismaMock.menuFoto.findMany).toHaveBeenCalledWith({
      where: { menuId: 3 },
      orderBy: { urutan: 'asc' },
    })
  })
})

describe('deleteAllMenuFotos', () => {
  it('menolak tanpa session', async () => {
    authMock.mockResolvedValue(null)

    await expect(deleteAllMenuFotos(1)).rejects.toThrow('Unauthorized')
  })

  it('menghapus semua file yang punya fileKey lalu baris database', async () => {
    prismaMock.menuFoto.findMany.mockResolvedValue([
      { id: 1, fileKey: 'k1' },
      { id: 2, fileKey: null },
      { id: 3, fileKey: 'k3' },
    ])

    await deleteAllMenuFotos(5)

    expect(deleteFilesMock).toHaveBeenCalledWith(['k1', 'k3'])
    expect(prismaMock.menuFoto.deleteMany).toHaveBeenCalledWith({ where: { menuId: 5 } })
  })

  it('tidak memanggil UploadThing bila tidak ada fileKey', async () => {
    prismaMock.menuFoto.findMany.mockResolvedValue([{ id: 1, fileKey: null }])

    await deleteAllMenuFotos(5)

    expect(deleteFilesMock).not.toHaveBeenCalled()
    expect(prismaMock.menuFoto.deleteMany).toHaveBeenCalledWith({ where: { menuId: 5 } })
  })

  it('tetap menghapus database saat UploadThing gagal', async () => {
    prismaMock.menuFoto.findMany.mockResolvedValue([{ id: 1, fileKey: 'k1' }])
    deleteFilesMock.mockRejectedValue(new Error('uploadthing down'))

    await deleteAllMenuFotos(5)

    expect(prismaMock.menuFoto.deleteMany).toHaveBeenCalledWith({ where: { menuId: 5 } })
  })
})
