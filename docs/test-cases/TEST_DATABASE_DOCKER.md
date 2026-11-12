# Database Test (Docker) — Setup & Cara Menjalankan

Dokumen ini menjelaskan database PostgreSQL khusus **integration test** yang
dijalankan lewat Docker. Tujuannya: test memakai database nyata, tetapi tidak
pernah menyentuh database development/production.

## Tech Stack

| Komponen | Versi / Pilihan | Alasan |
|----------|-----------------|--------|
| Docker Compose | Compose v2 (`docker compose`) | Isolasi service, healthcheck, sekali perintah |
| PostgreSQL | `postgres:16-alpine` | Sama dengan versi PostgreSQL project, image kecil |
| Storage | `tmpfs` untuk `PGDATA` | Ephemeral + cepat; data hilang saat container berhenti |
| Tuning | `fsync=off`, `synchronous_commit=off`, `full_page_writes=off` | Aman karena data disposable; mempercepat test |
| Healthcheck | `pg_isready` | Test tidak mulai sebelum database benar-benar siap |
| Port | `127.0.0.1:5433` | Tidak bentrok dengan PostgreSQL lokal (5432) dan tidak terbuka ke LAN |
| Schema | `prisma db push --skip-generate` | Menyiapkan schema test tanpa menyentuh Prisma Client / dev server |
| Runner | `scripts/test-db.mjs` | Load env, validasi URL, jalankan Prisma + Vitest lintas PowerShell/Git Bash |
| Test runner | Vitest (`src/test/integration`) | Sama dengan test integration yang sudah ada |

File terkait:

```
docker-compose.test.yml      # service PostgreSQL test
scripts/test-db.mjs          # runner push/reset/test (load .env, set DATABASE_URL)
.env.example                 # contoh TEST_DATABASE_URL
src/test/integration/        # seluruh integration test
```

## Prasyarat

1. **Docker Desktop / Docker Engine** dengan Compose v2 aktif.
   Cek dengan `docker --version` dan `docker compose version`.
2. **Node.js** sudah terpasang dan `npm install` sudah dijalankan.
3. **`.env`** sudah dibuat dari `.env.example` (minimal berisi
   `TEST_DATABASE_URL`).

> **PENTING:** `TEST_DATABASE_URL` tidak boleh sama dengan `DATABASE_URL`.
> Script akan menolak berjalan bila keduanya identik. Jangan pernah mengarahkan
> `TEST_DATABASE_URL` ke Supabase production.

## Konfigurasi Environment

Tambahkan ke `.env` (sudah tersedia di `.env.example`):

```dotenv
TEST_DATABASE_URL="postgresql://pringmoni:pringmoni@localhost:5433/pringmoni_test"
```

Nilai tersebut cocok dengan default `docker-compose.test.yml`. Override opsional
(jarang diperlukan):

| Variable | Default | Fungsi |
|----------|---------|--------|
| `TEST_DB_NAME` | `pringmoni_test` | Nama database di container |
| `TEST_DB_USER` | `pringmoni` | User PostgreSQL test |
| `TEST_DB_PASSWORD` | `pringmoni` | Password user test |
| `TEST_DB_PORT` | `5433` | Port host yang dipetakan ke container |

Jika mengubah `TEST_DB_*`, sesuaikan juga `TEST_DATABASE_URL`.

Script juga membaca `.env.test` dan `.env.test.local` (keduanya di-gitignore),
jadi nilai test bisa dipisah dari `.env` bila diinginkan.

## Cara Menjalankan (Quick Start)

```powershell
# 1. Nyalakan database test (menunggu sampai healthcheck lolos)
npm run test:db:up

# 2. Push schema + jalankan semua integration test
npm run test:integration

# 3. Hentikan dan hapus container + volume
npm run test:db:down
```

`test:integration` otomatis melakukan `prisma db push` ke database test sebelum
menjalankan Vitest, jadi database yang baru dibuat langsung siap dipakai.

## Perintah npm

