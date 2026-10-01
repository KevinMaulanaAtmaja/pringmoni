"use server"

import prisma from "@/lib/prisma"
import {
  Prisma,
  KategoriBahan,
  LokasiStok,
  SatuanStok,
  StatusStok,
  StatusMenu,
  JenisPerubahanStok,
} from "@prisma/client"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { hitungKetersediaanResep } from "@/lib/resep"

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

type KelengkapanResep = {
  bahanUtama: number
  bahanBumbu: number
}

const kosong: KelengkapanResep = { bahanUtama: 0, bahanBumbu: 0 }

async function hitungKelengkapanResep(
  bahanIds: number[]
): Promise<KelengkapanResep> {
  if (bahanIds.length === 0) return kosong

  const grouped = await prisma.stokBahan.groupBy({
    by: ["kategori"],
    where: { id: { in: bahanIds }, tipe: "dapur", deletedAt: null },
    _count: { _all: true },
  })

  return {
    bahanUtama:
      grouped.find((g) => g.kategori === "bahan_utama")?._count._all ?? 0,
    bahanBumbu: grouped.find((g) => g.kategori === "bumbu")?._count._all ?? 0,
  }
}

/**
 * Resep dianggap "lengkap" (indikator kualitas data) kalau punya minimal
 * 1 bahan utama dan 1 bahan bumbu. Kelengkapan TIDAK lagi menjadi syarat
 * menyimpan atau menghapus bahan: menu dengan resep seadanya tetap bisa
 * dipesan dan tetap dilacak stoknya otomatis selama punya >= 1 bahan.
 */
function pesanResepTidakLengkap(k: KelengkapanResep): string {
  const kurang: string[] = []
  if (k.bahanUtama === 0) kurang.push("1 bahan utama")
  if (k.bahanBumbu === 0) kurang.push("1 bahan bumbu")

  return `Idealnya resep punya 1 bahan utama dan 1 bahan bumbu. Saat ini masih kurang: ${kurang.join(" dan ")}.`
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
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Nama bahan sudah ada di bagian ini" }
    }
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
    if (!Number.isFinite(newStok) || newStok < 0) {
      return { error: "Jumlah stok tidak valid" }
    }
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

export async function transferStokBahan(stokBahanId: number, jumlah: number) {
  try {
    const session = await requireOwner()

    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      return { error: "Jumlah transfer harus lebih dari 0" }
    }

    const sumber = await prisma.stokBahan.findFirst({
      where: { id: stokBahanId, deletedAt: null },
    })
    if (!sumber) {
      return { error: "Bahan tidak ditemukan" }
    }
    if (sumber.tipe !== "gudang") {
      return { error: "Hanya bahan di Gudang yang bisa dipindahkan ke Dapur" }
    }

    const stokSebelumGudang = Number(sumber.stokQty)
    if (jumlah > stokSebelumGudang) {
      return {
        error: `Jumlah melebihi stok gudang (${stokSebelumGudang} ${sumber.satuan})`,
      }
    }

    const stokMinimum = Number(sumber.stokMinimum)
    const stokSesudahGudang = Number((stokSebelumGudang - jumlah).toFixed(2))
    const keterangan = `Transfer Gudang → Dapur: ${jumlah} ${sumber.satuan}`
    const userId = session.user.id ? parseInt(session.user.id) : null

    await prisma.$transaction(async (tx) => {
      const tujuan = await tx.stokBahan.findFirst({
        where: { namaBahan: sumber.namaBahan, tipe: "dapur", deletedAt: null },
      })

      const tujuanId = tujuan
        ? tujuan.id
        : (
            await tx.stokBahan.create({
              data: {
                namaBahan: sumber.namaBahan,
                tipe: "dapur",
                kategori: sumber.kategori,
                stokQty: 0,
                satuan: sumber.satuan,
                stokMinimum: sumber.stokMinimum,
                hargaPerSatuan: sumber.hargaPerSatuan,
                statusStok: "habis",
                keterangan: sumber.keterangan,
              },
            })
          ).id

      const stokSebelumDapur = tujuan ? Number(tujuan.stokQty) : 0
      const stokSesudahDapur = Number((stokSebelumDapur + jumlah).toFixed(2))
      const minimumDapur = tujuan ? Number(tujuan.stokMinimum) : stokMinimum

      await tx.stokBahan.update({
        where: { id: sumber.id },
        data: {
          stokQty: stokSesudahGudang,
          statusStok: hitungStatus(stokSesudahGudang, stokMinimum),
          updatedAt: new Date(),
        },
      })

      await tx.stokBahan.update({
        where: { id: tujuanId },
        data: {
          stokQty: stokSesudahDapur,
          statusStok: hitungStatus(stokSesudahDapur, minimumDapur),
          updatedAt: new Date(),
        },
      })

      await tx.riwayatStok.createMany({
        data: [
          {
            stokBahanId: sumber.id,
            stokSebelum: stokSebelumGudang,
            stokSesudah: stokSesudahGudang,
            jumlahPerubahan: -jumlah,
            jenisPerubahan: "transfer",
            keterangan,
            userId,
          },
          {
            stokBahanId: tujuanId,
            stokSebelum: stokSebelumDapur,
            stokSesudah: stokSesudahDapur,
            jumlahPerubahan: jumlah,
            jenisPerubahan: "transfer",
            keterangan,
            userId,
          },
        ],
      })
    })

    revalidatePath("/dashboard/stok-bahan")
    revalidatePath("/dashboard/menu")
    return { success: true, dipindah: jumlah }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Gagal memindahkan stok",
    }
  }
}

