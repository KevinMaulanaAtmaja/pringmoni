# Graph Report - pringmoni  (2026-11-15)

## Corpus Check
- 253 files · ~326,157 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2848 nodes · 4641 edges · 194 communities (103 shown, 63 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0aa78f96`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- KasirPage
- actions/shift.ts
- page-loader.tsx
- compilerOptions
- uploadthing.ts
- src/types/index.ts
- LaporanClient.tsx
- types/index.ts
- components.json
- 2. MVP (Minimum Viable Product)
- -
- stok-bahan/page.tsx
- pesanan.ts
- menu-management.tsx
- 20260408053831_init_all_schema/migration.sql
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- auth.ts
- OWASP Top 10 Focus Areas
- kasir/page.tsx
- StaleNotificationBell.tsx
- DashboardCharts.tsx
- GrafikPeakHours.tsx
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- menu.ts
- src_lib_auth_auth
- actions/voucher.ts
- cn
- KasirOrderNotifications.tsx
- ✅ SELESAI
- scripts
- scripts.js
- optionalDependencies
- components/BankIcon.tsx
- PieMetode.tsx
- createLog
- 20260327055635_init/migration.sql
- security-scan.ts
- kasir.ts
- ClockDisplay.tsx
- prisma
- README.md
- notifications.ts
- parallel-guard.ts
- verification.ts
- category-icon.tsx
- Tester Agent
- dependencies
- eslint.config.mjs
- users.ts
- [tokenMeja]/page.tsx
- cloudinary
- [kodeAkses]/page.tsx
- reservasi-customer.ts
- 20261017000001_add_jadwal_shift_dan_kas_keluar/migration.sql
- 20260930000001_add_shift_kasir/migration.sql
- "reservasi"
- ref_react
- dropdown-menu.tsx
- print-struk.ts
- meja.ts
- @hugeicons/react
- "reservasi"
- graphify.js
- next-auth
- PerbandinganCard.tsx
- jsqr
- PieKategori.tsx
- next
- ref_dotenv
- ref_uploadthing
- package.json
- ref_prisma_client
- seed-menu.ts
- pusher-js
- babel-plugin-react-compiler
- qrcode.react
- recharts
- clsx
- cn
- @uploadthing/react
- postcss.config.mjs
- eslint
- eslint-config-next
- exceljs
- reservasi/page.tsx
- jspdf
- zod
- stok-bahan.ts
- lucide-react
- radix-ui
- nodemailer
- { GET, POST }
- pg
- Refactorer Agent
- Test Architect Agent
- Orchestrator Agent (Single-Worker Mode)
- Design System - Pringmoni (UI & Visual Design)
- Code Reviewer Agent
- 3. Product Backlog (PBI)
- @hugeicons/core-free-icons
- Pringmoni - Resto POS & Monitoring
- Documentation Types
- OWASP Top 10 Analysis
- @prisma/adapter-pg
- PBIs (Product Backlog Items)
- Security Best Practices
- Backend Developer Agent
- Phase 2: Multi-Perspective Analysis
- @prisma/client
- ARCHITECTURE - Pringmoni
- Alur Kerja Wajib (Anti-Churn)
- Debugging Protocol
- Parallel Execution Command
- Refactor Mode - Code Quality Improvement
- Parallel Execution
- Workflow
- Documentation Generation Command
- Verify Changes Command
- Mentor Mode - Educational Session
- Designing Tests
- Common Bottleneck Patterns
- Git Commit Command
- Start Command - Pringmoni Interactive Session
- Rapid Mode - Fast Iteration
- Test Design Command
- Analyzing Projects
- Designing APIs
- Designing Architecture
- Managing Git
- Graphify Command
- dependencies
- opencode.json
- pusher
- shadcn
- qrcode
- @radix-ui/react-dialog
- react
- react-dom
- sharp
- tw-animate-css
- actions/reservasi.ts
- xlsx
- @tailwindcss/postcss
- @testing-library/jest-dom
- Implementasi Reservasi (PBI-7.1)
- @testing-library/react
- "reservasi"
- tsx
- uploadthing
- uuid
- @types/node
- @types/nodemailer
- 8. Rencana: Pengaturan Jam Reservasi oleh Owner
- @types/react
- @types/react-dom
- typescript
- logs.ts
- seed-2025.ts
- seed-historical.ts
- seed-resep.ts
- useOrdersRealtime
- GrafikMenu.tsx

## God Nodes (most connected - your core abstractions)
1. `-` - 882 edges
2. `cn()` - 82 edges
3. `createLog()` - 53 edges
4. `Button()` - 36 edges
5. `triggerPusher()` - 30 edges
6. `ReservasiPage()` - 25 edges
7. `KasirPage()` - 23 edges
8. `Badge()` - 23 edges
9. `Input()` - 23 edges
10. `Card()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `ForgotPasswordPage()` --indirect_call--> `forgotPasswordAction()`  [INFERRED]
  src/app/(auth)/reset-password/page.tsx → src/app/actions/forgot-password.ts
- `handleSubmit()` --calls--> `createPesanan()`  [EXTRACTED]
  src/app/dashboard/kasir/pesanan-baru/page.tsx → src/app/actions/pesanan.ts
- `cancelExpiredOrders()` --calls--> `createLog()`  [EXTRACTED]
  src/app/actions/pesanan.ts → src/lib/log.ts
- `handleCek()` --calls--> `cekStatusReservasi()`  [EXTRACTED]
  src/app/reservasi/status/page.tsx → src/app/actions/reservasi-customer.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (194 total, 63 thin omitted)

### Community 1 - "KasirPage"
Cohesion: 0.16
Nodes (5): getPesananRiwayatKasir(), KasirPage(), getGrandTotal(), handleBayarTunaiStep(), handleMethodWarningProceed()

### Community 2 - "actions/shift.ts"
Cohesion: 0.06
Nodes (72): ambilShiftRow(), autoCloseShifts(), bukaShift(), getDaftarKasir(), getDaftarKasirLengkap(), getJadwalShift(), getRiwayatShift(), getShiftAktif() (+64 more)

### Community 4 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node (+22 more)

### Community 5 - "uploadthing.ts"
Cohesion: 0.40
Nodes (4): { GET, POST }, f, OurFileRouter, utapi

### Community 6 - "src/types/index.ts"
Cohesion: 0.06
Nodes (33): AnalisisTambahan, CreateStokBahanInput, CreateUserInput, CustomerMenu, DashboardStats, DetailPesananItem, JenisPerubahanStok, KategoriBahan (+25 more)

### Community 7 - "LaporanClient.tsx"
Cohesion: 0.13
Nodes (17): currentYear, dateToWeekStr(), getWeekRange(), LaporanClient(), LaporanKasirItem, loadingState, TabBanding(), TabBulanan() (+9 more)

### Community 8 - "types/index.ts"
Cohesion: 0.08
Nodes (24): CustomerMenu, DashboardStats, DetailPesananItem, GrafikPoint, ItemLaporanPesanan, KategoriMenu, LaporanKasir, LaporanMenuTerlaris (+16 more)

### Community 9 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "2. MVP (Minimum Viable Product)"
Cohesion: 0.10
Nodes (20): 1. Tujuan Proyek, 2. MVP (Minimum Viable Product), 3. Fitur Lengkap, 4. DOD (Definition of Done) & Kendala, 5. Plan Next Semester, Admin Dashboard, Customer-Facing, Dokumentasi (+12 more)

### Community 11 - "-"
Cohesion: 0.00
Nodes (881): -, 1, -, -, -, -, :, 14 (+873 more)

### Community 12 - "stok-bahan/page.tsx"
Cohesion: 0.09
Nodes (39): ref_qrcode_react, StokBahanWithType, metodeConfig, PesananData, StatusPesanan, PembayaranInfo, BahanLogo(), BahanLogoConfig (+31 more)

### Community 13 - "pesanan.ts"
Cohesion: 0.09
Nodes (33): getKategoriMenus(), cancelExpiredOrders(), cancelPesanan(), CreatePesananData, CreatePesananItem, getActivePesananByToken(), getCustomerMenuData, getCustomerPaymentStatus() (+25 more)

### Community 14 - "menu-management.tsx"
Cohesion: 0.10
Nodes (38): MenuWithKategori, CartItem, aksiColors, aksiKategori, aksiLabels, JenisAksi, statusColors, statusLabels (+30 more)

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.17
Nodes (13): "detail_pesanan", "kategori_menu", "logs", "meja", "menu", "menu_foto", "pesanan", "users" (+5 more)

### Community 16 - "devDependencies"
Cohesion: 0.12
Nodes (17): agentation, agentation-mcp, devDependencies, agentation, agentation-mcp, tailwindcss, @testing-library/user-event, ts-node (+9 more)

### Community 18 - "laporan.ts"
Cohesion: 0.32
Nodes (14): getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir(), getLaporanKategori(), getLaporanMenuTerlaris() (+6 more)

### Community 19 - "auth.ts"
Cohesion: 0.05
Nodes (46): ref_next_auth, ref_vitest, HasilValidasi, loginAction(), LoginState, STATE_AWAL, validasiKredensial(), utapi (+38 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "kasir/page.tsx"
Cohesion: 0.14
Nodes (14): metodeColors, metodeIcons, metodeLabels, Pesanan, PesananItem, statusBayarColors, statusBayarLabels, PesananDetail (+6 more)

### Community 22 - "StaleNotificationBell.tsx"
Cohesion: 0.22
Nodes (11): LogoutButton(), buildSubtext(), formatDurasi(), formatRupiah(), KIND_META, KindMeta, labelStatus(), NotifikasiRow() (+3 more)

### Community 23 - "DashboardCharts.tsx"
Cohesion: 0.19
Nodes (12): ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah(), MejaData (+4 more)

### Community 24 - "GrafikPeakHours.tsx"
Cohesion: 0.23
Nodes (7): amberGradient(), calcTicks(), GrafikPeakHours(), TooltipPayload, GrafikPendapatan(), TooltipPayload, GrafikPoint

### Community 25 - "app/layout.tsx"
Cohesion: 0.12
Nodes (16): nextConfig, ref_agentation, ref_next, src_app_globals, geistMono, geistMonoHeading, geistSans, inter (+8 more)

### Community 26 - "export-laporan.ts"
Cohesion: 0.31
Nodes (10): ref_jspdf, centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport, MonthPDFData (+2 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "menu.ts"
Cohesion: 0.08
Nodes (34): applyStokHarian(), createKategori(), createMenu(), CreateMenuInput, deleteKategori(), deleteMenu(), deleteAllMenuFotos(), deleteMenuFoto() (+26 more)

### Community 29 - "src_lib_auth_auth"
Cohesion: 0.09
Nodes (30): ref_pusher, autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), getStaleOrders(), PaidStaleOrder, StaleOrder (+22 more)

### Community 30 - "actions/voucher.ts"
Cohesion: 0.10
Nodes (33): ref_jsqr, createPesanan(), createVoucher(), deleteVoucher(), getVoucherAktif(), getVoucherList(), HasilValidasiVoucher, normalisasiKode() (+25 more)

### Community 31 - "cn"
Cohesion: 0.08
Nodes (37): ref_class_variance_authority, ref_clsx, ref_hugeicons_core_free_icons, ref_hugeicons_react, ref_lucide_react, ref_radix_ui, ref_tailwind_merge, MenuTabs() (+29 more)

### Community 32 - "KasirOrderNotifications.tsx"
Cohesion: 0.24
Nodes (8): getPaidOrdersForNotification(), getPesananBelumBayar(), KasirOrderNotifications(), NotifOrder, PaidOrder, soundedConfirmedOrders, soundedPaidOrders, ToastData

### Community 33 - "✅ SELESAI"
Cohesion: 0.07
Nodes (29): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 8. Optimasi delay >5 detik (+21 more)

### Community 34 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, graph:update, lint, seed-2025, seed-menu, seed-resep (+3 more)

### Community 35 - "scripts.js"
Cohesion: 0.32
Nodes (14): addSimReplay(), advanceSimOnSlide(), beginSimStream(), beginSimThink(), escapeHtml(), finishSim(), go(), initSims() (+6 more)

### Community 36 - "optionalDependencies"
Cohesion: 0.40
Nodes (5): lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 39 - "PieMetode.tsx"
Cohesion: 0.33
Nodes (5): COLORS, formatRupiah(), PieMetode(), PieMetodeProps, PieTooltipPayload

### Community 40 - "createLog"
Cohesion: 0.16
Nodes (11): forgotPasswordAction(), logoutAction(), resetPasswordConfirmAction(), ForgotPasswordPage(), ResetPasswordPage(), sendResetPasswordEmail(), transporter, createLog() (+3 more)

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "kasir.ts"
Cohesion: 0.15
Nodes (23): accPesanan(), batalkanPesananKasir(), confirmQrisPayment(), generateQRISCode(), getPembayaranInfo(), KasirPesananItem, konfirmasiPembayaran(), prosesPembayaranQRIS() (+15 more)

### Community 44 - "ClockDisplay.tsx"
Cohesion: 0.60
Nodes (5): ClockDisplay(), getServerSnapshot(), getSnapshot(), pad(), subscribe()

### Community 45 - "prisma"
Cohesion: 0.67
Nodes (3): prisma, prisma, prisma

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "Tester Agent"
Cohesion: 0.18
Nodes (10): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+2 more)

### Community 54 - "dependencies"
Cohesion: 0.22
Nodes (9): bcryptjs, class-variance-authority, dependencies, bcryptjs, class-variance-authority, @react-pdf/renderer, tailwind-merge, @react-pdf/renderer (+1 more)

### Community 64 - "users.ts"
Cohesion: 0.22
Nodes (12): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+4 more)

