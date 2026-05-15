import Midtrans from "midtrans-client"

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

export async function checkMidtransTransaction(transactionId: string) {
  try {
    // @ts-expect-error - Midtrans client API types are incomplete
    const status = await midtransCore.transaction.status(transactionId)
    return {
      success: true,
      data: status,
    }
  } catch (error) {
    console.error("Midtrans Status Check Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check transaction",
    }
  }
}