export async function hapusResepBahan(resepId: number) {
  try {
    await requireOwner()

    const resep = await prisma.resepMenu.findUnique({
      where: { id: resepId },
      select: { id: true },
    })
    if (!resep) {
      return { error: "Bahan resep tidak ditemukan" }
    }

    await prisma.resepMenu.deleteMany({ where: { id: resepId } })
    revalidatePath("/dashboard/stok-bahan")
    revalidatePath("/dashboard/menu")
    return { success: true }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal menghapus bahan dari resep",
    }
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

export type MenuResepRingkasan = {
  id: number
  namaMenu: string
  kategori: string
  statusMenu: StatusMenu
  jumlahBahan: number
  jumlahBahanUtama: number
  jumlahBahanBumbu: number
  /** Punya >= 1 bahan → stok dilacak otomatis; kalau tidak → mode manual */
  adaResep: boolean
  /** Punya 1 bahan utama + 1 bumbu (indikator kualitas data) */
  lengkap: boolean
  porsiTersedia: number
  bahanPembatas: string[]
  bahan: Array<{
    resepId: number
    namaBahan: string
    satuan: string
    jumlah: number
    stokQty: number
  }>
}

export async function getDaftarMenuResep(): Promise<MenuResepRingkasan[]> {
  await requireOwner()
  const menus = await prisma.menu.findMany({
    where: { deletedAt: null },
    include: {
      kategori: { select: { namaKategori: true } },
      resep: { include: { stokBahan: true } },
    },
    orderBy: { namaMenu: "asc" },
  })

  return menus.map((m) => {
    const bahan = m.resep.filter((r) => !r.stokBahan.deletedAt)
    const jumlahBahanUtama = bahan.filter(
      (r) => r.stokBahan.kategori === "bahan_utama"
    ).length
    const jumlahBahanBumbu = bahan.filter(
      (r) => r.stokBahan.kategori === "bumbu"
    ).length

    const ketersediaan = hitungKetersediaanResep(
      bahan.map((r) => ({
        namaBahan: r.stokBahan.namaBahan,
        satuan: r.stokBahan.satuan,
        jumlahPerPorsi: Number(r.jumlah),
        stokQty: Number(r.stokBahan.stokQty),
      })),
      jumlahBahanUtama,
      jumlahBahanBumbu
    )

    return {
      id: m.id,
      namaMenu: m.namaMenu,
      kategori: m.kategori?.namaKategori ?? "-",
      statusMenu: m.statusMenu,
      jumlahBahan: bahan.length,
      jumlahBahanUtama,
      jumlahBahanBumbu,
      adaResep: ketersediaan.adaResep,
      lengkap: jumlahBahanUtama > 0 && jumlahBahanBumbu > 0,
      porsiTersedia: ketersediaan.porsiTersedia,
      bahanPembatas: ketersediaan.bahanPembatas,
      bahan: bahan.map((r) => ({
        resepId: r.id,
        namaBahan: r.stokBahan.namaBahan,
        satuan: r.stokBahan.satuan,
        jumlah: Number(r.jumlah),
        stokQty: Number(r.stokBahan.stokQty),
      })),
    }
  })
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

    // Satukan duplikat bahan (unique [menuId, stokBahanId]) supaya createMany
    // tidak melanggar constraint dan membatalkan seluruh penyimpanan.
    const itemMap = new Map<number, number>()
    for (const i of items) {
      if (i.stokBahanId > 0 && i.jumlah > 0) {
        itemMap.set(i.stokBahanId, (itemMap.get(i.stokBahanId) ?? 0) + i.jumlah)
      }
    }
    const cleanItems = Array.from(itemMap, ([stokBahanId, jumlah]) => ({
      stokBahanId,
      jumlah,
    }))

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

    // Kelengkapan cuma berupa peringatan, bukan penolakan.
    const kelengkapan = await hitungKelengkapanResep(bahanIds)
    const warning =
      cleanItems.length > 0 && (kelengkapan.bahanUtama === 0 || kelengkapan.bahanBumbu === 0)
        ? pesanResepTidakLengkap(kelengkapan)
        : undefined

    revalidatePath("/dashboard/stok-bahan")
    revalidatePath("/dashboard/menu")
    return { success: true, warning }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan resep" }
  }
}