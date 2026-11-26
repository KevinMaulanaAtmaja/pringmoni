# Riset AI Pringmoni

> **Tanggal riset:** 5 November 2026  
> **Status:** riset selesai, belum implementasi  
> **Dokumen rencana:** [AI-PLAN.md](./AI-PLAN.md)  
> **Lingkup:** model AI gratis, rekomendasi pesanan pelanggan (CBF/CF/hybrid), ringkasan performa untuk owner, dan peluang integrasi AI lain.

---

## 0. Ringkasan Eksekutif

1. **Rekomendasi pelanggan sebaiknya tidak memakai LLM di jalur utama.** Data restoran kecil lebih cocok untuk **hybrid recommender deterministik**: popularitas + item-item co-occurrence (CF implisit) + content-based filtering (CBF) berbasis embedding. LLM hanya dipakai untuk hal yang memang butuh bahasa, seperti ringkasan owner.
2. **Google AI Studio / Gemini API adalah pilihan utama untuk model gratis.** Free tier tersedia untuk `gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, dan model embedding (`gemini-embedding-2`, `gemini-embedding-001`). Cocok karena mendukung Bahasa Indonesia, structured output (JSON Schema), dan embedding dalam satu provider.
3. **Gunakan Groq free tier sebagai fallback** untuk ringkasan/chat karena cepat dan OpenAI-compatible. OpenRouter cocok untuk eksperimen, tetapi kuota gratisnya kecil. Cloudflare Workers AI bisa menjadi opsi jika deploy di Cloudflare. Hugging Face Inference Providers **bukan lagi gratis** untuk akun free (per riset ini).
4. **Rekomendasi pelanggan yang disarankan:** dua tahap.
   - Tahap 1: candidate generation dari popularitas, co-occurrence, dan CBF.
   - Tahap 2: ranking hybrid + filter stok/lokasi + diversifikasi.
   - Cold start: tampilkan **"Favorit hari ini"**; setelah pelanggan menambah item, tampilkan **"Sering dipesan bersama"**.
5. **Ringkasan owner yang disarankan:** agregasi data deterministik dari laporan yang sudah ada, lalu LLM hanya menulis narasi singkat. Angka tetap berasal dari database, bukan dari LLM. Wajib ada cache, fallback template, dan validasi angka.
6. **Catatan privasi penting:** free tier Gemini **menggunakan data untuk meningkatkan produk Google** (`Used to improve our products: Yes`). Jangan mengirim nama pelanggan, nomor telepon, data pembayaran, atau data keuangan sensitif tanpa persetujuan. Untuk data sensitif, pertimbangkan paid tier (sangat murah untuk volume kecil) atau model lokal (Ollama).
7. **Peluang AI lain yang paling layak setelah dua fitur di atas:** OCR nota supplier/stok, forecast stok harian, dan generate deskripsi/allergen menu. Chatbot dan dynamic pricing ditunda karena risiko operasional lebih tinggi.

### Keputusan yang disarankan

| Komponen | Pilihan | Alasan |
|---|---|---|
| Provider utama | Google AI Studio / Gemini API | Free tier, multimodal, embedding, structured output, Bahasa Indonesia |
| Model teks | `gemini-3.5-flash-lite` (volume tinggi), `gemini-3.8-flash` (kualitas) | Free tier; Flash-Lite murah/cepat, Flash lebih kuat |
| Model embedding | `gemini-embedding-2`, 768 dimensi | Free tier; 100+ bahasa; cukup untuk < 500 menu |
| Fallback teks | Groq `openai/gpt-oss-120b` / `openai/gpt-oss-20b` | Cepat, OpenAI-compatible, free tier 30 RPM / 1.000 RPD |
| Rekomendasi pelanggan | Deterministik hybrid (CF + CBF + popularitas) | Tidak ada biaya per request, rendah latensi, bisa dijelaskan |
| Ringkasan owner | LLM + fakta deterministik + cache + fallback | Ringkas, tetapi angka tetap valid |
| Model lokal (opsional) | Ollama + model kecil / embedding lokal | Untuk privasi atau jika kuota gratis habis |
| Yang **tidak** disarankan | LLM untuk hitung harga, stok, pembayaran, atau ubah status pesanan | Risiko halusinasi dan dampak operasional |

---

## 1. Konteks Aplikasi dan Data yang Tersedia

### 1.1 Fitur yang sudah ada

Berdasarkan `.opencode/PRD.md`, `.opencode/ARCHITECTURE.md`, dan kode:

- Customer self-order lewat token meja (`src/app/(customer)/[tokenMeja]/page.tsx`).
- Menu diambil dari `getCustomerMenuData()` di `src/app/actions/pesanan.ts:131`.
- Daftar menu untuk pelanggan difilter `statusMenu = 'tersedia'`, `stokManual > 0`, dan `deletedAt = null` di `src/app/actions/pesanan.ts:78`.
- Keranjang dan checkout ada di `src/components/customer/cart-sheet.tsx` dan `src/app/(customer)/[tokenMeja]/checkout/page.tsx`.
- Dashboard owner sudah punya statistik, grafik, laporan, menu terlaris, analisis kategori, dan perbandingan periode di `src/app/actions/dashboard.ts` dan `src/app/actions/laporan.ts`.
- Ada rate limiter generik di `src/lib/rate-limiter.ts`.
- Ada cookie penanda perangkat `pm_device` di `src/lib/sesi.ts:13`, dipasang oleh `src/proxy.ts:128`. Ini bisa dipakai sebagai basis **session ID anonim** untuk rekomendasi, dengan hashing.

### 1.2 Data yang relevan untuk AI

| Sumber data | Model/field | Nilai untuk AI |
|---|---|---|
| Menu | `Menu.namaMenu`, `deskripsi`, `harga`, `kategoriId`, `statusMenu`, `stokManual` | Fitur CBF, filter kandidat, harga, ketersediaan |
| Kategori | `KategoriMenu.namaKategori`, `lokasi` (`resto`/`cafe`), `pilihanSuhu` | Konteks lokasi, diversifikasi, varian suhu |
| Foto menu | `MenuFoto.fotoUrl` | Multimodal embedding/quality check (opsional) |
| Pesanan | `Pesanan.createdAt`, `mejaId`, `totalHarga`, `statusPesanan`, `statusPembayaran`, `metodePembayaran` | Basket, waktu, status valid, payment mix |
| Detail pesanan | `DetailPesanan.menuId`, `jumlah`, `hargaSaatPesan` | Item-item co-occurrence, popularitas, AOV |
| Meja | `Meja.nomorMeja`, `tokenMeja`, `kapasitas`, `statusMeja` | Konteks sesi, turnover |
| Stok/resep | `RiwayatStok`, `ResepMenu`, bahan | Forecast stok, OCR, waste analysis |
| Shift/kasir | `ShiftKasir`, `Users` | Anomaly detection, laporan shift |

### 1.3 Keterbatasan data saat ini

| Keterbatasan | Dampak | Solusi |
|---|---|---|
| Tidak ada rating/review pelanggan | Tidak bisa explicit feedback CF | Gunakan implicit feedback: pesanan dibayar = positif |
| Tidak ada akun pelanggan | Tidak ada identitas jangka panjang | Session-level personalization via cookie hash; jangan klaim "personalized" berlebihan |
| Tidak ada log klik/impresi | Sulit mengukur rekomendasi | Tambahkan `RekomendasiLog` sejak fase awal |
| Volume transaksi restoran kecil | CF bisa lemah/kosong | CBF + popularitas + co-occurrence; minimum support |
| Menu bisa habis | Rekomendasi tidak boleh menyesatkan | Filter stok real-time; fallback ke item tersedia |
| Tidak ada data cost/margin di menu | Tidak bisa margin-aware ranking | Gunakan harga sebagai proxy; tambahkan cost nanti jika ada |
| Tidak ada data cuaca/event | Konteks terbatas | Mulai dari waktu + lokasi; tambah cuaca nanti |

**Implikasi:** jangan mulai dengan deep learning atau matrix factorization yang butuh data besar. Mulai dari statistik sederhana + embedding, lalu ukur.

---

## 2. Masalah yang Ingin Diselesaikan

### 2.1 Pelanggan

- Menu banyak dan kategori banyak → pelanggan bingung memilih.
- Pelanggan baru (cold start) tidak punya riwayat.
- Sulit menemukan pasangan menu (mis. minuman pendamping makanan).
- Rekomendasi harus tetap akurat saat stok berubah.

### 2.2 Owner

- Data performa tersebar di beberapa halaman/laporan.
- Owner butuh ringkasan singkat: apa yang naik/turun, kenapa, dan apa yang harus dilakukan.
- Ringkasan harus berbasis angka nyata, bukan opini LLM.

### 2.3 Metrik keberhasilan

| Level | Metrik | Target awal |
|---|---|---|
| Rekomendasi | CTR rekomendasi | ≥ 8–12% (baseline diukur dulu) |
| Rekomendasi | Add-to-cart dari rekomendasi | ≥ 5% |
| Rekomendasi | Kenaikan AOV | +3–8% (uji A/B) |
| Rekomendasi | Coverage menu | ≥ 30% menu pernah muncul |
| Owner | Waktu membaca laporan | < 2 menit |
| Owner | Ringkasan dipakai/dibuka | ≥ 3×/minggu |
| Sistem | Latensi rekomendasi | < 150 ms (tanpa LLM) |
| Sistem | Fallback rate | < 5% request AI gagal |

Angka target ini hipotesis; baseline harus diukur sebelum implementasi.

---

## 3. Dasar Algoritma yang Relevan

### 3.1 Content-Based Filtering (CBF)

**Ide:** rekomendasikan menu yang mirip dengan menu yang disukai/dilihat pelanggan, berdasarkan konten menu.

Fitur yang tersedia:

- Nama menu.
- Deskripsi.
- Kategori.
- Lokasi (`resto`/`cafe`).
- Rentang harga.
- Pilihan suhu (`pilihanSuhu`).
- Foto (opsional, multimodal).

Cara kerja:

1. Ubah teks menu menjadi vektor embedding.
2. Vektor sesi pelanggan = rata-rata berbobot embedding menu yang sudah ada di keranjang/riwayat.
3. Hitung cosine similarity ke menu kandidat.
4. Urutkan, filter stok, ambil top-N.

Rumus:

```text
cos(u, v) = (u · v) / (||u|| × ||v||)
```

Kelebihan:

- Bekerja untuk menu baru.
- Tidak butuh banyak transaksi.
- Bisa menjelaskan "mirip dengan menu ini".

Kekurangan:

- Tidak menangkap pola "sering dibeli bersama".
- Kualitas tergantung deskripsi menu.
- Bisa terlalu homogen.

### 3.2 Collaborative Filtering (CF) Implisit

**Ide:** gunakan pola keranjang pesanan. Jika banyak pelanggan membeli A dan B bersama, maka A dan B berhubungan.

Karena tidak ada rating dan akun pelanggan, gunakan **item-item co-occurrence** (market basket analysis), bukan user-based CF.

Rumus:

```text
support(A, B)      = |transaksi yang memuat A dan B| / |total transaksi|
confidence(A → B)  = |transaksi yang memuat A dan B| / |transaksi yang memuat A|
lift(A, B)         = confidence(A → B) / support(B)
```

Skor praktis:

```text
skorCF(A → B) = lift(A, B) × log(1 + |A∩B|) × decay(waktu)
```

- `decay` bisa memakai half-life 60–90 hari.
- Minimal co-occurrence: 3–5 transaksi agar tidak noise.
- Hanya hitung dari pesanan yang valid: `statusPembayaran = 'berhasil'`, bukan `dibatalkan`, `deletedAt = null`.
- Exclude item yang jarang muncul.

Kelebihan:

- Menemukan pasangan yang tidak terduga.
- Bagus untuk cross-sell ("Sering dipesan bersama").
- Tidak butuh LLM.

Kekurangan:

- Cold start untuk menu baru.
- Popularity bias: menu populer mendominasi.
- Data sedikit → co-occurrence tidak stabil.

### 3.3 Hybrid

Gabungkan:

- CF (co-occurrence) → relevansi berdasarkan perilaku.
- CBF (embedding) → relevansi berdasarkan konten.
- Popularitas → fallback dan cold start.
- Konteks → waktu, lokasi resto/cafe, harga.
- Eksplorasi → sesekali tampilkan menu baru/underdog.

Contoh skor:

```text
skor = 0.40 × CF_norm
     + 0.25 × CBF_norm
     + 0.20 × Popularitas_norm
     + 0.10 × Konteks_norm
     + 0.05 × Eksplorasi
