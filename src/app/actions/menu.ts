'use server';

import prisma from '@/lib/prisma';
import { KategoriMenu, StatusMenu } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

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
    include: { kategori: true },
    orderBy: { createdAt: 'desc' },
  });
  return menus.map((m) => ({
    ...m,
    harga: Number(m.harga),
  }));
}

export async function getKategoriMenus(): Promise<KategoriMenu[]> {
  return prisma.kategoriMenu.findMany({
    where: { deletedAt: null },
    orderBy: { namaKategori: 'asc' },
  });
}

export async function createMenu(data: CreateMenuInput) {
  await prisma.menu.create({
    data: {
      namaMenu: data.namaMenu,
      deskripsi: data.deskripsi,
      harga: new Prisma.Decimal(data.harga),
      kategoriId: data.kategoriId,
      statusMenu: data.statusMenu || 'tersedia',
    },
  });
  revalidatePath('/dashboard/menu');
}

export async function updateMenu(data: UpdateMenuInput) {
  const { id, ...rest } = data;
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
  await prisma.menu.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath('/dashboard/menu');
}

export async function toggleStatusMenu(id: number, status: StatusMenu) {
  await prisma.menu.update({
    where: { id },
    data: { statusMenu: status },
  });
  revalidatePath('/dashboard/menu');
}
