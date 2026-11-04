<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pringmoni - Resto POS & Monitoring

## SESSION STARTUP (WAJIB DIBACA SETIAP SESI BARU)

**Setiap kali sesi baru dimulai, agent WAJIB membaca dokumen referensi berikut secara berurutan:**

1. `.opencode/PRD.md` — Product Requirements Document, backlog PBI, status pengerjaan
2. `.opencode/DESIGN.md` — Design system (warna, tipografi, spacing, komponen)
3. `.opencode/ARCHITECTURE.md` — Arsitektur teknis (database schema, routes, auth flow)
4. `.opencode/CONVENTIONS.md` — Code conventions (naming, folder structure, commit format)     
5. `.opencode/SECURITY.md` — Security rules (critical rules, best practices, audit checklist)

**Gunakan tools `read` untuk membaca file-file di atas sebelum memulai tugas apapun.**

6. **Sinkronkan & baca graphify di awal tugas:** jalankan `npm run graph:update`, lalu gunakan `graphify query "<pertanyaan>"` / `graphify path` / `graphify explain` untuk mencari kode. **Jangan** langsung pakai `rg`/`grep` untuk eksplorasi umum — graphify lebih hemat token dan sudah memuat relasi antar-file.

## Project Overview

Sistem **Resto POS & Monitoring** untuk **Restoran Pringsewu** (PBL project).

### Tech Stack
| Library | Versi |
|---------|-------|
| Next.js | 16.2.1 |
| React | 19.2.4 |
| NextAuth | 5.0.0-beta.30 |
| Prisma | 5.22.0 |
| Tailwind CSS | v4 |
| shadcn/ui | v4.1.1 |
| jsPDF | v4.2.1 |
| Pusher | v5.3.3 |
| UploadThing | v7.7.4 |

## Project Structure (Ringkasan)

