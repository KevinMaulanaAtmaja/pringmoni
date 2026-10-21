'use server';

import prisma from '@/lib/prisma';
import { KategoriMenu, LokasiMenu, StatusMenu } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { deleteAllMenuFotos } from './menu-foto';
import { butuhBumbu, hitungKetersediaanResep } from '@/lib/resep';

export type MenuWithKategori = {
  id: number;
  namaMenu: string;
  deskripsi: string | null;
  harga: number;
  kategoriId: number;
  statusMenu: StatusMenu;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  kategori: KategoriMenu;
  fotoUrl: string | null;
  fotoUrls?: string[];
  /** Punya >= 1 bahan di resep → stok dilacak otomatis; tanpa resep → manual */
  adaResep?: boolean;
  /** Resep punya 1 bahan utama + 1 bumbu (indikator kualitas data) */
  resepLengkap?: boolean;
  /** Porsi maksimum yang masih bisa dimasak dari stok bahan sekarang */
  porsiTersedia?: number;
  /** Bahan yang stoknya paling menentukan nilai porsiTersedia */
  bahanPembatas?: string[];
};

export type CreateMenuInput = {
  namaMenu: string;
  deskripsi?: string;
  harga: number;
  kategoriId: number;
  statusMenu?: StatusMenu;
};

export type UpdateMenuInput = Partial<CreateMenuInput> & { id: number };

