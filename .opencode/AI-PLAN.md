# Rencana Implementasi AI Pringmoni

> **Status:** draft, belum implementasi  
> **Tanggal:** 5 November 2026  
> **Dokumen riset:** [AI-RESEARCH.md](./AI-RESEARCH.md)  
> **Prinsip utama:** AI tidak boleh berada di jalur kritis pembayaran/stok; rekomendasi pelanggan dibuat deterministik, LLM hanya untuk narasi.

---

## 0. Ringkasan Rencana

| Komponen | Keputusan |
|---|---|
| Rekomendasi pelanggan | Hybrid deterministik: popularitas + CF co-occurrence + CBF embedding |
| Model AI untuk rekomendasi | Tidak ada LLM saat request; embedding hanya saat backfill |
| Provider embedding | Google `gemini-embedding-2` (768 dimensi), fallback Ollama |
| Ringkasan owner | Gemini Flash-Lite + fakta deterministik + cache + fallback template |
| Provider teks | Google AI Studio primary; Groq fallback |
| Database | Tambah `MenuEmbedding`, `MenuRelation`, `RekomendasiLog`, `AiInsightCache`, `AiUsage` |
| Feature flag | `AI_RECOMMENDER_ENABLED`, `AI_OWNER_INSIGHT_ENABLED` |
| Estimasi | ±14–18 hari kerja untuk inti (bukan termasuk OCR/forecast) |
| Risiko utama | Data sedikit, privasi free tier, halusinasi angka, kuota berubah |

**Urutan yang disarankan:**

1. Fondasi data + logging + feature flag.
2. Rekomendasi MVP tanpa AI (popularitas + co-occurrence).
3. Embedding + CBF.
4. Hybrid ranking + UI + evaluasi.
5. Ringkasan owner (template dulu, lalu LLM).
6. OCR/forecast sebagai fase berikutnya.

---

## 1. Tujuan dan Non-Goals

### 1.1 Tujuan

- Meningkatkan relevansi menu dan cross-sell tanpa memperlambat halaman menu.
- Memberi owner ringkasan performa yang singkat, berbasis angka, dan bisa ditindaklanjuti.
- Membangun fondasi data/log agar AI berikutnya bisa dievaluasi, bukan sekadar ditambahkan.
- Menjaga biaya tetap nol atau sangat rendah dengan memanfaatkan free tier dan precomputation.

### 1.2 Non-goals (untuk fase ini)

- Tidak membuat akun pelanggan baru.
- Tidak memakai LLM untuk menghitung harga, diskon, stok, pembayaran, atau status pesanan.
- Tidak membuat chatbot yang bisa mengubah pesanan.
- Tidak membangun matrix factorization/deep learning yang butuh data besar.
- Tidak mengirim PII pelanggan ke provider AI.
- Tidak mengubah alur checkout yang sudah ada tanpa evaluasi.

---

## 2. Prinsip Arsitektur

1. **Deterministic first, AI second.** Rekomendasi harus tetap berfungsi jika API AI mati.
2. **AI off the critical path.** Jangan panggil LLM saat pelanggan membuka menu atau checkout.
3. **Precompute, bukan hitung saat request.** Embedding dan relasi dihitung di background.
4. **Provider adapter.** Jangan mengikat kode ke satu vendor; Gemini/Groq/Ollama bisa ditukar lewat env.
5. **Cache and fallback.** Ringkasan owner dan embedding harus punya cache; semua fitur AI punya fallback.
6. **Privacy by design.** Kirim agregat, hash session, jangan kirim PII.
7. **Measure before optimize.** Log impresi/klik dan ukur baseline sebelum mengubah bobot.
8. **Feature flag.** Semua fitur baru bisa dimatikan tanpa deploy ulang.
9. **No destructive migration.** Tambah tabel/kolom; jangan hapus data lama.

---

## 3. Arsitektur Usulan

```text
┌──────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App Router                      │
├───────────────────────────┬──────────────────────────────────────┤
│ Customer UI               │ Dashboard Owner                      │
│ - RekomendasiSection      │ - AiInsightCard                      │
│ - CartSheet cross-sell    │ - Tombol "Buat ulang"                │
└─────────────┬─────────────┴──────────────────┬───────────────────┘
              │                                │
              ▼                                ▼
┌──────────────────────────────┐  ┌───────────────────────────────┐
│ Server Actions               │  │ Server Actions                │
│ rekomendasi.ts               │  │ ai-insight.ts                 │
│ - getRekomendasiPelanggan    │  │ - getRingkasanOwner           │
│ - catatInteraksiRekomendasi  │  │ - invalidateRingkasanOwner    │
└─────────────┬────────────────┘  └──────────────┬────────────────┘
              │                                  │
              ▼                                  ▼
┌──────────────────────────────┐  ┌───────────────────────────────┐
│ Recommendation Engine        │  │ Insight Aggregator            │
│ - popularitas                │  │ - laporan.ts (existing)       │
│ - CF co-occurrence           │  │ - fakta deterministik         │
│ - CBF neighbors              │  │ - hash + cache                │
│ - hybrid + MMR               │  │ - prompt + validator          │
└─────────────┬────────────────┘  └──────────────┬────────────────┘
              │                                  │
              ▼                                  ▼
┌──────────────────────────────┐  ┌───────────────────────────────┐
│ PostgreSQL (Prisma)          │  │ AI Provider Adapter           │
│ - MenuEmbedding              │  │ - Gemini (text + embedding)   │
│ - MenuRelation               │  │ - Groq (text fallback)        │
│ - RekomendasiLog             │  │ - Ollama (opsional)           │
│ - AiInsightCache / AiUsage   │  │ - timeout, retry, circuit     │
└──────────────────────────────┘  └───────────────────────────────┘
              ▲
              │ backfill / cron / script
┌─────────────┴────────────────────────────────────────────────────┐
│ scripts/ai/backfill-embeddings.ts                                 │
│ scripts/ai/build-relations.ts                                     │
│ scripts/ai/evaluate-recommender.ts                                │
└──────────────────────────────────────────────────────────────────┘
```

