# Graph Report - pringmoni  (2026-11-05)

## Corpus Check
- 249 files · ~314,619 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .toml 4, (none) 2, .css 2)

## Summary
- 2751 nodes · 5121 edges · 123 communities (93 shown, 30 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dd6305e9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- fixtures.ts
- actions/shift.ts
- page-loader.tsx
- compilerOptions
- kasir.ts
- src/types/index.ts
- LaporanClient.tsx
- types/index.ts
- components.json
- 2. MVP (Minimum Viable Product)
- -
- Button
- dashboard.ts
- Badge
- 20260408053831_init_all_schema/migration.sql
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- login.ts
- OWASP Top 10 Focus Areas
- [tokenMeja]/page.tsx
- auth.ts
- DashboardCharts.tsx
- Input
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- menu.ts
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
- kasir/page.tsx
- 20260327055635_init/migration.sql
- security-scan.ts
- prisma.ts
- auth.ts
- meja/page.tsx
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
- @prisma/client
- PieKategori.tsx
- users.ts
- print-struk.ts
- overrides
- prisma
- postcss.config.mjs
- { GET, POST }
- Refactorer Agent
- Test Architect Agent
- Orchestrator Agent (Single-Worker Mode)
- Design System - Pringmoni (UI & Visual Design)
- Code Reviewer Agent
- 3. Product Backlog (PBI)
- Pringmoni - Resto POS & Monitoring
- Documentation Types
- OWASP Top 10 Analysis
- PBIs (Product Backlog Items)
- Security Best Practices
- Backend Developer Agent
- Phase 2: Multi-Perspective Analysis
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

## God Nodes (most connected - your core abstractions)
1. `-` - 882 edges
2. `auth` - 105 edges
3. `cn()` - 81 edges
4. `Button()` - 65 edges
5. `react` - 57 edges
6. `MenuManagement()` - 57 edges
7. `next` - 49 edges
8. `createLog()` - 48 edges
9. `lucide-react` - 46 edges
10. `KasirPage()` - 46 edges

## Surprising Connections (you probably didn't know these)
- `Modul 7: Reservasi & Operasional Meja` --references--> `getNotifikasiTerlambat()`  [INFERRED]
  .opencode/PRD.md → src/app/actions/notifikasi.ts
- `✅ SELESAI` --references--> `CleanupRegistry`  [INFERRED]
  .opencode/PROGRESS.md → tests/e2e/fixtures.ts
- `8. Optimasi delay >5 detik` --references--> `getDashboardStats()`  [INFERRED]
  .opencode/PROGRESS.md → src/app/actions/dashboard.ts
- `8. Optimasi delay >5 detik` --references--> `getPesananBelumBayar()`  [INFERRED]
  .opencode/PROGRESS.md → src/app/actions/kasir.ts
- `Priority Test` --references--> `createMenu()`  [INFERRED]
  .opencode/agent/tester.md → src/app/actions/menu.ts

## Import Cycles
- None detected.

## Communities (123 total, 30 thin omitted)

### Community 1 - "fixtures.ts"
Cohesion: 0.06
Nodes (42): 1. Tujuan, 2. Strategi Isolasi Database (KEPUTUSAN), 3. Aturan Penulisan Test, 4. Perintah, 5. Peta Modul & Status, 6. Rencana Bertahap (Staged Implementation), 7. Data Test & Cleanup, 8. Catatan Operasional (+34 more)

### Community 2 - "actions/shift.ts"
Cohesion: 0.07
Nodes (65): 4.1 Shift Kasir & Serah Terima Kas, 4. Server Actions, ambilShiftRow(), autoCloseShifts(), bukaShift(), getDaftarKasir(), getDaftarKasirLengkap(), getJadwalShift() (+57 more)

### Community 3 - "page-loader.tsx"
Cohesion: 0.08
Nodes (27): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 8. Optimasi delay >5 detik (+19 more)

### Community 4 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 5 - "kasir.ts"
Cohesion: 0.17
Nodes (16): accPesanan(), confirmQrisPayment(), generateQRISCode(), getPembayaranInfo(), getPesananRiwayatKasir(), KasirPesananItem, konfirmasiPembayaran(), prosesPembayaranQRIS() (+8 more)

### Community 6 - "src/types/index.ts"
Cohesion: 0.05
Nodes (36): 8. Stock & Availability Flow, AnalisisTambahan, BandingData, CreateStokBahanInput, CreateUserInput, DashboardStats, DetailPesananItem, JenisPerubahanStok (+28 more)

### Community 7 - "LaporanClient.tsx"
Cohesion: 0.22
Nodes (22): LaporanPage(), AnalisisCard(), currentYear, dateToWeekStr(), FilterPeriode(), getWeekRange(), LaporanClient(), LaporanKasirItem (+14 more)

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

### Community 12 - "Button"
Cohesion: 0.17
Nodes (33): class-variance-authority, lucide-react, getPesananByTokenAndId(), DetailPesananPage(), metodeConfig, PesananData, StatusPesanan, PembayaranInfo (+25 more)

### Community 13 - "dashboard.ts"
Cohesion: 0.13
Nodes (14): nextConfig, Modul 8: Notifikasi, QR & Backup, next, autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), getStaleOrders() (+6 more)

