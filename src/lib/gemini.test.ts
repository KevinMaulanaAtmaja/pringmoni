import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { analisaKriteriaGemini, GeminiError } from "./gemini"

const apiKeyAwal = process.env.GEMINI_API_KEY

function responsGemini(teks: string, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => ({ candidates: [{ content: { parts: [{ text: teks }] } }] }),
  } as unknown as Response
}

describe("SPK - Gemini NLU", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key"
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    if (apiKeyAwal === undefined) {
      delete process.env.GEMINI_API_KEY
    } else {
      process.env.GEMINI_API_KEY = apiKeyAwal
    }
  })

  it("mengirim responseSchema dan mem-parsing kriteria", async () => {
    const fetchMock = vi.fn().mockResolvedValue(responsGemini(JSON.stringify({
      mood: "panas",
      alasan: "Kata panas berarti ingin dingin",
      kriteria: {
        suhu: "dingin",
        rasa: ["segar", "manis"],
        kategori: ["Minuman"],
        kepekatan: 0.2,
        energi: 0.3,
      },
    })))
    vi.stubGlobal("fetch", fetchMock)

    const hasil = await analisaKriteriaGemini("Aduh panas, enaknya yang seger")

    expect(hasil.mood).toBe("panas")
    expect(hasil.kriteria.suhu).toBe("dingin")
    expect(hasil.kriteria.rasa).toContain("segar")
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain("gemini-3.5-flash-lite:generateContent")
    const body = String(init.body)
    expect(body).toContain("responseSchema")
    expect(body).toContain("Aduh panas")
    expect(body).not.toContain("stokManual")
  })

  it("menolak bila API key tidak ada", async () => {
    delete process.env.GEMINI_API_KEY

    await expect(analisaKriteriaGemini("panas")).rejects.toThrow(GeminiError)
  })

  it("menerjemahkan suhu panas menjadi hangat", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responsGemini(JSON.stringify({
      mood: "dingin",
      alasan: "Ingin hangat",
      kriteria: { suhu: "panas", rasa: [], kategori: [], kepekatan: 0.5, energi: 0.5 },
    }))))

    const hasil = await analisaKriteriaGemini("Dingin banget")

    expect(hasil.kriteria.suhu).toBe("hangat")
  })

  it("melempar error saat provider mengembalikan status gagal", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responsGemini("{}", false, 429)))

    await expect(analisaKriteriaGemini("panas")).rejects.toThrow(/status 429/)
  })
})
