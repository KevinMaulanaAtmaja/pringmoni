# WORKFLOW.md - Alur Kerja dengan Opencode

> Catatan: Simtem ini dijalankan di awal setiap sesi chat baru dengan Opencode.

---

## Pertanyaan Interaktif Saat Ingin Bekerja

Setiap kali user mau generate code, WAJIB tanyakan:

``` txt
"FE-1/BE/Tester mau kerja fitur apa hari ini?"
"Cek [AGENTS-FE.md/AGENTS-BE.md/AGENTS-TESTER.md] dulu ya"
"Pilih PBI atau fitur dari list yang tersedia"
```

### Opsi yang Ditawarkan

``` txt
OPTIONS:
═══════════════════════════
Modul 1: User Management
  □ PBI-1.1 Login & Logout
  □ PBI-1.2 CRUD User
  □ PBI-1.3 CRUD Meja
  □ PBI-1.4 CRUD Menu

Modul 2: Pesanan
  □ PBI-2.1 Buat Pesanan
  □ PBI-2.2 Kelola Item Pesanan
  □ PBI-2.3 Status & Pembatalan

Modul 3: Pembayaran
  □ PBI-3.1 Hitung Total
  □ PBI-3.2 Pembayaran
  □ PBI-3.3 Struk & Riwayat

Modul 4: Sistem
  □ PBI-4.1 Logging

Modul 5: Laporan
  □ PBI-5.1 Laporan
  □ PBI-5.2 Analitik
═══════════════════════════
```

---

## Checklist SEBELUM Generate Code

``` txt
CHECKLIST SEBELUM GENERATE:
═══════════════════════════
□ Role & nama sudah?
□ Cek AGENTS-{role}.md untuk PBI yang dipilih?
□ Survei API/cari info jika perlu breaking changes?
□ Versi library sudah dicek di AGENTS.md?
□ Dapat persetujuan dari lead/manager?
□ Test case sudah disiapkan (untuk tester)?
═══════════════════════════
```

---

## Pertanyaan Persetujuan

Sebelum generate, WAJIB tanya:

``` txt
"oke, kerja [PBI-x.x] - [nama fitur] ya
- Folder: [src/app/xxx]
- File: [xxx.tsx]
- Estimasi: [x] menit

Boleh Eksekusi?"
```

### Opsi Jawaban User

| Jawaban | Tindakan |
| ------- | -------- |
| "Ya, boleh" | Generate code |
| "Review dulu" | Tunda generate, tampilkan rencana dulu |
| " Ga jadi" | Batal, tunda |
| "Ganti ke yang lain" | Kembali ke list PBI |

---

## Checklist SETELAH Generate Code

``` txt
CHECKLIST SETELAH GENERATE:
═══════════════════════════
□ Code sudah digenerate
□ Periksa apakah ada error lint (npm run lint)
□ Cek struktur file sesuai AGENTS.md?
□ Beri tahu cara CEK/VERIFY
□ Jelaskan cara Commit & Push
═══════════════════════════
```

### Cara Commit & Push Setelah Selesai

```bash
# 1. Pastikan di branch develop
git checkout develop

# 2. Buat branch baru sesuai fitur
git checkout -b feature/fe-kasir        # FE
git checkout -b feature/be-crud-menu    # BE
git checkout -b test/fe-ui-kasir        # Tester UI
git checkout -b test/be-logika-kasir    # Tester Logic

# 3. Cek file yang diubah
git status

# 4. Add file
git add src/app/dashboard/kasir/page.tsx

# 5. Commit dengan format [Tipe]: [PBI-x.x] - [Penjelasan]
git commit -m "feat: PBI-3.1 - Hitung Total UI di halaman kasir"

# 6. Push
git push -u origin feature/fe-kasir

# 7. Buat PR ke develop di GitHub
```

**CATATAN:**

- Jangan lupa `npm run lint` dulu sebelum commit
- Branch wajib dari `develop` (`git checkout develop` dulu)

---

## Cara Cek Setiap Fitur

### Untuk FE (UI/Components)

```bash
# Cek apakah code bisa di-build
npm run build

# Cek apakah ada error lint
npm run lint

# Cek manual di browser:
# 1. Buka http://localhost:3000/{route}
# 2. Cek tampilan sesuai mockup?
# 3. Klik interaksi berfungsi?
```

