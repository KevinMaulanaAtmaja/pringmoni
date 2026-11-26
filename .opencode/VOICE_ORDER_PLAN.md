# Rencana Voice Order + SPK Rekomendasi Menu (CBF + CF)

Mengintegrasikan voice order berbasis mood pada kiosk customer dengan **Sistem Pendukung Keputusan** (mata kuliah Sistem Pendukung Keputusan). LLM hanya dipakai untuk menerjemahkan bahasa alami menjadi vektor kriteria; **keputusan akhir dihitung oleh metode CBF dan CF** agar dapat dipertanggungjawabkan (bukan kotak hitam).

## 1. Keputusan yang sudah disepakati
| Aspek | Keputusan |
|---|---|
| Metode SPK | **CBF (Content-Based Filtering) + item-item CF (Collaborative Filtering)**, hybrid berbobot |
| LLM | `gemini-3.5-flash-lite` hanya untuk NLU: transkrip -> vektor kriteria (structured JSON) |
| Sumber suara | Web Speech API browser (`id-ID`) |
| Lokasi | Kiosk customer `/[tokenMeja]`; dashboard = voice-search filter (tanpa biaya API) |
| Privasi | Free tier Gemini (data dipakai untuk training) - diterima |
| Migrasi Prisma | **Tidak ada** (hanya data JSON hasil precompute) |
| Deploy model | **Tidak ada** - semua metode adalah aritmetika matriks kecil di serverless |

## 2. Hasil Riset Penyedia STT (Nov 2026)
| Penyedia | Free tier | Putusan |
|---|---|---|
| Web Speech API | 100% gratis, tanpa server | **Dipakai** |
| Groq whisper-large-v3-turbo | 8 jam audio/hari, 2.000 req/hari, file <=25 MB | Cadangan fase 2 (butuh upload audio) |
| Gemini `3.5-transcribe` | Free of charge | Tidak perlu (kita kirim teks) |
| Gemini `3.5-flash-lite` (teks) | Free of charge | **Dipakai untuk NLU** |
| Cloudflare Workers AI | ~214 menit audio/hari | Alternatif cadangan |
| Deepgram nova-3 / AssemblyAI | Kredit sekali $200 / $50 | Bukan recurring free |

## 3. Kerangka SPK

```
transkrip "aduh panas banget, pengen yang seger"
   â”‚
   â”œâ”€[1] NLU (Gemini Flash-Lite, structured output) -> vektor kriteria kueri
   â”‚      { suhu: "dingin", rasa: ["manis","segar"], kepekatan: 0.2,
   â”‚        kategori: ["Minuman"], energi: 0.1 }
   â”‚
   â”œâ”€[2] CBF : cosine(vektorMenu_i , vektorKueri)          -> skorMood   0..1
   â”œâ”€[3] CF  : Î£ simItemItem(seedMenu, menu_i) Â· bobot      -> skor Sosial 0..1
   â”‚      seedMenu = top-3 hasil CBF (menghindari matriks kosong saat katalog baru)
   â”œâ”€[4] skorMenu = 0.60Â·skorMood + 0.30Â·skorSosial + 0.10Â·skorStok
   â”‚
   â””â”€[5] Top-N (default 4) + rincian skor -> ditampilkan ke pengguna
```

Bobot 60/30/10 adalah **hipotesis awal yang bisa diuji**; nilai ini ditulis sebagai konstanta di satu modul supaya mudah diubah saat sidang/demo.

### 3.1 CBF - Content-Based Filtering
Representasi menu (vektor berdimensi kecil, interpretabel):

| Komponen | Sumber | Sifat |
|---|---|---|
| TF-IDF kata | `nama_menu` + `deskripsi` + `kategori.nama_kategori` | numerik, ternormalisasi L2 |
| suhu | `kategori.pilihan_suhu`, kata "es/dingin/panas/hangat" | biner |
| rasa | kamus kata kunci: manis, gurih, asam, pedas, pahit | biner (multi-hot) |
| kepekatan | kategori berat (nasi/ayam/daging) vs ringan (salad/snack) | 0..1 |
| lokasi | `kategori.lokasi` (`resto` / `cafe`) | biner |

- Tokenisasi Bahasa Indonesia: lowercase, buang tanda baca, stem sederhana (imbuhan `me-`, `di-`, `-kan`, `-an`, `-nya`), dan **stopword ID** (yang, dan, di, ini, itu, mau, pengen, deh, sih, ...).
- `cosine(q, m) = (q Â· m) / (â€–qâ€– â€–mâ€–)`. Karena kueri dibuat oleh LLM sebagai multi-hot + bobot, vektor q selalu kecil dan bisa dihitung per permintaan.
- Katalog menu di-cache di `globalThis` (pola sama dengan `src/lib/rate-limiter.ts:7`) dengan TTL 5 menit; puluhan menu x ratusan kata = mikrodetik, aman untuk serverless.
- Cold start: CBF **tidak butuh histori apa pun**, jadi rekomendasi tetap jalan di hari pertama restoran memakai fitur ini.

