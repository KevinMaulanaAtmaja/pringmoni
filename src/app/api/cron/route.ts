import { NextResponse } from "next/server"
import { autoCancelStaleUnpaid } from "@/app/actions/dashboard"
import { sweepTengahMalam } from "@/app/actions/notifikasi"
import { expireReservasiLazy } from "@/lib/reservasi"

const CRON_SECRET = process.env.CRON_SECRET

export const runtime = "nodejs"

export async function GET(req: Request) {
  const secret = req.headers.get("authorization")
  const expected = CRON_SECRET ? `Bearer ${CRON_SECRET}` : undefined
  if (!CRON_SECRET || secret !== expected) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const hariIni = new Date()
    hariIni.setHours(0, 0, 0, 0)

    const [cancelOrder, sweep, reservasi] = await Promise.all([
      autoCancelStaleUnpaid(),
      sweepTengahMalam(hariIni),
      expireReservasiLazy(),
    ])

    return NextResponse.json({
      ok: true,
      cancelOrder,
      sweep,
      reservasi,
      ranAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("cron expiry error:", error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
