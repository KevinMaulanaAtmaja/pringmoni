export const HASIL_STORAGE_KEY = "pringmoni-reservasi-terakhir"

export interface HasilReservasi {
  reservasiId: number
  kodeReservasi: string
  namaPelanggan?: string
  dpNominal: number
  subtotalHarga: number
  diskonVoucher: number
  voucherKode: string | null
  totalHarga: number
  sisaTagihan: number
  batasKonfirmasi: string
  waktuKedatangan?: string
  jumlahOrang?: number
  nomorMeja?: string
  statusReservasi?: string
  dpStatus?: string
}