### 3.2 CF - Collaborative Filtering (item-item)
Kenapa **item-item** dan bukan user-item:
- Kiosk anonim per meja (`tokenMeja`), tidak ada akun pelanggan -> matriks user-item teramat jarang (sparse) dan hampir selalu cold start.
- Item-item jauh lebih padat dan stabil: jumlah menu puluhan, jumlah order ratusan.
- User-item tetap disediakan sebagai pembanding di laporan SPK bila dosen memintanya (lihat 3.5).

Formula (cosine atas vektor biner belanja-sekali):
```
sim(i, j) = co/i->j  /  sqrt(freq(i) Â· freq(j))
co(i, j)  = jumlah pesanan yang memuat menu i DAN menu j
freq(i)   = jumlah pesanan yang memuat menu i
```
- Sumber data: `DetailPesanan` digabung `Pesanan` dengan filter `statusPembayaran = "berhasil"`, `deletedAt = null`, dan `createdAt >= 90 hari terakhir` (pola filter sama dengan `src/app/actions/laporan.ts:165`).
- Matriks `sim` disimpan sebagai JSON hasil precompute (lihat 3.3). Ukuran realistis: 100 menu -> 4.950 pasang, file ratusan KB.
- Skor CF untuk sebuah kueri:
```
skorSosial(i) = Î£_{s âˆˆ seedTop3} sim(s, i) Â· bobotRank(s)   dinormalkan ke 0..1
```
`seedTop3` diambil dari hasil CBF, sehingga CF tidak pernah menghadapi matriks kosong.

### 3.3 Precompute (offline, tanpa GPU)
- Script `prisma/build-item-similarity.ts` (dijalankan `npm run seed:similarity`, pola `prisma/seed-menu.ts` yang sudah ada dengan `tsx`).
- Membaca order 90 hari -> hitung `co`, `freq`, `sim` -> tulis `src/data/menu-similarity.json`:
```json
{ "generatedAt": "2026-11-15T00:00:00.000Z",
  "menuCount": 42,
  "pairs": [{ "a": 12, "b": 31, "sim": 0.73 }] }
```
- Runtime hanya `import` file ini. Tidak ada pelatihan, tidak ada model, tidak ada layanan tambahan.
- Penyegelan: cukup jalankan script saat data pesanan bertambah banyak (manual/mingguan). Bila file tidak ada, CF otomatis nonaktif (bobot 0.30 dialokasikan ulang ke CBF) tanpa error.

### 3.4 Gerbang kelayakan (hard filter)
Sebelum pemeringkatan, buang menu yang: `statusMenu != "tersedia"`, `stokManual <= 0`, `deletedAt != null`, atau `lokasi` tidak sesuai tab aktif (`resto` / `cafe`). Ini menjamin rekomendasi tidak pernah mengarah ke menu yang tidak bisa dipesan.

### 3.5 Jepretan pembanding (opsional, untuk laporan SPK)
Bila diminta membandingkan CBF vs CF vs hybrid:
- Jalankan ketiganya atas satu kumpulan kueri uji, ukur **precision@4** dan **recall@4** terhadap label "menu yang benar-benar dipesan setelah rekomendasi".
- Log hasil lewat `Logs` (model sudah ada) atau file laporan sederhana, bukan tabel baru.

## 4. Arsitektur
```
[Mic / ketik kalimat] -> transkrip id-ID (browser)
   -> POST /api/rekomendasi { transkrip, tokenMeja }
     1. checkRateLimit(ip, "voice")              10 req / 10 menit
     2. getMenusForCustomer()                    menu dari DB, bukan dari klien
     3. NLU Gemini -> vektor kriteria
     4. CBF + CF + gate kelayakan -> peringkat 4 menu
     5. gagal / tanpa GEMINI_API_KEY -> mood-lexicon CBF-only
   <- { mood, alasan, rekomendasi: [{ menuId, skor, rincianSkor }] }
   -> sheet hasil: 3-4 MenuCard + tombol tambah ke keranjang
```
Jaminan keamanan:
- Katalog selalu dimuat ulang di server; klien tidak bisa menyuntik daftar menu.
- `stokManual` tidak pernah dikirim ke model.
- Transkrip dibatasi 500 karakter.
- Id hasil model difilter terhadap daftar menu yang lolos gate kelayakan.

## 5. Desain Data
Tanpa perubahan schema Prisma. Yang ditambahkan hanya artefak hasil precompute (`src/data/menu-similarity.json`) dan kamus leksikon di dalam kode.

Kamus leksikon (dipakai NLU fallback dan CBF untuk fitur biner):

| Sinyal | Arah kriteria |
|---|---|
| panas, gerah, haus, seger, kepanasan | suhu = dingin, rasa = segar |
| hujan, dingin, menggigil, adem | suhu = panas/hangat, kepekatan sedang |
| capek, lemas, ngantuk, butuh tenaga | rasa = manis, energi tinggi |
| laper, lapar berat | kepekatan tinggi |
| diet, sehat, ringan | kepekatan rendah, kategori ringan |
| sedih, stres, bad day | comfort food / dessert |

