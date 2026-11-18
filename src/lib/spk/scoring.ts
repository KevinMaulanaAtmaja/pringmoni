import type { RekomendasiMenu } from "@/types"
import { rekomendasiCBF, type KriteriaSaran, type MenuBahanData } from "./cbf"
import { matriksTersedia, skorSosial } from "./cf"

export interface MenuPenilaian extends MenuBahanData {
  statusMenu: string
  stokManual: number
  deletedAt?: Date | null
}

export interface OpsiRanking {
  lokasi?: string
  topN?: number
}

export const BOBOT_HYBRID = { cbf: 0.6, cf: 0.3, stok: 0.1 } as const
export const BOBOT_CBF_SAJA = { cbf: 0.9, cf: 0, stok: 0.1 } as const

type BobotHybrid = Readonly<{ cbf: number; cf: number; stok: number }>

function clamp01(nilai: number): number {
  if (!Number.isFinite(nilai)) return 0
  return Math.min(1, Math.max(0, nilai))
}

export function bobotEfektif(): BobotHybrid {
  return matriksTersedia() ? BOBOT_HYBRID : BOBOT_CBF_SAJA
}

export function lolosGate(menu: MenuPenilaian, lokasi?: string): boolean {
  if (menu.statusMenu !== "tersedia") return false
  if (menu.stokManual <= 0) return false
  if (menu.deletedAt) return false
  if (lokasi && menu.lokasi !== lokasi) return false
  return true
}

export function skorStok(menu: MenuPenilaian, stokMaksimum: number): number {
  if (stokMaksimum <= 0) return 0
  return clamp01(menu.stokManual / stokMaksimum)
}

export function skorHybrid(cbf: number, cf: number, stok: number, bobot: BobotHybrid = bobotEfektif()): number {
  return clamp01(bobot.cbf * clamp01(cbf) + bobot.cf * clamp01(cf) + bobot.stok * clamp01(stok))
}

export function rankingHybrid(
  kriteria: KriteriaSaran,
  katalog: MenuPenilaian[],
  opsi: OpsiRanking = {}
): RekomendasiMenu[] {
  const kandidat = katalog.filter((menu) => lolosGate(menu, opsi.lokasi))
  if (kandidat.length === 0) {
    return []
  }

  const hasilCBF = rekomendasiCBF(kriteria, kandidat)
  const petaCBF = new Map(hasilCBF.map((item) => [item.menuId, clamp01(item.skor)]))
  const seedTop3 = hasilCBF.slice(0, 3).map((item) => item.menuId)
  const stokMaksimum = Math.max(...kandidat.map((menu) => menu.stokManual), 1)
  const bobot = bobotEfektif()
  const pakaiCF = matriksTersedia()

  return kandidat
    .map((menu): RekomendasiMenu => {
      const cbf = petaCBF.get(menu.id) ?? 0
      const cf = pakaiCF ? clamp01(skorSosial(menu.id, seedTop3)) : 0
      const stok = skorStok(menu, stokMaksimum)
      return {
        menuId: menu.id,
        skor: skorHybrid(cbf, cf, stok, bobot),
        rincian: { cbf, cf, stok },
      }
    })
    .sort((a, b) => b.skor - a.skor)
    .slice(0, opsi.topN ?? 4)
}
