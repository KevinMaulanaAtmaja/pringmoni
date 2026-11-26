import { tokenize, stem } from "./tokenize"

export interface KriteriaSaran {
  suhu: string | null
  rasa: string[]
  kategori: string[]
  kepekatan: number
  energi: number
}

export type VektorSparse = Map<string, number>

const KEY_TOKO = (token: string) => `tf:${token}`
const KEY_SUHU = (suhu: string) => `suhu:${suhu}`
const KEY_RASA = (rasa: string) => `rasa:${stem(rasa)}`
const KEY_KATEGORI = (kategori: string) => `kategori:${kategori.trim().toLowerCase()}`
const KEY_LOKASI = (lokasi: string) => `lokasi:${lokasi.trim().toLowerCase()}`

const INDIKATOR_SUHU: Array<{ suhu: string; kata: string }> = [
  { suhu: "dingin", kata: "es" },
  { suhu: "dingin", kata: "dingin" },
  { suhu: "dingin", kata: "sejuk" },
  { suhu: "dingin", kata: "seger" },
  { suhu: "dingin", kata: "segar" },
  { suhu: "hangat", kata: "panas" },
  { suhu: "hangat", kata: "hangat" },
]

const RASA_KUNCI = ["manis", "gurih", "asam", "pedas", "pahit", "segar"]

export function buildVektorKriteria(kriteria: KriteriaSaran): VektorSparse {
  const vektor = new Map<string, number>()

  const suhu = kriteria?.suhu?.trim().toLowerCase()
  if (suhu) {
    vektor.set(KEY_SUHU(suhu), 1)
  }

  const rasaList = Array.isArray(kriteria?.rasa) ? kriteria.rasa : []
  for (const rasa of rasaList) {
    const key = KEY_RASA(rasa)
    if (!vektor.has(key)) {
      vektor.set(key, 1)
    }
  }

  const kategoriList = Array.isArray(kriteria?.kategori) ? kriteria.kategori : []
  for (const kategori of kategoriList) {
    const key = KEY_KATEGORI(kategori)
    if (!vektor.has(key)) {
      vektor.set(key, 1)
    }
  }

  return vektor
}

export function cosineSimilarity(q: VektorSparse, m: VektorSparse): number {
  let dot = 0
  let normQ = 0
  let normM = 0

  const kunci = new Set([...q.keys(), ...m.keys()])
  for (const kunciItem of kunci) {
    const nilaiQ = q.get(kunciItem) ?? 0
    const nilaiM = m.get(kunciItem) ?? 0
    dot += nilaiQ * nilaiM
    normQ += nilaiQ * nilaiQ
    normM += nilaiM * nilaiM
  }

  if (normQ === 0 || normM === 0) {
    return 0
  }

  return dot / (Math.sqrt(normQ) * Math.sqrt(normM))
}

export interface MenuBahanData {
  id: number
  namaMenu: string
  deskripsi: string | null
  kategori: string | null
  lokasi: string | null
  pilihanSuhu: boolean
}

export function tokenUnik(menu: MenuBahanData): string[] {
  const teks = [menu.namaMenu, menu.deskripsi ?? "", menu.kategori ?? ""].join(" ")
  return tokenize(teks)
}

export function buildVektorMenu(menu: MenuBahanData, idf: (token: string) => number): VektorSparse {
  const tokens = tokenUnik(menu)
  const vektor = new Map<string, number>()

  const frekuensi = new Map<string, number>()
  for (const token of tokens) {
    frekuensi.set(token, (frekuensi.get(token) ?? 0) + 1)
  }
  const total = Math.max(tokens.length, 1)
  for (const [token, frekuensiToken] of frekuensi) {
    vektor.set(KEY_TOKO(token), (frekuensiToken / total) * idf(token))
  }

  const tokenSet = new Set(tokens)
  for (const indikator of INDIKATOR_SUHU) {
    if (tokenSet.has(indikator.kata)) {
      vektor.set(KEY_SUHU(indikator.suhu), 1)
    }
  }
  for (const rasa of RASA_KUNCI) {
    if (tokenSet.has(rasa)) {
      vektor.set(KEY_RASA(rasa), 1)
    }
  }
  if (menu.lokasi) {
    vektor.set(KEY_LOKASI(menu.lokasi), 1)
  }

  return vektor
}

export interface HasilRekomendasi {
  menuId: number
  skor: number
}

export function rekomendasiCBF(kriteria: KriteriaSaran, katalog: MenuBahanData[]): HasilRekomendasi[] {
  const df = new Map<string, number>()

  for (const menu of katalog) {
    const tokens = tokenUnik(menu)
    const unik = new Set(tokens)
    for (const token of unik) {
      df.set(token, (df.get(token) ?? 0) + 1)
    }
  }

  const total = Math.max(katalog.length, 1)
  const idf = (token: string) => Math.log(1 + total / Math.max(df.get(token) ?? 0, 1))

  const query = buildVektorKriteria(kriteria)
  const hasil: HasilRekomendasi[] = []

  for (const menu of katalog) {
    const vektor = buildVektorMenu(menu, idf)
    hasil.push({
      menuId: menu.id,
      skor: cosineSimilarity(query, vektor),
    })
  }

  return hasil.sort((a, b) => b.skor - a.skor)
}

const GLOBAL_KEY = "__katalogMenuCache"

interface CacheKatalog {
  daftar: MenuBahanData[]
  diperbarui: number
}

type GlobalStore = Record<string, CacheKatalog | undefined>

const globalThisStore = globalThis as unknown as GlobalStore
let cacheKatalog: CacheKatalog | undefined = globalThisStore[GLOBAL_KEY]

export function simpanKatalogCache(katalog: MenuBahanData[]): void {
  cacheKatalog = { daftar: katalog, diperbarui: Date.now() }
  globalThisStore[GLOBAL_KEY] = cacheKatalog
}

export function bacaKatalogCache(ttlMs = 5 * 60 * 1000): MenuBahanData[] | null {
  if (!cacheKatalog) {
    return null
  }
  if (Date.now() - cacheKatalog.diperbarui > ttlMs) {
    return null
  }
  return cacheKatalog.daftar
}

export function hapusKatalogCache(): void {
  cacheKatalog = undefined
  delete globalThisStore[GLOBAL_KEY]
}