### Community 65 - "[tokenMeja]/page.tsx"
Cohesion: 0.23
Nodes (12): Menu, CartSheetProps, KeranjangItem, MenuCard(), PindahMejaSheet(), PindahMejaSheetProps, Input(), src_components_ui_sheet_sheet (+4 more)

### Community 67 - "[kodeAkses]/page.tsx"
Cohesion: 0.10
Nodes (33): getReservasiCustomer(), formatRupiah(), formatTanggalPanjang(), formatWaktu(), HasilReservasi, KategoriItem, LANGKAH, MejaInfo (+25 more)

### Community 69 - "reservasi-customer.ts"
Cohesion: 0.13
Nodes (21): ref_crypto, cekDanCatatRate(), cekStatusReservasi(), createReservasiCustomer(), CreateReservasiCustomerInput, getIp(), globalStore, ItemReservasiInput (+13 more)

### Community 75 - "ref_react"
Cohesion: 0.16
Nodes (18): ref_react, initialState, initialState, initialState, formatRupiah(), formatWaktu(), labelStatus(), StatusData (+10 more)

### Community 76 - "dropdown-menu.tsx"
Cohesion: 0.12
Nodes (11): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut() (+3 more)

### Community 77 - "print-struk.ts"
Cohesion: 0.17
Nodes (16): ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee(), centerText(), formatRupiah(), nomorPesanan() (+8 more)