### 3.1 Alur rekomendasi pelanggan

1. Customer membuka halaman menu.
2. `getRekomendasiPelanggan` menerima `tokenMeja` + isi keranjang.
3. Engine mengambil kandidat:
   - popularitas 30 hari,
   - relasi CF dari item di keranjang,
   - relasi CBF dari item di keranjang.
4. Filter: tersedia, stok > 0, tidak dihapus, bukan item yang sudah di keranjang.
5. Ranking hybrid + MMR.
6. Return 4–6 item + alasan.
7. UI menampilkan; impresi/klik dicatat ke `RekomendasiLog`.

### 3.2 Alur ringkasan owner

1. Owner membuka dashboard/laporan.
2. `getRingkasanOwner(periode, tanggal)` cek session + role.
3. Ambil fakta dari fungsi laporan yang sudah ada (mis. `getLaporanAll` di `src/app/actions/laporan.ts`).
4. Hitung `dataHash`; cek `AiInsightCache`.
5. Jika cache valid → return.
6. Jika tidak → panggil provider dengan JSON Schema, timeout 10 detik.
7. Validasi output; simpan cache + `AiUsage`.
8. Jika gagal → return template deterministik.
9. UI menampilkan panel fakta + narasi + badge sumber (`AI` / `template`).

---

## 4. Perubahan Database

### 4.1 Model baru

Tambahkan ke `prisma/schema.prisma`:

```prisma
model MenuEmbedding {
  id        Int      @id @default(autoincrement())
  menuId    Int      @unique @map("menu_id")
  model     String   @map("model")
  dimensi   Int      @map("dimensi")
  vektor    Float[]  @map("vektor")
  teksHash  String   @map("teks_hash")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  menu      Menu     @relation(fields: [menuId], references: [id], onDelete: Cascade)

  @@map("menu_embedding")
}

enum TipeRelasi {
  cf
  cbf

  @@map("tipe_relasi")
}

model MenuRelation {
  id            Int        @id @default(autoincrement())
  menuId        Int        @map("menu_id")
  relatedMenuId Int        @map("related_menu_id")
  tipe          TipeRelasi @map("tipe")
  skor          Float      @map("skor")
  support       Float?     @map("support")
  confidence    Float?     @map("confidence")
  lift          Float?     @map("lift")
  cooccurrence  Int?       @map("cooccurrence")
  updatedAt     DateTime   @updatedAt @map("updated_at")
  menu          Menu       @relation("MenuRelationA", fields: [menuId], references: [id], onDelete: Cascade)
  relatedMenu   Menu       @relation("MenuRelationB", fields: [relatedMenuId], references: [id], onDelete: Cascade)

  @@unique([menuId, relatedMenuId, tipe])
  @@index([menuId, tipe, skor])
  @@map("menu_relation")
}

model RekomendasiLog {
  id          Int      @id @default(autoincrement())
  sesiId      String   @map("sesi_id")
  menuId      Int      @map("menu_id")
  sumber      String   @map("sumber") // populer | cf | cbf | hybrid | eksplorasi
  skor        Float    @map("skor")
  posisi      Int      @map("posisi")
  konteks     Json?    @map("konteks")
  dilihat     Boolean  @default(false) @map("dilihat")
  diklik      Boolean  @default(false) @map("diklik")
  ditambahkan Boolean  @default(false) @map("ditambahkan")
  createdAt   DateTime @default(now()) @map("created_at")
  menu        Menu     @relation(fields: [menuId], references: [id], onDelete: Cascade)

  @@index([sesiId, createdAt])
  @@index([menuId, createdAt])
  @@map("rekomendasi_log")
}

model AiInsightCache {
  id        Int      @id @default(autoincrement())
  tipe      String   @map("tipe") // owner_harian | owner_mingguan | ...
  periode   String   @map("periode")
  tanggal   String   @map("tanggal")
  dataHash  String   @map("data_hash")
  provider  String   @map("provider")
  model     String   @map("model")
  konten    Json     @map("konten")
  createdAt DateTime @default(now()) @map("created_at")
  expiresAt DateTime @map("expires_at")

  @@unique([tipe, periode, tanggal, dataHash])
  @@index([expiresAt])
  @@map("ai_insight_cache")
}

model AiUsage {
  id           Int      @id @default(autoincrement())
  fitur        String   @map("fitur")
  provider     String   @map("provider")
  model        String   @map("model")
  inputTokens  Int      @default(0) @map("input_tokens")
  outputTokens Int      @default(0) @map("output_tokens")
  latencyMs    Int      @map("latency_ms")
  sukses       Boolean  @map("sukses")
  errorCode    String?  @map("error_code")
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([createdAt])
  @@map("ai_usage")
}
```

