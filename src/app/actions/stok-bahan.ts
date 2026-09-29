"use server"

import prisma from "@/lib/prisma"
import {
  KategoriBahan,
  LokasiStok,
  SatuanStok,
  StatusStok,
  JenisPerubahanStok,
} from "@prisma/client"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export type StokBahanWithType = {
  id: number
  namaBahan: string
  tipe: LokasiStok
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

export type ResepMenuInput = {
  stokBahanId: number
  jumlah: number
}

async function requireOwner() {
  const session = await auth()
  if (!session?.user || session.user.role !== "owner") {
    throw new Error("Unauthorized")
  }
  return session
}

function hitungStatus(stokQty: number, stokMinimum: number): StatusStok {
  if (stokQty <= 0) return "habis"
  if (stokQty <= stokMinimum) return "menipis"
  return "tersedia"
}

export async function getStokBahanList(tipe: LokasiStok): Promise<StokBahanWithType[]> {
  await requireOwner()
  const items = await prisma.stokBahan.findMany({
    where: { tipe, deletedAt: null },
    orderBy: { createdAt: "desc" },
  })
  return items.map((item) => ({
    id: item.id,
    namaBahan: item.namaBahan,
    tipe: item.tipe,
    kategori: item.kategori,
    stokQty: Number(item.stokQty),
    satuan: item.satuan,
    stokMinimum: Number(item.stokMinimum),
    hargaPerSatuan: Number(item.hargaPerSatuan),
    statusStok: hitungStatus(Number(item.stokQty), Number(item.stokMinimum)),
    keterangan: item.keterangan,
    createdAt: item.createdAt,
  }))
}

export async function createStokBahan(data: {
  tipe: LokasiStok
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
      return { error: "Nama bahan tidak boleh kosong" }
    }

    const existingAny = await prisma.stokBahan.findFirst({
      where: { namaBahan: cleanName, tipe: data.tipe },
    })

    if (existingAny && !existingAny.deletedAt) {
      return { error: "Nama bahan sudah ada di bagian ini" }
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
          tipe: data.tipe,
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

    await prisma.riwayatStok.create({
      data: {
        stokBahanId: createdId,
        stokSebelum: 0,
        stokSesudah: data.stokQty,
        jumlahPerubahan: data.stokQty,
        jenisPerubahan: data.stokQty > 0 ? "restock" : "koreksi",
        keterangan: data.keterangan ? `Stok awal: ${data.keterangan}` : "Stok awal baru",
        userId: session.user.id ? parseInt(session.user.id) : null,
      },
    })

    revalidatePath("/dashboard/stok-bahan")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambahkan bahan" }
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
  keterangan?: string
}) {
  try {
    const session = await requireOwner()
    const cleanName = data.namaBahan.trim()
    if (!cleanName) {
      return { error: "Nama bahan tidak boleh kosong" }
    }

    const currentItem = await prisma.stokBahan.findUnique({
      where: { id: data.id },
    })
    if (!currentItem || currentItem.deletedAt) {
      return { error: "Bahan tidak ditemukan" }
    }

    const duplicate = await prisma.stokBahan.findFirst({
      where: {
        namaBahan: cleanName,
        tipe: currentItem.tipe,
        deletedAt: null,
        NOT: { id: data.id },
      },
    })
    if (duplicate) {
      return { error: "Nama bahan sudah digunakan di bagian ini" }
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
          jenisPerubahan: "koreksi",
          keterangan: "Koreksi stok melalui edit bahan",
          userId: session.user.id ? parseInt(session.user.id) : null,
        },
      })
    }

    revalidatePath("/dashboard/stok-bahan")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal memperbarui bahan" }
  }
}

export async function deleteStokBahan(id: number) {
  try {
    await requireOwner()
    const item = await prisma.stokBahan.findUnique({ where: { id } })
    if (!item || item.deletedAt) {
      return { error: "Bahan tidak ditemukan" }
    }

    const dipakaiResep = await prisma.resepMenu.count({ where: { stokBahanId: id } })
    if (dipakaiResep > 0) {
      return { error: "Bahan ini dipakai pada resep menu, tidak dapat dihapus" }
    }

    await prisma.stokBahan.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    revalidatePath("/dashboard/stok-bahan")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menghapus bahan" }
  }
}

