---
name: auditing-regulations
description: Workflow terstandar untuk audit regulasi (fokus UU PDP), ekstraksi pasal, pemetaan ke keamanan teknis, pemanfaatan graphify, dan penyusunan rekomendasi stack (model/hosting/STT/dashboard AI) dalam format Markdown siap kirim.
license: MIT
compatibility: opencode
metadata:
  category: legal-audit
  audience: developers
  regulation: uu-pdp
---

# Auditing Regulations (UU PDP)

Skill ini memandu audit regulasi dengan fokus pada **Undang-Undang Pelindungan Data Pribadi (UU PDP)**, pemetaan ke kodebase, dan rekomendasi implementasi praktis.

## Kapan Digunakan
- Audit pasal UU PDP terkait keamanan, akses, logging, dan pemrosesan data pribadi
- Mapping ketentuan hukum ke kontrol teknis di sistem POS
- Menyusun rekomendasi teknologi/model/hosting/STT/dashboard AI berbasis kebutuhan audit
- Menyusun ringkasan siap kirim dalam format Markdown

## Sumber Resmi Prioritas
| Sumber | Tujuan | Catatan |
|---|---|---|
| [peraturan.go.id](https://peraturan.go.id/) | Sumber utama peraturan perundang-undangan Indonesia | Prioritaskan untuk verifikasi nomor, tahun, judul, status |
| [jdih.kemenkumham.go.id](https://jdih.kemenkumham.go.id/) | JDIH Kemenkumham | Sering memuat salinan resmi & kronologi |
| [jdih.setneg.go.id](https://jdih.setneg.go.id/) | JDIH Sekretariat Negara | Referensi tambahan untuk verifikasi |

## Workflow Baku

### 1) Persiapan
- [ ] Tentukan fokus: **UU PDP** (nomor, tahun jika diketahui). Jika tidak diketahui, cari via websearch.
- [ ] Identifikasi konteks sistem: Pringmoni POS (roles, transaksi, pelanggan, kasir, logging)
- [ ] Siapkan scope pemetaan: auth, otorisasi, audit trail, data pribadi, retensi

### 2) Pencarian & Verifikasi
- [ ] **WebSearch**: gunakan query terarah `site:peraturan.go.id "undang undang pelindungan data pribadi"` + variasi
- [ ] **WebFetch**: buka hasil paling relevan, ekstrak metadata (nomor/tahun/judul/status)
- [ ] **Cross-check**: verifikasi di minimal 1 sumber resmi lain jika memungkinkan
- [ ] Catat URL yang digunakan

### 3) Ekstraksi Pasal Relevan
Fokus pada pasal yang berdampak teknis:

| Aspek | Target Pencarian |
|---|---|
| Prinsip & dasar pemrosesan | Prinsip, dasar hukum pemrosesan, persetujuan (jika relevan) |
| Keamanan pemrosesan | Kewajiban menjamin keamanan, kerahasiaan, integritas |
| Akses & otorisasi | Pembatasan akses, wewenang |
| Pencatatan / audit | Dokumentasi, pencatatan pemrosesan |
| Hak subjek data & pertanggungjawaban | Transparansi, pemenuhan hak, pertanggungjawaban pengendali |
| Sanksi (relevan) | Hanya jika berdampak pada kebutuhan kontrol teknis |

Untuk tiap pasal: nomor pasal/ayat, bunyi inti, relevansi keamanan, status, catatan penerapan.

### 4) Pemetaan ke Kodebase & Graphify
- [ ] **Graphify Query**: `graphify query "auth rbac role logging audit trail pesanan transaksi data pribadi"` 
- [ ] **Graphify Path/Explain**: gunakan jika butuh relasi antar modul (`graphify path` / `graphify explain`)
- [ ] **Lokal Scan**: periksa `src/lib/auth.ts`, `src/proxy.ts`, `src/app/actions/logs.ts`, `src/app/actions/pesanan.ts`, `src/app/actions/users.ts`, `prisma/schema.prisma`
- [ ] **Gap Analysis**: bandingkan temuan pasal vs kontrol yang ada -> klasifikasi `Sudah` / `Cukup` / `Perlu Diperkuat`

### 5) Rekomendasi Stack (Model/Hosting/STT/Dashboard)
Susun rekomendasi berbasis free tier dan realistis untuk MVP:

#### Model AI (Gratis/Hemat)
Pertimbangkan: biaya, ketersediaan free tier, kemampuan meringkas hukum Indonesia, kecepatan.
Saran awal: `google/gemini-2.5-flash` (OpenRouter), `deepseek-chat-v3` (OpenRouter/Groq), `llama-*` (Groq). Test ringkas ekstraksi pasal.

#### Hosting Gratis
Pertimbangkan: Next.js support, env vars, custom domain, cold start.
Saran awal: `Cloudflare Pages + Workers` (paling hemat), `Render` (fullstack), `Railway` (fullstack), `Netlify`.

#### Speech-to-Text untuk Order
Pertimbangkan: offline-capable untuk kasir, akurasi Bahasa Indonesia, biaya.
Saran awal: `Web Speech API` (native, gratis) -> fallback `Groq Whisper` (API) -> opsi `faster-whisper/whisper.cpp` (self-host).

#### Dashboard Rekomendasi AI
Struktur minimal:
1. Input Audit (UU PDP + konteks)
2. Hasil Pasal (tabel + filter)
3. Mapping Teknis (korelasi file + gap)
4. Rekomendasi Kontrol (action item)
5. Rekomendasi Stack (model/hosting/STT)
6. Ekspor (Markdown siap kirim)

Stack: `Next.js + Tailwind CSS + shadcn/ui + recharts` (konsisten dengan project).

### 6) Penyusunan Output
- [ ] Gunakan template dari agent `legal-audit-a5` secara ketat
- [ ] Hanya tampilkan pasal yang **ditemukan** di sumber resmi yang diverifikasi
- [ ] Semua link sumber dicantumkan
- [ ] Tabel rapi, ringkas, siap kirim
- [ ] Action item prioritas terukur

## Checklist Kualitas
- [ ] Sumber resmi tercantum dengan URL
- [ ] Nomor/tahun/status UU PDP jelas atau dinyatakan tidak ditemukan
- [ ] Setiap pasal kunci punya relevansi keamanan
- [ ] Pemetaan teknis merujuk ke file/path nyata (bila ada)
- [ ] Gap analysis ada (Sudah/Cukup/Perlu Diperkuat)
- [ ] Rekomendasi stack lengkap (Model/Hosting/STT/Dashboard)
- [ ] Output dalam format **Markdown**
- [ ] Tanpa exploit code
- [ ] Read-only (tidak mengubah file)

## Tips Praktis
- Mulai dari `graphify query` sebelum baca seluruh kodebase - lebih cepat & terfokus
- Lebih baik sedikit pasal relevan yang terverifikasi, daripada banyak pasal yang belum pasti statusnya
- Fokus pada kontrol yang bisa langsung diuji (role check, logging, akses terbatas)
- Untuk "Speech-to-Text order", prioritaskan solusi yang minim biaya untuk kasir
- Buat rekomendasi hosting dengan catatan **free tier** saat ini
