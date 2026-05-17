import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    const blob = await response.blob()

    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/png",
        "Content-Disposition": `attachment; filename="qris-pembayaran.png"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch QR code" }, { status: 502 })
  }
}
