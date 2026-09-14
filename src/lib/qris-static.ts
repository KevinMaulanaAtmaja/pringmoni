export const QRIS_STATIC_URL = process.env.NEXT_PUBLIC_QRIS_STATIC_URL || ""

export function getQrisStaticUrl(): string {
  return QRIS_STATIC_URL
}