Tambahkan relasi balik di model `Menu`:

```prisma
model Menu {
  // ... field yang sudah ada
  embeddings     MenuEmbedding[]
  relationsA     MenuRelation[]  @relation("MenuRelationA")
  relationsB     MenuRelation[]  @relation("MenuRelationB")
  rekomendasiLog RekomendasiLog[]
}
```

### 4.2 Catatan desain

- `Float[]` didukung PostgreSQL + Prisma. Untuk < 500 menu, tidak perlu pgvector.
- `MenuRelation` menyimpan **dua arah** (A→B dan B→A) agar query baca sederhana. Ini duplikasi kecil, tetapi mempercepat request.
- `RekomendasiLog` sebaiknya diisi sebagai batch/async; jangan menambah latency kritis.
- `AiUsage` berguna untuk monitoring kuota dan biaya. Jika terlalu berat, bisa dimulai dengan log aplikasi, lalu pindah ke tabel.
- `AiInsightCache.konten` menyimpan JSON hasil validasi, bukan raw response provider.
- Jangan menyimpan prompt yang mengandung PII.

### 4.3 Migrasi

Sesuai workflow project yang sudah memakai folder `prisma/migrations`:

```bash
npx prisma migrate dev --name ai_foundation
npx prisma generate
```

Untuk produksi:

```bash
npx prisma migrate deploy
```

Aturan:

- Backup database sebelum migrasi.
- Tidak ada `DROP`, `DELETE`, atau reset data.
- Jika migrasi gagal, perbaiki migrasi, jangan `migrate reset`.
- Sesuai `.opencode/SECURITY.md`, jangan mengosongkan database.

---

## 5. Modul dan File yang Akan Ditambah

```text
src/lib/ai/
├── config.ts                 # env, feature flag, batas kuota
├── provider.ts               # interface TextProvider & EmbeddingProvider
├── gemini.ts                 # implementasi Gemini
├── groq.ts                   # implementasi Groq (text fallback)
├── ollama.ts                 # opsional, embedding/local text
├── prompts/
│   └── owner-insight.ts      # system prompt + schema
├── recommendation/
│   ├── session.ts            # hash sesiId
│   ├── popularitas.ts        # agregasi popularitas
│   ├── cf.ts                 # baca relasi CF
│   ├── cbf.ts                # baca relasi CBF
│   ├── hybrid.ts             # skor + MMR
│   └── types.ts
└── usage.ts                  # catat AiUsage

src/app/actions/
├── rekomendasi.ts            # server action pelanggan
└── ai-insight.ts             # server action owner

src/components/customer/
├── rekomendasi-section.tsx   # section "Untukmu" / "Sering dipesan bersama"
└── cross-sell-sheet.tsx      # opsional, atau integrasi ke cart-sheet

src/components/dashboard/
└── AiInsightCard.tsx         # kartu ringkasan owner

scripts/ai/
├── backfill-embeddings.ts
├── build-relations.ts
└── evaluate-recommender.ts
```

### 5.1 Interface provider

```ts
export interface AiUsageInfo {
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  latencyMs: number
}

export interface TextProvider {
  generateJson<T>(input: {
    model: string
    system: string
    prompt: string
    schema: unknown
    maxOutputTokens?: number
    temperature?: number
    timeoutMs?: number
  }): Promise<{ data: T; usage: AiUsageInfo }>
}

export interface EmbeddingProvider {
  embedText(input: {
    model: string
    texts: string[]
    dimensi?: number
  }): Promise<{ vectors: number[][]; usage: AiUsageInfo }>
}
```

Implementasi:

- `gemini.ts` mengimplementasikan keduanya.
- `groq.ts` hanya `TextProvider`.
- `provider.ts` memilih provider berdasarkan `AI_PROVIDER` dan fallback.
- Gunakan `fetch` + `AbortSignal.timeout`; tidak perlu SDK baru.
- Jangan log API key atau prompt penuh.

---

## 6. Fitur 1 — Rekomendasi Pelanggan

### 6.1 Fase 1: MVP tanpa AI (wajib lebih dulu)

Tujuan: mengirim nilai cepat dan mengumpulkan data sebelum menambah embedding.

Fitur:

- "Favorit hari ini" berdasarkan popularitas 30 hari + lokasi + stok.
- "Sering dipesan bersama" berdasarkan co-occurrence dari pesanan valid.
- Cross-sell 2–3 item di cart sheet.
- Log impresi/klik/tambah.

Tidak ada API AI. Semua query Prisma + cache.

**Kenapa lebih dulu:** jika data co-occurrence belum cukup, kita tahu dari data, bukan dari asumsi. Ini juga menjadi fallback permanen jika embedding gagal.

### 6.2 Fase 2: Embedding + CBF

