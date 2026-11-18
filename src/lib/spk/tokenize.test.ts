import { describe, it, expect } from "vitest"
import { stem, tokenize } from "./tokenize"

describe("SPK - Tokenisasi Bahasa Indonesia", () => {
  it("lowercase, buang tanda baca, stemming, dan stopword", () => {
    expect(tokenize("Aduh panas banget, pengen yang seger")).toEqual(["panas", "banget", "seger"])
  })

  it("stemming mengubah imbuhan me- dan akhiran -kan", () => {
    expect(stem("membacakan")).toBe("baca")
    expect(stem("pembelian")).toBe("beli")
  })

  it("mengembalikan array kosong untuk teks tanpa token valid", () => {
    expect(tokenize("   ")).toEqual([])
    expect(tokenize("yang dan ini itu")).toEqual([])
  })
})
