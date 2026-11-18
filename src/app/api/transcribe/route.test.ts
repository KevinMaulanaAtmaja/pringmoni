import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { consumeRateLimit } from "@/lib/rate-limiter"
import { POST } from "./route"

vi.mock("@/lib/rate-limiter", () => ({ consumeRateLimit: vi.fn() }))

const apiKeyAwal = process.env.GROQ_API_KEY
const apiKeyGeminiAwal = process.env.GEMINI_API_KEY

function buatRequest(tokenMeja: string | null = "meja-abc", audio: Blob | null = new Blob(["audio"], { type: "audio/webm" })): Request {
  const form = new FormData()
  if (tokenMeja !== null) form.append("tokenMeja", tokenMeja)
  if (audio) form.append("audio", audio, "audio.webm")
  return new Request("http://localhost/api/transcribe", { method: "POST", body: form })
}

function responsGroq(teks: string, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => ({ text: teks }),
  } as unknown as Response
}

function responsGemini(teks: string, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => ({ candidates: [{ content: { parts: [{ text: teks }] } }] }),
  } as unknown as Response
}

describe("POST /api/transcribe", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GROQ_API_KEY = "groq-test-key"
    delete process.env.GEMINI_API_KEY
    vi.mocked(consumeRateLimit).mockReturnValue({
      allowed: true,
      remainingAttempts: 4,
      retryAfterDetik: 0,
      blockedUntil: null,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    if (apiKeyAwal === undefined) {
      delete process.env.GROQ_API_KEY
    } else {
      process.env.GROQ_API_KEY = apiKeyAwal
    }
    if (apiKeyGeminiAwal === undefined) {
      delete process.env.GEMINI_API_KEY
    } else {
      process.env.GEMINI_API_KEY = apiKeyGeminiAwal
    }
  })

  it("mengirim audio ke Groq dan mengembalikan transkrip", async () => {
    const fetchMock = vi.fn().mockResolvedValue(responsGroq("Aduh panas banget"))
    vi.stubGlobal("fetch", fetchMock)

    const response = await POST(buatRequest())
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ transkrip: "Aduh panas banget" })
    expect(consumeRateLimit).toHaveBeenCalledWith("meja-abc", "transcribe")

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain("api.groq.com")
    const body = init.body as FormData
    expect(body.get("model")).toBe("whisper-large-v3-turbo")
    expect(body.get("language")).toBe("id")
  })

  it("menolak audio kosong atau bukan audio", async () => {
    const kosong = await POST(buatRequest("meja-abc", new Blob([])))
    expect(kosong.status).toBe(400)

    const bukanAudio = await POST(buatRequest("meja-abc", new Blob(["x"], { type: "text/plain" })))
    expect(bukanAudio.status).toBe(400)
    expect(consumeRateLimit).not.toHaveBeenCalled()
  })

  it("mengembalikan 429 saat kuota unggahan habis", async () => {
    vi.mocked(consumeRateLimit).mockReturnValue({
      allowed: false,
      remainingAttempts: 0,
      retryAfterDetik: 30,
      blockedUntil: Date.now() + 30_000,
    })

    const response = await POST(buatRequest())
    expect(response.status).toBe(429)
    expect(response.headers.get("Retry-After")).toBe("30")
  })

  it("mengembalikan 503 bila GROQ_API_KEY dan GEMINI_API_KEY tidak ada", async () => {
    delete process.env.GROQ_API_KEY
    delete process.env.GEMINI_API_KEY

    const response = await POST(buatRequest())
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: "Transkripsi audio belum tersedia. Silakan ketik manual." })
  })

  it("memakai Gemini bila GROQ_API_KEY tidak ada", async () => {
    delete process.env.GROQ_API_KEY
    process.env.GEMINI_API_KEY = "gemini-test-key"
    const fetchMock = vi.fn().mockResolvedValue(responsGemini("Aduh gerah, mau yang dingin"))
    vi.stubGlobal("fetch", fetchMock)

    const response = await POST(buatRequest())
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ transkrip: "Aduh gerah, mau yang dingin" })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain("generativelanguage.googleapis.com")
    expect(url).toContain("gemini-3.5-flash-lite")
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("gemini-test-key")
    const body = JSON.parse(String(init.body)) as {
      contents: Array<{ parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }>
    }
    const parts = body.contents[0].parts
    expect(parts.some((part) => part.inlineData?.mimeType === "audio/webm")).toBe(true)
  })

  it("jatuh ke Gemini saat Groq gagal", async () => {
    process.env.GEMINI_API_KEY = "gemini-test-key"
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(responsGroq("", false, 429))
      .mockResolvedValueOnce(responsGemini("Pesan dari Gemini"))
    vi.stubGlobal("fetch", fetchMock)

    const response = await POST(buatRequest())
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ transkrip: "Pesan dari Gemini" })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("mengembalikan 502 saat Gemini gagal", async () => {
    delete process.env.GROQ_API_KEY
    process.env.GEMINI_API_KEY = "gemini-test-key"
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responsGemini("", false, 500)))

    const response = await POST(buatRequest())
    expect(response.status).toBe(502)
  })

  it("mengembalikan 502 saat Groq gagal", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responsGroq("", false, 429)))

    const response = await POST(buatRequest())
    expect(response.status).toBe(502)
  })
})