```

Bobot harus bisa dikonfigurasi dan dievaluasi. Jangan menganggap bobot ini final.

### 3.4 Cold Start

| Kondisi | Strategi |
|---|---|
| Pelanggan baru, keranjang kosong | Popularitas + konteks waktu/lokasi + stok |
| Keranjang 1 item | CF item-item + CBF mirip item tersebut |
| Keranjang ≥ 2 item | Hybrid penuh |
| Menu baru | Boost eksplorasi + CBF ke menu populer |
| Data transaksi sedikit | Turunkan bobot CF, naikkan popularitas/CBF |

### 3.5 Diversifikasi dan Eksplorasi

- **MMR (Maximal Marginal Relevance):** kurangi item yang terlalu mirip dengan item yang sudah dipilih.
- Maksimal 1–2 item per kategori.
- 5–10% slot untuk eksplorasi menu baru/underdog.
- Jangan tampilkan item yang sudah ada di keranjang untuk cross-sell.

### 3.6 Evaluasi

**Offline:**

- Temporal split: latih dari data sebelum tanggal X, uji setelahnya.
- HitRate@K, Precision@K, Recall@K, NDCG@K.
- Coverage, novelty, diversity.
- Bandingkan: popularitas saja vs CF vs CBF vs hybrid.

**Online:**

- CTR rekomendasi.
- Add-to-cart rate.
- AOV.
- Conversion rate.
- Revenue per session.
- Guardrail: cancel rate, stock-out complaint, waktu muat halaman.

Tanpa log impresi/klik, evaluasi online tidak mungkin. Karena itu `RekomendasiLog` harus ada sejak fase pertama.

---

## 4. Provider dan Model AI Gratis (Riset 5 November 2026)

> Harga dan kuota bisa berubah. Angka di bawah adalah hasil dokumentasi resmi pada tanggal riset. Sebelum implementasi, cek ulang halaman resmi masing-masing provider.

### 4.1 Perbandingan provider

| Provider | Kuota gratis | Model yang relevan | Kelebihan | Keterbatasan | Verdict |
|---|---|---|---|---|---|
| **Google AI Studio / Gemini API** | Free tier untuk `gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`; embedding `gemini-embedding-2` dan `gemini-embedding-001` gratis | Gemini Flash/Flash-Lite, Gemini Embedding | Multimodal, structured output, embedding, Bahasa Indonesia, satu API | Rate limit dinamis; free tier datanya dipakai untuk improve products | **Primary** |
| **Groq** | Free plan: 30 RPM, 1.000 RPD, 8.000 TPM, 200.000 TPD per model | `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b` | Sangat cepat, OpenAI-compatible, structured output | Tidak ada embedding yang jelas di free plan; model terbatas | **Fallback teks** |
| **OpenRouter** | 20 RPM; 50 RPD jika belum pernah beli kredit; 1.000 RPD jika sudah beli ≥ 10 kredit | Model berakhiran `:free` (katalog berubah) | Satu API untuk banyak model; bagus untuk eksperimen | Kuota 50 RPD kecil; kualitas/limit bervariasi | **Eksperimen/fallback** |
| **Cloudflare Workers AI** | 10.000 Neurons/hari | `@cf/openai/gpt-oss-120b`, `@cf/openai/gpt-oss-20b`, `@cf/qwen/qwen3.8-27b`, `@cf/baai/bge-m3`, `@cf/qwen/qwen3-embedding-0.6b` | Murah, dekat dengan edge, ada embedding | Kuota harian kecil; cocok jika deploy di Cloudflare | **Opsional** |
| **Hugging Face Inference Providers** | Akun free: **tidak ada** kredit bulanan; PRO $2/bulan | Banyak model open | Ekosistem model besar | Bukan gratis untuk produksi | **Tidak diprioritaskan** |
| **Ollama / model lokal** | Gratis (biaya hardware/listrik) | Llama/Qwen/Gemma kecil, `nomic-embed-text`, `bge-m3` | Privasi, offline, tanpa biaya per request | Butuh server/mini PC; operasional lebih rumit | **Opsi privasi** |

### 4.2 Google AI Studio / Gemini API — detail

**Model teks yang masuk free tier (berdasarkan halaman pricing):**

| Model | Free tier input | Free tier output | Catatan |
|---|---:|---:|---|
| `gemini-3.8-flash` | Free of charge | Free of charge | Model Flash paling kuat; cocok untuk ringkasan/analisis |
| `gemini-3.5-flash-lite` | Free of charge | Free of charge | Cepat dan hemat; cocok untuk volume tinggi |
| `gemini-3.1-flash-lite` | Free of charge | Free of charge | Alternatif Flash-Lite |

Model flagship/preview seperti `Gemini 4 Argon` dan `Gemini 3.1 Pro Preview` **tidak** tercantum sebagai free tier pada halaman pricing saat riset. Gunakan Flash/Flash-Lite untuk fitur gratis.

**Model embedding:**

| Model | Free tier | Dimensi | Input | Catatan |
|---|---|---:|---:|---|
| `gemini-embedding-2` | Text/image/audio/video free of charge | 128–3.072 (disarankan 768/1.536/3.072) | 8.192 token | Multimodal; 100+ bahasa |
| `gemini-embedding-001` | Text free of charge | 128–3.072 | 2.048 token | Text-only; fallback sederhana |

Untuk menu restoran, **768 dimensi** sudah cukup. Lebih besar belum tentu lebih baik dan membuat penyimpanan lebih berat.

**Rate limit:**

- Google membatasi **RPM**, **TPM**, dan **RPD** per project (bukan per API key).
- Angka pastinya **dinamis** dan hanya terlihat di AI Studio setelah login (`https://aistudio.google.com/rate-limit`).
- Dokumentasi menyatakan: *“Specified rate limits are not guaranteed and actual capacity may vary.”*
- RPD reset tengah malam waktu Pasifik.
- Rencana harus mengasumsikan kuota kecil dan selalu punya fallback. Jangan hardcode asumsi “250 request/hari” tanpa mengecek dashboard.

