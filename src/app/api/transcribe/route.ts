import { consumeRateLimit } from "@/lib/rate-limiter"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const GROQ_MODEL = "whisper-large-v3-turbo"
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/audio/transcriptions"
const GEMINI_MODEL = "gemini-3.5-flash-lite"
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const GEMINI_PROMPT = `Transkripsikan audio Bahasa Indonesia berikut menjadi teks apa adanya.
Kembalikan hanya teks transkrip tanpa penjelasan, tanpa awalan, dan tanpa tanda kutip.`
const UKURAN_MAKS = 25 * 1024 * 1024
const UKURAN_MAKS_GEMINI = 14 * 1024 * 1024
const TIMEOUT_MS = 60_000

type HasilTranskrip = { ok: true; teks: string } | { ok: false; pesan: string }

function responsError(pesan: string, status: number): Response {
  return Response.json({ error: pesan }, { status })
}

function bersihkanTeks(teks: string): string {
  return teks
    .trim()
    .replace(/^["'`]+/, "")
    .replace(/["'`]+$/, "")
    .trim()
    .slice(0, 500)
}

async function transkripsiGroq(audio: Blob, apiKey: string): Promise<HasilTranskrip> {
  const body = new FormData()
  body.append("file", audio, "audio.webm")
  body.append("model", GROQ_MODEL)
  body.append("language", "id")
  body.append("response_format", "json")

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  })

  if (!response.ok) {
    return { ok: false, pesan: `Layanan transkripsi Groq gagal dengan status ${response.status}` }
  }

  const data = await response.json() as { text?: unknown }
  const teks = typeof data.text === "string" ? bersihkanTeks(data.text) : ""
  if (!teks) return { ok: false, pesan: "Transkripsi Groq tidak menghasilkan teks" }

  return { ok: true, teks }
}

async function transkripsiGemini(audio: Blob, apiKey: string): Promise<HasilTranskrip> {
  const data = Buffer.from(await audio.arrayBuffer()).toString("base64")

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: GEMINI_PROMPT },
            { inlineData: { mimeType: audio.type || "audio/webm", data } },
          ],
        },
      ],
      generationConfig: { temperature: 0, maxOutputTokens: 300 },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  })

  if (!response.ok) {
    return { ok: false, pesan: `Layanan transkripsi Gemini gagal dengan status ${response.status}` }
  }

  const hasil = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>
  }
  const teks = bersihkanTeks(
    (hasil.candidates?.[0]?.content?.parts ?? [])
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join(" ")
  )
  if (!teks) return { ok: false, pesan: "Transkripsi Gemini tidak menghasilkan teks" }

  return { ok: true, teks }
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

    const groqKey = process.env.GROQ_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY
    if (!groqKey && !geminiKey) {
      return responsError("Transkripsi audio belum tersedia. Silakan ketik manual.", 503)
    }

    if (groqKey) {
      const hasil = await transkripsiGroq(audio, groqKey)
      if (hasil.ok) return Response.json({ transkrip: hasil.teks })
      if (!geminiKey) return responsError(hasil.pesan, 502)
    }

    if (geminiKey) {
      if (audio.size > UKURAN_MAKS_GEMINI) {
        return responsError("Audio terlalu besar untuk transkripsi Gemini (maksimal 14 MB). Silakan rekam lebih pendek.", 400)
      }
      const hasil = await transkripsiGemini(audio, geminiKey)
      if (hasil.ok) return Response.json({ transkrip: hasil.teks })
      return responsError(hasil.pesan, 502)
    }

    return responsError("Transkripsi audio belum tersedia. Silakan ketik manual.", 503)
  } catch (error) {
    console.error("POST /api/transcribe gagal:", error)
    return responsError("Gagal memproses audio", 500)
  }
}
