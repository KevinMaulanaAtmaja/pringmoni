import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { refreshMatriksSimilarity } from "@/lib/spk/refresh-similarity"
import { GET, POST } from "./route"

vi.mock("@/lib/spk/refresh-similarity", () => ({ refreshMatriksSimilarity: vi.fn() }))

const rahasiaAwal = process.env.CRON_SECRET

describe("GET /api/cron/similarity", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = "rahasia-cron"
    vi.mocked(refreshMatriksSimilarity).mockResolvedValue({
      dijalankan: true,
      tersimpan: true,
      generatedAt: "2026-11-17T00:00:00.000Z",
      menuCount: 12,
      pairs: 8,
    })
  })

  afterEach(() => {
    if (rahasiaAwal === undefined) {
      delete process.env.CRON_SECRET
    } else {
      process.env.CRON_SECRET = rahasiaAwal
    }
  })

  it("menolak tanpa secret", async () => {
    const response = await GET(new Request("http://localhost/api/cron/similarity"))
    expect(response.status).toBe(401)
    expect(refreshMatriksSimilarity).not.toHaveBeenCalled()
  })

  it("menolak secret salah", async () => {
    const response = await GET(new Request("http://localhost/api/cron/similarity", {
      headers: { Authorization: "Bearer salah" },
    }))
    expect(response.status).toBe(401)
  })

  it("menerima Bearer secret dan menjalankan refresh", async () => {
    const response = await GET(new Request("http://localhost/api/cron/similarity", {
      headers: { Authorization: "Bearer rahasia-cron" },
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ ok: true, dijalankan: true, menuCount: 12 })
    expect(refreshMatriksSimilarity).toHaveBeenCalledTimes(1)
  })

  it("menerima secret lewat query untuk scheduler sederhana", async () => {
    const response = await GET(new Request("http://localhost/api/cron/similarity?secret=rahasia-cron"))
    expect(response.status).toBe(200)
  })

  it("POST juga tersedia untuk schedule format baru", async () => {
    const response = await POST(new Request("http://localhost/api/cron/similarity", {
      method: "POST",
      headers: { Authorization: "Bearer rahasia-cron" },
    }))
    expect(response.status).toBe(200)
  })
})
