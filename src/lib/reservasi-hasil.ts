export const HASIL_STORAGE_KEY = "pringmoni-reservasi-terakhir"
export const HASIL_STORAGE_TTL_MS = 24 * 60 * 60 * 1000

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

interface HasilReservasiEnvelope {
  savedAt: number
  data: HasilReservasi
}

function isEnvelope(value: unknown): value is HasilReservasiEnvelope {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return typeof v.savedAt === "number" && !!v.data && typeof v.data === "object"
}

export function simpanHasilReservasi(data: HasilReservasi): void {
  try {
    const payload: HasilReservasiEnvelope = { savedAt: Date.now(), data }
    sessionStorage.setItem(HASIL_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* sessionStorage tidak tersedia */
  }
}

export function ambilHasilReservasi(): HasilReservasi | null {
  try {
    const tersimpan = sessionStorage.getItem(HASIL_STORAGE_KEY)
    if (!tersimpan) return null

    const parsed = JSON.parse(tersimpan) as unknown

    if (isEnvelope(parsed)) {
      if (Date.now() - parsed.savedAt > HASIL_STORAGE_TTL_MS) {
        sessionStorage.removeItem(HASIL_STORAGE_KEY)
        return null
      }
      if (!parsed.data?.kodeReservasi) return null
      return parsed.data
    }

    // Format lama tanpa timestamp: hapus agar patuh batas penyimpanan 24 jam.
    sessionStorage.removeItem(HASIL_STORAGE_KEY)
    return null
  } catch {
    try {
      sessionStorage.removeItem(HASIL_STORAGE_KEY)
    } catch {
      /* abaikan */
    }
    return null
  }
}