### Untuk BE (Server Actions/Database)

```bash
# Validasi schema Prisma
npx prisma validate

# Sync schema ke database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Cek apakah code bisa di-build
npm run build

# Test Server Actions via:
# - Postman/REST client
# - Atau cek via FE yang sudah terintegrasi
```

### Untuk Tester

```bash
# Jalankan test
npm run test

# Atau Manual:
# 1. Buka halaman yang ditest
# 2. Isi data test
# 3. Klik tombol
# 4. Verifikasi hasil expected vs actual
# 5. Report ke lead kalau ada bug
```

---

## Template Pesan Interaktif

### Saat Memulai Sesi

Tanya: `"Selamat datang! Siapa nama dan role kamu?"`

| Jawaban | Arahkan ke |
|---------|------------|
| Pandi/Pohan, FE | `AGENTS-FE.md` |
| Kevin, BE | `AGENTS-BE.md` |
| Izza/Melandri, Tester | `AGENTS-TESTER.md` |

### Saat Pilih Fitur

```
opencode: "OK, kerja PBI-[x.x] - [nama fitur] ya
          
Detail:
- Folder: [src/app/xxx]
- File: [xxx.tsx]
- Estimasi: [x] menit

Boleh generate?"
user:    "Ya"
opencode: "Generating..."
         [Generate code]
         
CARA CEK:
- Jalankan: npm run build
- Buka http://localhost:3000/{route}
- Verifikasi tampilan/interaksi
```

### Saat Review

```
opencode: "Selesai! untuk review:
         
1. Buka file yang digenerate
2. Cek sesuai kebutuhan
3. Jika ada yang perlu diubah, bilang:
   - "Ubah [bagian] jadi [desired]"
4. Kalau sudah OK, bilang: "OK, finalize"
```

---

## Peraturan Branch GitHub

## Peraturan Branch GitHub

```
BRANCH STRUCTURE:
═══════════════════════════
main        → Production (protect)
develop    → Staging (gabung semua branch)
│
├── feature/be-{nama}      → BE kerja
├── feature/fe-{nama}     → FE kerja  
└── test/{nama-test}      → Tester
═══════════════════════════
```

### Branch Guide

| Orang | Branch Utama |
|-------|--------------|
| Kevin (BE) | `feature/be-crud-menu`, `be-auth`, dll |
| Pandi (FE-1) | `feature/fe-kasir`, `fe-dashboard` |
| Pohan (FE-2) | `feature/fe-customer`, `fe-menu` |
| Izza (Tester Logic) | `test/be-logika-{nama}` |
| Melandri (Tester UI) | `test/fe-ui-{nama}` |

---

## Cara Commit & Push (PANDUAN)

Setelah selesai generate code & dapat persetujuan, IKUTI steps ini di terminal:

### Step 1: Cek Status

```bash
git status
```

### Step 2: Add File

```bash
git add src/app/dashboard/kasir/page.tsx
# Atau: git add . (untuk semua file)
```

### Step 3: Commit

```bash
git commit -m "feat: PBI-3.1 - Hitung Total UI di halaman kasir"
```

### Step 4: Push


```bash
git push -u origin feature/fe-kasir
```

### Step 5: Buat PR

- Buka GitHub
- Buat PR dari branch kamu → `develop`
- Jangan ke `main`!

### Format Pesan Commit

``` txt
[Tipe]: [PBI-x.x] - [Penjelasan]
```

| Tipe | Contoh |
| ---- | ------ |
| `feat` | fitur baru |
| `fix` | perbaikan bug |
| `refactor` | ubah struktur tanpa ubah fungsi |
| `test` | tambah test |
| `docs` | ubah dokumentasi |

---

## Catatan Penting

1. **Selalu tanya role & nama di awal sesi**
2. **Arahkan ke AGENTS-{role}.md sesuai role**
3. **Pilih dulu PBI dari list yang tersedia**
4. **Dapat persetujuan dulu baru generate**
5. **Berikan cara cek setelah generate**
6. **Review dulu sebelum finalize**
7. **Jangan langsung generate semua - satu-satu dulu**