**Structured output:**

- Gemini mendukung JSON Schema; SDK JS juga bisa memakai Zod.
- Cocok untuk ringkasan owner yang harus menghasilkan JSON valid.
- Tetap validasi output di server; jangan percaya 100% pada model.

**Catatan API 2026:**

- Dokumentasi Gemini terbaru memakai **Interactions API** (bukan hanya `generateContent` lama). Saat implementasi, ikuti contoh resmi terbaru dan jangan mengasumsikan endpoint lama.
- Simpan nama model di environment variable, bukan hardcode.

### 4.3 Groq — detail

Free plan (berdasarkan dokumentasi Groq):

| Model | RPM | RPD | TPM | TPD |
|---|---:|---:|---:|---:|
| `openai/gpt-oss-120b` | 30 | 1.000 | 8.000 | 200.000 |
| `openai/gpt-oss-20b` | 30 | 1.000 | 8.000 | 200.000 |
| `qwen/qwen3.8-27b` | 30 | 1.000 | 8.000 | 200.000 |

Selain itu, Groq menyediakan speech-to-text `whisper-large-v3` dan `whisper-large-v3-turbo` dengan 20 RPM dan 2.000 RPD di free plan. Ini berguna jika nanti ingin mengeksplorasi voice ordering.

Kelebihan:

- Latensi sangat rendah.
- API kompatibel OpenAI, mudah dijadikan fallback.
- Cocok untuk ringkasan singkat atau chat.

Keterbatasan:

- Free plan dibatasi per model; 1.000 RPD cukup untuk owner summary, tetapi tidak untuk rekomendasi per request.
- Embedding tidak dijadikan andalan di free plan.
- Cek terms privasi sebelum mengirim data restoran.

### 4.4 OpenRouter — detail

- Free model variant adalah model dengan ID berakhiran `:free`.
- 20 request/menit.
- 50 request/hari jika akun belum pernah membeli kredit.
- 1.000 request/hari jika sudah membeli minimal 10 kredit (ambang dapat berubah; cek dokumentasi).
- Tidak ada jaminan model gratis tertentu tersedia selamanya.
- Bagus untuk **eksperimen model** dan fallback, bukan primary untuk fitur produksi.

### 4.5 Cloudflare Workers AI — detail

- Free allocation: **10.000 Neurons/hari**.
- Model yang relevan: `@cf/openai/gpt-oss-120b`, `@cf/openai/gpt-oss-20b`, `@cf/qwen/qwen3.8-27b`, `@cf/baai/bge-m3`, `@cf/qwen/qwen3-embedding-0.6b`.
- Kelebihan: dekat dengan edge, ada embedding, cocok jika aplikasi di-deploy di Cloudflare.
- Keterbatasan: kuota harian kecil; harga per model berbeda; belum tentu cocok untuk Next.js di Vercel tanpa pemanggilan HTTP tambahan.

