import matriksSimilarity from "../../data/menu-similarity.json"

export interface PasanganSimilarity {
  a: number
  b: number
  sim: number
}

export interface MatriksSimilarity {
  generatedAt: string
  menuCount: number
  pairs: PasanganSimilarity[]
}

export type PetaSimilarity = Map<string, number>

export function kunciPasangan(a: number, b: number): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`
}

export function buatPetaSimilarity(pairs: PasanganSimilarity[]): PetaSimilarity {
  const peta: PetaSimilarity = new Map()
  for (const pasangan of pairs) {
    if (!Number.isFinite(pasangan.sim) || pasangan.sim <= 0) {
      continue
    }
    peta.set(kunciPasangan(pasangan.a, pasangan.b), pasangan.sim)
  }
  return peta
}

export function ambilSimilarity(peta: PetaSimilarity, a: number, b: number): number {
  if (a === b) {
    return 0
  }
  return peta.get(kunciPasangan(a, b)) ?? 0
}

export const BOBOT_RANK = [1, 0.6, 0.3]

export function bobotRank(rank: number): number {
  return BOBOT_RANK[rank] ?? 0
}

export function hitungSkorSosial(
  peta: PetaSimilarity,
  menuId: number,
  seedTop3: number[]
): number {
  const seeds = seedTop3.slice(0, BOBOT_RANK.length)
  let bobotTotal = 0
  let skor = 0

  for (let rank = 0; rank < seeds.length; rank++) {
    const bobot = bobotRank(rank)
    if (bobot === 0 || seeds[rank] === menuId) {
      continue
    }
    skor += ambilSimilarity(peta, seeds[rank], menuId) * bobot
    bobotTotal += bobot
  }

  return bobotTotal > 0 ? skor / bobotTotal : 0
}

let matriksRef: MatriksSimilarity = matriksSimilarity as MatriksSimilarity
let petaRef: PetaSimilarity = buatPetaSimilarity(matriksRef.pairs)

export function bacaMatriksSimilarity(): MatriksSimilarity {
  return matriksRef
}

export function setMatriksSimilarity(matriks: MatriksSimilarity): void {
  matriksRef = matriks
  petaRef = buatPetaSimilarity(matriks.pairs)
}

export function matriksTersedia(): boolean {
  return petaRef.size > 0
}

export function similaritasItem(a: number, b: number): number {
  return ambilSimilarity(petaRef, a, b)
}

export function skorSosial(menuId: number, seedTop3: number[]): number {
  return hitungSkorSosial(petaRef, menuId, seedTop3)
}
