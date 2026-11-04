'use server';

import prisma from '@/lib/prisma';
import { StatusVoucher } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { createLog } from '@/lib/log';
import { hitungPotonganDiskon } from '@/lib/voucher';

export type VoucherWithUsage = {
  id: number;
  kode: string;
  namaVoucher: string;
  deskripsi: string | null;
  diskonPersen: number;
  minimalBelanja: number;
  statusVoucher: StatusVoucher;
  createdAt: Date;
  updatedAt: Date | null;
  jumlahDipakai: number;
};

/** Bentuk voucher yang dikirim ke sisi customer (tanpa data internal). */
export type VoucherPublik = {
  id: number;
  kode: string;
  namaVoucher: string;
  deskripsi: string | null;
  diskonPersen: number;
  minimalBelanja: number;
};

export type VoucherInput = {
  kode: string;
  namaVoucher: string;
  deskripsi?: string | null;
  diskonPersen: number;
  minimalBelanja: number;
  statusVoucher?: StatusVoucher;
};

export type HasilValidasiVoucher = {
  valid: boolean;
  error?: string;
  kode?: string;
  namaVoucher?: string;
  diskonPersen?: number;
  minimalBelanja?: number;
  potongan?: number;
};

async function requireOwner() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'owner') {
    throw new Error('Unauthorized');
  }
}

function normalisasiKode(kode: string): string {
  return kode.trim().toUpperCase();
}

function validasiInput(data: VoucherInput): string | null {
  if (!data.kode?.trim()) return 'Kode voucher wajib diisi';
  if (data.kode.trim().length > 30) return 'Kode voucher maksimal 30 karakter';
  if (!data.namaVoucher?.trim()) return 'Nama voucher wajib diisi';
  if (data.namaVoucher.trim().length > 100) return 'Nama voucher maksimal 100 karakter';
  if (!Number.isInteger(data.diskonPersen) || data.diskonPersen < 1 || data.diskonPersen > 100) {
    return 'Diskon harus berupa bilangan bulat antara 1 sampai 100';
  }
  if (!Number.isFinite(data.minimalBelanja) || data.minimalBelanja < 0) {
    return 'Minimal belanja tidak boleh negatif';
  }
  return null;
}