### 4.6 Hugging Face Inference Providers — detail

- Akun free: **tidak ada kredit bulanan** untuk Inference Providers saat riset.
- PRO: $2/bulan kredit, bisa dipakai untuk berbagai model.
- Bukan pilihan “gratis” untuk produksi, kecuali memang sudah berlangganan PRO.
- Namun, model open-source dari Hugging Face bisa dijalankan sendiri via Ollama/Transformers.js.

### 4.7 Ollama / model lokal — detail

Opsi jika privasi lebih penting daripada kemudahan:

- LLM kecil: Qwen, Llama, Gemma versi 3B–8B.
- Embedding: `nomic-embed-text`, `bge-m3`, atau model sentence-transformers.
- Biaya: hardware + listrik; tidak ada biaya per request.
- Cocok untuk: restoran dengan mini PC/server lokal, data sensitif, atau koneksi internet tidak stabil.
- Tidak cocok untuk: deploy serverless tanpa GPU/CPU kuat.

### 4.8 Rekomendasi provider per use case

| Use case | Primary | Fallback | Alasan |
|---|---|---|---|
| Embedding menu | `gemini-embedding-2` (768 dim) | Ollama `bge-m3` / `nomic-embed-text` | Free tier, multibahasa, tanpa dependency SDK |
| Rekomendasi pelanggan | Tidak ada LLM; engine deterministik | Popularitas | Latensi rendah, biaya nol, bisa dijelaskan |
| Ringkasan owner | `gemini-3.5-flash-lite` | Groq `gpt-oss-120b`, lalu template | Cepat, murah, structured output |
| Deskripsi menu | `gemini-3.5-flash-lite` | Groq `gpt-oss-20b` | Teks pendek, non-sensitif |
| OCR nota supplier | `gemini-3.8-flash` (multimodal) | Tesseract / input manual | Butuh pemahaman gambar dan teks |
| Chatbot FAQ | `gemini-3.5-flash-lite` + RAG | Groq | Murah, tetapi wajib guardrail |

---

## 5. Privasi, Keamanan, dan Kepatuhan

### 5.1 Free tier dan data

- Free tier Gemini: **data digunakan untuk meningkatkan produk Google**.
- Paid tier Gemini: data **tidak** digunakan untuk improve products (berdasarkan tabel pricing).
- Artinya:
  - Menu (nama, deskripsi, harga) relatif tidak sensitif → aman untuk free tier.
  - Ringkasan performa restoran (pendapatan, margin, cancel rate, shift) bisa sensitif secara bisnis → perlu persetujuan owner.
  - Nama pelanggan, nomor telepon, email, data pembayaran, token meja → **jangan dikirim ke LLM**.
- Jika owner tidak setuju data keuangan dikirim ke free tier:
  - Gunakan paid tier (biaya sangat kecil untuk volume ini), atau
  - Gunakan Ollama lokal, atau
  - Gunakan ringkasan template deterministik tanpa LLM.