- Backfill embedding menu ke `MenuEmbedding`.
- Hitung top-20 neighbor CBF per menu → `MenuRelation` dengan `tipe = cbf`.
- Request hanya membaca relasi, bukan menghitung cosine semua menu.
- Jika menu berubah, `teksHash` berubah; job berikutnya memperbarui embedding.

Teks yang di-embed:

```text
Nama: {namaMenu}
Kategori: {kategori}
Lokasi: {resto|cafe}
Harga: {harga}
Deskripsi: {deskripsi}
Varian: {panas|dingin|tidak ada}
```

Gunakan `gemini-embedding-2`, `output_dimensionality = 768`, dan task/parameter yang sesuai dokumentasi embedding yang berlaku (`SEMANTIC_SIMILARITY` untuk model yang mendukung).

### 6.3 Fase 3: Hybrid ranking

Pseudocode:

```ts
function skorHybrid(kandidat: Kandidat, ctx: Konteks): number {
  const cf = normalisasi(ctx.cfScore[kandidat.id] ?? 0)
  const cbf = normalisasi(ctx.cbfScore[kandidat.id] ?? 0)
  const pop = normalisasi(ctx.popularitas[kandidat.id] ?? 0)
  const konteks = hitungKonteks(kandidat, ctx) // waktu, lokasi, harga
  const eksplorasi = ctx.explorasi[kandidat.id] ?? 0

  return 0.40 * cf
       + 0.25 * cbf
       + 0.20 * pop
       + 0.10 * konteks
       + 0.05 * eksplorasi
}
```

Aturan:

- Normalisasi setiap komponen ke `[0, 1]`.
- Jika CF/CBF kosong, naikkan bobot popularitas.
- Jika data transaksi < ambang (mis. 100 pesanan valid), CF dikurangi.
- Filter stok dan status selalu dilakukan **sebelum** ranking.
- MMR: `λ = 0.7`, maksimal 2 item per kategori, maksimal 6 item.
- Eksplorasi: 5–10% slot untuk menu baru/underdog yang stoknya tersedia.

### 6.4 Kontrak Server Action

```ts
export type SumberRekomendasi =
  | "populer"
  | "cf"
  | "cbf"
  | "hybrid"
  | "eksplorasi"

export interface RekomendasiItem {
  menuId: number
  namaMenu: string
  harga: number
  fotoUrl: string | null
  kategori: string
  alasan: string
  skor: number
  sumber: SumberRekomendasi
}

export async function getRekomendasiPelanggan(input: {
  tokenMeja: string
  menuIdsKeranjang: number[]
  limit?: number
}): Promise<{ items: RekomendasiItem[]; sesiId: string }>
```

Validasi:

- `tokenMeja` valid dan meja tidak dihapus.
- `menuIdsKeranjang` hanya angka positif; maksimal 50.
- `limit` dibatasi 1–10.
- Rate limit per `sesiId` (mis. 60 request/menit).
- Jangan pernah mempercayai `harga` dari client; ambil dari database.

Event logging:

```ts
export async function catatInteraksiRekomendasi(input: {
  sesiId: string
  menuId: number
  aksi: "lihat" | "klik" | "tambah"
}): Promise<{ success: boolean }>
```

- Validasi `sesiId` berasal dari server (HMAC/hash), bukan string bebas.
- `lihat` dicatat sekali per sesi/menu/hari (hindari spam).
- `klik`/`tambah` dicatat maksimal sekali per sesi/menu.

### 6.5 Session ID

```ts
import crypto from "crypto"

export function buatSesiId(input: {
  deviceId?: string
  tokenMeja: string
  tanggal: string // YYYY-MM-DD
  pepper: string
}): string {
  return crypto
    .createHash("sha256")
    .update(`${input.deviceId ?? "anon"}|${input.tokenMeja}|${input.tanggal}|${input.pepper}`)
    .digest("hex")
}
```

- `deviceId` dari cookie `pm_device` (`src/lib/sesi.ts`).
- Jangan simpan `deviceId` mentah di log.
- ID berputar setiap hari; ini bukan identitas orang.

### 6.6 UI

**Halaman menu** (`src/app/(customer)/[tokenMeja]/page.tsx`):

- Tambahkan section setelah pill kategori (sekitar baris 702) dan sebelum grid menu (sekitar baris 731).
- Sebelum keranjang berisi: judul **"Favorit hari ini"**.
- Setelah keranjang berisi: judul **"Sering dipesan bersama"** atau **"Mirip dengan pilihanmu"**.
- Gunakan komponen kartu horizontal yang sudah ada (`MenuCard`) atau komponen ringkas baru.
- Jangan blokir render menu jika rekomendasi gagal; section bisa kosong.

**Cart sheet** (`src/components/customer/cart-sheet.tsx`):

- Tambahkan 2–3 item cross-sell di bawah daftar item, sebelum ringkasan pembayaran.
- Fetch saat sheet dibuka; cache per signature keranjang.
- Jangan tampilkan item yang sudah ada di keranjang.
- Jangan tampilkan item yang stoknya habis.

**Alasan rekomendasi:**

- "Sering dipesan bersama Nasi Goreng"
- "Mirip dengan Es Teh"
- "Favorit di jam makan siang"

