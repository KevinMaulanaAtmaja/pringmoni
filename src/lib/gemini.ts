import type { KriteriaSaran } from "./spk/cbf"

const MODEL = "gemini-3.5-flash-lite"
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`
const TIMEOUT_MS = 15_000

const PROMPT = `Kamu adalah modul NLU untuk sistem rekomendasi menu restoran.
Tugasmu hanya mengubah transkrip Bahasa Indonesia menjadi kriteria terstruktur.
Jangan memilih menu, jangan menghasilkan menuId, jangan menebak stok, dan jangan menjawab di luar schema.
Artikan "panas/gerah/haus" sebagai keinginan minuman DINGIN, bukan suhu makanan.
Artikan "dingin/hujan" sebagai keinginan minuman HANGAT.
Gunakan rasa "segar" untuk kata seger/segar.
Berikan alasan singkat maksimal 160 karakter yang menjelaskan pemetaan kata ke kriteria.`

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    mood: {
      type: "string",
      enum: ["panas", "dingin", "lemas", "lapar", "diet", "butuh hiburan", "ingin eskrim", "netral"],
    },
    alasan: { type: "string" },
    kriteria: {
      type: "object",
      properties: {
        suhu: { type: "string", enum: ["dingin", "hangat", "netral"] },
        rasa: {
          type: "array",
          items: { type: "string", enum: ["manis", "gurih", "asam", "pedas", "pahit", "segar"] },
        },
        kategori: {
          type: "array",
          items: { type: "string", enum: ["Minuman", "Makanan", "Camilan", "Dessert", "Cafe", "Paket Ramadhan"] },
        },
        kepekatan: { type: "number", minimum: 0, maximum: 1 },
        energi: { type: "number", minimum: 0, maximum: 1 },
      },
      required: ["suhu", "rasa", "kategori", "kepekatan", "energi"],
    },
  },
  required: ["mood", "alasan", "kriteria"],
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> }
  }>
}

export interface HasilAnalisisGemini {
  mood: string
  alasan: string
  kriteria: KriteriaSaran
}

export class GeminiError extends Error {
  constructor(pesan: string) {
    super(pesan)
    this.name = "GeminiError"
  }
}

function clamp01(nilai: unknown, fallback: number): number {
  if (typeof nilai !== "number" || !Number.isFinite(nilai)) return fallback
  return Math.min(1, Math.max(0, nilai))
}

function daftarString(nilai: unknown): string[] {
  if (!Array.isArray(nilai)) return []
  return nilai
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, 40))
    .filter((item) => item.length > 0)
}

function validasiHasil(nilai: unknown): HasilAnalisisGemini {
  if (!nilai || typeof nilai !== "object") {
    throw new GeminiError("Respons Gemini bukan objek JSON")
  }

  const obj = nilai as Record<string, unknown>
  const kriteriaInput = obj.kriteria && typeof obj.kriteria === "object"
    ? obj.kriteria as Record<string, unknown>
    : {}

  const suhuMentah = typeof kriteriaInput.suhu === "string" ? kriteriaInput.suhu.toLowerCase() : "netral"
  const suhu = suhuMentah === "dingin" || suhuMentah === "hangat" || suhuMentah === "panas" || suhuMentah === "sejuk"
    ? (suhuMentah === "panas" ? "hangat" : suhuMentah === "sejuk" ? "dingin" : suhuMentah)
    : null

  return {
    mood: typeof obj.mood === "string" && obj.mood.trim() ? obj.mood.trim().slice(0, 80) : "netral",
    alasan: typeof obj.alasan === "string" ? obj.alasan.trim().slice(0, 200) : "",
    kriteria: {
      suhu,
      rasa: daftarString(kriteriaInput.rasa),
      kategori: daftarString(kriteriaInput.kategori),
      kepekatan: clamp01(kriteriaInput.kepekatan, 0.5),
      energi: clamp01(kriteriaInput.energi, 0.5),
    },
  }
}

export async function analisaKriteriaGemini(transkrip: string): Promise<HasilAnalisisGemini> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new GeminiError("GEMINI_API_KEY belum diisi")
  }

  const response = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: `${PROMPT}\n\nTranskrip: ${transkrip}` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0,
        maxOutputTokens: 512,
      },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new GeminiError(`Gemini gagal dengan status ${response.status}`)
  }

  const data = await response.json() as GeminiResponse
  const teks = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim()
  if (!teks) {
    throw new GeminiError("Gemini tidak mengembalikan teks")
  }

  try {
    return validasiHasil(JSON.parse(teks))
  } catch (error) {
    if (error instanceof GeminiError) throw error
    throw new GeminiError("Respons Gemini bukan JSON yang valid")
  }
}