Agar agent langsung paham isi project tanpa eksplorasi, berikut peta ringkas `src/`:

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── (auth)/login/page.tsx           # Login (NextAuth v5)
│   ├── (customer)/[tokenMeja]/         # Customer kiosk (QR scan, tanpa login)
│   │   ├── page.tsx                    #   Menu & order
│   │   ├── checkout/page.tsx           #   Konfirmasi pesanan
│   │   ├── pembayaran/...              #   Pembayaran QRIS/tunai
│   │   └── pesanan/page.tsx            #   Lihat pesanan
│   ├── dashboard/                      # Admin dashboard (auth)
│   │   ├── page.tsx                    #   Statistik
│   │   ├── pesanan/page.tsx            #   Kelola pesanan
│   │   ├── kasir/page.tsx              #   Kasir (POS)
│   │   ├── menu/page.tsx               #   Kelola menu + stok harian
│   │   ├── meja/page.tsx               #   Kelola meja (+QR token)
│   │   ├── users/page.tsx              #   Kelola user
│   │   ├── stok-bahan/page.tsx         #   Stok gudang/dapur (internal)
│   │   ├── shift/page.tsx              #   Jadwal & riwayat shift
│   │   ├── logging/page.tsx            #   Log aktivitas
│   │   └── laporan/page.tsx            #   Laporan (PDF/Excel export)
│   ├── api/auth/[...nextauth]/route.ts # Auth API
│   └── api/uploadthing/                # Upload gambar
├── app/actions/                        # Server Actions (inti logika bisnis)
│   ├── meja.ts  menu.ts  pesanan.ts  kasir.ts
│   ├── users.ts  login.ts  logout.ts  forgot-password.ts
│   ├── stok-bahan.ts  shift.ts  voucher.ts  refund.ts
│   └── dashboard.ts  laporan.ts  logs.ts  notifikasi.ts  upload.ts
├── components/                         # UI (shadcn/ui) + charts (recharts)
├── lib/                                # utils, prisma.ts, auth.ts, uploadthing.ts, export-laporan.ts, print-struk.ts, stok.ts
└── types/                              # Shared TypeScript types
```

Fitur & integrasi utama:
- **Auth**: NextAuth v5 + role-based (OWNER / CASHIER / WAITER / KITCHEN)
- **Payment**: QRIS statis + tunai (verifikasi manual kasir). Midtrans hanya arsip di branch `feature/be-midtrans-qris-dinamis`
- **Realtime**: Pusher (customer order -> dashboard update)
- **Export**: jsPDF (struk/laporan) & exceljs/xlsx
- **DB**: Prisma + PostgreSQL (16 model: Users, JadwalShift, ShiftKasir, KasKeluar, Meja, KategoriMenu, Menu, MenuFoto, Pesanan, DetailPesanan, RefundBukti, Voucher, Logs, StokBahan, RiwayatStok, ResepMenu)
- **Ketersediaan menu**: stok harian (`menu.stokManual`) diatur dari Menu Management; stok bahan hanya monitoring internal gudang/dapur

## Workflow Configuration

Project ini menggunakan **OpenCode Workflow** dengan konfigurasi di folder `.opencode/`.

### Folder Structure
```
.opencode/
├── agent/          # Agents (orchestrator, specialists, project-specific)
├── command/        # Commands (/review, /commit, /start, dll)
├── skill/          # Skills (domain knowledge)
├── plugin/         # Plugins (auto-format, security-scan, dll)
├── PRD.md          # Product Requirements Document
├── DESIGN.md       # UI Design System (warna, tipografi, dll)
├── ARCHITECTURE.md # Arsitektur Teknis
├── CONVENTIONS.md  # Code Conventions
└── SECURITY.md     # Security Rules
```

### Available Agents

**Primary (Tab to switch):**
| Agent | Fungsi |
|-------|--------|
| `orchestrator` | Master coordinator, multi-step tasks |
| `build` | Default development work |
| `plan` | Analysis only, no file changes |

**Subagents (@mention):**
| Agent | Fungsi | Bash? | Edit? |
|-------|--------|-------|-------|
| `@code-reviewer` | Code quality review | No | No |
| `@debugger` | Bug investigation | Yes | No |
| `@security-auditor` | OWASP vulnerability check | No | No |
| `@refactorer` | Code cleanup | No | Yes |
| `@test-architect` | Test strategy & design | No | Yes |
| `@docs-writer` | Documentation generation | No | Yes |
| `@frontend-dev` | Frontend UI specialist | No | Yes |
| `@backend-dev` | Backend/database specialist | Yes | Yes |
| `@tester` | Testing specialist | No | Yes |

### Available Commands (/)

| Command | Fungsi |
|---------|--------|
| `/start` | Interactive PBI selector & role workflow |
| `/review` | Multi-perspective code review |
| `/commit` | Generate conventional commit message |
| `/architect` | High-level design session |
| `/rapid` | Fast iteration, minimal ceremony |
| `/debug` | Systematic bug investigation |
| `/refactor` | Code cleanup workflow |
| `/security-audit` | OWASP vulnerability check |
| `/test-design` | Plan test coverage |
| `/docs` | Generate documentation |
| `/parallel` | Run multiple tasks at once |
| `/verify-changes` | Lint -> Type -> Build -> Test -> Review |
| `/mentor` | Educational explanations |

### Available Skills

| Skill | Fungsi |
|-------|--------|
| `analyzing-projects` | Codebase exploration & architecture recognition |
| `designing-apis` | REST/GraphQL API design patterns |
| `designing-architecture` | Software architecture decisions |
| `designing-tests` | Test strategy & TDD/BDD approaches |
| `managing-git` | Git workflows & commit conventions |
| `optimizing-performance` | Performance optimization techniques |
| `parallel-execution` | Parallel task execution patterns |

### Plugins (Auto-activated)

| Plugin | Fungsi |
|--------|--------|
| `auto-format` | Auto-format files after edits |
| `security-scan` | Block edits to sensitive files (.env, keys) |
| `verification` | Reminds to test after 3+ file edits |
| `notifications` | Session completion notifications |
| `parallel-guard` | Educates about parallel execution |

## Pembatasan Kerja

| Aktivitas | Diizinkan |
|-----------|-----------|
| `npm run dev` | Tidak - dijalankan oleh user |
| `npm run build` | Ya **tapi hanya saat dev server user TIDAK aktif** |
| `npm run lint` | Ya |
| Install dependencies baru | Hanya BE yang boleh |
| Mengosongkan database | **HANYA atas perintah eksplisit user** |

### ⚠️ Larangan: `next build` bersamaan dengan `next dev`

`next build` menimpa folder `.next/` yang sama dipakai dev server Turbopack.
Akibatnya dev server bisa **buta total** (semua route balas 404, termasuk
`/login` dan `/api/auth/*`) atau memuat modul basi (mis. Prisma client lama →
`Unknown field 'sessionVersion'`).

Aturan:
- Jalankan `next build` **hanya** setelah dev server user dimatikan.
- Setelah build, `.next/` dibersihkan (`rm -rf .next`) bila dev server akan
  dijalankan lagi — dev server akan membangun ulang artefaknya sendiri.
- Setelah mengubah `prisma/schema.prisma`: `npx prisma generate` **harus**
  dijalankan saat dev server mati (Windows mengunci DLL query engine → EPERM).
- Kalau dev server tiba-tiba 404 semua route: matikan → `rm -rf .next` →
  jalankan ulang `npm run dev`.

### Branch Terlindungi (JANGAN DIHAPUS)

Branch berikut **DILARANG** dihapus (lokal maupun remote) kecuali atas perintah eksplisit user:

| Branch | Alasan |
|--------|--------|
| `main` | Branch produksi |
| `develop` | Branch integrasi/staging |
| `feature/be-midtrans-qris-dinamis` | **Arsip** integrasi Midtrans + QRIS dinamis (di `df12fb2`, sebelum diganti QRIS statis). Disimpan untuk referensi masa depan, bukan fitur aktif. |

Branch arsip `feature/be-midtrans-qris-dinamis` berisi kode Midtrans lama (`src/lib/midtrans.ts`, `src/app/api/midtrans/callback/route.ts`, `src/app/api/download-qr/route.ts`) yang sengaja dinonaktifkan. Jangan merge ke `main`/`develop` tanpa permintaan eksplisit user.

## Kompatibilitas Shell (PowerShell & Git Bash)

Project ini dijalankan baik di **PowerShell** maupun **Git Bash** (Windows). Semua agent, command, dan plugin WAJIB menulis perintah yang aman di kedua shell. Gunakan panduan ini selalu:

- **Separator:** `npm`/`npx`/`git` command dijalankan sendiri-sendiri. Jangan rantai dengan `&&` (PowerShell 5.1 menolak `&&`). Kalau harus berantai, pakai `;` atau jalankan terpisah.
- **Pindah direktori:** JANGAN `cd` lalu eksekusi. Jalankan perintah dari direktori kerja saat ini, atau set `workdir` — sama di kedua shell.
- **Path:** Hindari path `bash-style` (`/c/Users/...`). Gunakan path gabungan atau absolut yang dikenali Windows. Jika perlu path bertanda kutip (mengandung spasi), kritik dengan tanda kutip ganda `"..."`.
- **Env variable:** Jangan bergantung pada sintaks env khusus shell. `npm`, `npx`, `git`, `node` adalah executable yang sama di kedua shell — perintah dasarnya identik.
- **Mencari file/exe:** Bila perlu cek keberadaan tool, gunakan cara yang netral (mis. `Get-Command` di PS / `command -v` di bash) — atau lebih baik, andalkan `npm run`/`npx` yang sudah terpasang di project.
- **Output besar:** Hindari perintah yang mencetak puluhan ribu baris ke terminal (memperlambat TUI). Gunakan `Select-Object -First`/`head` bijak.

**Intinya:** setiap perintah harus bisa dieksekusi tanpa perubahan sintaks di PowerShell DAN Git Bash. Nama program (`npm`, `npx`, `git`, `node`) selalu sama; yang membedakan hanyalah separator dan quoting — bina agar kompatibel keduanya.

## Referensi

- **PRD**: `.opencode/PRD.md`
- **Design System**: `.opencode/DESIGN.md`
- **Arsitektur**: `.opencode/ARCHITECTURE.md`
- **Conventions**: `.opencode/CONVENTIONS.md`
- **Security**: `.opencode/SECURITY.md`
- **Product Backlog**: `.opencode/PRD.md` (section 3)

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Prioritaskan graphify di atas pencarian mentah. Jangan langsung memakai `rg -n`, `grep -rn`, atau pencarian rekursif sejenis untuk eksplorasi umum; pakai cara itu hanya jika graphify tidak menyediakan konteks yang cukup.
- Hemat token: cari kode secukupnya. Jika harus membaca file langsung, baca hanya bagian yang relevan (idealnya <=10 baris per kebutuhan) dan hindari dump file besar atau membaca baris kode satu per satu tanpa alasan jelas.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- Setelah mengubah kode, WAJIB jalankan `npm run graph:update` sebelum commit agar graph tetap sinkron (AST-only, no API cost). Script ini menonaktifkan snapshot harian (`GRAPHIFY_NO_BACKUP=1`), jadi hanya `graphify-out/` umum yang diperbarui. Jangan jalankan `graphify update .` polos karena akan membuat folder backup `graphify-out/20YYYY-MM-DD/` yang membengkakkan repo. Folder tanggal sudah di-gitignore.

### Aturan Hemat Token (WAJIB)

Anggaran token habis kalau dipakai untuk "mencari", bukan berpikir/membuat/debug. Patuhi:

- **Jangan pernah** `read`/`git diff`/`cat` file `graphify-out/graph.json`, `graph.html`, `manifest.json`, `.graphify_analysis.json` — ukurannya ratusan ribu token (`graph.json` ≈ 607k token). Untuk graph, pakai `graphify query/path/explain`, bukan baca file.
- **Diff aman:** `git diff --stat` dulu; diff isi hanya file spesifik. Untuk status pakai `git status --short`. Jangan `git diff` seluruh repo (artefak graphify ikut terbaca).
- **Query graphify sempit:** `graphify query "<symbol/fitur>" --budget 400` dan `context_filter=['call']` bila perlu; pakai `graphify explain "<symbol>"` untuk satu konsep. Jangan query umum yang mengembalikan 100+ node.
- **Grep hanya terarah:** `rg -n "symbol" src --glob '*.ts' -m 5`; lalu baca hanya ±15 baris di sekitar hit (offset/limit). Jangan `grep -r` untuk eksplorasi umum.
- **Baca file seperlunya:** `read` dengan `offset`/`limit`, bukan seluruh file besar. Jangan membaca ulang file yang sama tanpa alasan.
- **Lint ringkas:** `npm run lint -- --quiet` (hanya error) saat verifikasi rutin; jalankan lint penuh hanya bila perlu melihat warning.
- **Dokumen startup** (~11k token: AGENTS+PRD+DESIGN+ARCH+CONV+SEC) dibaca sekali per sesi, bukan diulang tiap tugas.