Alasan harus deterministik, bukan hasil LLM.

### 6.7 Job backfill

`scripts/ai/backfill-embeddings.ts`:

1. Ambil menu yang `deletedAt = null`.
2. Bangun teks menu.
3. Hitung hash dari `model + dimensi + teks`.
4. Lewati jika `MenuEmbedding.teksHash` sama.
5. Panggil embedding provider (batch jika didukung; jika tidak, loop dengan jeda).
6. Simpan `vektor`, `model`, `dimensi`, `teksHash`.

`scripts/ai/build-relations.ts`:

1. **CF:** ambil pesanan valid 180 hari; hitung pasangan item; simpan `tipe = cf`.
2. **CBF:** ambil embedding; hitung cosine; simpan top-20 `tipe = cbf`.
3. Hapus relasi lama yang tidak lagi valid (hanya untuk menu yang diproses).
4. Jalankan manual atau via cron harian.

Untuk MVP, job bisa dijalankan manual setelah import menu. Jangan menambah cron sebelum alur manual terbukti.

### 6.8 Evaluasi

Offline script `scripts/ai/evaluate-recommender.ts`:

- Temporal split: 80% data lama untuk train, 20% terbaru untuk test.
- Bandingkan:
  1. popularitas saja,
  2. CF saja,
  3. CBF saja,
  4. hybrid.
- Metrik: HitRate@5, Precision@5, Recall@5, NDCG@5, coverage, diversity.
- Simpan hasil ke CSV/Markdown untuk dibandingkan.

Online:

- A/B test 50/50 berdasarkan hash `sesiId`.
- Metrik utama: CTR, add-to-cart, AOV.
- Guardrail: cancel rate, waktu muat, stock-out.
- Hentikan jika ada regresi signifikan.

---

## 7. Fitur 2 — Ringkasan Performa Owner

### 7.1 Fase 1: Template deterministik

Sebelum LLM, buat `getRingkasanOwner` yang menghasilkan ringkasan dari aturan:

- Pendapatan naik/turun X% vs periode sebelumnya.
- Menu terlaris.
- Menu dengan penurunan terbesar.
- Jam sibuk.
- Cancel rate.
- Rekomendasi rule-based (mis. "menu X perlu dipromosikan").

Ini menjadi fallback permanen dan baseline kualitas.

### 7.2 Fase 2: LLM

Tambahkan provider Gemini dengan JSON Schema. LLM hanya menulis narasi dari fakta.

**Fakta yang dikirim:** lihat `AI-RESEARCH.md` bagian 7.2.

**System prompt:** lihat `AI-RESEARCH.md` bagian 7.3.

**Schema output (Zod):**

```ts
import { z } from "zod"

export const SkemaRingkasanOwner = z.object({
  ringkasan: z.string().max(1200),
  insight: z.array(z.object({
    judul: z.string().max(120),
    fakta: z.string().max(300),
    dampak: z.string().max(300),
  })).max(5),
  rekomendasi: z.array(z.object({
    aksi: z.string().max(300),
    alasan: z.string().max(300),
    prioritas: z.enum(["tinggi", "sedang", "rendah"]),
  })).max(5),
  risiko: z.array(z.object({
    risiko: z.string().max(300),
    mitigasi: z.string().max(300),
  })).max(3),
  data_tidak_cukup: z.boolean(),
})
```

### 7.3 Kontrak Server Action

```ts
export interface FaktaOwner {
  periode: string
  label: string
  pendapatan: number
  pendapatanSebelumnya: number
  pertumbuhanPersen: number
  jumlahPesanan: number
  aov: number
  cancelRatePersen: number
  // field lain mengikuti AI-RESEARCH.md bagian 7.2
  [key: string]: unknown
}

export interface RingkasanOwner {
  sumber: "ai" | "template"
  periode: string
  label: string
  dibuatPada: string
  fakta: FaktaOwner
  konten: z.infer<typeof SkemaRingkasanOwner>
}

export async function getRingkasanOwner(input: {
  periode: string
  tanggal: string
  force?: boolean
}): Promise<RingkasanOwner>
```

Aturan:

- `auth()` wajib; hanya `role === "owner"`.
- Validasi `periode` ke daftar yang diizinkan.
- `force` hanya boleh 1×/jam per owner.
- Jangan pernah mengembalikan error mentah provider ke UI.

### 7.4 Cache

- Key: `hash(tipe + periode + tanggal + dataHash)`.
- TTL: 6 jam untuk periode berjalan; 24 jam untuk periode lampau.
- `force` menghapus cache lama untuk key tersebut, lalu generate ulang.
- Jika data berubah (ada pesanan baru), `dataHash` berubah; cache otomatis tidak cocok.
- Jangan cache jika `dataTidakCukup = true` terlalu lama; coba lagi setelah data bertambah.

### 7.5 Validasi angka

Tiga lapis:

1. **Panel fakta deterministik** di UI — angka selalu dari database.
2. **Prompt** melarang angka yang tidak ada.
3. **Post-validator** mengekstrak angka dari narasi dan mencocokkan dengan fakta; jika tidak cocok, tandai dan fallback ke template.

