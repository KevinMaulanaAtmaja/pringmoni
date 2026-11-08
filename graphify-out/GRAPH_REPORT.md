# Graph Report - pringmoni  (2026-11-07)

## Corpus Check
- 276 files · ~343,261 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2887 nodes · 4599 edges · 164 communities (99 shown, 39 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dac8401e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- seed-2025.ts
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
- ShiftKasirPanel.tsx
- dashboard.ts
- cn
- 20260408053831_init_all_schema/migration.sql
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- auth.ts
- OWASP Top 10 Focus Areas
- Whitebox Testing Plan - Pringmoni
- auth-mock.ts
- DashboardCharts.tsx
- GrafikPeakHours.tsx
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- menu.ts
- notifikasi.ts
- testing/page.tsx
- ✅ SELESAI
- package.json
- meja.ts
- scripts
- scripts.js
- pesanan.ts
- kasir/page.tsx
- components/BankIcon.tsx
- PieMetode.tsx
- KasirPage
- 20260327055635_init/migration.sql
- security-scan.ts
- createLog
- useOrdersRealtime
- shift/page.tsx
- README.md
- notifications.ts
- parallel-guard.ts
- verification.ts
- category-icon.tsx
- [tokenMeja]/page.tsx
- dependencies
- eslint.config.mjs
- stok-bahan.test.ts
- prisma.ts
- cloudinary
- StaleNotificationBell.tsx
- seed-menu.ts
- PerbandinganCard.tsx
- 20261017000001_add_jadwal_shift_dan_kas_keluar/migration.sql
- 20260930000001_add_shift_kasir/migration.sql
- refund.ts
- login.ts
- card.tsx
- users.test.ts
- print-struk.ts
- prisma-mock.ts
- export-laporan.test.ts
- exceljs
- graphify.js
- menu-management.tsx
- proxy.ts
- sesi.ts
- lucide-react
- next
- next.config.ts
- logout.ts
- delete/route.ts
- class-variance-authority
- pusher
- pusher-js
- qrcode.react
- @react-pdf/renderer
- LoginPage
- seed-historical.ts
- postcss.config.mjs
- sharp
- seed-resep.ts
- tw-animate-css
- xlsx
- radix-ui
- { GET, POST }
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
- PBIs (Product Backlog Items)
- Security Best Practices
- Backend Developer Agent
- Phase 2: Multi-Perspective Analysis
- pg
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
- shadcn
- Tester Agent
- seed.ts
- stok-bahan/page.tsx
- testPrisma.ts
- tmp-cek-meja.ts
- tmp-cek-prisma.ts
- ref_dotenv

## God Nodes (most connected - your core abstractions)
1. `-` - 882 edges
2. `cn()` - 81 edges
3. `createLog()` - 48 edges
4. `Button()` - 33 edges
5. `triggerPusher()` - 26 edges
6. `KasirPage()` - 23 edges
7. `PrismaMock` - 22 edges
8. `Badge()` - 21 edges
9. `Card()` - 21 edges
10. `CardContent()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `LoginPage()` --indirect_call--> `loginAction()`  [INFERRED]
  src/app/(auth)/login/page.tsx → src/app/actions/login.ts
- `ResetPasswordPage()` --indirect_call--> `resetPasswordConfirmAction()`  [INFERRED]
  src/app/(auth)/reset-password/[token]/page.tsx → src/app/actions/reset-password-confirm.ts
- `ForgotPasswordPage()` --indirect_call--> `forgotPasswordAction()`  [INFERRED]
  src/app/(auth)/reset-password/page.tsx → src/app/actions/forgot-password.ts
- `handleBatalFinal()` --calls--> `batalkanPesananKasir()`  [EXTRACTED]
  src/app/dashboard/kasir/page.tsx → src/app/actions/kasir.ts
- `handleSubmit()` --calls--> `createPesanan()`  [EXTRACTED]
  src/app/dashboard/kasir/pesanan-baru/page.tsx → src/app/actions/pesanan.ts

## Import Cycles
- None detected.

## Communities (164 total, 39 thin omitted)

### Community 1 - "seed-2025.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 2 - "actions/shift.ts"
Cohesion: 0.06
Nodes (73): ambilShiftRow(), autoCloseShifts(), bukaShift(), getDaftarKasir(), getDaftarKasirLengkap(), getJadwalShift(), getKasKeluarAktif(), getRiwayatShift() (+65 more)

### Community 4 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node (+22 more)

### Community 5 - "uploadthing.ts"
Cohesion: 0.40
Nodes (4): { GET, POST }, f, OurFileRouter, utapi

### Community 6 - "src/types/index.ts"
Cohesion: 0.06
Nodes (35): AnalisisTambahan, CreateStokBahanInput, CreateUserInput, DashboardStats, DetailPesananItem, JenisPerubahanStok, KategoriBahan, KategoriMenu (+27 more)

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
Cohesion: 0.28
Nodes (12): autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), getPaidStaleWarnings(), getStaleOrders(), PaidStaleOrder, StaleOrder (+4 more)

### Community 14 - "cn"
Cohesion: 0.12
Nodes (18): MenuTabs(), CardAction(), CardFooter(), DialogOverlay(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), Separator() (+10 more)

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.18
Nodes (12): "detail_pesanan", "kategori_menu", "logs", "meja", "menu", "menu_foto", "pesanan", "users" (+4 more)

### Community 16 - "devDependencies"
Cohesion: 0.04
Nodes (46): agentation, agentation-mcp, babel-plugin-react-compiler, eslint, eslint-config-next, prisma, devDependencies, agentation (+38 more)

### Community 18 - "laporan.ts"
Cohesion: 0.30
Nodes (15): getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir(), getLaporanKategori(), getLaporanMenuTerlaris() (+7 more)

### Community 19 - "auth.ts"
Cohesion: 0.13
Nodes (9): StatCard(), StatGrid(), StatGridProps, CustomUser, { handlers, auth, signIn, signOut }, next-auth, Session, User (+1 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "Whitebox Testing Plan - Pringmoni"
Cohesion: 0.05
Nodes (38): 10. Risiko & Mitigasi, 11. Progress Tracker, 12. Riwayat Perubahan, 1. Tujuan & Ruang Lingkup, 2.1 Library tersedia, 2.2 Test yang sudah berjalan (27 file, 526 test), 2.3 Gap yang harus ditutup di Fase 0, 2. Baseline Library & Kondisi Saat Ini (+30 more)

### Community 22 - "auth-mock.ts"
Cohesion: 0.16
Nodes (14): clearLogs(), getLogCount(), getLogs(), getUniqueUsers(), LogItem, LoggingPage(), sessionUntuk(), TestRole (+6 more)

### Community 23 - "DashboardCharts.tsx"
Cohesion: 0.19
Nodes (12): ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah(), MejaData (+4 more)

### Community 24 - "GrafikPeakHours.tsx"
Cohesion: 0.23
Nodes (7): amberGradient(), calcTicks(), GrafikPeakHours(), TooltipPayload, GrafikPendapatan(), TooltipPayload, GrafikPoint

### Community 25 - "app/layout.tsx"
Cohesion: 0.16
Nodes (13): src_app_globals, geistMono, geistMonoHeading, geistSans, inter, metadata, RootLayout(), Providers() (+5 more)

### Community 26 - "export-laporan.ts"
Cohesion: 0.20
Nodes (13): COLORS, GrafikMenu(), TooltipPayload, centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan() (+5 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "menu.ts"
Cohesion: 0.09
Nodes (35): applyStokHarian(), createKategori(), createMenu(), CreateMenuInput, deleteKategori(), deleteMenu(), deleteAllMenuFotos(), deleteMenuFoto() (+27 more)

### Community 29 - "notifikasi.ts"
Cohesion: 0.17
Nodes (11): awalHari(), getNotifikasiDashboard(), getNotifikasiTerlambat(), KIND_PER_ROLE, klasifikasiPesanan(), NotifikasiPesananTerlambat, PesananNotifikasi, PRIORITAS_KIND (+3 more)

### Community 30 - "testing/page.tsx"
Cohesion: 0.09
Nodes (31): BarisTest(), formatDurasi(), formatWaktu(), gayaStatusFase, gayaStatusTest, labelStatusFase, labelStatusTest, TestingPage() (+23 more)

### Community 31 - "✅ SELESAI"
Cohesion: 0.04
Nodes (47): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 8. Optimasi delay >5 detik (+39 more)

### Community 32 - "package.json"
Cohesion: 0.15
Nodes (12): lightningcss-win32-x64-msvc, name, optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc, overrides, effect, prisma (+4 more)

### Community 33 - "meja.ts"
Cohesion: 0.16
Nodes (13): createMeja(), deleteMeja(), generateNomorMeja(), getNextNomorMeja(), kosongkanMeja(), MejaResult, updateMeja(), MejaPage() (+5 more)

### Community 34 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, graph:update, lint, seed-2025, seed-menu, seed-resep (+4 more)

### Community 35 - "scripts.js"
Cohesion: 0.32
Nodes (14): addSimReplay(), advanceSimOnSlide(), beginSimStream(), beginSimThink(), escapeHtml(), finishSim(), go(), initSims() (+6 more)

### Community 36 - "pesanan.ts"
Cohesion: 0.09
Nodes (39): getKategoriMenus(), cancelExpiredOrders(), CreatePesananData, CreatePesananItem, getActivePesananByToken(), getCustomerMenuData, getCustomerPaymentStatus(), getMejaByToken() (+31 more)

### Community 37 - "kasir/page.tsx"
Cohesion: 0.13
Nodes (24): metodeColors, metodeIcons, metodeLabels, Pesanan, PesananItem, statusBayarColors, statusBayarLabels, statusBayarColors (+16 more)

### Community 39 - "PieMetode.tsx"
Cohesion: 0.33
Nodes (5): COLORS, formatRupiah(), PieMetode(), PieMetodeProps, PieTooltipPayload

### Community 40 - "KasirPage"
Cohesion: 0.16
Nodes (5): KasirPage(), getGrandTotal(), handleBatalFinal(), handleBayarTunaiStep(), handleMethodWarningProceed()

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "createLog"
Cohesion: 0.15
Nodes (28): accPesanan(), batalkanPesananKasir(), confirmQrisPayment(), generateQRISCode(), getPaidOrdersForNotification(), getPembayaranInfo(), getPesananBelumBayar(), getPesananRiwayatKasir() (+20 more)

### Community 44 - "useOrdersRealtime"
Cohesion: 0.16
Nodes (12): DashboardRealtimeRefresh(), KasirOrderNotifications(), NotifOrder, PaidOrder, soundedConfirmedOrders, soundedPaidOrders, ToastData, StaleNotificationBell() (+4 more)

### Community 45 - "shift/page.tsx"
Cohesion: 0.20
Nodes (19): getMeja(), CartItem, aksiColors, aksiKategori, aksiLabels, JenisAksi, statusColors, statusLabels (+11 more)

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "[tokenMeja]/page.tsx"
Cohesion: 0.06
Nodes (60): createPesanan(), MejaTersediaPindah, createVoucher(), deleteVoucher(), getVoucherAktif(), getVoucherList(), HasilValidasiVoucher, normalisasiKode() (+52 more)

### Community 54 - "dependencies"
Cohesion: 0.05
Nodes (41): bcryptjs, clsx, cn, @hugeicons/react, jspdf, next-auth, nodemailer, dependencies (+33 more)

### Community 64 - "stok-bahan.test.ts"
Cohesion: 0.19
Nodes (23): createStokBahan(), deleteStokBahan(), getBahanDapurList(), getRiwayatStok(), getStokBahanList(), hapusResepBahan(), hitungStatus(), requireOwner() (+15 more)

### Community 65 - "prisma.ts"
Cohesion: 0.09
Nodes (16): ref_crypto, forgotPasswordAction(), resetPasswordConfirmAction(), resetPasswordAction(), ForgotPasswordPage(), ResetPasswordPage(), sendResetPasswordEmail(), transporter (+8 more)

### Community 67 - "StaleNotificationBell.tsx"
Cohesion: 0.05
Nodes (41): NotifikasiItem, NotifikasiKind, LaporanPage(), jamLabel(), rupiah(), ShiftSidebarStatus(), ClockDisplay(), getServerSnapshot() (+33 more)

### Community 69 - "seed-menu.ts"
Cohesion: 0.24
Nodes (9): KATEGORI_SEED, KategoriSeed, main(), MENU_CAFE_SEED, MENU_PAKET_SEED, MenuSeed, prisma, upsertKategori() (+1 more)

### Community 70 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 73 - "refund.ts"
Cohesion: 0.12
Nodes (14): deleteRefundBukti(), getRefundInfo(), RefundBuktiInput, RefundInfo, requireKasir(), ORDERS_CHANNEL, PESANAN_EVENTS, pesananFixture (+6 more)

### Community 74 - "login.ts"
Cohesion: 0.19
Nodes (13): HasilValidasi, loginAction(), LoginState, STATE_AWAL, validasiKredensial(), checkRateLimit(), getKey(), RateLimitEntry (+5 more)

### Community 75 - "card.tsx"
Cohesion: 0.25
Nodes (11): initialState, initialState, initialState, CafeSpotlightProps, StatCardProps, Card(), CardContent(), CardDescription() (+3 more)

### Community 76 - "users.test.ts"
Cohesion: 0.22
Nodes (13): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+5 more)

### Community 77 - "print-struk.ts"
Cohesion: 0.15
Nodes (19): ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee(), hitungExpiryMenit(), centerText(), formatRupiah() (+11 more)

### Community 78 - "prisma-mock.ts"
Cohesion: 0.15
Nodes (12): markPesananSelesai(), hitungStatus(), potongStokDapur(), stokBahanFixture, userFixture, createPrismaMock(), MockFunction, model() (+4 more)

### Community 79 - "export-laporan.test.ts"
Cohesion: 0.13
Nodes (10): clickMock, createElementMock, createObjectUrlMock, excelState, FakeJsPDF, FakeWorkbook, FakeWorksheet, pdfState (+2 more)

### Community 82 - "menu-management.tsx"
Cohesion: 0.15
Nodes (12): MenuWithKategori, ActionResult, KategoriMenu, LokasiMenu, statusColors, statusLabels, StatusMenu, Checkbox() (+4 more)

### Community 83 - "proxy.ts"
Cohesion: 0.20
Nodes (13): ALL_ROLES, config, getRouteRole(), isPublicRoute(), isRoleUser(), proxy(), PUBLIC_ROUTES, RESERVED_ROOT_SEGMENTS (+5 more)

### Community 84 - "sesi.ts"
Cohesion: 0.31
Nodes (8): AMBANG_SESI_AKTIF_MS, ambilVersiSesi(), cacheVersi, catatAktivitasSesi(), catatVersiSesi(), sesiLainKemungkinanAktif(), terakhirCatatAktivitas, waktuLoginLabel()

### Community 98 - "seed-historical.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 102 - "seed-resep.ts"
Cohesion: 0.47
Nodes (5): butuhBumbu(), DRY_RUN, main(), prisma, upsertBahan()

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
Nodes (18): 1. Cek Sebelum Mengubah, 2. Spec Sebelum Kode, 3.1 Test Adalah Spek (WAJIB), 3. Verifikasi Sebelum Commit, 4. Sinkron Dokumen, 5. Larangan File Sementara, 6. Handoff Sesi, Alur Kerja Wajib (Anti-Churn) (+10 more)

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

### Community 166 - "Tester Agent"
Cohesion: 0.18
Nodes (10): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+2 more)

### Community 168 - "stok-bahan/page.tsx"
Cohesion: 0.17
Nodes (12): StokBahanWithType, BahanLogo(), BahanLogoConfig, emptyForm, getBahanLogoConfig(), jenisPerubahanLabels, kategoriLabels, satuanLabels (+4 more)

## Knowledge Gaps
- **1720 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `@opencode-ai/plugin`, `recentTaskCalls`, `SENSITIVE_FILES` (+1715 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1911 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `StaleNotificationBell.tsx`, `page-loader.tsx`, `kasir/page.tsx`, `stok-bahan/page.tsx`, `card.tsx`, `ShiftKasirPanel.tsx`, `shift/page.tsx`, `menu-management.tsx`, `[tokenMeja]/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `KasirPage()` connect `KasirPage` to `print-struk.ts`, `createLog`, `useOrdersRealtime`, `kasir/page.tsx`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `@opencode-ai/plugin` to the rest of the system?**
  _1720 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `actions/shift.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05648148148148148 - nodes in this community are weakly interconnected._
- **Should `page-loader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `src/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05547652916073969 - nodes in this community are weakly interconnected._