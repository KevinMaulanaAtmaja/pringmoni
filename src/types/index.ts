export type RoleUser = 'owner' | 'cashier' | 'waiter'

export type TipeMeja = 'lesehan' | 'kursi'

export interface User {
  id: number
  username: string
  email?: string
  role: RoleUser
  status: boolean
}

export interface UserWithRole {
  id: number
  username: string
  email: string | null
  role: RoleUser
  status: boolean
  createdAt: Date
}

export interface CreateUserInput {
  username: string
  email?: string
  password: string
  role: RoleUser
}

export interface UpdateUserInput {
  id: number
  username: string
  email?: string
  role: RoleUser
  status: boolean
  password?: string
}

export interface UserResponse {
  success?: boolean
  error?: string
  data?: UserWithRole
}

export type StatusMeja = 'kosong' | 'terpakai'

export interface Meja {
  id: number
  nomorMeja: string
  tipeMeja: TipeMeja
  kapasitas: number
  tokenMeja?: string
  statusMeja: StatusMeja
}

export type StatusMenu = 'tersedia' | 'habis' | 'nonaktif'

export interface KategoriMenu {
  id: number
  namaKategori: string
}

export interface Menu {
  id: number
  namaMenu: string
  deskripsi: string | null
  harga: number
  kategoriId: number
  kategori?: KategoriMenu
  statusMenu: StatusMenu
  fotoUrl: string | null
}

// Type for customer menu display (returned by getMenusForCustomer)
export interface CustomerMenu {
  id: number
  namaMenu: string
  deskripsi: string | null
  harga: number
  kategori: string
  statusMenu: StatusMenu
  fotoUrl: string | null
  menuFoto?: { id: number; fotoUrl: string }[]
}

export type StatusPesanan = 'menunggu' | 'diproses' | 'selesai' | 'dibatalkan'
export type StatusBayar = 'menunggu' | 'berhasil' | 'dibatalkan'
export type MetodePembayaran = 'qris' | 'tunai' | 'transfer'

export interface DetailPesananItem {
  id: number
  menuId: number
  menuName: string
  jumlah: number
  hargaSaatPesan: number
  catatanItem: string | null
  fotoUrls?: string[]
}

export interface Pesanan {
  id: number
  mejaId: number
  meja?: Meja
  waiterId?: number
  kasirId?: number
  statusPesanan: StatusPesanan
  catatan: string | null
  namaPelanggan?: string | null
  totalHarga: number
  biayaAdmin?: number
  ppn?: number
  metodePembayaran?: MetodePembayaran
  jumlahBayar?: number
  kembalian: number
  statusPembayaran: StatusBayar
  createdAt: string
  detailPesanan: DetailPesananItem[]
}

export interface DashboardStats {
  totalPesananHariIni: number
  totalPendapatanHariIni?: number
  mejaTerpakai: number
  mejaKosong: number
  pesananMenunggu: number
}

// Laporan types
export type PeriodeLaporan = 'harian' | 'mingguan' | 'bulanan' | 'tahunan'

export interface ItemLaporanPesanan {
  id: number
  nomorMeja: string
  namaPelanggan: string | null
  totalHarga: number
  statusPesanan: string
  metodePembayaran: string | null
  statusPembayaran: string
  createdAt: Date | string
  kasirUsername: string | null
  waiterUsername: string | null
  items: Array<{
    namaMenu: string
    jumlah: number
    hargaSaatPesan: number
  }>
}

export interface LaporanPendapatan {
  periode: string
  label: string
  totalPendapatan: number
  totalPesanan: number
  totalItemTerjual: number
  tunai: number
  qris: number
  transfer: number
  rataRataPesanan: number
  detailPesanan: ItemLaporanPesanan[]
}

export interface MenuTerlaris {
  namaMenu: string
  kategori: string
  totalTerjual: number
  totalPendapatan: number
}

export interface LaporanMenuTerlaris {
  periode: string
  label: string
  menus: MenuTerlaris[]
}

export interface LaporanKasir {
  periode: string
  label: string
  daftarKasir: Array<{
    username: string
    totalTransaksi: number
    totalPendapatan: number
    tunai: number
    qris: number
    transfer: number
    rataRata: number
  }>
}

export interface LaporanSummary {
  harian: LaporanPendapatan
  mingguan: LaporanPendapatan
  bulanan: LaporanPendapatan
  tahunan: LaporanPendapatan
  menuTerlaris: MenuTerlaris[]
  laporanKasir: LaporanKasir
}

// Grafik & Perbandingan types
export interface GrafikPoint {
  label: string
  pendapatan: number
  pesanan: number
}

export interface PerbandinganData {
  periodeSebelumnya: string
  nominalSebelumnya: number
  nominalSekarang: number
  pesananSebelumnya: number
  pesananSekarang: number
  growthPendapatan: number
  growthPesanan: number
}

export interface KategoriAnalisis {
  namaKategori: string
  totalTerjual: number
  totalPendapatan: number
  persentase: number
}

export interface AnalisisTambahan {
  cancelRate: number
  totalBatal: number
  totalPesanan: number
  rataItemPerPesanan: number
}

export interface BandingData {
  label: string
  pendapatan: number
  pesanan: number
  itemTerjual: number
  rataRata: number
  tunai: number
  qris: number
  transfer: number
  cancelRate: number
  topMenu: MenuTerlaris[]
  grafik: GrafikPoint[]
}

// Stok Bahan types
export type KategoriBahan = 'bahan_utama' | 'bumbu'
export type SatuanStok = 'kg' | 'pcs' | 'pack'
export type StatusStok = 'tersedia' | 'menipis' | 'habis'
export type JenisPerubahanStok = 'restock' | 'penggunaan' | 'koreksi' | 'limbah'

export interface StokBahan {
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

export interface RiwayatStok {
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

export interface CreateStokBahanInput {
  namaBahan: string
  kategori: KategoriBahan
  stokQty: number
  satuan: SatuanStok
  stokMinimum: number
  hargaPerSatuan: number
  keterangan?: string
}

export interface UpdateStokBahanInput {
  id: number
  namaBahan: string
  kategori: KategoriBahan
  stokQty: number
  satuan: SatuanStok
  stokMinimum: number
  hargaPerSatuan: number
  statusStok: StatusStok
  keterangan?: string
}