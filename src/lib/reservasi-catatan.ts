export const ACARA_RESERVASI = [
  "Bukber",
  "Ulang Tahun",
  "Meeting",
  "Gathering",
  "Arisan",
  "Lamaran",
] as const

export type AcaraReservasi = (typeof ACARA_RESERVASI)[number]

export function gabungCatatanReservasi(
  acara: string | null | undefined,
  detail: string | null | undefined
): string | null {
  const a = acara?.trim() ?? ""
  const d = detail?.trim() ?? ""
  if (!a) return d || null
  if (!d) return a
  return `${a} — ${d}`
}

export function pisahCatatanReservasi(catatan: string | null | undefined): {
  acara: AcaraReservasi | null
  detail: string | null
} {
  const raw = catatan?.trim() ?? ""
  if (!raw) return { acara: null, detail: null }
  const [kepala, ...sisa] = raw.split(/\s+—\s+/)
  const acara = (ACARA_RESERVASI as readonly string[]).includes(kepala)
    ? (kepala as AcaraReservasi)
    : null
  if (!acara) return { acara: null, detail: raw }
  return { acara, detail: sisa.join(" — ") || null }
}
