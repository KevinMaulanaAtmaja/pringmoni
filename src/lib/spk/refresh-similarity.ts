import prisma from "@/lib/prisma"
import { hitungMatriksSimilarity, simpanMatriksSimilarity } from "./build-similarity"
import { bacaMatriksSimilarity, setMatriksSimilarity } from "./cf"

interface StateRefresh {
  berjalan: boolean
  terakhirBerhasil: number
}

const kunciGlobal = "__similarityRefreshState"
const globalState = globalThis as unknown as { [kunciGlobal]?: StateRefresh }
const state: StateRefresh = globalState[kunciGlobal] ?? { berjalan: false, terakhirBerhasil: 0 }
globalState[kunciGlobal] = state

export interface OpsiRefreshSimilarity {
  cooldownMs?: number
}

export interface HasilRefreshSimilarity {
  dijalankan: boolean
  alasan?: string
  tersimpan: boolean
  generatedAt: string
  menuCount: number
  pairs: number
}

function ringkasanSekarang(alasan: string): HasilRefreshSimilarity {
  const matriks = bacaMatriksSimilarity()
  return {
    dijalankan: false,
    alasan,
    tersimpan: false,
    generatedAt: matriks.generatedAt,
    menuCount: matriks.menuCount,
    pairs: matriks.pairs.length,
  }
}

export async function refreshMatriksSimilarity(
  opsi: OpsiRefreshSimilarity = {}
): Promise<HasilRefreshSimilarity> {
  const sekarang = Date.now()
  if (state.berjalan) {
    return ringkasanSekarang("refresh sedang berjalan")
  }
  if (opsi.cooldownMs && sekarang - state.terakhirBerhasil < opsi.cooldownMs) {
    return ringkasanSekarang("masih dalam masa cooldown")
  }

  state.berjalan = true
  try {
    const matriks = await hitungMatriksSimilarity(prisma, 90)
    let tersimpan = true

    try {
      await simpanMatriksSimilarity(matriks)
    } catch (error) {
      tersimpan = false
      const pesan = error instanceof Error ? error.message : String(error)
      console.warn("Gagal menulis menu-similarity.json, matriks diperbarui di memori:", pesan)
    }

    setMatriksSimilarity(matriks)
    state.terakhirBerhasil = Date.now()

    return {
      dijalankan: true,
      tersimpan,
      generatedAt: matriks.generatedAt,
      menuCount: matriks.menuCount,
      pairs: matriks.pairs.length,
    }
  } finally {
    state.berjalan = false
  }
}