Alternatif yang lebih ketat: minta LLM memakai placeholder `{{pendapatan}}`; aplikasi mengganti dengan nilai terformat. Ini menghilangkan risiko angka salah, dengan sedikit kompromi naturalitas.

### 7.6 UI

- Tambahkan `AiInsightCard` di dashboard owner (`src/app/dashboard/page.tsx`) atau halaman laporan.
- Tampilkan:
  - Badge `AI` / `Template`.
  - Periode dan waktu generate.
  - Ringkasan 3–5 bullet.
  - Insight, rekomendasi, risiko.
  - Panel "Fakta" dengan angka utama.
  - Tombol "Buat ulang" (rate limited).
  - Disclaimer: "Ringkasan dibuat otomatis; tetap cek data sumber."
- Pertimbangkan lazy load: tombol "Tampilkan ringkasan AI" agar dashboard tidak menunggu provider.
- Di mobile, tampilkan versi ringkas (3 bullet) dengan expand.

---

## 8. Konfigurasi dan Secrets

Tambahkan ke `.env` (dikerjakan manual oleh user; file `.env` diblokir oleh security scan):

```bash
AI_ENABLED=true
AI_PROVIDER=gemini

# Gemini
GEMINI_API_KEY=...
AI_TEXT_MODEL=gemini-3.5-flash-lite
AI_TEXT_MODEL_KUALITAS=gemini-3.8-flash
AI_EMBED_MODEL=gemini-embedding-2
AI_EMBED_DIM=768

# Fallback
GROQ_API_KEY=...
GROQ_TEXT_MODEL=openai/gpt-oss-120b

# Fitur
AI_RECOMMENDER_ENABLED=true
AI_OWNER_INSIGHT_ENABLED=true

# Batas
AI_REQUEST_TIMEOUT_MS=10000
AI_DAILY_INSIGHT_LIMIT=20
AI_DAILY_EMBED_LIMIT=500
AI_RECOMMENDER_RATE_LIMIT=60
AI_SESSION_PEPPER=...

# Opsional
OLLAMA_BASE_URL=http://localhost:11434
```

Aturan:

- Jangan gunakan `NEXT_PUBLIC_` untuk API key.
- Jangan commit `.env`.
- Jika `.env.example` ada, tambahkan nama variabel tanpa nilai rahasia.
- `AI_ENABLED=false` harus mematikan semua panggilan provider; fitur kembali ke fallback.
- `AI_RECOMMENDER_ENABLED=false` harus menyembunyikan section rekomendasi tanpa error.

---

## 9. Guardrail, Rate Limit, dan Observability

### 9.1 Guardrail

- Timeout provider: 8–10 detik.
- Retry maksimal 2× untuk 429/5xx, dengan exponential backoff + jitter.
- Circuit breaker: setelah 3 kegagalan dalam 5 menit, lewati provider selama 15 menit.
- Maksimal output token: 800 untuk ringkasan, 300 untuk teks pendek.
- `temperature`: 0.2 untuk ringkasan (faktual), 0.5 untuk copy menu.
- Tolak output yang tidak sesuai schema.
- Jangan pernah menampilkan raw error provider.

### 9.2 Rate limit

Gunakan `src/lib/rate-limiter.ts` atau helper baru:

- Rekomendasi pelanggan: 60 request/menit per `sesiId`; 300/menit per IP hash.
- Event logging: 120/menit per sesi.
- Ringkasan owner: 10/jam per owner; `force` 1/jam.
- Embedding backfill: mengikuti kuota provider; batasi 60 request/menit.

### 9.3 Observability

Catat di `AiUsage`:

- fitur, provider, model.
- input/output token.
- latency.
- sukses/gagal.
- error code (bukan pesan mentah).

Dashboard internal (bisa halaman owner atau log):

- Jumlah request/hari.
- Persentase fallback.
- Rata-rata latency.
- Token terpakai.
- Error 429/5xx.

Jangan log prompt lengkap jika mengandung data sensitif.

---

## 10. Testing

### 10.1 Unit

- `hybrid.ts`: skor finite, normalisasi, filter stok, MMR.
- `session.ts`: hash stabil, berbeda per tanggal, tidak membocorkan device ID.
- `prompts/owner-insight.ts`: schema valid, prompt tidak memuat PII.
- `validasi angka`: angka yang tidak ada di fakta ditolak.
- `cache`: key berubah saat data berubah.

### 10.2 Integration

- `getRekomendasiPelanggan` dengan Prisma mock:
  - token invalid → error.
  - stok habis → tidak muncul.
  - item di keranjang → tidak muncul untuk cross-sell.
  - data kosong → fallback popularitas.
- `getRingkasanOwner`:
  - bukan owner → unauthorized.
  - provider timeout → template.
  - output invalid → template.
  - cache hit → tidak memanggil provider.

### 10.3 Contract

- Mock provider; jangan panggil API asli di CI.
- Simpan fixture respons sukses/429/invalid JSON.
- Snapshot prompt untuk mendeteksi perubahan tak sengaja.

### 10.4 E2E

- Halaman menu tetap tampil meski `AI_ENABLED=false`.
- Section rekomendasi muncul dan tidak memblokir menu.
- Cart cross-sell tidak menampilkan item yang sudah ada.
- Dashboard owner menampilkan fallback saat provider mati.

