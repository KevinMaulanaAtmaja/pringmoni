# Graph Report - pringmoni  (2026-11-07)

## Corpus Check
- 252 files · ~323,009 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2745 nodes · 4207 edges · 186 communities (97 shown, 62 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4821ebc6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- fixtures.ts
- actions/shift.ts
- page-loader.tsx
- compilerOptions
- createLog
- src/types/index.ts
- LaporanClient.tsx
- types/index.ts
- components.json
- 2. MVP (Minimum Viable Product)
- -
- ShiftKasirPanel.tsx
- dashboard.ts
- ✅ SELESAI
- 20260408053831_init_all_schema/migration.sql
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- auth.ts
- OWASP Top 10 Focus Areas
- [tokenMeja]/page.tsx
- ARCHITECTURE - Pringmoni
- DashboardCharts.tsx
- card.tsx
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- menu-management.tsx
- notifikasi.ts
- stok-bahan/page.tsx
- StaleNotificationBell.tsx
- package.json
- PieMetode.tsx
- scripts
- scripts.js
- cn
- kasir/page.tsx
- components/BankIcon.tsx
- GrafikPeakHours.tsx
- KasirPage
- 20260327055635_init/migration.sql
- security-scan.ts
- actions/voucher.ts
- logging/page.tsx
- DashboardClient.tsx
- README.md
- notifications.ts
- parallel-guard.ts
- verification.ts
- category-icon.tsx
- pesanan.ts
- dependencies
- eslint.config.mjs
- stok-bahan.ts
- prisma.ts
- Playwright Blackbox Testing - Pringmoni
- useOrdersRealtime
- seed-menu.ts
- optionalDependencies
- GrafikMenu.tsx
- PerbandinganCard.tsx
- refund.ts
- Tester Agent
- BLACKBOX TEST - Rencana, Aturan & Implementasi Bertahap
- meja.ts
- print-struk.ts
- seed-2025.ts
- seed-historical.ts
- exceljs
- seed-resep.ts
- uploadthing.ts
- jspdf
- jsqr
- lucide-react
- next
- prisma
- nodemailer
- @prisma/adapter-pg
- @prisma/client
- pusher
- pusher-js
- qrcode
- 20261017000001_add_jadwal_shift_dan_kas_keluar/migration.sql
- seed.ts
- @radix-ui/react-dialog
- react-dom
- testPrisma.ts
- babel-plugin-react-compiler
- postcss.config.mjs
- sharp
- cloudinary
- tw-animate-css
- cn
- xlsx
- zod
- eslint
- @hugeicons/react
- next-auth
- radix-ui
- next.config.ts
- { GET, POST }
- qrcode.react
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
- recharts
- PBIs (Product Backlog Items)
- Security Best Practices
- Backend Developer Agent
- Phase 2: Multi-Perspective Analysis
- pg
- uploadthing
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
- react
- shadcn
- @uploadthing/react
- @playwright/test
- tailwindcss
- @testing-library/jest-dom
- @testing-library/react
- ts-node
- tsx
- @types/bcryptjs
- @types/node
- vitest
- 20260930000001_add_shift_kasir/migration.sql
- clsx
- tmp-cek-meja.ts
- uuid
- tmp-cek-prisma.ts
- ref_dotenv

## God Nodes (most connected - your core abstractions)
1. `-` - 882 edges
2. `cn()` - 80 edges
3. `createLog()` - 47 edges
4. `Button()` - 33 edges
5. `triggerPusher()` - 26 edges
6. `KasirPage()` - 23 edges
7. `Badge()` - 20 edges
8. `Card()` - 20 edges
9. `Input()` - 20 edges
10. `CardContent()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `ForgotPasswordPage()` --indirect_call--> `forgotPasswordAction()`  [INFERRED]
  src/app/(auth)/reset-password/page.tsx → src/app/actions/forgot-password.ts
- `handleBatalFinal()` --calls--> `batalkanPesananKasir()`  [EXTRACTED]
  src/app/dashboard/kasir/page.tsx → src/app/actions/kasir.ts
- `handleSubmit()` --calls--> `createPesanan()`  [EXTRACTED]
  src/app/dashboard/kasir/pesanan-baru/page.tsx → src/app/actions/pesanan.ts
- `cancelExpiredOrders()` --calls--> `createLog()`  [EXTRACTED]
  src/app/actions/pesanan.ts → src/lib/log.ts
- `handlePindah()` --calls--> `pindahMeja()`  [EXTRACTED]
  src/components/customer/pindah-meja-sheet.tsx → src/app/actions/pesanan.ts

## Import Cycles
- None detected.

## Communities (186 total, 62 thin omitted)

### Community 1 - "fixtures.ts"
Cohesion: 0.07
Nodes (34): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_node_crypto, ref_path, authDir, ownerFile, CleanupRegistry, CleanupTask (+26 more)

### Community 2 - "actions/shift.ts"
Cohesion: 0.06
Nodes (70): ambilShiftRow(), autoCloseShifts(), bukaShift(), getDaftarKasir(), getDaftarKasirLengkap(), getJadwalShift(), getKasKeluarAktif(), getRiwayatShift() (+62 more)

### Community 4 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node (+22 more)

### Community 5 - "createLog"
Cohesion: 0.16
Nodes (26): accPesanan(), batalkanPesananKasir(), confirmQrisPayment(), generateQRISCode(), getPembayaranInfo(), KasirPesananItem, konfirmasiPembayaran(), prosesPembayaranQRIS() (+18 more)

### Community 6 - "src/types/index.ts"
Cohesion: 0.06
Nodes (33): AnalisisTambahan, CreateStokBahanInput, CreateUserInput, DashboardStats, DetailPesananItem, JenisPerubahanStok, KategoriBahan, KategoriMenu (+25 more)

### Community 7 - "LaporanClient.tsx"
Cohesion: 0.10
Nodes (21): currentYear, dateToWeekStr(), getWeekRange(), LaporanClient(), LaporanKasirItem, loadingState, TabBanding(), TabBulanan() (+13 more)

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

### Community 12 - "ShiftKasirPanel.tsx"
Cohesion: 0.14
Nodes (25): metodeConfig, PesananData, StatusPesanan, PembayaranInfo, Menu, MenuCardProps, MenuFoto, satuanLabels (+17 more)

### Community 13 - "dashboard.ts"
Cohesion: 0.19
Nodes (14): autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), getStaleOrders(), PaidStaleOrder, StaleOrder, getPesananByTokenAndId() (+6 more)

### Community 14 - "✅ SELESAI"
Cohesion: 0.07
Nodes (29): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 8. Optimasi delay >5 detik (+21 more)

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.18
Nodes (12): "detail_pesanan", "kategori_menu", "logs", "meja", "menu", "menu_foto", "pesanan", "users" (+4 more)

### Community 16 - "devDependencies"
Cohesion: 0.10
Nodes (21): agentation, agentation-mcp, eslint-config-next, devDependencies, agentation, agentation-mcp, eslint-config-next, @tailwindcss/postcss (+13 more)

### Community 18 - "laporan.ts"
Cohesion: 0.32
Nodes (14): getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir(), getLaporanKategori(), getLaporanMenuTerlaris() (+6 more)

### Community 19 - "auth.ts"
Cohesion: 0.05
Nodes (43): HasilValidasi, loginAction(), LoginState, STATE_AWAL, validasiKredensial(), utapi, LoginPage(), StatCard() (+35 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "[tokenMeja]/page.tsx"
Cohesion: 0.06
Nodes (51): createPesanan(), getActivePesananByToken(), getCustomerMenuData, getMejaByToken(), getMejaTersediaPindah(), getMenusForCustomer(), getStatusPesananAktifMeja(), MejaTersediaPindah (+43 more)

### Community 22 - "ARCHITECTURE - Pringmoni"
Cohesion: 0.12
Nodes (15): 1. Architecture Overview, 2. Database Schema, 3. Route Structure, 4.1 Shift Kasir & Serah Terima Kas, 4. Server Actions, 5.1 Ambil alih sesi (takeover antar perangkat), 5. Auth Flow, 6. Real-time Flow (+7 more)

### Community 23 - "DashboardCharts.tsx"
Cohesion: 0.19
Nodes (12): ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah(), MejaData (+4 more)

### Community 24 - "card.tsx"
Cohesion: 0.24
Nodes (12): initialState, initialState, initialState, CafeSpotlightProps, StatCardProps, Card(), CardContent(), CardDescription() (+4 more)

### Community 25 - "app/layout.tsx"
Cohesion: 0.16
Nodes (13): src_app_globals, geistMono, geistMonoHeading, geistSans, inter, metadata, RootLayout(), Providers() (+5 more)

### Community 26 - "export-laporan.ts"
Cohesion: 0.36
Nodes (9): centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport, MonthPDFData, renderRingkasanPDF() (+1 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "menu-management.tsx"
Cohesion: 0.07
Nodes (48): getMeja(), applyStokHarian(), createKategori(), createMenu(), CreateMenuInput, deleteKategori(), deleteMenu(), deleteAllMenuFotos() (+40 more)

### Community 29 - "notifikasi.ts"
Cohesion: 0.24
Nodes (10): awalHari(), getNotifikasiDashboard(), getNotifikasiTerlambat(), KIND_PER_ROLE, klasifikasiPesanan(), NotifikasiItem, NotifikasiKind, NotifikasiPesananTerlambat (+2 more)

### Community 30 - "stok-bahan/page.tsx"
Cohesion: 0.17
Nodes (12): StokBahanWithType, BahanLogo(), BahanLogoConfig, emptyForm, getBahanLogoConfig(), jenisPerubahanLabels, kategoriLabels, satuanLabels (+4 more)

### Community 31 - "StaleNotificationBell.tsx"
Cohesion: 0.11
Nodes (18): buildSubtext(), formatDurasi(), formatRupiah(), KIND_META, KindMeta, labelStatus(), NotifikasiRow(), DropdownMenu() (+10 more)

### Community 32 - "package.json"
Cohesion: 0.25
Nodes (7): name, overrides, effect, prisma, seed, private, version

### Community 33 - "PieMetode.tsx"
Cohesion: 0.33
Nodes (5): COLORS, formatRupiah(), PieMetode(), PieMetodeProps, PieTooltipPayload

### Community 34 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, dev, graph:update, lint, seed-2025, seed-menu, seed-resep (+10 more)

### Community 35 - "scripts.js"
Cohesion: 0.32
Nodes (14): addSimReplay(), advanceSimOnSlide(), beginSimStream(), beginSimThink(), escapeHtml(), finishSim(), go(), initSims() (+6 more)

### Community 36 - "cn"
Cohesion: 0.12
Nodes (22): MenuTabs(), CardAction(), CardFooter(), Checkbox(), DialogOverlay(), SelectContent(), SelectGroup(), SelectItem() (+14 more)

### Community 37 - "kasir/page.tsx"
Cohesion: 0.11
Nodes (34): getPesananById(), metodeColors, metodeIcons, metodeLabels, Pesanan, PesananItem, statusBayarColors, statusBayarLabels (+26 more)

### Community 39 - "GrafikPeakHours.tsx"
Cohesion: 0.23
Nodes (7): amberGradient(), calcTicks(), GrafikPeakHours(), TooltipPayload, GrafikPendapatan(), TooltipPayload, GrafikPoint

### Community 40 - "KasirPage"
Cohesion: 0.15
Nodes (6): getPesananRiwayatKasir(), KasirPage(), getGrandTotal(), handleBatalFinal(), handleBayarTunaiStep(), handleMethodWarningProceed()

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "actions/voucher.ts"
Cohesion: 0.26
Nodes (14): createVoucher(), deleteVoucher(), getVoucherList(), HasilValidasiVoucher, normalisasiKode(), requireOwner(), setStatusVoucher(), updateVoucher() (+6 more)

### Community 44 - "logging/page.tsx"
Cohesion: 0.22
Nodes (10): getLogCount(), getLogs(), getUniqueUsers(), LogItem, aksiColors, aksiKategori, aksiLabels, JenisAksi (+2 more)

### Community 45 - "DashboardClient.tsx"
Cohesion: 0.10
Nodes (22): LaporanPage(), jamLabel(), rupiah(), ShiftSidebarStatus(), ClockDisplay(), getServerSnapshot(), getSnapshot(), pad() (+14 more)

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "pesanan.ts"
Cohesion: 0.17
Nodes (16): cancelExpiredOrders(), CreatePesananData, CreatePesananItem, getCustomerPaymentStatus(), getPesananForCheckout(), getPesananForDashboard(), konfirmasiPembayaranCustomer(), markItemDiantar() (+8 more)

### Community 54 - "dependencies"
Cohesion: 0.22
Nodes (9): bcryptjs, class-variance-authority, dependencies, bcryptjs, class-variance-authority, @react-pdf/renderer, tailwind-merge, @react-pdf/renderer (+1 more)

### Community 64 - "stok-bahan.ts"
Cohesion: 0.19
Nodes (21): createStokBahan(), deleteStokBahan(), getBahanDapurList(), getRiwayatStok(), getStokBahanList(), hapusResepBahan(), hitungStatus(), requireOwner() (+13 more)

### Community 65 - "prisma.ts"
Cohesion: 0.13
Nodes (10): ref_crypto, forgotPasswordAction(), resetPasswordConfirmAction(), ForgotPasswordPage(), ResetPasswordPage(), sendResetPasswordEmail(), transporter, getIp() (+2 more)

### Community 66 - "Playwright Blackbox Testing - Pringmoni"
Cohesion: 0.29
Nodes (6): Aturan Penting, Capture, Playwright Blackbox Testing - Pringmoni, Setup, Strategi Data, Struktur

### Community 67 - "useOrdersRealtime"
Cohesion: 0.16
Nodes (13): getPaidOrdersForNotification(), getPesananBelumBayar(), DashboardRealtimeRefresh(), KasirOrderNotifications(), NotifOrder, PaidOrder, soundedConfirmedOrders, soundedPaidOrders (+5 more)

### Community 69 - "seed-menu.ts"
Cohesion: 0.24
Nodes (9): KATEGORI_SEED, KategoriSeed, main(), MENU_CAFE_SEED, MENU_PAKET_SEED, MenuSeed, prisma, upsertKategori() (+1 more)

### Community 70 - "optionalDependencies"
Cohesion: 0.40
Nodes (5): lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 71 - "GrafikMenu.tsx"
Cohesion: 0.40
Nodes (4): COLORS, GrafikMenu(), TooltipPayload, MenuTerlaris

### Community 72 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 73 - "refund.ts"
Cohesion: 0.33
Nodes (4): deleteRefundBukti(), RefundBuktiInput, RefundInfo, requireKasir()

### Community 74 - "Tester Agent"
Cohesion: 0.18
Nodes (10): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+2 more)

### Community 75 - "BLACKBOX TEST - Rencana, Aturan & Implementasi Bertahap"
Cohesion: 0.20
Nodes (9): 1. Tujuan, 2. Strategi Isolasi Database (KEPUTUSAN), 3. Aturan Penulisan Test, 4. Perintah, 5. Peta Modul & Status, 6. Rencana Bertahap (Staged Implementation), 7. Data Test & Cleanup, 8. Catatan Operasional (+1 more)

### Community 76 - "meja.ts"
Cohesion: 0.09
Nodes (26): createMeja(), deleteMeja(), generateNomorMeja(), getNextNomorMeja(), kosongkanMeja(), MejaResult, updateMeja(), createUser() (+18 more)

### Community 77 - "print-struk.ts"
Cohesion: 0.17
Nodes (16): ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee(), centerText(), formatRupiah(), nomorPesanan() (+8 more)

### Community 78 - "seed-2025.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 79 - "seed-historical.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 81 - "seed-resep.ts"
Cohesion: 0.47
Nodes (5): butuhBumbu(), DRY_RUN, main(), prisma, upsertBahan()

### Community 82 - "uploadthing.ts"
Cohesion: 0.40
Nodes (4): { GET, POST }, f, OurFileRouter, utapi

### Community 87 - "prisma"
Cohesion: 0.67
Nodes (3): prisma, prisma, prisma

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

### Community 153 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

## Knowledge Gaps
- **1646 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `@opencode-ai/plugin`, `recentTaskCalls`, `SENSITIVE_FILES` (+1641 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1829 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `page-loader.tsx`, `kasir/page.tsx`, `ShiftKasirPanel.tsx`, `DashboardClient.tsx`, `[tokenMeja]/page.tsx`, `card.tsx`, `app/layout.tsx`, `stok-bahan/page.tsx`, `StaleNotificationBell.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `createLog()` connect `createLog` to `prisma.ts`, `actions/shift.ts`, `refund.ts`, `actions/voucher.ts`, `meja.ts`, `dashboard.ts`, `auth.ts`, `pesanan.ts`, `[tokenMeja]/page.tsx`, `menu-management.tsx`, `notifikasi.ts`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `@opencode-ai/plugin` to the rest of the system?**
  _1646 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `fixtures.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07456140350877193 - nodes in this community are weakly interconnected._
- **Should `actions/shift.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05878332194121668 - nodes in this community are weakly interconnected._
- **Should `page-loader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._