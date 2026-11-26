import { getMejaByToken, getMenusForCustomer } from "@/app/actions/pesanan"
import { analisaKriteriaGemini } from "@/lib/gemini"
import { analisaMoodFallback } from "@/lib/mood-fallback"
import { consumeRateLimit } from "@/lib/rate-limiter"
import { rankingHybrid, type MenuPenilaian } from "@/lib/spk/scoring"
import type { KriteriaSaran } from "@/lib/spk/cbf"
import type { VoiceRecommendation } from "@/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface PayloadValid {
  transkrip: string
  tokenMeja: string
}

function validasiPayload(body: unknown): PayloadValid | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Body harus berupa JSON" }
  }

  const obj = body as Record<string, unknown>
  const transkrip = typeof obj.transkrip === "string" ? obj.transkrip.trim() : ""
  const tokenMeja = typeof obj.tokenMeja === "string" ? obj.tokenMeja.trim() : ""

  if (transkrip.length < 1 || transkrip.length > 500) {
    return { error: "transkrip harus 1..500 karakter" }
  }
  if (!tokenMeja) {
    return { error: "tokenMeja wajib diisi" }
  }

  return { transkrip, tokenMeja }
}

function keMenuPenilaian(menus: Awaited<ReturnType<typeof getMenusForCustomer>>): MenuPenilaian[] {
  return menus.map((menu) => ({
    id: menu.id,
    namaMenu: menu.namaMenu,
    deskripsi: menu.deskripsi,
    kategori: menu.kategori,
    lokasi: menu.lokasi,
    pilihanSuhu: menu.pilihanSuhu,
    statusMenu: menu.statusMenu,
    stokManual: menu.porsiTersedia,
    deletedAt: null,
  }))
}

async function analisaTranskrip(transkrip: string): Promise<{ mood: string; alasan: string; kriteria: KriteriaSaran }> {
  try {
    return await analisaKriteriaGemini(transkrip)
  } catch (error) {
    const pesan = error instanceof Error ? error.message : String(error)
    console.warn("Gemini gagal, memakai fallback leksikon:", pesan)
    return analisaMoodFallback(transkrip)
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null)
    const payload = validasiPayload(body)
    if ("error" in payload) {
      return Response.json({ error: payload.error }, { status: 400 })
    }

    const hasilLimit = consumeRateLimit(payload.tokenMeja, "voice")
    if (!hasilLimit.allowed) {
      return Response.json(
        { error: "Terlalu banyak permintaan voice order", retryAfterDetik: hasilLimit.retryAfterDetik },
        {
          status: 429,
          headers: { "Retry-After": String(hasilLimit.retryAfterDetik) },
        }
      )
    }

    const meja = await getMejaByToken(payload.tokenMeja)
    if (!meja) {
      return Response.json({ error: "Token meja tidak valid" }, { status: 400 })
    }

    const katalog = keMenuPenilaian(await getMenusForCustomer())
    const analisis = await analisaTranskrip(payload.transkrip)
    const hasil: VoiceRecommendation = {
      mood: analisis.mood,
      alasan: analisis.alasan,
      rekomendasi: rankingHybrid(analisis.kriteria, katalog, { topN: 4 }),
    }

    return Response.json(hasil)
  } catch (error) {
    console.error("POST /api/rekomendasi gagal:", error)
    return Response.json({ error: "Gagal memproses rekomendasi" }, { status: 500 })
  }
}
