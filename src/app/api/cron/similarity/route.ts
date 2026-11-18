import { refreshMatriksSimilarity } from "@/lib/spk/refresh-similarity"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function terotentikasi(request: Request): boolean {
  const rahasia = process.env.CRON_SECRET
  if (!rahasia) return false

  const header = request.headers.get("authorization")
  const query = new URL(request.url).searchParams.get("secret")
  return header === `Bearer ${rahasia}` || query === rahasia
}

async function handler(request: Request): Promise<Response> {
  if (!terotentikasi(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const hasil = await refreshMatriksSimilarity()
    return Response.json({ ok: true, ...hasil })
  } catch (error) {
    console.error("Refresh similarity gagal:", error)
    return Response.json({ error: "Gagal menyegarkan matriks similarity" }, { status: 500 })
  }
}

export { handler as GET, handler as POST }
