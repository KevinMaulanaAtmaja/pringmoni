export type RoleUser = 'owner' | 'cashier' | 'waiter'

export type TipeMeja = 'lesehan' | 'kursi'

export interface User {
  id: number
  username: string
  email?: string
  role: RoleUser
  status: boolean
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
// Backend type (sync with Prisma)
export type MetodePembayaran = 'qris' | 'tunai'
// Frontend display only (3 metode)
export type MetodePembayaranFrontend = 'tunai' | 'transfer' | 'qris'

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
  totalHarga: number
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