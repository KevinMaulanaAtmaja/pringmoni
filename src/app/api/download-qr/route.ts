import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")
  const mode = searchParams.get("mode") || "download"

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  try {
    const parsed = new URL(url)

    const allowedHosts = [
      "api.midtrans.com",
      "api.sandbox.midtrans.com",
      "api.sandbox.veritrans.co.id",
      "merchants-app.midtrans.com",
      "merchants-app.sbx.midtrans.com",
      "api.qrserver.com",
    ]
    if (!allowedHosts.includes(parsed.hostname)) {
      return NextResponse.json({ error: "Domain tidak diizinkan" }, { status: 403 })
    }

    const response = await fetch(url)

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: `Midtrans error: ${text}` }, { status: response.status })
    }

    const blob = await response.blob()

    const headers: Record<string, string> = {
      "Content-Type": response.headers.get("Content-Type") || "image/png",
    }

    if (mode !== "inline") {
      headers["Content-Disposition"] = `attachment; filename="qris-pembayaran.png"`
    }

    return new NextResponse(blob, { headers })
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch QR code" }, { status: 502 })
  }
}