| Perintah | Yang dilakukan |
|----------|----------------|
| `npm run test:db:up` | `docker compose up -d --wait` (menunggu healthcheck) |
| `npm run test:db:down` | `docker compose down -v` (container + volume dihapus) |
| `npm run test:db:logs` | Ikuti log container `pringmoni-test-db` |
| `npm run test:db:push` | Sinkronkan schema Prisma ke DB test (non-destruktif) |
| `npm run test:db:reset` | `prisma db push --force-reset` — **hapus semua data** DB test |
| `npm run test:integration` | Push schema + `vitest run src/test/integration` |

Menjalankan satu file test:

```powershell
npm run test:integration -- src/test/integration/tc01-create-user.test.ts
```

## Alur di Balik Layar

1. `docker-compose.test.yml` menyalakan PostgreSQL 16 dengan `PGDATA` di
   `tmpfs` dan port `127.0.0.1:5433`.
2. Healthcheck `pg_isready` memastikan database siap sebelum Compose selesai.
3. `scripts/test-db.mjs` memuat `.env.test.local` → `.env.test` → `.env`
   (variable yang sudah ada di shell tidak ditimpa).
4. Script memvalidasi `TEST_DATABASE_URL`, menolak jika sama dengan
   `DATABASE_URL`, lalu menetapkan `DATABASE_URL` dan `DIRECT_URL` ke DB test.
5. `prisma db push --skip-generate` menyiapkan schema tanpa regenerasi client
   (aman walau `npm run dev` sedang berjalan).
6. Vitest menjalankan integration test. Setiap test membuat data unik dan
   menghapusnya di blok `finally`; tidak ada `TRUNCATE`, sehingga file test
   boleh berjalan paralel.

## Reset & Bersih-Bersih

```powershell
# Schema + data test di-reset total
npm run test:db:reset

# Matikan container dan buang datanya
npm run test:db:down
```

Karena `PGDATA` memakai `tmpfs`, data otomatis hilang saat container berhenti.
`test:db:down` juga menghapus volume/network sisa agar tidak ada state tersisa.

## Troubleshooting

| Gejala | Penyebab umum | Solusi |
|--------|---------------|--------|
| `docker: command not found` / daemon error | Docker Desktop belum jalan | Jalankan Docker Desktop, tunggu status *running* |
| `port is already allocated` | Port 5433 dipakai proses lain | Set `TEST_DB_PORT=5434` dan sesuaikan `TEST_DATABASE_URL` |
| `test:db:up` gagal di healthcheck | Container crash / init lambat | `npm run test:db:logs`, lalu ulangi |
| Test tampil *skipped* semua | `TEST_DATABASE_URL` tidak terbaca | Pastikan ada di `.env`, atau set di shell sebelum perintah |
| `relation ... does not exist` | Schema belum di-push | `npm run test:db:push` atau ulangi `npm run test:integration` |
| `The column ... does not exist` | Prisma Client basi (beda dengan schema) | Hentikan dev server, lalu `npx prisma generate` |
| `TEST_DATABASE_URL tidak boleh sama...` | URL test = URL dev | Pisahkan database test; jangan memakai DB dev |
| Compose v1 (`docker-compose`) | Versi Docker lama | Upgrade ke Compose v2 (`docker compose`) |

Cek cepat bahwa database bisa diakses:

```powershell
docker compose -f docker-compose.test.yml exec db-test pg_isready -U pringmoni -d pringmoni_test
```

## Catatan Keamanan

- Port di-bind ke `127.0.0.1`, bukan `0.0.0.0`, sehingga tidak terekspos ke
  jaringan.
- Container hanya untuk test; password default (`pringmoni`) tidak dipakai di
  production.
- `TEST_DATABASE_URL` adalah satu-satunya jalur yang dipakai test; test tidak
  pernah membaca `DATABASE_URL` production (script menimpa `DATABASE_URL`
  hanya di proses anak).
- Data test bersifat sementara dan dihapus di `finally`; `test:db:down`
  memastikan tidak ada sisa data.

## Catatan CI

Di CI, pola yang sama bisa dipakai:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_DB: pringmoni_test
      POSTGRES_USER: pringmoni
      POSTGRES_PASSWORD: pringmoni
    ports:
      - 5433:5432
    options: >-
      --health-cmd "pg_isready -U pringmoni -d pringmoni_test"
      --health-interval 3s --health-timeout 3s --health-retries 20
```

Lalu set `TEST_DATABASE_URL` di environment job dan jalankan
`npm run test:integration`.
