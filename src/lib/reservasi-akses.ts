/**
 * Link reservasi umum (bukan per meja).
 * Kode ini memang publik dan boleh dibagikan lewat IG/WA/kasir.
 * Customer memilih sendiri meja yang masih kosong dari daftar.
 */
export const KODE_AKSES_RESERVASI = "PRINGSEWU26"

export const LINK_RESERVASI_PUBLIK = `/reservasi/${KODE_AKSES_RESERVASI}`

export function normalisasiKodeAkses(kode: string): string {
  return (kode || "").trim().toUpperCase()
}

export function kodeAksesValid(kode: string): boolean {
  return normalisasiKodeAkses(kode) === KODE_AKSES_RESERVASI
}
