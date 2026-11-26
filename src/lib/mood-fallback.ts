import type { KriteriaSaran } from "./spk/cbf"
import { tokenize } from "./spk/tokenize"

interface AturanMood {
  label: string
  kata: string[]
  alasan: string
  kriteria: Partial<KriteriaSaran>
}

const ATURAN: AturanMood[] = [
  {
    label: "panas",
    kata: ["panas", "gerah", "haus", "seger", "kepanasan"],
    alasan: "Kata panas atau haus mengarah ke minuman dingin dan segar.",
    kriteria: { suhu: "dingin", rasa: ["segar", "manis"], kepekatan: 0.2, energi: 0.2 },
  },
  {
    label: "dingin",
    kata: ["hujan", "dingin", "menggigil", "adem"],
    alasan: "Kata dingin atau hujan mengarah ke minuman hangat.",
    kriteria: { suhu: "hangat", kepekatan: 0.5, energi: 0.5 },
  },
  {
    label: "lemas",
    kata: ["capek", "lemas", "ngantuk", "tenaga"],
    alasan: "Kata capek atau lemas mengarah ke makanan manis berenergi.",
    kriteria: { rasa: ["manis"], kepekatan: 0.5, energi: 0.9 },
  },
  {
    label: "lapar",
    kata: ["laper", "lapar"],
    alasan: "Kata lapar mengarah ke makanan dengan kepekatan tinggi.",
    kriteria: { kategori: ["Makanan"], kepekatan: 0.85, energi: 0.7 },
  },
  {
    label: "diet",
    kata: ["diet", "sehat", "ringan"],
    alasan: "Kata diet atau ringan mengarah ke pilihan rendah kalori.",
    kriteria: { kategori: ["Makanan"], kepekatan: 0.2, energi: 0.3 },
  },
  {
    label: "butuh hiburan",
    kata: ["sedih", "stres", "bad", "day"],
    alasan: "Mood sedih atau stres mengarah ke dessert manis sebagai comfort food.",
    kriteria: { rasa: ["manis"], kategori: ["Dessert"], kepekatan: 0.4, energi: 0.4 },
  },
  {
    label: "ingin eskrim",
    kata: ["eskrim", "ice", "cream"],
    alasan: "Kata eskrim mengarah ke dessert dingin dan manis.",
    kriteria: { suhu: "dingin", rasa: ["manis"], kategori: ["Dessert"], kepekatan: 0.3, energi: 0.4 },
  },
]

export interface HasilFallbackMood {
  mood: string
  alasan: string
  kriteria: KriteriaSaran
}

export function analisaMoodFallback(transkrip: string): HasilFallbackMood {
  const tokenSet = new Set(tokenize(transkrip))
  const kataMentah = new Set(transkrip.toLowerCase().match(/[a-z]+/g) ?? [])
  const cocokKata = (kata: string) => tokenSet.has(kata) || kataMentah.has(kata)
  const kriteria: KriteriaSaran = {
    suhu: null,
    rasa: [],
    kategori: [],
    kepekatan: 0.5,
    energi: 0.5,
  }

  const label: string[] = []
  const alasan: string[] = []
  let totalKepekatan = 0
  let totalEnergi = 0
  let jumlahAturan = 0

  for (const aturan of ATURAN) {
    if (!aturan.kata.some(cocokKata)) {
      continue
    }

    label.push(aturan.label)
    alasan.push(aturan.alasan)
    jumlahAturan += 1

    if (aturan.kriteria.suhu) {
      kriteria.suhu = aturan.kriteria.suhu
    }
    for (const rasa of aturan.kriteria.rasa ?? []) {
      if (!kriteria.rasa.includes(rasa)) {
        kriteria.rasa.push(rasa)
      }
    }
    for (const kategori of aturan.kriteria.kategori ?? []) {
      if (!kriteria.kategori.includes(kategori)) {
        kriteria.kategori.push(kategori)
      }
    }
    totalKepekatan += aturan.kriteria.kepekatan ?? 0.5
    totalEnergi += aturan.kriteria.energi ?? 0.5
  }

  if (jumlahAturan > 0) {
    kriteria.kepekatan = totalKepekatan / jumlahAturan
    kriteria.energi = totalEnergi / jumlahAturan
  }

  return {
    mood: label.length > 0 ? label.join(" + ") : "netral",
    alasan: alasan.length > 0
      ? alasan.join(" ")
      : "Tidak ada kata mood yang dikenali; rekomendasi memakai kriteria netral.",
    kriteria,
  }
}