### Community 78 - "meja.ts"
Cohesion: 0.09
Nodes (20): createMeja(), deleteMeja(), generateNomorMeja(), getMeja(), getNextNomorMeja(), kosongkanMeja(), MejaResult, updateMeja() (+12 more)

### Community 81 - "graphify.js"
Cohesion: 0.32
Nodes (6): hasGraph(), location, IMPORTANT: keep the reminder string free of backticks and $(...) constructs., server(), setup(), ref_path

### Community 83 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 85 - "PieKategori.tsx"
Cohesion: 0.33
Nodes (4): CATEGORY_COLORS, PieKategori(), PieTooltipPayload, KategoriAnalisis

### Community 89 - "package.json"
Cohesion: 0.25
Nodes (7): name, overrides, effect, prisma, seed, private, version

### Community 90 - "ref_prisma_client"
Cohesion: 0.18
Nodes (5): prisma, prisma, ref_prisma_client, p, p

### Community 91 - "seed-menu.ts"
Cohesion: 0.24
Nodes (9): KATEGORI_SEED, KategoriSeed, main(), MENU_CAFE_SEED, MENU_PAKET_SEED, MenuSeed, prisma, upsertKategori() (+1 more)

### Community 105 - "reservasi/page.tsx"
Cohesion: 0.20
Nodes (9): ALASAN_CEPAT, MejaRow, MenuRow, METODE_DP_LABEL, ReservasiItemDraft, ReservasiItemRow, ReservasiRow, STATUS_LABEL (+1 more)

