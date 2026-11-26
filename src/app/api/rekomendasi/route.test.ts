import { beforeEach, describe, expect, it, vi } from "vitest"
import { getMejaByToken, getMenusForCustomer } from "@/app/actions/pesanan"
import { analisaKriteriaGemini } from "@/lib/gemini"
import { consumeRateLimit } from "@/lib/rate-limiter"
import { POST } from "./route"

vi.mock("@/app/actions/pesanan", () => ({
  getMejaByToken: vi.fn(),
  getMenusForCustomer: vi.fn(),
}))
vi.mock("@/lib/gemini", () => ({ analisaKriteriaGemini: vi.fn() }))
vi.mock("@/lib/rate-limiter", () => ({ consumeRateLimit: vi.fn() }))

function buatRequest(body: unknown): Request {
  return new Request("http://localhost/api/rekomendasi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/rekomendasi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(consumeRateLimit).mockReturnValue({
      allowed: true,
      remainingAttempts: 9,
      retryAfterDetik: 0,
      blockedUntil: null,
    })
    vi.mocked(getMejaByToken).mockResolvedValue({ id: 1 } as Awaited<ReturnType<typeof getMejaByToken>>)
    vi.mocked(getMenusForCustomer).mockResolvedValue([{
      id: 7,
      namaMenu: "Es Teh Manis",
      deskripsi: "Teh hitam segar",
      harga: 8000,
      statusMenu: "tersedia",
      kategori: "Minuman",
      lokasi: "cafe",
      pilihanSuhu: true,
      fotoUrl: null,
      menuFoto: [],
      adaResep: false,
      resepLengkap: true,
      porsiTersedia: 12,
      bahanPembatas: [],
    }] as Awaited<ReturnType<typeof getMenusForCustomer>>)
    vi.mocked(analisaKriteriaGemini).mockResolvedValue({
      mood: "panas",
      alasan: "Ingin minuman dingin",
      kriteria: { suhu: "dingin", rasa: ["segar"], kategori: ["Minuman"], kepekatan: 0.2, energi: 0.2 },
    })
  })

  it("mengembalikan mood dan rekomendasi hasil ranking", async () => {
    const response = await POST(buatRequest({ transkrip: "Aduh panas", tokenMeja: "meja-abc" }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.mood).toBe("panas")
    expect(data.rekomendasi).toHaveLength(1)
    expect(data.rekomendasi[0].menuId).toBe(7)
    expect(data.rekomendasi[0].rincian).toHaveProperty("cbf")
    expect(data.rekomendasi[0].rincian).toHaveProperty("cf")
    expect(data.rekomendasi[0].rincian).toHaveProperty("stok")
    expect(consumeRateLimit).toHaveBeenCalledWith("meja-abc", "voice")
  })

  it("menolak payload tidak valid", async () => {
    const kosong = await POST(buatRequest({ transkrip: "", tokenMeja: "meja-abc" }))
    expect(kosong.status).toBe(400)

    const tanpaMeja = await POST(buatRequest({ transkrip: "panas" }))
    expect(tanpaMeja.status).toBe(400)
    expect(consumeRateLimit).not.toHaveBeenCalled()
  })

  it("mengembalikan 429 saat rate limit voice terlampaui", async () => {
    vi.mocked(consumeRateLimit).mockReturnValue({
      allowed: false,
      remainingAttempts: 0,
      retryAfterDetik: 42,
      blockedUntil: Date.now() + 42_000,
    })

    const response = await POST(buatRequest({ transkrip: "panas", tokenMeja: "meja-abc" }))
    expect(response.status).toBe(429)
    expect(response.headers.get("Retry-After")).toBe("42")
    expect(await response.json()).toEqual({
      error: "Terlalu banyak permintaan voice order",
      retryAfterDetik: 42,
    })
    expect(getMejaByToken).not.toHaveBeenCalled()
  })

  it("menolak token meja yang tidak ditemukan", async () => {
    vi.mocked(getMejaByToken).mockResolvedValue(null)

    const response = await POST(buatRequest({ transkrip: "panas", tokenMeja: "meja-salah" }))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "Token meja tidak valid" })
  })

  it("memakai fallback leksikon saat Gemini gagal", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.mocked(analisaKriteriaGemini).mockRejectedValue(new Error("provider down"))

    const response = await POST(buatRequest({
      transkrip: "Aduh panas apa yang enak ya?",
      tokenMeja: "meja-abc",
    }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.mood).toBe("panas")
    expect(data.alasan).toContain("dingin")
    warn.mockRestore()
  })
})