/** Daftar voucher untuk halaman management owner. */
export async function getVoucherList(): Promise<VoucherWithUsage[]> {
  await requireOwner();
  const vouchers = await prisma.voucher.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { pesanan: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return vouchers.map((v) => ({
    id: v.id,
    kode: v.kode,
    namaVoucher: v.namaVoucher,
    deskripsi: v.deskripsi,
    diskonPersen: v.diskonPersen,
    minimalBelanja: Number(v.minimalBelanja),
    statusVoucher: v.statusVoucher,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
    jumlahDipakai: v._count.pesanan,
  }));
}

/** Voucher aktif yang bisa dipilih customer (publik, tanpa auth). */
export async function getVoucherAktif(): Promise<VoucherPublik[]> {
  const vouchers = await prisma.voucher.findMany({
    where: { deletedAt: null, statusVoucher: 'aktif' },
    select: {
      id: true,
      kode: true,
      namaVoucher: true,
      deskripsi: true,
      diskonPersen: true,
      minimalBelanja: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return vouchers.map((v) => ({
    ...v,
    minimalBelanja: Number(v.minimalBelanja),
  }));
}

/**
 * Validasi kode voucher untuk customer.
 * Validasi minimum belanja dan perhitungan diskon selalu diulang di server
 * ketika pesanan dibuat, nilai dari client tidak pernah dipercaya.
 */
export async function validateVoucher(kode: string, subtotal: number): Promise<HasilValidasiVoucher> {
  const kodeNormal = normalisasiKode(kode || '');
  if (!kodeNormal) {
    return { valid: false, error: 'Kode voucher tidak boleh kosong' };
  }

  const voucher = await prisma.voucher.findFirst({
    where: { kode: kodeNormal, deletedAt: null },
  });

  if (!voucher) {
    return { valid: false, error: 'Kode voucher tidak ditemukan' };
  }
  if (voucher.statusVoucher !== 'aktif') {
    return { valid: false, error: 'Voucher sedang tidak aktif' };
  }
  if (subtotal < Number(voucher.minimalBelanja)) {
    return {
      valid: false,
      error: `Minimal belanja voucher ini Rp ${Number(voucher.minimalBelanja).toLocaleString('id-ID')}`,
    };
  }

  return {
    valid: true,
    kode: voucher.kode,
    namaVoucher: voucher.namaVoucher,
    diskonPersen: voucher.diskonPersen,
    minimalBelanja: Number(voucher.minimalBelanja),
    potongan: hitungPotonganDiskon(subtotal, voucher.diskonPersen),
  };
}

export async function createVoucher(data: VoucherInput) {
  await requireOwner();

  const error = validasiInput(data);
  if (error) return { error };

  const kode = normalisasiKode(data.kode);
  const existing = await prisma.voucher.findUnique({ where: { kode } });

  if (existing && !existing.deletedAt) {
    return { error: 'Kode voucher sudah digunakan' };
  }

  const dataSimpan = {
    kode,
    namaVoucher: data.namaVoucher.trim(),
    deskripsi: data.deskripsi?.trim() || null,
    diskonPersen: data.diskonPersen,
    minimalBelanja: data.minimalBelanja,
    statusVoucher: data.statusVoucher ?? ('aktif' as StatusVoucher),
  };

  const voucher = existing
    ? await prisma.voucher.update({
        where: { id: existing.id },
        data: { ...dataSimpan, deletedAt: null },
      })
    : await prisma.voucher.create({ data: dataSimpan });

  await createLog(
    'MANAGE_VOUCHER',
    `Membuat voucher ${voucher.kode} (${voucher.diskonPersen}%, min Rp ${Number(voucher.minimalBelanja).toLocaleString('id-ID')})`
  );

  revalidatePath('/dashboard/menu');
  revalidatePath('/', 'layout');
  return { success: true, id: voucher.id };
}

export async function updateVoucher(id: number, data: VoucherInput) {
  await requireOwner();

  const error = validasiInput(data);
  if (error) return { error };

  const kode = normalisasiKode(data.kode);
  const bentrok = await prisma.voucher.findFirst({
    where: { kode, id: { not: id }, deletedAt: null },
  });
  if (bentrok) {
    return { error: 'Kode voucher sudah digunakan' };
  }

  const voucher = await prisma.voucher.update({
    where: { id },
    data: {
      kode,
      namaVoucher: data.namaVoucher.trim(),
      deskripsi: data.deskripsi?.trim() || null,
      diskonPersen: data.diskonPersen,
      minimalBelanja: data.minimalBelanja,
      ...(data.statusVoucher ? { statusVoucher: data.statusVoucher } : {}),
    },
  });

  await createLog('MANAGE_VOUCHER', `Mengubah voucher ${voucher.kode}`);

  revalidatePath('/dashboard/menu');
  revalidatePath('/', 'layout');
  return { success: true, id: voucher.id };
}

export async function setStatusVoucher(id: number, status: StatusVoucher) {
  await requireOwner();

  const voucher = await prisma.voucher.update({
    where: { id },
    data: { statusVoucher: status },
  });

  await createLog(
    'MANAGE_VOUCHER',
    `Mengubah status voucher ${voucher.kode} menjadi ${status}`
  );

  revalidatePath('/dashboard/menu');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteVoucher(id: number) {
  await requireOwner();

  const voucher = await prisma.voucher.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createLog('MANAGE_VOUCHER', `Menghapus voucher ${voucher.kode}`);

  revalidatePath('/dashboard/menu');
  revalidatePath('/', 'layout');
  return { success: true };
}
