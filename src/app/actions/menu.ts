'use server';

import prisma from '@/lib/prisma';
import { KategoriMenu, LokasiMenu, StatusMenu } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { deleteAllMenuFotos } from './menu-foto';
import { createLog } from '@/lib/log';


export type MenuWithKategori = {
  id: number;
  namaMenu: string;
  deskripsi: string | null;
  harga: number;
  kategoriId: number;
  statusMenu: StatusMenu;
  stokManual?: number;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  kategori: KategoriMenu;
  fotoUrl: string | null;
  fotoUrls?: string[];
  adaResep?: boolean;
  resepLengkap?: boolean;
  porsiTersedia?: number;
  bahanPembatas?: string[];
};

export type CreateMenuInput = {
  namaMenu: string;
  deskripsi?: string;
  harga: number;
  kategoriId: number;
  statusMenu?: StatusMenu;
  stokManual?: number;
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
      stokManual: true,
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
    },
    orderBy: { createdAt: 'desc' },
  });
  return menus.map((m) => {
    return {
      ...m,
      harga: Number(m.harga),
      fotoUrl: m.menuFoto[0]?.fotoUrl || null,
      fotoUrls: m.menuFoto.map(f => f.fotoUrl),
      adaResep: false,
      resepLengkap: true,
      porsiTersedia: 0,
      bahanPembatas: [],
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

async function requireOwnerOrKitchen() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  if (session.user.role !== 'owner' && session.user.role !== 'kitchen') {
    throw new Error("Unauthorized")
  }
  return session
}

export async function createMenu(data: CreateMenuInput) {
  await requireOwnerOrKitchen()
  // Validation
  if (!data.namaMenu?.trim()) {
    return { error: "Nama menu wajib diisi" }
  }
  if (data.harga <= 0) {
    return { error: "Harga harus lebih dari 0" }
  }

  const stokManual = data.stokManual === undefined
    ? 0
    : Math.max(0, Math.floor(Number(data.stokManual)))
  const statusMenu = data.statusMenu && data.statusMenu !== 'nonaktif'
    ? (stokManual > 0 ? 'tersedia' : 'habis')
    : (data.statusMenu || 'tersedia')

  const menu = await prisma.menu.create({
    data: {
      namaMenu: data.namaMenu,
      deskripsi: data.deskripsi,
      harga: new Prisma.Decimal(data.harga),
      kategoriId: data.kategoriId,
      statusMenu,
      stokManual,
    },
  });
  revalidatePath('/dashboard/menu');
  // Jangan return row Prisma mentah: `harga` bertipe Decimal dan tidak bisa
  // diserialisasi ke Client Component ("Decimal objects are not supported").
  return { id: menu.id };
}

export async function updateMenu(data: UpdateMenuInput) {
  await requireOwnerOrKitchen()
  const { id, namaMenu, deskripsi, kategoriId, statusMenu, harga, stokManual } = data;

  // Validation
  if (namaMenu !== undefined && !namaMenu?.trim()) {
    return { error: "Nama menu tidak boleh kosong" }
  }
  if (harga !== undefined && harga <= 0) {
    return { error: "Harga harus lebih dari 0" }
  }

  const nextStok = stokManual !== undefined
    ? Math.max(0, Math.floor(Number(stokManual)))
    : undefined
  const nextStatus = statusMenu && statusMenu !== 'nonaktif' && nextStok !== undefined
    ? (nextStok > 0 ? 'tersedia' : 'habis')
    : statusMenu

  await prisma.menu.update({
    where: { id },
    data: {
      namaMenu,
      deskripsi,
      kategoriId,
      statusMenu: nextStatus,
      harga: harga !== undefined ? new Prisma.Decimal(harga) : undefined,
      stokManual: nextStok,
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

export async function updateStokMenuHarian(menuId: number, jumlah: number) {
  const session = await requireOwnerOrKitchen()
  if (jumlah < 0 || !Number.isInteger(jumlah)) {
    return { error: "Stok harus berupa angka tidak negatif" }
  }
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    select: { id: true, statusMenu: true, namaMenu: true },
  })
  if (!menu) return { error: "Menu tidak ditemukan" }
  if (menu.statusMenu === 'nonaktif') {
    return { error: "Menu nonaktif tidak bisa diatur stok hariannya" }
  }

  let statusMenu = menu.statusMenu
  if (jumlah > 0) {
    statusMenu = 'tersedia'
  } else {
    statusMenu = 'habis'
  }

  await prisma.menu.update({
    where: { id: menuId },
    data: { stokManual: jumlah, statusMenu },
  })

  await createLog('UPDATE_ORDER_STATUS', `Atur stok harian ${menu.namaMenu} menjadi ${jumlah}`, session.user.id ? parseInt(session.user.id) : undefined)

  revalidatePath('/dashboard/menu')
  revalidatePath('/dashboard')
  return { success: true }
}

async function applyStokHarian(jumlah: number, kategoriId?: number) {
  const session = await requireOwnerOrKitchen()
  if (jumlah < 0 || !Number.isInteger(jumlah)) {
    return { error: "Stok harus berupa angka tidak negatif" }
  }

  let kategoriNama = ''
  if (kategoriId !== undefined) {
    const kategori = await prisma.kategoriMenu.findFirst({
      where: { id: kategoriId, deletedAt: null },
      select: { namaKategori: true },
    })
    if (!kategori) {
      return { error: "Kategori tidak ditemukan" }
    }
    kategoriNama = kategori.namaKategori
  }

  const where: Prisma.MenuWhereInput = {
    deletedAt: null,
    statusMenu: { not: 'nonaktif' },
    ...(kategoriId !== undefined ? { kategoriId } : {}),
  }

  await prisma.menu.updateMany({
    where,
    data: {
      stokManual: jumlah,
      statusMenu: jumlah > 0 ? 'tersedia' : 'habis',
    },
  })

  const target = kategoriId !== undefined
    ? `kategori ${kategoriNama}`
    : 'semua menu (nonaktif dikecualikan)'

  await createLog('UPDATE_ORDER_STATUS', `Atur stok harian ${target} menjadi ${jumlah}`, session.user.id ? parseInt(session.user.id) : undefined)

  revalidatePath('/dashboard/menu')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function setAllStokMenuHarian(jumlah: number) {
  return applyStokHarian(jumlah)
}

export async function setStokMenuHarianByKategori(kategoriId: number, jumlah: number) {
  return applyStokHarian(jumlah, kategoriId)
}