### Community 108 - "stok-bahan.ts"
Cohesion: 0.19
Nodes (21): createStokBahan(), deleteStokBahan(), getBahanDapurList(), getRiwayatStok(), getStokBahanList(), hapusResepBahan(), hitungStatus(), requireOwner() (+13 more)

### Community 115 - "Refactorer Agent"
Cohesion: 0.08
Nodes (24): 1. Ensure Tests Exist, 1. Meaningful Names, 2. Make Small Changes, 2. Small Functions, 3. DRY (Don't Repeat Yourself), 3. Preserve Behavior, 4. Document Changes, 4. SOLID Principles (+16 more)

### Community 116 - "Test Architect Agent"
Cohesion: 0.10
Nodes (20): 1. Arrange-Act-Assert (AAA), 2. Descriptive Test Names, 3. Test Behavior, Not Implementation, Boundary Testing, Core Philosophy, Coverage Gaps, Coverage Strategies, Critical Path Coverage (+12 more)

### Community 117 - "Orchestrator Agent (Single-Worker Mode)"
Cohesion: 0.15
Nodes (12): Core Philosophy, Critical Rules, Live Monitoring (IMPORTANT - user follows your progress), Orchestrator Agent (Single-Worker Mode), Output Format, Phase 1: UNDERSTAND, Phase 2: PLAN, Phase 3: EXECUTE (+4 more)

### Community 118 - "Design System - Pringmoni (UI & Visual Design)"
Cohesion: 0.11
Nodes (18): 1. Brand & Identity, 2. Color Palette, 3. Typography, 4. Spacing, Radius & Layout, 5. Dark Mode, 6. Komponen (shadcn/ui), 7. Aturan Penggunaan Warna (Praktik), Aturan Penggunaan (+10 more)

### Community 119 - "Code Reviewer Agent"
Cohesion: 0.11
Nodes (17): 1. Code Quality, 2. Security (Surface Level), 3. Performance (Surface Level), 4. Maintainability, 5. Consistency, Anti-Patterns to Flag, Code Reviewer Agent, Core Philosophy (+9 more)

### Community 120 - "3. Product Backlog (PBI)"
Cohesion: 0.08
Nodes (23): 1. Product Overview, 2. Core Features, 3. Product Backlog (PBI), 4. Definition of Done, 5. Future Plans, Customer Self-Order, Dashboard Admin, Fitur Baru (+15 more)

### Community 122 - "Pringmoni - Resto POS & Monitoring"
Cohesion: 0.10
Nodes (19): Aturan Hemat Token (WAJIB), Available Agents, Available Commands (/), Available Skills, Branch Terlindungi (JANGAN DIHAPUS), Folder Structure, graphify, Kompatibilitas Shell (PowerShell & Git Bash) (+11 more)

### Community 123 - "Documentation Types"
Cohesion: 0.13
Nodes (14): 1. README Files, 2. API Documentation, 3. Guides and Tutorials, 4. Inline Documentation, 5. Architecture Documentation, Clarity, Core Philosophy, Critical Rules (+6 more)

### Community 124 - "OWASP Top 10 Analysis"
Cohesion: 0.13
Nodes (14): A01: Broken Access Control, A02: Cryptographic Failures, A03: Injection, A04: Insecure Design, A05: Security Misconfiguration, A06: Vulnerable Components, A07: Authentication Failures, A08: Software and Data Integrity Failures (+6 more)

### Community 126 - "PBIs (Product Backlog Items)"
Cohesion: 0.15
Nodes (12): FE-1: Customer, Waiter & Cashier, FE-2: Owner / Admin, Frontend Developer Agent, Modul 1: Auth, Modul 2: Pesanan, Modul 3: Pembayaran, Modul 4: Sistem, Modul 5: Laporan & Analitik (+4 more)

### Community 127 - "Security Best Practices"
Cohesion: 0.15
Nodes (12): API Security, Audit Checklist, Authentication, Authorization, Critical Rules, Data Validation, DILARANG Mengosongkan Database, DILARANG Run Dev Server (+4 more)

### Community 128 - "Backend Developer Agent"
Cohesion: 0.17
Nodes (11): Backend Developer Agent, Files to Work On, Modul 1: User Management, Modul 2: Pesanan, Modul 3: Pembayaran, Modul 4: Sistem, Modul 5: Laporan & Analitik, PBIs (Product Backlog Items) (+3 more)

### Community 129 - "Phase 2: Multi-Perspective Analysis"
Cohesion: 0.17
Nodes (11): Correctness Review, Maintainability Review, Output Format, Performance Review, Phase 1: Gather Context, Phase 2: Multi-Perspective Analysis, Phase 3: Synthesize Findings, Review Mode - Comprehensive Code Review (+3 more)

### Community 131 - "ARCHITECTURE - Pringmoni"
Cohesion: 0.12
Nodes (15): 1. Architecture Overview, 2. Database Schema, 3. Route Structure, 4.1 Shift Kasir & Serah Terima Kas, 4. Server Actions, 5.1 Ambil alih sesi (takeover antar perangkat), 5. Auth Flow, 6. Real-time Flow (+7 more)

### Community 132 - "Alur Kerja Wajib (Anti-Churn)"
Cohesion: 0.11
Nodes (17): 1. Cek Sebelum Mengubah, 2. Spec Sebelum Kode, 3. Verifikasi Sebelum Commit, 4. Sinkron Dokumen, 5. Larangan File Sementara, 6. Handoff Sesi, Alur Kerja Wajib (Anti-Churn), Code Conventions - Pringmoni (+9 more)

### Community 133 - "Debugging Protocol"
Cohesion: 0.20
Nodes (9): Debug Mode - Systematic Problem Investigation, Debugging Protocol, Output Format, Phase 1: Reproduce, Phase 2: Isolate, Phase 3: Diagnose, Phase 4: Fix, Phase 5: Document (+1 more)

### Community 134 - "Parallel Execution Command"
Cohesion: 0.20
Nodes (9): Core Principle, Parallel Execution Command, Parallelization Patterns, Pattern A: Multi-Perspective Review, Pattern B: Directory Parallelization, Pattern C: Full Verification Suite, Performance Impact, When NOT to Parallelize (+1 more)

### Community 135 - "Refactor Mode - Code Quality Improvement"
Cohesion: 0.20
Nodes (9): Output Format, Phase 1: Assess, Phase 2: Plan, Phase 3: Execute, Phase 4: Verify, Refactor Mode - Code Quality Improvement, Refactoring Protocol, Refactoring Target (+1 more)

### Community 136 - "Parallel Execution"
Cohesion: 0.20
Nodes (9): Adversarial, Directory-Based, Parallel Execution, Parallelization Patterns, Performance Impact, Perspective-Based, Quick Reference, Task-Based (+1 more)

### Community 137 - "Workflow"
Cohesion: 0.22
Nodes (8): Architect Mode - System Design Session, Output Format, Phase 1: Understand, Phase 2: Explore, Phase 3: Design, Phase 4: Document, Workflow, Your Mission

### Community 138 - "Documentation Generation Command"
Cohesion: 0.22
Nodes (8): API Documentation, Documentation Generation Command, Documentation Target, Documentation Types, Guides, Output Format, Quality Checks, README

### Community 139 - "Verify Changes Command"
Cohesion: 0.22
Nodes (8): Output Format, Phase 1: Gather Context, Phase 2: Fast Checks (Fail-Fast Gate), Phase 3: Deep Checks, Phase 4: Adversarial Review, Philosophy, Verification Target, Verify Changes Command

### Community 140 - "Mentor Mode - Educational Session"
Cohesion: 0.25
Nodes (7): Build Understanding, Encourage Exploration, Mentor Mode - Educational Session, Mentor Principles, Response Structure, Teach the "Why", Your Mission

### Community 141 - "Designing Tests"
Cohesion: 0.25
Nodes (7): Arrange-Act-Assert (AAA), Designing Tests, Quick Reference, TDD Cycle, Test Design Patterns, The Testing Pyramid, When to Use This Skill

### Community 142 - "Common Bottleneck Patterns"
Cohesion: 0.25
Nodes (7): Common Bottleneck Patterns, N+1 Query Problem, Optimizing Performance, Quick Reference, Synchronous Blocking, Unbounded Operations, When to Use This Skill

### Community 143 - "Git Commit Command"
Cohesion: 0.29
Nodes (6): Git Commit Command, Phase 1: Gather Context, Phase 2: Analyze Changes, Phase 3: Generate Commit Message, Phase 4: Execute Commit, Safety Checks

### Community 144 - "Start Command - Pringmoni Interactive Session"
Cohesion: 0.29
Nodes (6): Branch Convention, Start Command - Pringmoni Interactive Session, Step 1: Identify Role, Step 2: Select PBI, Step 3: Confirm & Execute, Step 4: Post-Generation

### Community 145 - "Rapid Mode - Fast Iteration"
Cohesion: 0.33
Nodes (5): Output Style, Rapid Execution Protocol, Rapid Mode - Fast Iteration, Rapid Mode Rules, Your Mission

### Community 146 - "Test Design Command"
Cohesion: 0.33
Nodes (5): Output Format, Target, Test Case Template, Test Design Command, Test Pyramid

### Community 147 - "Analyzing Projects"
Cohesion: 0.33
Nodes (5): Analyzing Projects, Core Analysis Framework, Quick Reference, The 5-Layer Discovery Process, When to Use This Skill

### Community 148 - "Designing APIs"
Cohesion: 0.33
Nodes (5): Designing APIs, Quick Reference, Resource-Oriented Design, REST API Design Principles, When to Use This Skill

### Community 149 - "Designing Architecture"
Cohesion: 0.33
Nodes (5): Core Architecture Principles, Designing Architecture, Quick Reference, SOLID Principles, When to Use This Skill

### Community 150 - "Managing Git"
Cohesion: 0.33
Nodes (5): Commit Message Conventions, Conventional Commits, Managing Git, Quick Reference, When to Use This Skill

### Community 151 - "Graphify Command"
Cohesion: 0.40
Nodes (4): Graphify Command, Step 1: Build / Update Graph, Step 2: Answer Codebase Questions via Graph, Step 3: Keep It Fresh

### Community 152 - "dependencies"
Cohesion: 0.50
Nodes (3): @opencode-ai/plugin, dependencies, @opencode-ai/plugin

### Community 162 - "actions/reservasi.ts"
Cohesion: 0.09
Nodes (27): activeReservationStatuses(), ALLOWED_ROLES, cancelReservasi(), confirmKedatanganReservasi(), createReservasi(), CreateReservasiData, CreateReservasiItem, expireReservasi() (+19 more)

### Community 166 - "Implementasi Reservasi (PBI-7.1)"
Cohesion: 0.10
Nodes (19): 1. Ringkasan, 2. Perubahan Database, 3. Server Actions, 4. UI, 5. Integrasi, 6. Verifikasi, 7. Checklist Uji Manual, 8. Batasan yang Diketahui (+11 more)

### Community 176 - "8. Rencana: Pengaturan Jam Reservasi oleh Owner"
Cohesion: 0.08
Nodes (23): 1. Keputusan yang sudah disepakati, 2. Ruang Lingkup, 3. Desain Data v2, 4. Fase Pengerjaan, 5. Alur Meja, 6. Verifikasi, 7. Urutan Eksekusi & Commit, 8.1 Keputusan yang sudah disepakati (+15 more)

### Community 182 - "logs.ts"
Cohesion: 0.38
Nodes (5): getLogCount(), getLogs(), getUniqueUsers(), LogItem, LoggingPage()

### Community 189 - "seed-2025.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 190 - "seed-historical.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 191 - "seed-resep.ts"
Cohesion: 0.47
Nodes (5): butuhBumbu(), DRY_RUN, main(), prisma, upsertBahan()

### Community 192 - "useOrdersRealtime"
Cohesion: 0.47
Nodes (4): ref_pusher_js, DashboardRealtimeRefresh(), PESANAN_EVENTS, useOrdersRealtime()

### Community 193 - "GrafikMenu.tsx"
Cohesion: 0.40
Nodes (4): COLORS, GrafikMenu(), TooltipPayload, MenuTerlaris

## Knowledge Gaps
- **1681 isolated node(s):** `$schema`, `@opencode-ai/plugin`, `recentTaskCalls`, `SENSITIVE_FILES`, `editedFiles` (+1676 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1882 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `[tokenMeja]/page.tsx`, `page-loader.tsx`, `ref_react`, `stok-bahan/page.tsx`, `dropdown-menu.tsx`, `menu-management.tsx`, `kasir/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `createLog()` connect `createLog` to `actions/reservasi.ts`, `actions/shift.ts`, `kasir.ts`, `pesanan.ts`, `meja.ts`, `auth.ts`, `menu.ts`, `src_lib_auth_auth`, `actions/voucher.ts`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `$schema`, `@opencode-ai/plugin`, `recentTaskCalls` to the rest of the system?**
  _1681 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `actions/shift.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05727848101265823 - nodes in this community are weakly interconnected._
- **Should `page-loader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `src/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._