export async function getMenus(): Promise<MenuWithKategori[]> {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  const menus = await prisma.menu.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      namaMenu: true,
      deskripsi: true,
      harga: true,
      kategoriId: true,
      statusMenu: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      kategori: true,
      menuFoto: {
        select: {
          id: true,
          fotoUrl: true,
          urutan: true,
        },
        orderBy: { urutan: 'asc' },
      },
      resep: {
        select: {
          jumlah: true,
          stokBahan: {
            select: {
              namaBahan: true,
              kategori: true,
              satuan: true,
              stokQty: true,
              deletedAt: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return menus.map((m) => {
    // `resep` berisi Decimal (jumlah/stokQty) — jangan ikut dikembalikan
    // ke Client Component (React hanya menerima plain object).
    const { resep, ...menuTanpaResep } = m;
    const bahanAktif = resep
      .filter((r) => !r.stokBahan.deletedAt)
      .map((r) => ({
        namaBahan: r.stokBahan.namaBahan,
        satuan: r.stokBahan.satuan,
        jumlahPerPorsi: Number(r.jumlah),
        stokQty: Number(r.stokBahan.stokQty),
        kategori: r.stokBahan.kategori,
      }));
    const ketersediaan = hitungKetersediaanResep(
      bahanAktif,
      bahanAktif.filter((b) => b.kategori === 'bahan_utama').length,
      bahanAktif.filter((b) => b.kategori === 'bumbu').length,
      butuhBumbu(m.kategori?.namaKategori)
    );
    return {
      ...menuTanpaResep,
      harga: Number(m.harga),
      fotoUrl: m.menuFoto[0]?.fotoUrl || null,
      fotoUrls: m.menuFoto.map(f => f.fotoUrl),
      adaResep: ketersediaan.adaResep,
      resepLengkap: ketersediaan.lengkap,
      porsiTersedia: ketersediaan.porsiTersedia,
      bahanPembatas: ketersediaan.bahanPembatas,
    };
  });
}

export async function getKategoriMenus(): Promise<KategoriMenu[]> {
  return prisma.kategoriMenu.findMany({
    where: { deletedAt: null },
    orderBy: { namaKategori: 'asc' },
  });
}

async function requireOwner() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') {
    throw new Error("Unauthorized")
  }
}

export async function createMenu(data: CreateMenuInput) {
  await requireOwner()
  // Validation
  if (!data.namaMenu?.trim()) {
    return { error: "Nama menu wajib diisi" }
  }
  if (data.harga <= 0) {
    return { error: "Harga harus lebih dari 0" }
  }
  
  const menu = await prisma.menu.create({
    data: {
      namaMenu: data.namaMenu,
      deskripsi: data.deskripsi,
      harga: new Prisma.Decimal(data.harga),
      kategoriId: data.kategoriId,
      statusMenu: data.statusMenu || 'tersedia',
    },
  });
  revalidatePath('/dashboard/menu');
  // Jangan return row Prisma mentah: `harga` bertipe Decimal dan tidak bisa
  // diserialisasi ke Client Component ("Decimal objects are not supported").
  return { id: menu.id };
}

export async function updateMenu(data: UpdateMenuInput) {
  await requireOwner()
  const { id, namaMenu, deskripsi, kategoriId, statusMenu, harga } = data;

  // Validation
  if (namaMenu !== undefined && !namaMenu?.trim()) {
    return { error: "Nama menu tidak boleh kosong" }
  }
  if (harga !== undefined && harga <= 0) {
    return { error: "Harga harus lebih dari 0" }
  }

  // Hanya field yang diizinkan (allowlist) supaya field sensitif seperti
  // deletedAt/createdAt tidak bisa diubah paksa dari client.
  await prisma.menu.update({
    where: { id },
    data: {
      namaMenu,
      deskripsi,
      kategoriId,
      statusMenu,
      harga: harga !== undefined ? new Prisma.Decimal(harga) : undefined,
    },
  });
  revalidatePath('/dashboard/menu');
}

export async function deleteMenu(id: number) {
  try {
    await requireOwner()
    // Delete all associated photos first
    await deleteAllMenuFotos(id);

    await prisma.menu.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath('/dashboard/menu');
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menghapus menu" }
  }
}

export async function toggleStatusMenu(id: number, status: StatusMenu) {
  await requireOwner()
  await prisma.menu.update({
    where: { id },
    data: { statusMenu: status },
  });
  revalidatePath('/dashboard/menu');
}

export async function createKategori(data: { namaKategori: string; lokasi?: LokasiMenu; icon?: string | null; pilihanSuhu?: boolean }) {
  await requireOwner()
  const lokasi = data.lokasi ?? 'resto'
  const icon = data.icon?.trim() || null
  const pilihanSuhu = data.pilihanSuhu ?? false
  // Check if kategori with same name exists (including soft-deleted)
  const existing = await prisma.kategoriMenu.findFirst({
    where: {
      namaKategori: data.namaKategori,
    },
  });

  if (existing) {
    if (existing.deletedAt) {
      // Restore soft-deleted kategori
      await prisma.kategoriMenu.update({
        where: { id: existing.id },
        data: {
          deletedAt: null,
          namaKategori: data.namaKategori,
          lokasi,
          icon,
          pilihanSuhu,
        },
      });
    } else {
      return { error: "Kategori dengan nama ini sudah ada" };
    }
  } else {
    // Create new kategori
    await prisma.kategoriMenu.create({
      data: { namaKategori: data.namaKategori, lokasi, icon, pilihanSuhu },
    });
  }
  
  revalidatePath('/dashboard/menu');
  return { success: true };
}

export async function updateKategori(id: number, data: { namaKategori: string; lokasi?: LokasiMenu; icon?: string | null; pilihanSuhu?: boolean }) {
  await requireOwner()
  // Check if namaKategori already exists (excluding current id, ONLY active ones)
  const existing = await prisma.kategoriMenu.findFirst({
    where: {
      namaKategori: data.namaKategori,
      id: { not: id },
      deletedAt: null, // Only check non-deleted categories
    },
  });

  if (existing) {
    return { error: "Kategori dengan nama ini sudah ada" };
  }

  const icon = data.icon?.trim() || null
  await prisma.kategoriMenu.update({
    where: { id },
    data: {
      namaKategori: data.namaKategori,
      lokasi: data.lokasi,
      icon,
      pilihanSuhu: data.pilihanSuhu ?? false,
    },
  });
  revalidatePath('/dashboard/menu');
  return { success: true };
}

export async function deleteKategori(id: number) {
  await requireOwner()
  // Count active menus using this category
  const menuCount = await prisma.menu.count({
    where: { 
      kategoriId: id, 
      deletedAt: null // Only count non-deleted menus
    },
  });

  if (menuCount > 0) {
    return { error: `Kategori masih digunakan oleh ${menuCount} menu aktif` };
  }

  // Safe to soft delete
  await prisma.kategoriMenu.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath('/dashboard/menu');
  return { success: true };
}
