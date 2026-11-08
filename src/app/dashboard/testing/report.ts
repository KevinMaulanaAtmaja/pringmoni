import { readFile } from "node:fs/promises"
import path from "node:path"

export type StatusTest = "passed" | "failed" | "skipped"

export interface PerubahanNilai {
  field: string
  diharapkan: string
  didapat: string
}

export interface DetailError {
  pesan: string
  ringkasan: string
  diharapkan?: string
  didapat?: string
  perubahan: PerubahanNilai[]
}

export interface DetailTest {
  nama: string
  grup: string
  status: StatusTest
  durasiMs: number
  error?: DetailError
}

export interface LaporanFile {
  path: string
  nama: string
  status: StatusTest
  total: number
  lulus: number
  gagal: number
  dilewati: number
  durasiMs: number
  tests: DetailTest[]
}

export interface LaporanTest {
  dibuatPada: string | null
  total: number
  lulus: number
  gagal: number
  dilewati: number
  durasiMs: number
  sukses: boolean
  files: LaporanFile[]
}

export interface StatCoverage {
  total: number
  covered: number
  pct: number
}

export interface RingkasanCoverage {
  statements: StatCoverage
  branches: StatCoverage
  functions: StatCoverage
  lines: StatCoverage
  files: Array<{
    path: string
    nama: string
    statements: number
    branches: number
    functions: number
    lines: number
  }>
}

export type StatusFase = "selesai" | "sebagian" | "belum"

export interface FaseWhitebox {
  id: string
  nama: string
  status: StatusFase
  catatan: string
}

const ENTITAS: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
}

function decodeEntitas(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, kode: string) => String.fromCharCode(Number(kode)))
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, kode: string) => ENTITAS[kode] ?? "")
}

function parseAtribut(raw: string): Record<string, string> {
  const hasil: Record<string, string> = {}
  const pola = /([\w:-]+)="([^"]*)"/g
  let cocok: RegExpExecArray | null
  while ((cocok = pola.exec(raw)) !== null) {
    hasil[cocok[1]] = decodeEntitas(cocok[2])
  }
  return hasil
}

function ambilAngka(teks: string | undefined): number {
  const nilai = Number.parseFloat(teks ?? "")
  return Number.isFinite(nilai) ? nilai : 0
}

function bersihkanNilai(value: string): string {
  let hasil = value.trim().replace(/,$/, "").trim()
  const kutip = hasil[0]
  if ((kutip === '"' || kutip === "'") && hasil.at(-1) === kutip) {
    hasil = hasil.slice(1, -1)
  }
  return hasil
}

function ekstrakPerubahan(teks: string): PerubahanNilai[] {
  const minus = new Map<string, string>()
  const plus = new Map<string, string>()
  const urutan: string[] = []

  for (const baris of teks.split("\n")) {
    const rapi = baris.trim()
    const cocokMinus = rapi.match(/^-\s+"([^"]+)":\s*(.*?),?$/)
    if (cocokMinus) {
      const key = cocokMinus[1]
      minus.set(key, bersihkanNilai(cocokMinus[2]))
      if (!urutan.includes(key)) urutan.push(key)
      continue
    }
    const cocokPlus = rapi.match(/^\+\s+"([^"]+)":\s*(.*?),?$/)
    if (cocokPlus) plus.set(cocokPlus[1], bersihkanNilai(cocokPlus[2]))
  }

  return urutan
    .filter((key) => plus.has(key))
    .map((key) => ({
      field: key,
      diharapkan: minus.get(key) ?? "",
      didapat: plus.get(key) ?? "",
    }))
}

function ringkasKegagalan(pesan: string, isi: string): DetailError {
  const teks = decodeEntitas(isi.trim() || pesan)
  const perubahan = ekstrakPerubahan(teks)

  const cocokDiharapkan = teks.match(/^Expected:\s*(.+)$/m)
  const cocokDidapat = teks.match(/^Received:\s*(.+)$/m)
  const diharapkan = cocokDiharapkan ? bersihkanNilai(cocokDiharapkan[1]) : undefined
  const didapat = cocokDidapat ? bersihkanNilai(cocokDidapat[1]) : undefined

  let ringkasan: string
  if (perubahan.length > 0) {
    ringkasan = perubahan
      .map((item) => `${item.field}: diharapkan ${item.diharapkan}, didapat ${item.didapat}`)
      .join("; ")
  } else if (diharapkan && didapat) {
    ringkasan = `diharapkan ${diharapkan}, didapat ${didapat}`
  } else {
    ringkasan =
      teks
        .split("\n")
        .map((baris) => baris.trim())
        .find((baris) => baris && !/^(AssertionError|Error|Expected:|Received:)/.test(baris)) ??
      pesan
  }

  return {
    pesan: decodeEntitas(pesan),
    ringkasan,
    diharapkan,
    didapat,
    perubahan,
  }
}

function pisahkanNama(nama: string): { grup: string; judul: string } {
  const bagian = nama.split(" > ")
  if (bagian.length < 2) return { grup: "Umum", judul: nama }
  return { grup: bagian.slice(0, -1).join(" > "), judul: bagian.at(-1) ?? nama }
}

function namaFile(filePath: string): string {
  return filePath.split(/[/\\]/).at(-1) ?? filePath
}

function pathRelatif(filePath: string, cwd: string): string {
  const relatif = path.relative(cwd, filePath)
  return relatif.startsWith("..") ? filePath : relatif.split(path.sep).join("/")
}

