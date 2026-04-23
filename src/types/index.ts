export type RoleUser = 'owner' | 'cashier' | 'waiter'

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
  deskripsi?: string
  harga: number
  kategoriId: number
  kategori?: KategoriMenu
  statusMenu: StatusMenu
  fotoUrl?: string
}

export type StatusPesanan = 'menunggu' | 'diproses' | 'selesai' | 'dibatalkan'
export type StatusBayar = 'menunggu' | 'berhasil' | 'dibatalkan'
export type MetodePembayaran = 'qris' | 'tunai'

export interface DetailPesananItem {
  id: number
  menuId: number
  menuName: string
  jumlah: number
  hargaSaatPesan: number
  catatanItem?: string
}

export interface Pesanan {
  id: number
  mejaId: number
  meja?: Meja
  waiterId?: number
  kasirId?: number
  statusPesanan: StatusPesanan
  catatan?: string
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