### 5.2 Prinsip data minimization

- Kirim **agregat**, bukan raw rows.
- Hash session ID; jangan simpan device ID mentah.
- Jangan kirim nama pelanggan ke prompt.
- Jangan kirim `tokenMeja` mentah ke provider.
- Log AI tidak boleh berisi PII.
- Retention `RekomendasiLog` dan `AiUsage` dibatasi (mis. 90 hari).

### 5.3 Keamanan implementasi

- API key hanya di server: `GEMINI_API_KEY`, `GROQ_API_KEY`; **jangan** `NEXT_PUBLIC_`.
- Server Action wajib cek session/role untuk fitur owner.
- Rekomendasi pelanggan bersifat publik, tetapi tetap kena rate limit.
- Validasi output LLM dengan Zod/JSON Schema.
- Jangan beri LLM akses menulis database, mengubah harga, atau mengubah status pesanan.
- Prompt injection: deskripsi menu dikontrol owner, tetapi tetap sanitasi dan batasi instruksi.
- Audit log untuk generate ringkasan owner.

---

## 6. Desain Riset untuk Rekomendasi Pelanggan

### 6.1 Arsitektur dua tahap

```text
Request (token meja + isi keranjang)
        │
        ▼
Candidate generation
  ├─ Popularitas (30 hari, per lokasi/waktu)
  ├─ CF co-occurrence (menu di keranjang)
  └─ CBF neighbors (embedding menu di keranjang)
        │
        ▼
Filter
  ├─ statusMenu = tersedia
  ├─ stokManual > 0
  ├─ deletedAt = null
  └─ exclude item yang sudah di keranjang (untuk cross-sell)
        │
        ▼
Hybrid ranking + diversifikasi (MMR)
        │
        ▼
Top 4–6 rekomendasi + alasan singkat
```

### 6.2 Mengapa precompute relasi, bukan hitung vektor saat request

Untuk restoran dengan < 500 menu:

- Simpan embedding di `MenuEmbedding`.
- Precompute top-20 neighbor CBF per menu ke `MenuRelation`.
- Precompute co-occurrence CF ke `MenuRelation`.
- Saat request, cukup query relasi + popularitas → cepat, tidak perlu memuat semua vektor.

Jika jumlah menu ribuan, baru pertimbangkan pgvector. Untuk MVP, `Float[]` + precomputed neighbors lebih sederhana.

### 6.3 Session identity

Karena tidak ada akun pelanggan:

```text
sesiId = SHA-256(pm_device + tokenMeja + tanggal + PEPPER)
```

- `pm_device` dari cookie `src/lib/sesi.ts`.
- `tanggal` membuat ID berputar setiap hari.
- `PEPPER` disimpan di env server.
- Jika cookie tidak ada, fallback ke `SHA-256(tokenMeja + tanggal + PEPPER)`.
- Ini bukan identitas orang; ini identitas sesi. Jangan klaim personalisasi jangka panjang.

### 6.4 Aturan UI

- Sebelum ada item di keranjang: **"Favorit hari ini"**.
- Setelah ada item: **"Sering dipesan bersama"** (CF) dan/atau **"Mirip dengan pilihanmu"** (CBF).
- Di dalam cart sheet: cross-sell 2–3 item, jangan mengganggu checkout.
- Tampilkan alasan singkat:
  - "Sering dipesan bersama Nasi Goreng"
  - "Mirip dengan Es Teh"
  - "Favorit di jam makan siang"
- Jangan tampilkan rekomendasi yang stoknya habis.
- Jangan menampilkan lebih dari 6 item.

### 6.5 Evaluasi dan logging

Log minimal:

```text
sesiId, menuId, sumber (populer/cf/cbf/hybrid/eksplorasi),
skor, posisi, konteks (lokasi, waktu), dilihat, diklik, ditambahkan, createdAt
```

Tanpa log ini, tidak ada cara mengukur CTR atau melakukan A/B test.

---

## 7. Desain Riset untuk Ringkasan Owner

### 7.1 Prinsip

1. **Fakta dari database, narasi dari LLM.**
2. **Angka tidak boleh dikarang.**
3. **Cache dan fallback wajib.**
4. **Hanya owner yang boleh mengakses.**
5. **Data yang dikirim adalah agregat, bukan data mentah pelanggan.**

### 7.2 Fakta yang dikirim

Contoh `fakta` JSON:

```json
{
  "periode": "mingguan",
  "label": "Minggu ke-3 November 2026",
  "pendapatan": 12500000,
  "pendapatan_sebelumnya": 11800000,
  "pertumbuhan_persen": 5.9,
  "jumlah_pesanan": 312,
  "aov": 40064,
  "menu_terlaris": [
    { "nama": "Nasi Goreng Pringsewu", "terjual": 88, "pendapatan": 2200000 }
  ],
  "menu_kurang_laku": [
    { "nama": "Es Campur", "terjual": 3, "pendapatan": 45000 }
  ],
  "kategori": [
    { "nama": "Makanan", "pendapatan": 8000000, "porsi": 65 }
  ],
  "jam_sibuk": [
    { "jam": "12:00-13:00", "pesanan": 54 }
  ],
  "metode_pembayaran": {
    "tunai": 40,
    "qris": 52,
    "transfer": 8
  },
  "cancel_rate_persen": 2.1,
  "refund": 1,
  "voucher_dipakai": 18,
  "data_tidak_cukup": false
}
```

### 7.3 Prompt yang disarankan

```text
Anda adalah analis operasional restoran. Gunakan HANYA fakta JSON di bawah.
Jangan mengarang angka, nama menu, atau penyebab yang tidak ada di data.
Tulis dalam Bahasa Indonesia yang singkat dan praktis untuk owner restoran.

Tugas:
1. Ringkas performa dalam maksimal 5 bullet.
2. Berikan 3 insight utama (apa yang naik/turun dan dampaknya).
3. Berikan 3 rekomendasi aksi yang bisa dilakukan minggu ini.
4. Sebutkan 1–3 risiko dan mitigasinya.
5. Jika data tidak cukup, set "data_tidak_cukup": true dan jelaskan.

Kembalikan JSON sesuai schema:
{
  "ringkasan": "string maksimal 120 kata",
  "insight": [{ "judul": "string", "fakta": "string", "dampak": "string" }],
  "rekomendasi": [{ "aksi": "string", "alasan": "string", "prioritas": "tinggi|sedang|rendah" }],
  "risiko": [{ "risiko": "string", "mitigasi": "string" }],
  "data_tidak_cukup": false
}
```

### 7.4 Grounding dan validasi angka

Cara paling aman:

- Tampilkan **panel fakta deterministik** di UI (angka dari database).
- LLM hanya menulis narasi yang merujuk ke fakta.
- Setelah output, ekstrak angka dari narasi dan cocokkan dengan fakta. Jika ada angka yang tidak dikenal, jangan tampilkan atau regenerate.
- Atau gunakan placeholder (`{{pendapatan}}`) yang diisi oleh aplikasi, bukan oleh LLM.

### 7.5 Cache dan fallback

- Cache key: `hash(periode + tanggal + dataHash)`.
- TTL: 6 jam untuk periode berjalan, 24 jam untuk periode lampau.
- Tombol "Buat ulang" dengan rate limit 1×/jam.
- Jika API gagal/timeout/kuota habis: tampilkan ringkasan template deterministik.
- Simpan `AiUsage` untuk memantau token, latency, dan error.

### 7.6 Estimasi biaya jika nanti pindah ke paid tier

Asumsi per ringkasan: 3.000 token input + 800 token output.

| Model | Input | Output | Per ringkasan | 1.000 ringkasan |
|---|---:|---:|---:|---:|
| `gemini-3.5-flash-lite` | $0.30/1M | $2.50/1M | ~$0.0029 | ~$2.90 |
| `gemini-3.8-flash` | $0.75/1M | $3.75/1M | ~$0.0053 | ~$5.30 |

Untuk embedding 200 menu × ~50 token = 10.000 token; dengan `gemini-embedding-2` $0.20/1M → ~$0.002. Sangat murah.

---

## 8. Peluang Integrasi AI Lain

| Peluang | Nilai | Effort | Data | Model/Pendekatan | Risiko | Prioritas |
|---|---|---|---|---|---|---|
| Ringkasan performa owner | Tinggi | Rendah | Laporan agregat | Gemini Flash-Lite + template | Halusinasi angka | **P0** |
| Rekomendasi menu hybrid | Tinggi | Sedang | Menu + pesanan | CF + CBF + popularitas | Data sedikit, bias populer | **P0** |
| OCR nota supplier/stok | Tinggi | Sedang | Foto nota, bahan | Gemini multimodal + validasi manusia | Akurasi, data sensitif | **P1** |
| Forecast stok harian | Tinggi | Sedang | Riwayat stok + penjualan | Moving average/Prophet + LLM explanation | Data musiman sedikit | **P1** |
| Generate deskripsi & allergen menu | Sedang | Rendah | Menu | Gemini Flash-Lite | Perlu review manusia | **P2** |
| Analisis review/sentimen | Sedang | Sedang | Teks review | LLM | Sumber review, bias | **P2** |
| Chatbot FAQ pelanggan | Sedang | Sedang | Menu/FAQ | RAG + Gemini/Groq | Halusinasi, ekspektasi | **P2** |
| Anomaly detection kas/shift | Tinggi | Sedang | Transaksi/shift | Statistik + LLM explanation | False positive | **P2** |
| ETA masak | Sedang | Sedang | Timestamp pesanan | Regresi sederhana | Data antrean | **P2** |
| Voice ordering | Rendah–sedang | Tinggi | Audio | Whisper/Gemini | Akurasi, privasi | **P3** |
| Dynamic promo/pricing | Sedang | Tinggi | Pesanan, stok | Bandit/rule-based | Fairness, kompleksitas | **P3** |
| Staff scheduling | Sedang | Tinggi | Shift, preferensi | OR-Tools (bukan LLM) | Adopsi | **P3** |

