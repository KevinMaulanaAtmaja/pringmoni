# Graph Report - pringmoni  (2026-11-04)

## Corpus Check
- 236 files · ~307,136 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2645 nodes · 4033 edges · 181 communities (92 shown, 64 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `692715c1`
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
- voucher-management.tsx
- dashboard.ts
- cn
- 20260408053831_init_all_schema/migration.sql
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- login.ts
- OWASP Top 10 Focus Areas
- pesanan.ts
- logging/page.tsx
- DashboardCharts.tsx
- GrafikPeakHours.tsx
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- menu.ts
- notifikasi.ts
- GrafikMenu.tsx
- ✅ SELESAI
- package.json
- meja.ts
- scripts
- scripts.js
- optionalDependencies
- kasir/page.tsx
- components/BankIcon.tsx
- PieMetode.tsx
- KasirPage
- 20260327055635_init/migration.sql
- security-scan.ts
- createLog
- auth.ts
- prisma
- README.md
- notifications.ts
- parallel-guard.ts
- verification.ts
- category-icon.tsx
- babel-plugin-react-compiler
- dependencies
- eslint.config.mjs
- stok-bahan.ts
- prisma.ts
- cloudinary
- StaleNotificationBell.tsx
- seed-menu.ts
- PerbandinganCard.tsx
- 20261017000001_add_jadwal_shift_dan_kas_keluar/migration.sql
- 20260930000001_add_shift_kasir/migration.sql
- cn
- eslint
- pesanan/[id]/page.tsx
- users.ts
- print-struk.ts
- eslint-config-next
- @hugeicons/react
- exceljs
- graphify.js
- next-auth
- jspdf
- jsqr
- lucide-react
- next
- next.config.ts
- nodemailer
- @prisma/adapter-pg
- @prisma/client
- pusher
- pusher-js
- qrcode
- qrcode.react
- recharts
- @radix-ui/react-dialog
- react-dom
- seed-historical.ts
- @uploadthing/react
- postcss.config.mjs
- sharp
- seed-resep.ts
- tw-animate-css
- @tailwindcss/postcss
- xlsx
- zod
- radix-ui
- @testing-library/jest-dom
- { GET, POST }
- @testing-library/react
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
- tsx
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
- react
- shadcn
- @types/node
- @types/nodemailer
- meja/page.tsx
- @types/react
- @types/react-dom
- typescript
- Tester Agent
- seed.ts
- stok-bahan/page.tsx
- testPrisma.ts
- clsx
- uploadthing
- uuid
- tmp-cek-meja.ts
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
- `getKasKeluarAktif()` --calls--> `requireShiftAktif()`  [EXTRACTED]
  src/app/actions/shift.ts → src/lib/shift.ts

## Import Cycles
- None detected.

## Communities (181 total, 64 thin omitted)

### Community 1 - "seed-2025.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 2 - "actions/shift.ts"
Cohesion: 0.06
Nodes (75): ambilShiftRow(), autoCloseShifts(), bukaShift(), getDaftarKasir(), getDaftarKasirLengkap(), getJadwalShift(), getKasKeluarAktif(), getRiwayatShift() (+67 more)

### Community 4 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node (+22 more)

### Community 5 - "uploadthing.ts"
Cohesion: 0.40
Nodes (4): { GET, POST }, f, OurFileRouter, utapi

### Community 6 - "src/types/index.ts"
Cohesion: 0.06
Nodes (34): AnalisisTambahan, CreateStokBahanInput, CreateUserInput, CustomerMenu, DashboardStats, DetailPesananItem, JenisPerubahanStok, KategoriBahan (+26 more)

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

### Community 12 - "voucher-management.tsx"
Cohesion: 0.16
Nodes (23): metodeConfig, PesananData, StatusPesanan, PembayaranInfo, Menu, MenuCardProps, MenuFoto, satuanLabels (+15 more)

### Community 13 - "dashboard.ts"
Cohesion: 0.27
Nodes (11): autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), getStaleOrders(), PaidStaleOrder, StaleOrder, getNotifikasiTerlambat() (+3 more)