## 6. File
| File | Aksi |
|---|---|
| `src/lib/spk/tokenize.ts` | Baru - tokenizer + stopword ID + stem sederhana |
| `src/lib/spk/cbf.ts` | Baru - profil menu (TF-IDF + fitur biner), cosine, cache TTL |
| `src/lib/spk/cf.ts` | Baru - loader matriks, sim(i,j), skorSosial |
| `src/lib/spk/scoring.ts` | Baru - hybrid 60/30/10, gate kelayakan, rincian skor, konstanta bobot |
| `src/lib/gemini.ts` | Baru - REST `v1beta/models/gemini-3.5-flash-lite:generateContent`, `responseSchema`, timeout 15 s |
| `src/lib/mood-fallback.ts` | Baru - leksikon deterministik (dipakai bila LLM gagal) |
| `src/lib/rate-limiter.ts` | Ubah - param `namespace` (default `"login"`), profil `voice` |
| `src/app/api/rekomendasi/route.ts` | Baru - `POST`, validasi, rate limit, gate, pemeringkatan |
| `prisma/build-item-similarity.ts` | Baru - precompute matriks CF |
| `package.json` | Ubah - script `seed:similarity` |
| `src/data/menu-similarity.json` | Baru (generated) |
| `src/hooks/use-voice-input.ts` | Baru - SpeechRecognition + error handling ID |
| `src/components/customer/voice-order-sheet.tsx` | Baru - UI hasil + rincian skor |
| `src/app/(customer)/[tokenMeja]/page.tsx` | Ubah - tombol mic, state keranjang |
| `src/app/dashboard/pesanan/page.tsx` | Ubah (fase 2) - mic isi filter pencarian |
| `src/types/index.ts` | Ubah - `VoiceRecommendation`, `RekomendasiMenu`, `RincianSkor` |
| test: `src/lib/spk/*.test.ts`, `src/lib/gemini.test.ts` | Baru - vitest |
| `.env.example` | Ubah - `GEMINI_API_KEY` (nama saja) |

## 7. Fase Pengerjaan
- **F1 - Fondasi metode:** `tokenize.ts`, `cbf.ts` + test (cosine, profil menu, cold start).
- **F2 - CF + precompute:** `build-item-similarity.ts`, `npm run seed:similarity`, `cf.ts` + test (matriks kosong, menu baru).
- **F3 - Hybrid & endpoint:** `scoring.ts`, gate kelayakan, `rate-limiter` namespace, `gemini.ts`, `mood-fallback.ts`, `POST /api/rekomendasi` + test.
- **F4 - Input suara & UI kiosk:** hook + sheet + tombol mic.
- **F5 - Fase 2:** voice-search dashboard, lalu Groq Whisper untuk iOS.

## 8. Kontrak API
Request: `{ transkrip: string (1..500), tokenMeja: string }`

Response 200:
```json
{ "mood": "panas/gerah",
  "alasan": "Cuaca panas, cocok minuman dingin",
  "rekomendasi": [
    { "menuId": 12, "skor": 0.87,
      "rincian": { "cbf": 0.91, "cf": 0.72, "stok": 1.0 } }
  ] }
```
Error: `400` transkrip kosong, `429` rate limit (`{ error, retryAfterDetik }`), `502` provider gagal (klien jatuh ke fallback).

## 9. Verifikasi
`npm run lint -- --quiet` -> `npm run test` -> `npm run build` (hanya bila dev server mati) -> `npm run graph:update`.
Uji metode: bandingkan CBF-only vs CF-only vs hybrid pada 10-15 kueri manual, catat precision@4.

## 10. Risiko
1. iOS Safari tidak mendukung Web Speech API -> diarahkan mengetik; ditutup fase 2 (Groq).
2. Chrome mengirim audio ke server Google.
3. Akurasi CBF bergantung pada kelengkapan `menu.deskripsi`; bila kosong, bobot bergeser ke fitur kategori/suhu.
4. CF lemah bila data pesanan < ~50 order -> matriks `sim` akan jarang; gate 3.3 (bobot dialihkan ke CBF) menangani ini.
5. RPM/RPD free tier Gemini untuk flash-lite tidak dipublikasikan -> rate limiter lokal wajib.
6. Mengubah bobot 60/30/10 di tengah demo akan mengubah hasil; konstanta dipusatkan dan didokumentasikan.

## 11. Urutan Eksekusi & Commit
`feat(spk): tokenizer dan CBF` -> `feat(spk): precompute matriks CF` -> `feat(spk): hybrid scoring dan gate kelayakan` -> `feat(voice): endpoint rekomendasi` -> `feat(voice): hook speech input` -> `feat(voice): sheet rekomendasi kiosk` -> `feat(voice): voice search pesanan`.