### Tiga peluang berikutnya yang disarankan

1. **OCR nota supplier / stok** — dampak operasional besar, bisa menghemat input manual. Perlu alur upload + verifikasi manusia.
2. **Forecast stok harian** — kurangi waste dan stock-out. Mulai dari statistik sederhana, bukan LLM.
3. **Generate deskripsi & allergen menu** — cepat, murah, risiko rendah, tetapi wajib review owner.

### Yang sebaiknya dihindari dulu

- LLM untuk menghitung total harga, stok, diskon, atau pembayaran.
- LLM yang otomatis mengubah status pesanan atau mengirim refund.
- Chatbot yang menjanjikan ketersediaan/stok tanpa cek database.
- Dynamic pricing tanpa aturan bisnis dan evaluasi fairness.

---

## 9. Risiko dan Pertanyaan Terbuka

### 9.1 Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Data transaksi sedikit | CF tidak stabil | Minimum support, CBF, popularitas |
| Popularity bias | Menu populer makin dominan | Diversifikasi, eksplorasi, log coverage |
| Feedback loop | Rekomendasi menguatkan bias | Eksplorasi 5–10%, evaluasi berkala |
| Kuota gratis berubah | Fitur berhenti | Provider adapter, cache, fallback, budget |
| Data free tier dipakai Google | Privasi bisnis | Agregat, consent, paid/local |
| Halusinasi LLM | Owner salah ambil keputusan | Fakta deterministik, schema, validasi angka |
| Latensi | Menu lambat | Rekomendasi deterministik, cache, async |
| Biaya membengkak | Tagihan | Quota, max token, cache, monitoring |
| Vendor lock-in | Sulit pindah | Interface provider, env config |
| Model deprecated | Fitur rusak | Evaluasi berkala, fallback model |
| Prompt injection | Output aneh | Sanitasi, batasi konteks, validasi |
| Data PII bocor | Risiko legal | Minimisasi, hashing, retention |

### 9.2 Pertanyaan untuk owner/tim

1. Apakah pelanggan boleh diidentifikasi lintas kunjungan (cookie/hash), atau hanya per sesi?

2. Apakah data keuangan agregat boleh dikirim ke free tier Google, atau harus paid/local?

3. Apa KPI utama: AOV, jumlah item per pesanan, atau menu tertentu?

4. Deployment target: Vercel, Cloudflare, atau server sendiri?

5. Apakah boleh menambah cron/background job?

6. Siapa yang me-review output AI sebelum dipakai?

7. Berapa lama data rekomendasi/log boleh disimpan?

8. Berapa jumlah menu dan rata-rata pesanan/hari? (untuk kalibrasi bobot)

9. Apakah ada data cost/margin per menu?

10. Apakah ada data cuaca/event yang bisa dipakai sebagai konteks?

---

## 10. Sumber

Diakses 5 November 2026:

- Gemini API pricing — https://ai.google.dev/gemini-api/docs/pricing
- Gemini API rate limits — https://ai.google.dev/gemini-api/docs/rate-limits
- Gemini embeddings — https://ai.google.dev/gemini-api/docs/embeddings
- Gemini structured outputs — https://ai.google.dev/gemini-api/docs/structured-output
- Groq rate limits — https://console.groq.com/docs/rate-limits
- OpenRouter limits — https://openrouter.ai/docs/api-reference/limits
- Cloudflare Workers AI pricing — https://developers.cloudflare.com/workers-ai/platform/pricing/
- Hugging Face Inference Providers pricing — https://huggingface.co/docs/inference-providers/pricing
- Supabase pgvector — https://supabase.com/docs/guides/database/extensions/pgvector
- Google Machine Learning recommendation (konsep) — https://developers.google.com/machine-learning/recommendation

---

## 11. Kesimpulan

Untuk Pringmoni, kombinasi paling realistis adalah:

- **Rekomendasi pelanggan:** hybrid deterministik, tanpa LLM per request. Mulai dari popularitas + co-occurrence, lalu tambahkan embedding CBF.
- **Ringkasan owner:** Gemini Flash-Lite + fakta deterministik + cache + fallback template.
- **Provider:** Google AI Studio sebagai primary, Groq sebagai fallback, Ollama sebagai opsi privasi.
- **Privasi:** jangan kirim PII; batasi data ke agregat; minta persetujuan owner untuk data keuangan.
- **Urutan implementasi:** fondasi data/log → rekomendasi MVP → embedding/CBF → ringkasan owner → OCR/forecast.

Rencana teknis langkah demi langkah ada di [AI-PLAN.md](./AI-PLAN.md).