### Community 14 - "Badge"
Cohesion: 0.31
Nodes (8): getCustomerPaymentStatus(), getPesananForCheckout(), PembayaranMetodePage(), RefundStatusBadge(), Badge(), badgeVariants, VarianBadge(), VarianBadgeProps

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.08
Nodes (35): "detail_pesanan", "kategori_menu", kategori_menu_nama_kategori_key, "logs", "meja", meja_nomor_meja_key, meja_token_meja_key, "menu" (+27 more)

### Community 16 - "devDependencies"
Cohesion: 0.09
Nodes (23): devDependencies, agentation, agentation-mcp, babel-plugin-react-compiler, eslint, eslint-config-next, @playwright/test, prisma (+15 more)

### Community 18 - "laporan.ts"
Cohesion: 0.28
Nodes (16): A. Optimasi laporan (belum dikerjakan), 🔜 Langkah Besok, getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir() (+8 more)

### Community 19 - "login.ts"
Cohesion: 0.05
Nodes (46): 1. Architecture Overview, 2. Database Schema, 3. Route Structure, 5.1 Ambil alih sesi (takeover antar perangkat), 5. Auth Flow, 6. Real-time Flow, 7. Payment Flow, ARCHITECTURE - Pringmoni (+38 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "[tokenMeja]/page.tsx"
Cohesion: 0.06
Nodes (57): jsqr, @radix-ui/react-dialog, getActivePesananByToken(), getCustomerMenuData, getMejaByToken(), getMejaTersediaPindah(), getMenusForCustomer(), getStatusPesananAktifMeja() (+49 more)

### Community 22 - "auth.ts"
Cohesion: 0.29
Nodes (7): StatGridProps, CustomUser, handlers, next-auth, Session, User, RoleUser

### Community 23 - "DashboardCharts.tsx"
Cohesion: 0.21
Nodes (12): ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah(), MejaData (+4 more)

### Community 24 - "Input"
Cohesion: 0.24
Nodes (18): 6. Komponen (shadcn/ui), initialState, LoginPage(), ForgotPasswordPage(), initialState, initialState, ResetPasswordPage(), CafeSpotlight() (+10 more)

### Community 25 - "app/layout.tsx"
Cohesion: 0.17
Nodes (13): agentation, geistMono, geistMonoHeading, geistSans, inter, metadata, RootLayout(), Providers() (+5 more)

### Community 26 - "export-laporan.ts"
Cohesion: 0.27
Nodes (11): exceljs, jspdf, centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport (+3 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "menu.ts"
Cohesion: 0.06
Nodes (51): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+43 more)

### Community 29 - "notifikasi.ts"
Cohesion: 0.21
Nodes (13): getPaidStaleWarnings(), PaidStaleOrder, awalHari(), getNotifikasiDashboard(), getNotifikasiTerlambat(), KIND_PER_ROLE, klasifikasiPesanan(), NotifikasiPesananTerlambat (+5 more)

### Community 30 - "stok-bahan/page.tsx"
Cohesion: 0.18
Nodes (11): StokBahanWithType, BahanLogo(), BahanLogoConfig, emptyForm, getBahanLogoConfig(), jenisPerubahanLabels, kategoriLabels, satuanLabels (+3 more)

### Community 31 - "StaleNotificationBell.tsx"
Cohesion: 0.07
Nodes (38): NotifikasiItem, NotifikasiKind, DashboardLayout(), jamLabel(), rupiah(), ShiftSidebarStatus(), ClockDisplay(), getServerSnapshot() (+30 more)

### Community 32 - "package.json"
Cohesion: 0.05
Nodes (39): name, private, version, agentation-mcp, babel-plugin-react-compiler, cloudinary, clsx, cn (+31 more)

### Community 33 - "PieMetode.tsx"
Cohesion: 0.38
Nodes (6): COLORS, formatRupiah(), PieMetode(), PieMetodeProps, PieTooltip(), PieTooltipPayload

### Community 34 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, dev, graph:update, lint, seed-2025, seed-menu, seed-resep (+10 more)

### Community 35 - "scripts.js"
Cohesion: 0.32
Nodes (14): addSimReplay(), advanceSimOnSlide(), beginSimStream(), beginSimThink(), escapeHtml(), finishSim(), go(), initSims() (+6 more)

### Community 36 - "cn"
Cohesion: 0.10
Nodes (32): @hugeicons/core-free-icons, @hugeicons/react, radix-ui, MenuWithKategori, MenuPage(), ActionResult, CATEGORY_ICON_MAP, CATEGORY_ICON_OPTIONS (+24 more)

### Community 37 - "kasir/page.tsx"
Cohesion: 0.12
Nodes (38): next-auth, react, getPesananById(), aksiColors, aksiKategori, aksiLabels, JenisAksi, LoggingPage() (+30 more)

### Community 39 - "GrafikPeakHours.tsx"
Cohesion: 0.26
Nodes (9): recharts, amberGradient(), calcTicks(), CustomTooltip(), GrafikPeakHours(), TooltipPayload, CustomTooltip(), TooltipPayload (+1 more)

### Community 40 - "kasir/page.tsx"
Cohesion: 0.07
Nodes (25): KasirPage(), getGrandTotal(), handleBayarTunaiStep(), handleMethodWarningProceed(), metodeColors, metodeIcons, metodeLabels, Pesanan (+17 more)

### Community 41 - "20260327055635_init/migration.sql"
Cohesion: 0.83
Nodes (3): "User", User_email_key, User_username_key

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "prisma.ts"
Cohesion: 0.14
Nodes (11): createMeja(), generateNomorMeja(), getNextNomorMeja(), kosongkanMeja(), MejaResult, updateMeja(), handleKosongkanConfirm(), globalForPrisma (+3 more)

### Community 44 - "auth.ts"
Cohesion: 0.18
Nodes (12): clearLogs(), getLogCount(), getLogs(), getUniqueUsers(), LogItem, getPesananForDashboard(), uploadMenuFoto(), POST() (+4 more)

### Community 45 - "meja/page.tsx"
Cohesion: 0.11
Nodes (15): qrcode.react, deleteMeja(), getMeja(), CartItem, PesananBaruPage(), MejaPage(), handleDeleteConfirm(), statusColors (+7 more)

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "pesanan.ts"
Cohesion: 0.19
Nodes (15): batalkanPesananKasir(), cancelPesanan(), createPesanan(), CreatePesananData, CreatePesananItem, konfirmasiPembayaranCustomer(), markItemDiantar(), markPesananSelesai() (+7 more)

### Community 54 - "dependencies"
Cohesion: 0.05
Nodes (38): dependencies, bcryptjs, class-variance-authority, cloudinary, clsx, cn, exceljs, @hugeicons/core-free-icons (+30 more)

### Community 57 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 64 - "stok-bahan.ts"
Cohesion: 0.10
Nodes (30): ⏳ BELUM / CATATAN, ⏳ BELUM / CATATAN, ⏳ BELUM / MENUNGGU KEPUTUSAN, PROGRESS - Sesi 2026-11-04, PROGRESS - Sesi 2026-11-04 (Blackbox E2E), PROGRESS - Sesi 2026-11-05 (Verifikasi Blackbox Modul 1.4 & 1.5), 🧹 Rampingkan graphify (2026-11-04), ✅ SELESAI (+22 more)

### Community 65 - "prisma.ts"
Cohesion: 0.14
Nodes (14): bcryptjs, nodemailer, forgotPasswordAction(), selesaikanPesananKasir(), logoutAction(), cancelExpiredOrders(), resetPasswordConfirmAction(), tambahKasKeluar() (+6 more)

### Community 66 - "Playwright Blackbox Testing - Pringmoni"
Cohesion: 0.29
Nodes (6): Aturan Penting, Capture, Playwright Blackbox Testing - Pringmoni, Setup, Strategi Data, Struktur

### Community 67 - "useOrdersRealtime"
Cohesion: 0.25
Nodes (9): getPaidOrdersForNotification(), getPesananBelumBayar(), KasirLayout(), KasirOrderNotifications(), NotifOrder, PaidOrder, soundedConfirmedOrders, soundedPaidOrders (+1 more)

### Community 69 - "seed-menu.ts"
Cohesion: 0.07
Nodes (26): main(), prisma, randomInt(), randomItem(), randomTime(), main(), prisma, randomInt() (+18 more)

### Community 70 - "optionalDependencies"
Cohesion: 0.67
Nodes (3): optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 71 - "GrafikMenu.tsx"
Cohesion: 0.47
Nodes (5): COLORS, CustomTooltip(), GrafikMenu(), TooltipPayload, MenuTerlaris

### Community 72 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 73 - "@prisma/client"
Cohesion: 0.20
Nodes (9): @prisma/client, ajukanRefund(), deleteRefundBukti(), getRefundInfo(), RefundBuktiInput, RefundInfo, requireKasir(), p (+1 more)

### Community 75 - "PieKategori.tsx"
Cohesion: 0.40
Nodes (5): CATEGORY_COLORS, PieKategori(), PieTooltip(), PieTooltipPayload, KategoriAnalisis

### Community 76 - "users.ts"
Cohesion: 0.33
Nodes (11): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+3 more)