### 10.5 Evaluasi

- Jalankan `scripts/ai/evaluate-recommender.ts` sebelum dan sesudah perubahan bobot.
- Simpan hasil di `.opencode/` atau folder laporan internal (bukan data pelanggan).

---

## 11. Roadmap dan PBI

### 11.1 Fase 0 — Fondasi (2–3 hari)

| PBI | Deliverable | Estimasi | Acceptance Criteria |
|---|---|---:|---|
| AI-00 | Dokumen riset + rencana | 0,5 hari | Dokumen ada di `.opencode`, disetujui |
| AI-01 | Migrasi tabel + relasi | 1 hari | Migrasi sukses, `prisma generate` sukses, tidak ada data hilang |
| AI-02 | Feature flag + config + provider stub | 1 hari | `AI_ENABLED=false` aman; tidak ada panggilan keluar |
| AI-03 | Logging rekomendasi | 0,5 hari | Impresi/klik/tambah tercatat |

### 11.2 Fase 1 — Rekomendasi MVP (3–4 hari)

| PBI | Deliverable | Estimasi | Acceptance Criteria |
|---|---|---:|---|
| AI-04 | Popularitas + "Favorit hari ini" | 1 hari | Muncul di halaman menu; filter stok benar |
| AI-05 | Co-occurrence CF + "Sering dipesan bersama" | 1,5 hari | Muncul setelah ada item; data dari pesanan valid |
| AI-06 | Cross-sell di cart sheet | 1 hari | Maks 3 item; tidak ada duplikat; tidak memblokir checkout |
| AI-07 | Log + evaluasi awal | 0,5 hari | CTR baseline terukur |

**Milestone:** rekomendasi sudah memberi nilai tanpa API AI.

### 11.3 Fase 2 — Embedding + CBF (3–4 hari)

| PBI | Deliverable | Estimasi | Acceptance Criteria |
|---|---|---:|---|
| AI-08 | Backfill embedding menu | 1,5 hari | Semua menu punya embedding; gagal sebagian tidak merusak |
| AI-09 | Build CBF neighbors | 1 hari | Top-20 neighbor per menu; skor masuk akal |
| AI-10 | Hybrid ranking + MMR | 1 hari | Relevan, tidak monoton, filter stok benar |
| AI-11 | UI "Mirip dengan pilihanmu" | 0,5 hari | Muncul saat keranjang berisi; alasan jelas |

### 11.4 Fase 3 — Ringkasan Owner (3–4 hari)

| PBI | Deliverable | Estimasi | Acceptance Criteria |
|---|---|---:|---|
| AI-12 | Agregator fakta + template | 1 hari | Angka cocok dengan laporan; tanpa LLM |
| AI-13 | Provider Gemini + schema | 1 hari | Output valid; timeout/fallback bekerja |
| AI-14 | Cache + AiUsage + tombol buat ulang | 1 hari | Cache hit; force rate limited; usage tercatat |
| AI-15 | UI AiInsightCard | 0,5 hari | Owner-only; mobile readable; disclaimer |

### 11.5 Fase 4 — Evaluasi & hardening (2 hari)

| PBI | Deliverable | Estimasi | Acceptance Criteria |
|---|---|---:|---|
| AI-16 | Offline evaluator | 1 hari | Membandingkan 4 strategi; hasil tersimpan |
| AI-17 | A/B test + guardrail | 0,5 hari | Assignment stabil; metrik terukur |
| AI-18 | Hardening + dokumentasi | 0,5 hari | Runbook, rollback, monitoring |

**Total inti:** ±14–18 hari kerja, tergantung kualitas data dan ketersediaan waktu.

---

## 12. Rollout dan Rollback

### 12.1 Rollout

1. **Dev:** semua flag off; migrasi + unit test.
2. **Staging/internal:** aktifkan rekomendasi untuk owner/karyawan; cek UI dan data.
3. **Produksi terbatas:** rekomendasi untuk 10–50% sesi (hash), owner summary hanya owner.
4. **Produksi penuh:** jika tidak ada regresi.

### 12.2 Rollback

- Matikan `AI_RECOMMENDER_ENABLED` / `AI_OWNER_INSIGHT_ENABLED`.
- UI kembali ke tampilan tanpa section AI.
- Jangan hapus tabel/data; biarkan untuk investigasi.
- Jika masalah pada migrasi, perbaiki dengan migrasi baru; jangan reset database.

### 12.3 Monitoring

- Error rate provider.
- Persentase fallback.
- Latensi rekomendasi.
- CTR/add-to-cart.
- AOV.
- Cancel rate.
- Token usage.

---

## 13. Roadmap AI Lanjutan (30/60/90 Hari)

### 0–30 hari

- Rekomendasi MVP + CBF.
- Ringkasan owner.
- Logging + evaluasi.

### 30–60 hari

- A/B test dan tuning bobot.
- OCR nota supplier (pilot).
- Generate deskripsi/allergen menu (dengan review).

### 60–90 hari

- Forecast stok harian.
- Analisis review/sentimen.
- Chatbot FAQ (jika ada kebutuhan jelas).
- Anomaly detection kas/shift.

