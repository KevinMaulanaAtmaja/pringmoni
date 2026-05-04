'use server';

import prisma from '@/lib/prisma';
import { KategoriMenu, StatusMenu } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { deleteAllMenuFotos } from './menu-foto';

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
  const menus = await prisma.menu.findMany({
    where: { deletedAt: null },
    include: { kategori: true, menuFoto: true },
    orderBy: { createdAt: 'desc' },
  });
  return menus.map((m) => ({
    ...m,
    harga: Number(m.harga),
    fotoUrl: m.menuFoto[0]?.fotoUrl || null,
    fotoUrls: m.menuFoto.map(f => f.fotoUrl),
  }));
}

export async function getKategoriMenus(): Promise<KategoriMenu[]> {
  return prisma.kategoriMenu.findMany({
    where: { deletedAt: null },
    orderBy: { namaKategori: 'asc' },
  });
}

export async function createMenu(data: CreateMenuInput) {
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
  return menu;
}

export async function updateMenu(data: UpdateMenuInput) {
  const { id, ...rest } = data;
  
  // Validation
  if (rest.namaMenu !== undefined && !rest.namaMenu?.trim()) {
    return { error: "Nama menu tidak boleh kosong" }
  }
  if (rest.harga !== undefined && rest.harga <= 0) {
    return { error: "Harga harus lebih dari 0" }
  }
  
  await prisma.menu.update({
    where: { id },
    data: {
      ...rest,
      harga: rest.harga !== undefined ? new Prisma.Decimal(rest.harga) : undefined,
    },
  });
  revalidatePath('/dashboard/menu');
}

export async function deleteMenu(id: number) {
  // Delete all associated photos first
  await deleteAllMenuFotos(id);
  
  await prisma.menu.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath('/dashboard/menu');
  return { success: true }
}

export async function toggleStatusMenu(id: number, status: StatusMenu) {
  await prisma.menu.update({
    where: { id },
    data: { statusMenu: status },
  });
  revalidatePath('/dashboard/menu');
}

export async function createKategori(data: { namaKategori: string }) {
  await prisma.kategoriMenu.create({
    data: { namaKategori: data.namaKategori },
  });
  revalidatePath('/dashboard/menu');
  return { success: true };
}

export async function updateKategori(id: number, data: { namaKategori: string }) {
  await prisma.kategoriMenu.update({
    where: { id },
    data: { namaKategori: data.namaKategori },
  });
  revalidatePath('/dashboard/menu');
  return { success: true };
}

export async function deleteKategori(id: number) {
  const menuExists = await prisma.menu.findFirst({
    where: { kategoriId: id, deletedAt: null },
  });

  if (menuExists) {
    return { error: "Kategori masih digunakan oleh menu aktif" };
  }

  await prisma.kategoriMenu.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath('/dashboard/menu');
  return { success: true };
}