### Community 77 - "print-struk.ts"
Cohesion: 0.18
Nodes (15): ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee(), centerText(), formatRupiah(), nomorPesanan() (+7 more)

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
Nodes (17): 1. Brand & Identity, 2. Color Palette, 3. Typography, 4. Spacing, Radius & Layout, 5. Dark Mode, 7. Aturan Penggunaan Warna (Praktik), Aturan Penggunaan, Design System - Pringmoni (UI & Visual Design) (+9 more)

### Community 119 - "Code Reviewer Agent"
Cohesion: 0.11
Nodes (17): 1. Code Quality, 2. Security (Surface Level), 3. Performance (Surface Level), 4. Maintainability, 5. Consistency, Anti-Patterns to Flag, Code Reviewer Agent, Core Philosophy (+9 more)

### Community 120 - "3. Product Backlog (PBI)"
Cohesion: 0.09
Nodes (22): 1. Product Overview, 2. Core Features, 3. Product Backlog (PBI), 4. Definition of Done, 5. Future Plans, Customer Self-Order, Dashboard Admin, Fitur Baru (+14 more)

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
Nodes (3): dependencies, @opencode-ai/plugin, @opencode-ai/plugin

## Knowledge Gaps
- **31 isolated node(s):** `@opencode-ai/plugin`, `@prisma/adapter-pg`, `@react-pdf/renderer`, `cloudinary`, `pg` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1776 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@prisma/client` connect `@prisma/client` to `package.json`, `stok-bahan.ts`, `fixtures.ts`, `kasir.ts`, `seed-menu.ts`, `kasir/page.tsx`, `prisma.ts`, `auth.ts`, `users.ts`, `meja/page.tsx`, `laporan.ts`, `pesanan.ts`, `[tokenMeja]/page.tsx`, `menu.ts`, `notifikasi.ts`, `stok-bahan/page.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `@opencode-ai/plugin`, `@prisma/adapter-pg`, `@react-pdf/renderer` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `fixtures.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06286748077792854 - nodes in this community are weakly interconnected._
- **Why does `next` connect `dashboard.ts` to `actions/shift.ts`, `kasir.ts`, `LaporanClient.tsx`, `Button`, `Badge`, `login.ts`, `[tokenMeja]/page.tsx`, `Input`, `app/layout.tsx`, `menu.ts`, `StaleNotificationBell.tsx`, `package.json`, `kasir/page.tsx`, `kasir/page.tsx`, `prisma.ts`, `auth.ts`, `meja/page.tsx`, `pesanan.ts`, `stok-bahan.ts`, `prisma.ts`, `useOrdersRealtime`, `@prisma/client`, `users.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `actions/shift.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06947996589940324 - nodes in this community are weakly interconnected._
- **Should `page-loader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08097165991902834 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._