### Community 14 - "cn"
Cohesion: 0.08
Nodes (34): getMeja(), MenuWithKategori, CartItem, ActionResult, CATEGORY_ICON_MAP, CATEGORY_ICON_OPTIONS, KategoriMenu, LokasiMenu (+26 more)

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.18
Nodes (12): "detail_pesanan", "kategori_menu", "logs", "meja", "menu", "menu_foto", "pesanan", "users" (+4 more)

### Community 16 - "devDependencies"
Cohesion: 0.12
Nodes (17): agentation, agentation-mcp, devDependencies, agentation, agentation-mcp, tailwindcss, @testing-library/user-event, ts-node (+9 more)

### Community 18 - "laporan.ts"
Cohesion: 0.32
Nodes (14): getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir(), getLaporanKategori(), getLaporanMenuTerlaris() (+6 more)

### Community 19 - "login.ts"
Cohesion: 0.08
Nodes (31): HasilValidasi, loginAction(), LoginState, STATE_AWAL, validasiKredensial(), LoginPage(), checkRateLimit(), getKey() (+23 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "pesanan.ts"
Cohesion: 0.05
Nodes (71): cancelExpiredOrders(), createPesanan(), CreatePesananData, CreatePesananItem, getActivePesananByToken(), getCustomerMenuData, getCustomerPaymentStatus(), getMejaByToken() (+63 more)

### Community 22 - "logging/page.tsx"
Cohesion: 0.17
Nodes (14): getLogCount(), getLogs(), getUniqueUsers(), LogItem, DetailPesananPage(), aksiColors, aksiKategori, aksiLabels (+6 more)

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
Cohesion: 0.36
Nodes (9): centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport, MonthPDFData, renderRingkasanPDF() (+1 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "menu.ts"
Cohesion: 0.08
Nodes (35): applyStokHarian(), createKategori(), createMenu(), CreateMenuInput, deleteKategori(), deleteMenu(), deleteAllMenuFotos(), deleteMenuFoto() (+27 more)

### Community 29 - "notifikasi.ts"
Cohesion: 0.14
Nodes (15): awalHari(), getNotifikasiDashboard(), KIND_PER_ROLE, klasifikasiPesanan(), NotifikasiItem, NotifikasiKind, NotifikasiPesananTerlambat, PesananNotifikasi (+7 more)

### Community 30 - "GrafikMenu.tsx"
Cohesion: 0.40
Nodes (4): COLORS, GrafikMenu(), TooltipPayload, MenuTerlaris

### Community 31 - "✅ SELESAI"
Cohesion: 0.10
Nodes (20): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 8. Optimasi delay >5 detik (+12 more)

### Community 32 - "package.json"
Cohesion: 0.25
Nodes (7): name, overrides, effect, prisma, seed, private, version

### Community 33 - "meja.ts"
Cohesion: 0.08
Nodes (26): createMeja(), deleteMeja(), generateNomorMeja(), getNextNomorMeja(), kosongkanMeja(), MejaResult, updateMeja(), LaporanPage() (+18 more)

### Community 34 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, graph:update, lint, seed-2025, seed-menu, seed-resep (+3 more)

### Community 35 - "scripts.js"
Cohesion: 0.32
Nodes (14): addSimReplay(), advanceSimOnSlide(), beginSimStream(), beginSimThink(), escapeHtml(), finishSim(), go(), initSims() (+6 more)

### Community 36 - "optionalDependencies"
Cohesion: 0.40
Nodes (5): lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 37 - "kasir/page.tsx"
Cohesion: 0.11
Nodes (25): getPesananById(), getPesananForDashboard(), markItemDiantar(), updateStatusPesanan(), metodeColors, metodeIcons, metodeLabels, Pesanan (+17 more)

### Community 39 - "PieMetode.tsx"
Cohesion: 0.33
Nodes (5): COLORS, formatRupiah(), PieMetode(), PieMetodeProps, PieTooltipPayload

### Community 40 - "KasirPage"
Cohesion: 0.14
Nodes (7): getPesananRiwayatKasir(), KasirPage(), getGrandTotal(), handleBatalFinal(), handleBayarTunaiStep(), handleMethodWarningProceed(), useShiftAktif()

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "createLog"
Cohesion: 0.19
Nodes (23): accPesanan(), batalkanPesananKasir(), confirmQrisPayment(), generateQRISCode(), getPembayaranInfo(), KasirPesananItem, konfirmasiPembayaran(), prosesPembayaranQRIS() (+15 more)

### Community 44 - "auth.ts"
Cohesion: 0.11
Nodes (12): utapi, StatCard(), StatGrid(), StatGridProps, CustomUser, { handlers, auth, signIn, signOut }, next-auth, Session (+4 more)

### Community 45 - "prisma"
Cohesion: 0.67
Nodes (3): prisma, prisma, prisma

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 54 - "dependencies"
Cohesion: 0.22
Nodes (9): bcryptjs, class-variance-authority, dependencies, bcryptjs, class-variance-authority, @react-pdf/renderer, tailwind-merge, @react-pdf/renderer (+1 more)

### Community 64 - "stok-bahan.ts"
Cohesion: 0.19
Nodes (21): createStokBahan(), deleteStokBahan(), getBahanDapurList(), getRiwayatStok(), getStokBahanList(), hapusResepBahan(), hitungStatus(), requireOwner() (+13 more)

### Community 65 - "prisma.ts"
Cohesion: 0.10
Nodes (11): ref_crypto, forgotPasswordAction(), logoutAction(), resetPasswordConfirmAction(), ForgotPasswordPage(), ResetPasswordPage(), sendResetPasswordEmail(), transporter (+3 more)

### Community 67 - "StaleNotificationBell.tsx"
Cohesion: 0.06
Nodes (36): getPaidOrdersForNotification(), getPesananBelumBayar(), KasirOrderNotifications(), NotifOrder, PaidOrder, soundedConfirmedOrders, soundedPaidOrders, ToastData (+28 more)

### Community 69 - "seed-menu.ts"
Cohesion: 0.24
Nodes (9): KATEGORI_SEED, KategoriSeed, main(), MENU_CAFE_SEED, MENU_PAKET_SEED, MenuSeed, prisma, upsertKategori() (+1 more)

### Community 70 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 75 - "pesanan/[id]/page.tsx"
Cohesion: 0.21
Nodes (14): initialState, initialState, initialState, statusBayarColors, statusColors, CafeSpotlightProps, StatCardProps, Card() (+6 more)

### Community 76 - "users.ts"
Cohesion: 0.22
Nodes (12): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+4 more)

### Community 77 - "print-struk.ts"
Cohesion: 0.18
Nodes (15): ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee(), centerText(), formatRupiah(), nomorPesanan() (+7 more)

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

### Community 158 - "meja/page.tsx"
Cohesion: 0.23
Nodes (12): statusColors, statusLabels, tipeMejaLabels, roleColors, roleLabels, TableBody(), TableCaption(), TableCell() (+4 more)

### Community 166 - "Tester Agent"
Cohesion: 0.18
Nodes (10): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+2 more)

### Community 168 - "stok-bahan/page.tsx"
Cohesion: 0.17
Nodes (12): StokBahanWithType, BahanLogo(), BahanLogoConfig, emptyForm, getBahanLogoConfig(), jenisPerubahanLabels, kategoriLabels, satuanLabels (+4 more)

## Knowledge Gaps
- **1610 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `@opencode-ai/plugin`, `recentTaskCalls`, `SENSITIVE_FILES` (+1605 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1784 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **64 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `meja.ts`, `StaleNotificationBell.tsx`, `page-loader.tsx`, `kasir/page.tsx`, `stok-bahan/page.tsx`, `pesanan/[id]/page.tsx`, `voucher-management.tsx`, `pesanan.ts`, `logging/page.tsx`, `app/layout.tsx`, `meja/page.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `createLog()` connect `createLog` to `prisma.ts`, `meja.ts`, `actions/shift.ts`, `kasir/page.tsx`, `dashboard.ts`, `login.ts`, `pesanan.ts`, `menu.ts`, `notifikasi.ts`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `@opencode-ai/plugin` to the rest of the system?**
  _1610 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `actions/shift.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055364314400458976 - nodes in this community are weakly interconnected._
- **Should `page-loader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `src/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._