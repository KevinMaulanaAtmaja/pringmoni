export const ADMIN_FEE_TRANSFER = 4000
export const ADMIN_FEE_QRIS_PERSEN = 0.7

export function hitungAdminFee(metode: 'transfer' | 'qris', totalHarga: number): number {
  if (metode === 'transfer') return ADMIN_FEE_TRANSFER
  if (metode === 'qris') return Math.ceil(totalHarga * ADMIN_FEE_QRIS_PERSEN / 100)
  return 0
}
