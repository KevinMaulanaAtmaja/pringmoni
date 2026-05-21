import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const orderId = body.order_id as string
    const statusCode = body.status_code as string
    const grossAmount = body.gross_amount as string
    const signatureKey = body.signature_key as string
    const transactionStatus = body.transaction_status as string
    const fraudStatus = body.fraud_status as string

    if (!orderId || !statusCode || !grossAmount || !signatureKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || ""
    const computedHash = crypto
      .createHash("sha512")
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest("hex")

    if (computedHash !== signatureKey) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    const uuid = orderId.replace("PRING-", "")
    const pesanan = await prisma.pesanan.findFirst({
      where: { midtransOrderId: uuid },
    })

    if (!pesanan) {
      return NextResponse.json({ error: "Pesanan not found" }, { status: 404 })
    }

    const isSuccess =
      transactionStatus === "capture" ||
      transactionStatus === "settlement"

    const isExpired =
      transactionStatus === "expire" ||
      transactionStatus === "cancel" ||
      transactionStatus === "deny"

    // Skip if already paid (e.g. cashier processed Tunai after customer chose QRIS/TF)
    if (pesanan.statusPembayaran !== "menunggu") {
      return NextResponse.json({ ok: true, note: "already processed" })
    }

    if (isSuccess && fraudStatus === "accept") {
      await prisma.pesanan.update({
        where: { id: pesanan.id },
        data: {
          statusPembayaran: "berhasil",
          statusPesanan: "diproses",
          jumlahBayar: parseFloat(grossAmount),
          kembalian: 0,
        },
      })
    } else if (isExpired) {
      await prisma.pesanan.update({
        where: { id: pesanan.id },
        data: {
          statusPembayaran: "dibatalkan",
          statusPesanan: "dibatalkan",
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Midtrans callback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
