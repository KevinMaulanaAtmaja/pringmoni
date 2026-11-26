export const REFUND_LIMIT_DAYS = 3

export const REFUND_LIMIT_MS = REFUND_LIMIT_DAYS * 24 * 60 * 60 * 1000

export function isRefundWithinLimit(
  createdAt: Date | string,
  now: number = Date.now()
): boolean {
  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt
  return now - created.getTime() <= REFUND_LIMIT_MS
}
