/**
 * Helper perhitungan diskon voucher (pure, aman dipakai client & server).
 */

/** Hitung nilai potongan diskon dalam rupiah (dibulatkan ke rupiah penuh). */
export function hitungPotonganDiskon(subtotal: number, diskonPersen: number): number {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return 0;
  const persen = Math.min(Math.max(diskonPersen, 0), 100);
  return Math.round((subtotal * persen) / 100);
}

/** Format nominal rupiah tanpa desimal untuk tampilan ringkas. */
export function formatRupiah(nilai: number): string {
  return `Rp ${Math.round(nilai).toLocaleString("id-ID")}`;
}
