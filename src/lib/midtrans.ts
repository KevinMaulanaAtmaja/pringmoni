import Midtrans from "midtrans-client"
import crypto from "crypto"

const isProduction = process.env.NODE_ENV === "production"
const serverKey = process.env.MIDTRANS_SERVER_KEY || ""
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""

export const midtransSnap = new Midtrans.Snap({
  isProduction,
  serverKey,
  clientKey,
})

export const midtransCore = new Midtrans.CoreApi({
  isProduction,
  serverKey,
  clientKey,
})

export interface MidtransTransactionData {
  transaction_details: {
    order_id: string
    gross_amount: number
  }
  credit_card?: {
    secure: boolean
  }
  customer_details?: {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
  }
  item_details?: Array<{
    id: string
    price: number
    quantity: number
    name: string
  }>
  callbacks?: {
    finish: string
    error: string
    pending: string
  }
}

export async function createMidtransTransaction(data: MidtransTransactionData) {
  try {
    const transaction = await midtransSnap.createTransaction(data)
    return {
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    }
  } catch (error) {
    console.error("Midtrans Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create transaction",
    }
  }
}

export async function checkMidtransTransaction(transactionId: string): Promise<
  { success: true; data: Record<string, unknown> } | { success: false; error: string }
> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = await (midtransCore as any).transaction.status(transactionId) as Record<string, unknown>
    return { success: true, data: status }
  } catch (error) {
    console.error("Midtrans Status Check Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to check transaction" }
  }
}

export async function createCorePayment(data: {
  order_id: string
  gross_amount: number
  payment_type: "bank_transfer" | "qris"
  bank?: string
  customer_details?: { first_name?: string }
  item_details?: Array<{ id: string; price: number; quantity: number; name: string }>
}) {
  try {
    const parameter: Record<string, unknown> = {
      payment_type: data.payment_type,
      transaction_details: {
        order_id: data.order_id,
        gross_amount: data.gross_amount,
      },
      customer_details: data.customer_details,
      item_details: data.item_details,
    }

    if (data.payment_type === "bank_transfer") {
      parameter.bank_transfer = { bank: data.bank || "bca" }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (midtransCore as any).charge(parameter)
    return { success: true, data: response as Record<string, unknown> }
  } catch (error) {
    console.error("Midtrans Core Payment Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create payment",
    }
  }
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const computed = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex")
  return computed === signatureKey
}
