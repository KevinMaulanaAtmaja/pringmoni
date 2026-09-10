'use server'

import prisma from '@/lib/prisma'
import { KategoriBahan, SatuanStok, StatusStok, JenisPerubahanStok } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

export type StokBahanWithType = {
  id: number
  namaBahan: string
  kategori: KategoriBahan
  stokQty: number
  satuan: SatuanStok
  stokMinimum: number
  hargaPerSatuan: number
  statusStok: StatusStok
  keterangan: string | null
  createdAt: Date
}

export type RiwayatStokWithType = {
  id: number
  stokBahanId: number
  namaBahan: string
  stokSebelum: number
  stokSesudah: number
  jumlahPerubahan: number
  jenisPerubahan: JenisPerubahanStok
  keterangan: string | null
  userName: string | null
  createdAt: string
}

async function requireOwner() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') {
    throw new Error('Unauthorized')
  }
  return session
}

function hitungStatus(stokQty: number, stokMinimum: number): StatusStok {
  if (stokQty <= 0) return 'habis'
  if (stokQty <= stokMinimum) return 'menipis'
  return 'tersedia'
}

export async function getStokBahanList(): Promise<StokBahanWithType[]> {
  await requireOwner()
  const items = await prisma.stokBahan.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  })
  return items.map(item => {
    const stokQty = Number(item.stokQty)
    const stokMinimum = Number(item.stokMinimum)
    return {
      id: item.id,
      namaBahan: item.namaBahan,
      kategori: item.kategori,
      stokQty,
      satuan: item.satuan,
      stokMinimum,
      hargaPerSatuan: Number(item.hargaPerSatuan),
      statusStok: hitungStatus(stokQty, stokMinimum),
      keterangan: item.keterangan,
      createdAt: item.createdAt,
    }
  })
}

export async function createStokBahan(data: {
  namaBahan: string
  kategori: KategoriBahan
  stokQty: number
  satuan: SatuanStok
  stokMinimum: number
  hargaPerSatuan: number
  keterangan?: string
}) {
  try {
    const session = await requireOwner()
    const cleanName = data.namaBahan.trim()
    if (!cleanName) {
      return { error: 'Nama bahan tidak boleh kosong' }
    }

    const existingAny = await prisma.stokBahan.findUnique({
      where: { namaBahan: cleanName },
    })

    if (existingAny && !existingAny.deletedAt) {
      return { error: 'Nama bahan sudah ada' }
    }

    const statusStok = hitungStatus(data.stokQty, data.stokMinimum)

    let createdId: number

    if (existingAny && existingAny.deletedAt) {
      const updated = await prisma.stokBahan.update({
        where: { id: existingAny.id },
        data: {
          kategori: data.kategori,
          stokQty: data.stokQty,
          satuan: data.satuan,
          stokMinimum: data.stokMinimum,
          hargaPerSatuan: data.hargaPerSatuan,
          statusStok,
          keterangan: data.keterangan || null,
          deletedAt: null,
          updatedAt: new Date(),
        },
      })
      createdId = updated.id
    } else {
      const created = await prisma.stokBahan.create({
        data: {
          namaBahan: cleanName,
          kategori: data.kategori,
          stokQty: data.stokQty,
          satuan: data.satuan,
          stokMinimum: data.stokMinimum,
          hargaPerSatuan: data.hargaPerSatuan,
          statusStok,
          keterangan: data.keterangan || null,
        },
      })
      createdId = created.id
    }

    // Catat riwayat stok awal
    await prisma.riwayatStok.create({
      data: {
        stokBahanId: createdId,
        stokSebelum: 0,
        stokSesudah: data.stokQty,
        jumlahPerubahan: data.stokQty,
        jenisPerubahan: data.stokQty > 0 ? 'restock' : 'koreksi',
        keterangan: data.keterangan ? `Stok awal: ${data.keterangan}` : 'Stok awal baru',
        userId: session.user.id ? parseInt(session.user.id) : null,
      },
    })

    revalidatePath('/dashboard/stok-bahan')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Gagal menambahkan bahan' }
  }
}

