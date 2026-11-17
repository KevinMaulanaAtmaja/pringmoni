import { consumeRateLimit } from "@/lib/rate-limiter"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MODEL = "whisper-large-v3-turbo"
const ENDPOINT = "https://api.groq.com/openai/v1/audio/transcriptions"
const UKURAN_MAKS = 25 * 1024 * 1024
const TIMEOUT_MS = 60_000

function responsError(pesan: string, status: number): Response {
  return Response.json({ error: pesan }, { status })
}

export async function POST(request: Request): Promise<Response> {
  try {
    const form = await request.formData().catch(() => null)
    if (!form) {
      return responsError("Body harus berupa FormData", 400)
    }

    const tokenMeja = typeof form.get("tokenMeja") === "string" ? String(form.get("tokenMeja")).trim() : ""
    if (!tokenMeja) {
      return responsError("tokenMeja wajib diisi", 400)
    }

    const audio = form.get("audio")
    if (!(audio instanceof Blob)) {
      return responsError("File audio wajib diunggah", 400)
    }
    if (audio.size === 0 || audio.size > UKURAN_MAKS) {
      return responsError("Ukuran audio harus 1 byte..25 MB", 400)
    }
    if (audio.type && !audio.type.startsWith("audio/")) {
      return responsError("Jenis file harus audio", 400)
    }

    const hasilLimit = consumeRateLimit(tokenMeja, "transcribe")
    if (!hasilLimit.allowed) {
      return Response.json(
        { error: "Terlalu banyak unggahan audio", retryAfterDetik: hasilLimit.retryAfterDetik },
        {
          status: 429,
          headers: { "Retry-After": String(hasilLimit.retryAfterDetik) },
        }
      )
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return responsError("Transkripsi audio belum tersedia. Silakan ketik manual.", 503)
    }

    const body = new FormData()
    body.append("file", audio, "audio.webm")
    body.append("model", MODEL)
    body.append("language", "id")
    body.append("response_format", "json")

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    })

    if (!response.ok) {
      return responsError(`Layanan transkripsi gagal dengan status ${response.status}`, 502)
    }

    const data = await response.json() as { text?: unknown }
    const teks = typeof data.text === "string" ? data.text.trim().slice(0, 500) : ""
    if (!teks) {
      return responsError("Transkripsi tidak menghasilkan teks", 502)
    }

    return Response.json({ transkrip: teks })
  } catch (error) {
    console.error("POST /api/transcribe gagal:", error)
    return responsError("Gagal memproses audio", 500)
  }
}