export function parseLaporanJunit(xml: string, cwd = process.cwd()): LaporanTest {
  const files: LaporanFile[] = []
  let dibuatPada: string | null = null

  const polaSuite = /<testsuite\b([^>]*)>([\s\S]*?)<\/testsuite>/g
  let suite: RegExpExecArray | null

  while ((suite = polaSuite.exec(xml)) !== null) {
    const atributSuite = parseAtribut(suite[1])
    const isiSuite = suite[2]
    const suitePath = atributSuite.name
    if (!suitePath) continue
    if (!dibuatPada && atributSuite.timestamp) dibuatPada = atributSuite.timestamp

    const tests: DetailTest[] = []
    const polaTest = /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g
    let test: RegExpExecArray | null

    while ((test = polaTest.exec(isiSuite)) !== null) {
      const atribut = parseAtribut(test[1])
      const isi = test[2] ?? ""
      const gagal = isi.match(/<failure\b([^>]*)>([\s\S]*?)<\/failure>/)
      const dilewati = /<skipped\b/.test(isi)
      const status: StatusTest = gagal ? "failed" : dilewati ? "skipped" : "passed"
      const { grup, judul } = pisahkanNama(atribut.name ?? "Tanpa nama")

      tests.push({
        nama: judul,
        grup,
        status,
        durasiMs: Math.round(ambilAngka(atribut.time) * 1000),
        error: gagal
          ? ringkasKegagalan(parseAtribut(gagal[1]).message ?? "", gagal[2])
          : undefined,
      })
    }

    const lulus = tests.filter((item) => item.status === "passed").length
    const gagal = tests.filter((item) => item.status === "failed").length
    const dilewati = tests.filter((item) => item.status === "skipped").length

    files.push({
      path: pathRelatif(suitePath, cwd),
      nama: namaFile(suitePath),
      status: gagal > 0 ? "failed" : tests.length > 0 ? "passed" : "skipped",
      total: tests.length,
      lulus,
      gagal,
      dilewati,
      durasiMs: Math.round(ambilAngka(atributSuite.time) * 1000),
      tests,
    })
  }

  files.sort((a, b) => a.path.localeCompare(b.path))

  const total = files.reduce((jumlah, file) => jumlah + file.total, 0)
  const lulus = files.reduce((jumlah, file) => jumlah + file.lulus, 0)
  const gagal = files.reduce((jumlah, file) => jumlah + file.gagal, 0)
  const dilewati = files.reduce((jumlah, file) => jumlah + file.dilewati, 0)

  return {
    dibuatPada,
    total,
    lulus,
    gagal,
    dilewati,
    durasiMs: files.reduce((jumlah, file) => jumlah + file.durasiMs, 0),
    sukses: gagal === 0,
    files,
  }
}

export async function bacaLaporanTest(): Promise<LaporanTest | null> {
  try {
    const xml = await readFile(path.join(process.cwd(), "test-results.xml"), "utf8")
    return parseLaporanJunit(xml)
  } catch {
    return null
  }
}

export async function bacaCoverage(): Promise<RingkasanCoverage | null> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "coverage", "coverage-summary.json"),
      "utf8"
    )
    const data = JSON.parse(raw) as Record<string, Record<string, StatCoverage>>
    const total = data.total
    if (!total) return null

    const files = Object.entries(data)
      .filter(([key]) => key !== "total")
      .map(([key, nilai]) => ({
        path: key,
        nama: namaFile(key),
        statements: nilai.statements?.pct ?? 0,
        branches: nilai.branches?.pct ?? 0,
        functions: nilai.functions?.pct ?? 0,
        lines: nilai.lines?.pct ?? 0,
      }))
      .sort((a, b) => a.nama.localeCompare(b.nama))

    return {
      statements: total.statements,
      branches: total.branches,
      functions: total.functions,
      lines: total.lines,
      files,
    }
  } catch {
    return null
  }
}

export function faseWhitebox(gagal: number): FaseWhitebox[] {
  return [
    {
      id: "S0",
      nama: "Foundation",
      status: "selesai",
      catatan: "Coverage V8, helper mock, fixture, dan script test sudah aktif.",
    },
    {
      id: "S1",
      nama: "Auth & Sesi",
      status: "selesai",
      catatan: "Login/logout/reset 100%; lib/auth.ts 100% statement (authorize, jwt takeover, session).",
    },
    {
      id: "S2",
      nama: "Pesanan & Stok Gate",
      status: "selesai",
      catatan: "pesanan.ts 99% statement / 90% branch; seluruh fungsi baca & mutasi teruji.",
    },
    {
      id: "S3",
      nama: "Pembayaran, Kasir, Shift",
      status: "selesai",
      catatan: "kasir.ts 100%; shift.ts 94,75% statement / 100% function.",
    },
    {
      id: "S4",
      nama: "High Support",
      status: "selesai",
      catatan: "Refund, notifikasi, laporan, stok bahan, dashboard, export teruji.",
    },
    {
      id: "S5",
      nama: "Medium CRUD & Proxy",
      status: "selesai",
      catatan: "Users, menu, meja, voucher, log, dan proxy sudah di atas target.",
    },
    {
      id: "S6",
      nama: "Finalisasi",
      status: gagal > 0 ? "belum" : "selesai",
      catatan:
        gagal > 0
          ? `${gagal} test masih gagal; definition of done "npm test hijau" belum terpenuhi.`
          : "Seluruh test hijau dan gate coverage terpenuhi.",
    },
    {
      id: "8.4",
      nama: "Integration Test",
      status: "belum",
      catatan:
        "Butuh test database PostgreSQL terisolasi + persetujuan user; di luar DoD iterasi ini (unit test tetap tanpa DB).",
    },
  ]
}