export async function resetAllStokBahan(tipe: LokasiStok) {
  try {
    await requireOwner()
    await prisma.stokBahan.updateMany({
      where: { tipe, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    revalidatePath("/dashboard/stok-bahan")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mereset data bahan" }
  }
}

export async function restockBahan(id: number, jumlah: number, keterangan?: string) {
  try {
    const session = await requireOwner()

    const item = await prisma.stokBahan.findUnique({ where: { id } })
    if (!item || item.deletedAt) {
      return { error: "Bahan tidak ditemukan" }
    }

    if (jumlah <= 0) {
      return { error: "Jumlah restock harus lebih dari 0" }
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
          jenisPerubahan: "restock",
          keterangan: keterangan || null,
          userId: session.user.id ? parseInt(session.user.id) : null,
        },
      }),
    ])

    revalidatePath("/dashboard/stok-bahan")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal melakukan restock" }
  }
}

export async function getRiwayatStok(stokBahanId: number): Promise<RiwayatStokWithType[]> {
  try {
    await requireOwner()

    const riwayat = await prisma.riwayatStok.findMany({
      where: { stokBahanId },
      include: {
        stokBahan: { select: { namaBahan: true } },
        user: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return riwayat.map((r) => ({
      id: r.id,
      stokBahanId: r.stokBahanId,
      namaBahan: r.stokBahan.namaBahan,
      stokSebelum: Number(r.stokSebelum),
      stokSesudah: Number(r.stokSesudah),
      jumlahPerubahan: Number(r.jumlahPerubahan),
      jenisPerubahan: r.jenisPerubahan,
      keterangan: r.keterangan,
      userName: r.user?.username || null,
      createdAt: r.createdAt.toISOString().replace("T", " ").substring(0, 19),
    }))
  } catch {
    return []
  }
}

export type ResepMenuWithBahan = {
  menuId: number
  namaMenu: string
  items: Array<{
    stokBahanId: number
    namaBahan: string
    satuan: SatuanStok
    jumlah: number
  }>
}

export async function getBahanDapurList(): Promise<StokBahanWithType[]> {
  await requireOwner()
  const items = await prisma.stokBahan.findMany({
    where: { tipe: "dapur", deletedAt: null },
    orderBy: { namaBahan: "asc" },
  })
  return items.map((item) => ({
    id: item.id,
    namaBahan: item.namaBahan,
    tipe: item.tipe,
    kategori: item.kategori,
    stokQty: Number(item.stokQty),
    satuan: item.satuan,
    stokMinimum: Number(item.stokMinimum),
    hargaPerSatuan: Number(item.hargaPerSatuan),
    statusStok: hitungStatus(Number(item.stokQty), Number(item.stokMinimum)),
    keterangan: item.keterangan,
    createdAt: item.createdAt,
  }))
}

export async function getDaftarMenuResep(): Promise<
  Array<{ id: number; namaMenu: string; jumlahBahan: number }>
> {
  await requireOwner()
  const menus = await prisma.menu.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { resep: true } } },
    orderBy: { namaMenu: "asc" },
  })
  return menus.map((m) => ({
    id: m.id,
    namaMenu: m.namaMenu,
    jumlahBahan: m._count.resep,
  }))
}

export async function getResepMenu(menuId: number): Promise<ResepMenuWithBahan | null> {
  try {
    await requireOwner()
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, deletedAt: null },
      include: {
        resep: {
          include: { stokBahan: true },
        },
      },
    })
    if (!menu) return null

    return {
      menuId: menu.id,
      namaMenu: menu.namaMenu,
      items: menu.resep
        .filter((r) => !r.stokBahan.deletedAt)
        .map((r) => ({
          stokBahanId: r.stokBahanId,
          namaBahan: r.stokBahan.namaBahan,
          satuan: r.stokBahan.satuan,
          jumlah: Number(r.jumlah),
        })),
    }
  } catch {
    return null
  }
}

export async function saveResepMenu(menuId: number, items: ResepMenuInput[]) {
  try {
    await requireOwner()
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, deletedAt: null },
    })
    if (!menu) {
      return { error: "Menu tidak ditemukan" }
    }

    const cleanItems = items
      .filter((i) => i.stokBahanId > 0 && i.jumlah > 0)
      .map((i) => ({ stokBahanId: i.stokBahanId, jumlah: i.jumlah }))

    const bahanIds = cleanItems.map((i) => i.stokBahanId)
    if (bahanIds.length > 0) {
      const count = await prisma.stokBahan.count({
        where: { id: { in: bahanIds }, tipe: "dapur", deletedAt: null },
      })
      if (count !== bahanIds.length) {
        return { error: "Beberapa bahan dapur tidak valid" }
      }
    }

    await prisma.$transaction([
      prisma.resepMenu.deleteMany({ where: { menuId } }),
      ...(cleanItems.length > 0
        ? [
            prisma.resepMenu.createMany({
              data: cleanItems.map((i) => ({
                menuId,
                stokBahanId: i.stokBahanId,
                jumlah: i.jumlah,
              })),
            }),
          ]
        : []),
    ])

    revalidatePath("/dashboard/stok-bahan")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan resep" }
  }
}