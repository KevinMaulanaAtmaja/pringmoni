export interface UserFixture {
  id: number
  username: string
  email: string
  password: string
  role: string
  status: boolean
  sessionVersion: number
  lastLoginAt: Date | null
  lastSeenAt: Date | null
  lastLoginDevice: string | null
}

export interface MejaFixture {
  id: number
  nomorMeja: string
  kapasitas: number
  tokenMeja: string
  statusMeja: string
  deletedAt: Date | null
}

export interface KategoriMenuFixture {
  id: number
  namaKategori: string
  lokasi: string
  icon: string | null
  pilihanSuhu: boolean
  deletedAt: Date | null
}

export interface MenuFixture {
  id: number
  namaMenu: string
  harga: number
  kategoriId: number
  statusMenu: string
  stokManual: number
  deskripsi: string | null
  deletedAt: Date | null
}

export interface PesananFixture {
  id: number
  publicId: string
  mejaId: number
  kasirId: number | null
  shiftId: number | null
  voucherId: number | null
  statusPesanan: string
  statusPembayaran: string
  metodePembayaran: string | null
  totalHarga: number
  diskonVoucher: number
  jumlahBayar: number | null
  kembalian: number | null
  biayaAdmin: number | null
  ppn: number | null
  midtransOrderId: string | null
  namaPelanggan: string | null
  catatan: string | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface DetailPesananFixture {
  id: number
  pesananId: number
  menuId: number
  jumlah: number
  hargaSaatPesan: number
  catatanItem: string | null
  statusItem: string
}

export interface VoucherFixture {
  id: number
  kode: string
  namaVoucher: string
  diskonPersen: number
  minimalBelanja: number
  statusVoucher: string
  deletedAt: Date | null
}

export interface JadwalShiftFixture {
  id: number
  nama: string
  jamMulai: number
  jamSelesai: number
  tanggal: Date
  kasirId: number | null
}

export interface ShiftKasirFixture {
  id: number
  kasirId: number
  jadwalShiftId: number | null
  tanggal: Date
  waktuMasuk: Date
  waktuKeluar: Date | null
  uangAwal: number
  uangAkhir: number | null
  totalTransaksi: number
  totalPendapatan: number
  totalTunai: number
  totalNonTunai: number
  selisihKas: number | null
  statusShift: string
  keterangan: string | null
  autoClosed: boolean
  sumberShiftId: number | null
}

export interface KasKeluarFixture {
  id: number
  shiftId: number
  userId: number
  nominal: number
  keterangan: string
  createdAt: Date
}

export interface StokBahanFixture {
  id: number
  namaBahan: string
  tipe: string
  kategori: string
  stokQty: number
  satuan: string
  stokMinimum: number
  hargaPerSatuan: number
  statusStok: string
  keterangan: string | null
  deletedAt: Date | null
}

export interface RiwayatStokFixture {
  id: number
  stokBahanId: number
  stokSebelum: number
  stokSesudah: number
  jumlahPerubahan: number
  jenisPerubahan: string
  keterangan: string | null
  userId: number | null
  createdAt: Date
}

const tanggal = new Date('2026-11-05T10:00:00+07:00')

export function userFixture(overrides: Partial<UserFixture> = {}): UserFixture {
  return {
    id: 1,
    username: 'owner',
    email: 'owner@pringmoni.test',
    password: 'hashed-password',
    role: 'owner',
    status: true,
    sessionVersion: 1,
    lastLoginAt: null,
    lastSeenAt: null,
    lastLoginDevice: null,
    ...overrides,
  }
}

export function mejaFixture(overrides: Partial<MejaFixture> = {}): MejaFixture {
  return {
    id: 1,
    nomorMeja: 'K01',
    kapasitas: 4,
    tokenMeja: 'TOKEN01',
    statusMeja: 'kosong',
    deletedAt: null,
    ...overrides,
  }
}

export function kategoriMenuFixture(
  overrides: Partial<KategoriMenuFixture> = {}
): KategoriMenuFixture {
  return {
    id: 1,
    namaKategori: 'Makanan',
    lokasi: 'dapur',
    icon: null,
    pilihanSuhu: false,
    deletedAt: null,
    ...overrides,
  }
}

export function menuFixture(overrides: Partial<MenuFixture> = {}): MenuFixture {
  return {
    id: 1,
    namaMenu: 'Nasi Goreng',
    harga: 25000,
    kategoriId: 1,
    statusMenu: 'tersedia',
    stokManual: 10,
    deskripsi: null,
    deletedAt: null,
    ...overrides,
  }
}

export function pesananFixture(overrides: Partial<PesananFixture> = {}): PesananFixture {
  return {
    id: 1,
    publicId: 'public-order-1',
    mejaId: 1,
    kasirId: null,
    shiftId: null,
    voucherId: null,
    statusPesanan: 'menunggu',
    statusPembayaran: 'menunggu',
    metodePembayaran: null,
    totalHarga: 25000,
    diskonVoucher: 0,
    jumlahBayar: null,
    kembalian: null,
    biayaAdmin: 0,
    ppn: 0,
    midtransOrderId: null,
    namaPelanggan: 'Budi',
    catatan: null,
    deletedAt: null,
    createdAt: tanggal,
    updatedAt: tanggal,
    ...overrides,
  }
}

export function detailPesananFixture(
  overrides: Partial<DetailPesananFixture> = {}
): DetailPesananFixture {
  return {
    id: 1,
    pesananId: 1,
    menuId: 1,
    jumlah: 1,
    hargaSaatPesan: 25000,
    catatanItem: null,
    statusItem: 'menunggu',
    ...overrides,
  }
}

export function voucherFixture(overrides: Partial<VoucherFixture> = {}): VoucherFixture {
  return {
    id: 1,
    kode: 'HEMAT10',
    namaVoucher: 'Hemat 10%',
    diskonPersen: 10,
    minimalBelanja: 50000,
    statusVoucher: 'aktif',
    deletedAt: null,
    ...overrides,
  }
}

export function jadwalShiftFixture(
  overrides: Partial<JadwalShiftFixture> = {}
): JadwalShiftFixture {
  return {
    id: 1,
    nama: 'Pagi',
    jamMulai: 480,
    jamSelesai: 960,
    tanggal,
    kasirId: null,
    ...overrides,
  }
}

export function shiftKasirFixture(
  overrides: Partial<ShiftKasirFixture> = {}
): ShiftKasirFixture {
  return {
    id: 1,
    kasirId: 2,
    jadwalShiftId: null,
    tanggal,
    waktuMasuk: tanggal,
    waktuKeluar: null,
    uangAwal: 100000,
    uangAkhir: null,
    totalTransaksi: 0,
    totalPendapatan: 0,
    totalTunai: 0,
    totalNonTunai: 0,
    selisihKas: null,
    statusShift: 'ACTIVE',
    keterangan: null,
    autoClosed: false,
    sumberShiftId: null,
    ...overrides,
  }
}

export function kasKeluarFixture(overrides: Partial<KasKeluarFixture> = {}): KasKeluarFixture {
  return {
    id: 1,
    shiftId: 1,
    userId: 2,
    nominal: 10000,
    keterangan: 'Beli es',
    createdAt: tanggal,
    ...overrides,
  }
}

export function stokBahanFixture(
  overrides: Partial<StokBahanFixture> = {}
): StokBahanFixture {
  return {
    id: 1,
    namaBahan: 'Beras',
    tipe: 'gudang',
    kategori: 'bahan_utama',
    stokQty: 50,
    satuan: 'kg',
    stokMinimum: 10,
    hargaPerSatuan: 12000,
    statusStok: 'tersedia',
    keterangan: null,
    deletedAt: null,
    ...overrides,
  }
}

export function riwayatStokFixture(
  overrides: Partial<RiwayatStokFixture> = {}
): RiwayatStokFixture {
  return {
    id: 1,
    stokBahanId: 1,
    stokSebelum: 40,
    stokSesudah: 50,
    jumlahPerubahan: 10,
    jenisPerubahan: 'restock',
    keterangan: null,
    userId: 1,
    createdAt: tanggal,
    ...overrides,
  }
}