### Yang ditunda

- Dynamic pricing.
- Voice ordering.
- Staff scheduling.
- Rekomendasi berbasis identitas pelanggan jangka panjang (butuh akun/consent).

---

## 14. Risiko Implementasi dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Data co-occurrence sedikit | Minimum support, fallback popularitas, CBF |
| Embedding API gagal | Simpan embedding lama; fallback popularitas |
| Kuota gratis habis | Cache, rate limit, provider fallback, feature flag |
| Data free tier dipakai Google | Agregat, consent, paid/local untuk data sensitif |
| Halusinasi angka | Fakta deterministik, schema, validasi, template fallback |
| Latensi dashboard | Lazy load, cache, timeout |
| Prompt injection | Sanitasi, batasi konteks, validasi output |
| PII bocor | Hash sesi, larang PII di prompt/log |
| Model deprecated | Env config, evaluasi, fallback model |
| Over-engineering | Mulai dari MVP deterministik; ukur sebelum tambah |
| Migrasi merusak data | Backup, additive migration, no reset |
| Adopsi owner rendah | UI sederhana, ringkasan singkat, penjelasan |
| Bias popularitas | Eksplorasi, diversifikasi, coverage metric |
| Feedback loop | Log semua sumber, evaluasi berkala |

---

## 15. Definition of Done

Fitur rekomendasi dianggap selesai jika:

- [ ] Feature flag tersedia dan default aman.
- [ ] Filter stok/status/deleted benar.
- [ ] Tidak memperlambat menu > 150 ms (p95).
- [ ] Ada fallback jika data kosong/API gagal.
- [ ] Log impresi/klik/tambah berjalan.
- [ ] Unit + integration test lulus.
- [ ] Evaluasi offline menunjukkan hybrid tidak kalah dari popularitas.
- [ ] Tidak ada PII di prompt/log.
- [ ] Dokumentasi dan runbook diperbarui.

Fitur ringkasan owner dianggap selesai jika:

- [ ] Hanya owner yang bisa mengakses.
- [ ] Angka di panel fakta cocok dengan laporan.
- [ ] Output LLM lolos schema dan validasi angka.
- [ ] Cache dan fallback template bekerja.
- [ ] Timeout/error tidak menampilkan pesan mentah.
- [ ] `AiUsage` tercatat.
- [ ] Ada tombol buat ulang dengan rate limit.
- [ ] Disclaimer ditampilkan.

---

## 16. Pertanyaan yang Perlu Dijawab Sebelum Implementasi

1. Apakah data keuangan agregat boleh dikirim ke free tier Google? Jika tidak, siapkan paid tier atau Ollama.
2. Apakah pelanggan boleh diidentifikasi per sesi via cookie hash? Apakah perlu consent banner?
3. Berapa jumlah menu dan rata-rata pesanan/hari? Ini menentukan bobot dan kelayakan CF.
4. Deployment target: Vercel, Cloudflare, atau server sendiri? Ini menentukan cron dan provider.
5. Apakah ada cron/background job yang diizinkan?
6. Siapa yang mereview output ringkasan owner?
7. Berapa lama log rekomendasi disimpan?
8. Apakah ada data cost/margin untuk ranking berbasis margin?
9. Apakah perlu rekomendasi untuk lokasi resto dan cafe secara terpisah? (Disarankan: ya.)
10. Apakah fitur rekomendasi harus muncul untuk semua pelanggan atau bisa dimatikan per meja?

---

## 17. Referensi Internal

- `.opencode/AI-RESEARCH.md` — riset provider, algoritma, privasi.
- `.opencode/PRD.md` — fitur dan status produk.
- `.opencode/ARCHITECTURE.md` — arsitektur aplikasi.
- `.opencode/CONVENTIONS.md` — konvensi kode.
- `.opencode/SECURITY.md` — aturan keamanan dan larangan operasi database.
- `prisma/schema.prisma` — model `Menu`, `Pesanan`, `DetailPesanan`, `Meja`.
- `src/app/actions/pesanan.ts` — `getMenusForCustomer`, `getCustomerMenuData`, `createPesanan`.
- `src/app/actions/laporan.ts` — agregasi laporan.
- `src/app/actions/dashboard.ts` — statistik dashboard.
- `src/app/(customer)/[tokenMeja]/page.tsx` — halaman menu pelanggan.
- `src/components/customer/menu-card.tsx` — kartu menu.
- `src/components/customer/cart-sheet.tsx` — keranjang.
- `src/lib/rate-limiter.ts` — rate limiter.
- `src/lib/sesi.ts` — cookie `pm_device`.
- `src/proxy.ts` — pemasangan cookie perangkat.

---

## 18. Penutup

Rencana ini sengaja **tidak** langsung memasang LLM di semua tempat. Urutannya adalah:

1. buat data dan pengukuran yang benar,
2. kirim rekomendasi deterministik yang berguna,
3. tambahkan embedding untuk kualitas,
4. tambahkan LLM hanya untuk narasi yang aman,
5. baru ekspansi ke OCR/forecast.

Dengan cara ini, Pringmoni mendapat manfaat AI tanpa mengorbankan kecepatan, keamanan data, atau keandalan operasional.