export async function updateStokBahan(data: {
  id: number
  namaBahan: string
  kategori: KategoriBahan
  stokQty: number
  satuan: SatuanStok
  stokMinimum: number
  hargaPerSatuan: number
  statusStok?: StatusStok
  keterangan?: string
}) {
  try {
    const session = await requireOwner()
    const cleanName = data.namaBahan.trim()
    if (!cleanName) {
      return { error: 'Nama bahan tidak boleh kosong' }
    }

    const existing = await prisma.stokBahan.findFirst({
      where: { namaBahan: cleanName, deletedAt: null, NOT: { id: data.id } },
    })
    if (existing) {
      return { error: 'Nama bahan sudah digunakan' }
    }

    const currentItem = await prisma.stokBahan.findUnique({
      where: { id: data.id },
    })
    if (!currentItem || currentItem.deletedAt) {
      return { error: 'Bahan tidak ditemukan' }
    }

    const prevStok = Number(currentItem.stokQty)
    const newStok = data.stokQty
    const statusStok = hitungStatus(newStok, data.stokMinimum)

    await prisma.stokBahan.update({
      where: { id: data.id },
      data: {
        namaBahan: cleanName,
        kategori: data.kategori,
        stokQty: newStok,
        satuan: data.satuan,
        stokMinimum: data.stokMinimum,
        hargaPerSatuan: data.hargaPerSatuan,
        statusStok,
        keterangan: data.keterangan || null,
        updatedAt: new Date(),
      },
    })

    if (prevStok !== newStok) {
      await prisma.riwayatStok.create({
        data: {
          stokBahanId: data.id,
          stokSebelum: prevStok,
          stokSesudah: newStok,
          jumlahPerubahan: Math.abs(newStok - prevStok),
          jenisPerubahan: 'koreksi',
          keterangan: 'Koreksi stok melalui edit bahan',
          userId: session.user.id ? parseInt(session.user.id) : null,
        },
      })
    }

    revalidatePath('/dashboard/stok-bahan')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Gagal memperbarui bahan' }
  }
}

export async function deleteStokBahan(id: number) {
  try {
    await requireOwner()
    const item = await prisma.stokBahan.findUnique({ where: { id } })
    if (!item || item.deletedAt) {
      return { error: 'Bahan tidak ditemukan' }
    }

    await prisma.stokBahan.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    revalidatePath('/dashboard/stok-bahan')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Gagal menghapus bahan' }
  }
}

export async function resetAllStokBahan() {
  try {
    await requireOwner()
    await prisma.stokBahan.updateMany({
      where: { deletedAt: null },
      data: { deletedAt: new Date() },
    })
    revalidatePath('/dashboard/stok-bahan')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Gagal mereset data bahan' }
  }
}

export async function restockBahan(
  id: number,
  jumlah: number,
  keterangan?: string
) {
  try {
    const session = await requireOwner()

    const item = await prisma.stokBahan.findUnique({ where: { id } })
    if (!item || item.deletedAt) {
      return { error: 'Bahan tidak ditemukan' }
    }

    if (jumlah <= 0) {
      return { error: 'Jumlah restock harus lebih dari 0' }
    }

    const stokSebelum = Number(item.stokQty)
    const stokSesudah = stokSebelum + jumlah
    const statusStok = hitungStatus(stokSesudah, Number(item.stokMinimum))

    await prisma.$transaction([
      prisma.stokBahan.update({
        where: { id },
        data: { stokQty: stokSesudah, statusStok },
      }),
      prisma.riwayatStok.create({
        data: {
          stokBahanId: id,
          stokSebelum,
          stokSesudah,
          jumlahPerubahan: jumlah,
          jenisPerubahan: 'restock',
          keterangan: keterangan || null,
          userId: session.user.id ? parseInt(session.user.id) : null,
        },
      }),
    ])

    revalidatePath('/dashboard/stok-bahan')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Gagal melakukan restock' }
  }
}

export async function getRiwayatStok(
  stokBahanId: number
): Promise<RiwayatStokWithType[]> {
  try {
    await requireOwner()

    const riwayat = await prisma.riwayatStok.findMany({
      where: { stokBahanId },
      include: {
        stokBahan: { select: { namaBahan: true } },
        user: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return riwayat.map(r => ({
      id: r.id,
      stokBahanId: r.stokBahanId,
      namaBahan: r.stokBahan.namaBahan,
      stokSebelum: Number(r.stokSebelum),
      stokSesudah: Number(r.stokSesudah),
      jumlahPerubahan: Number(r.jumlahPerubahan),
      jenisPerubahan: r.jenisPerubahan,
      keterangan: r.keterangan,
      userName: r.user?.username || null,
      createdAt: r.createdAt.toISOString().replace('T', ' ').substring(0, 19),
    }))
  } catch {
    return []
  }
}
