# Graph Report - pringmoni  (2026-10-22)

## Corpus Check
- 232 files · ~301,963 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1615 nodes · 3408 edges · 115 communities (89 shown, 15 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c7bfa88d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- StaleNotificationBell.tsx
- @prisma/client
- actions/shift.ts
- PageLoader
- compilerOptions
- MenuPage
- src/types/index.ts
- LaporanClient.tsx
- types/index.ts
- components.json
- 2. MVP (Minimum Viable Product)
- cart-sheet.tsx
- menu/page.tsx
- dashboard/pesanan/page.tsx
- dashboard.ts
- 20260408053831_init_all_schema/migration.sql
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- auth
- OWASP Top 10 Focus Areas
- GrafikPeakHours.tsx
- optionalDependencies
- Card
- upload.ts
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- resep-menu-dialog.tsx
- pesanan.ts
- overrides
- prisma
- package.json
- print-struk.ts
- scripts
- [tokenMeja]/page.tsx
- lucide-react
- meja/page.tsx
- components/BankIcon.tsx
- GrafikMenu.tsx
- PieKategori.tsx
- 20260327055635_init/migration.sql
- security-scan.ts
- users/page.tsx
- Button
- DashboardCharts.tsx
- README.md
- notifications.ts
- parallel-guard.ts
- verification.ts
- category-icon.tsx
- stok-bahan/page.tsx
- dependencies
- eslint.config.mjs
- login.ts
- forgot-password.ts
- ClockDisplay.tsx
- next
- PerbandinganCard.tsx
- 20261017000001_add_jadwal_shift_dan_kas_keluar/migration.sql
- 20260930000001_add_shift_kasir/migration.sql
- "pesanan"
- postcss.config.mjs
- { GET, POST }
- vitest
- Refactorer Agent
- Test Architect Agent
- Orchestrator Agent (Single-Worker Mode)
- Design System - Pringmoni (UI & Visual Design)
- Code Reviewer Agent
- 3. Product Backlog (PBI)
- kasir/page.tsx
- Pringmoni - Resto POS & Monitoring
- Documentation Types
- OWASP Top 10 Analysis
- PBIs (Product Backlog Items)
- Security Best Practices
- Backend Developer Agent
- Phase 2: Multi-Perspective Analysis
- ARCHITECTURE - Pringmoni
- Code Style
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
- proxy.ts
- cn

## God Nodes (most connected - your core abstractions)
1. `auth` - 99 edges
2. `cn()` - 79 edges
3. `react` - 52 edges
4. `Button()` - 50 edges
5. `MenuPage()` - 49 edges
6. `lucide-react` - 43 edges
7. `StokBahanPage()` - 39 edges
8. `createLog()` - 38 edges
9. `MejaPage()` - 34 edges
10. `ResepMenuDialog()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `8. Optimasi delay >5 detik` --references--> `getDashboardStats()`  [INFERRED]
  .opencode/PROGRESS.md → src/app/actions/dashboard.ts
- `8. Optimasi delay >5 detik` --references--> `getPesananBelumBayar()`  [INFERRED]
  .opencode/PROGRESS.md → src/app/actions/kasir.ts
- `6. Komponen (shadcn/ui)` --references--> `Button()`  [INFERRED]
  .opencode/DESIGN.md → src/components/ui/button.tsx
- `6. Komponen (shadcn/ui)` --references--> `Dialog()`  [INFERRED]
  .opencode/DESIGN.md → src/components/ui/dialog.tsx
- `6. Komponen (shadcn/ui)` --references--> `Select()`  [INFERRED]
  .opencode/DESIGN.md → src/components/ui/select.tsx

## Import Cycles
- None detected.

## Communities (115 total, 15 thin omitted)

### Community 0 - "StaleNotificationBell.tsx"
Cohesion: 0.13
Nodes (19): pusher-js, getPaidOrdersForNotification(), getPesananBelumBayar(), NotifikasiPesananTerlambat, KasirLayout(), DashboardRealtimeRefresh(), KasirOrderNotifications(), NotifOrder (+11 more)

### Community 1 - "@prisma/client"
Cohesion: 0.12
Nodes (19): main(), prisma, randomInt(), randomItem(), randomTime(), main(), prisma, randomInt() (+11 more)

### Community 2 - "actions/shift.ts"
Cohesion: 0.07
Nodes (65): ambilShiftRow(), autoCloseShifts(), bukaShift(), getDaftarKasir(), getJadwalShift(), getKasKeluarAktif(), getRiwayatShift(), getShiftAktif() (+57 more)

### Community 3 - "PageLoader"
Cohesion: 0.08
Nodes (28): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 8. Optimasi delay >5 detik (+20 more)

### Community 4 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 5 - "MenuPage"
Cohesion: 0.06
Nodes (47): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+39 more)

### Community 6 - "src/types/index.ts"
Cohesion: 0.06
Nodes (31): AnalisisTambahan, CreateStokBahanInput, CreateUserInput, DashboardStats, DetailPesananItem, JenisPerubahanStok, KategoriBahan, KategoriMenu (+23 more)

### Community 7 - "LaporanClient.tsx"
Cohesion: 0.12
Nodes (18): LaporanPage(), currentYear, dateToWeekStr(), getWeekRange(), LaporanClient(), LaporanKasirItem, loadingState, TabBanding() (+10 more)

### Community 8 - "types/index.ts"
Cohesion: 0.08
Nodes (24): CustomerMenu, DashboardStats, DetailPesananItem, GrafikPoint, ItemLaporanPesanan, KategoriMenu, LaporanKasir, LaporanMenuTerlaris (+16 more)

### Community 9 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "2. MVP (Minimum Viable Product)"
Cohesion: 0.10
Nodes (20): 1. Tujuan Proyek, 2. MVP (Minimum Viable Product), 3. Fitur Lengkap, 4. DOD (Definition of Done) & Kendala, 5. Plan Next Semester, Admin Dashboard, Customer-Facing, Dokumentasi (+12 more)

### Community 11 - "cart-sheet.tsx"
Cohesion: 0.18
Nodes (15): @radix-ui/react-dialog, CartSheet(), CartSheetProps, getItemKey(), sampleVouchers, Voucher, src_components_ui_sheet_sheet, SheetContent (+7 more)

### Community 12 - "menu/page.tsx"
Cohesion: 0.17
Nodes (22): MenuWithKategori, DetailPesananPage(), ActionResult, KategoriMenu, statusColors, statusLabels, StatusMenu, Menu (+14 more)

### Community 13 - "dashboard/pesanan/page.tsx"
Cohesion: 0.15
Nodes (26): getPesananById(), getPesananForDashboard(), aksiColors, aksiKategori, aksiLabels, JenisAksi, PesananDetailPage(), statusBayarColors (+18 more)

### Community 14 - "dashboard.ts"
Cohesion: 0.14
Nodes (18): pusher, autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), getPaidStaleWarnings(), getStaleOrders(), PaidStaleOrder (+10 more)

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.16
Nodes (19): "detail_pesanan", "kategori_menu", kategori_menu_nama_kategori_key, "logs", "meja", meja_nomor_meja_key, meja_token_meja_key, "menu" (+11 more)

### Community 16 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, @testing-library/jest-dom (+12 more)

### Community 18 - "laporan.ts"
Cohesion: 0.28
Nodes (16): A. Optimasi laporan (belum dikerjakan), 🔜 Langkah Besok, getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir() (+8 more)

### Community 19 - "auth"
Cohesion: 0.11
Nodes (22): bcryptjs, logoutAction(), clearLogs(), getLogCount(), getLogs(), getUniqueUsers(), LogItem, POST() (+14 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "GrafikPeakHours.tsx"
Cohesion: 0.20
Nodes (7): amberGradient(), calcTicks(), GrafikPeakHours(), TooltipPayload, GrafikPendapatan(), TooltipPayload, GrafikPoint

### Community 22 - "optionalDependencies"
Cohesion: 0.67
Nodes (3): optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 23 - "Card"
Cohesion: 0.23
Nodes (19): 6. Komponen (shadcn/ui), resetPasswordConfirmAction(), initialState, LoginPage(), ForgotPasswordPage(), initialState, initialState, ResetPasswordPage() (+11 more)

### Community 24 - "upload.ts"
Cohesion: 0.50
Nodes (3): sharp, uuid, uploadMenuFoto()

### Community 25 - "app/layout.tsx"
Cohesion: 0.21
Nodes (10): next-auth, src_app_globals, geistMono, geistMonoHeading, geistSans, inter, metadata, RootLayout() (+2 more)

### Community 26 - "export-laporan.ts"
Cohesion: 0.26
Nodes (12): exceljs, jspdf, centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport (+4 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "resep-menu-dialog.tsx"
Cohesion: 0.16
Nodes (15): getResepMenu(), hitungKelengkapanResep(), pesanResepTidakLengkap(), saveResepMenu(), StokBahanWithType, kategoriLabels, KategoriResep, newRow() (+7 more)

### Community 29 - "pesanan.ts"
Cohesion: 0.12
Nodes (32): konfirmasiPembayaran(), prosesPembayaranQRIS(), updatePesananMeja(), cancelExpiredOrders(), cancelPesanan(), createPesanan(), CreatePesananData, CreatePesananItem (+24 more)

### Community 32 - "package.json"
Cohesion: 0.06
Nodes (34): name, private, version, babel-plugin-react-compiler, cloudinary, clsx, lightningcss-win32-x64-msvc, pg (+26 more)

### Community 33 - "print-struk.ts"
Cohesion: 0.18
Nodes (15): ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee(), centerText(), formatRupiah(), nomorPesanan() (+7 more)

### Community 34 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, seed-2025, seed-resep, seed-resep:dry, start

### Community 35 - "[tokenMeja]/page.tsx"
Cohesion: 0.16
Nodes (16): jsqr, getStatusPesananAktifMeja(), CheckoutData, CheckoutPage(), CreatePesananResult, metodeOptions, CustomerMenuPage(), Menu (+8 more)

### Community 36 - "lucide-react"
Cohesion: 0.17
Nodes (15): lucide-react, DashboardLayout(), jamLabel(), rupiah(), ShiftSidebarStatus(), DashboardClient(), DashboardClientProps, SidebarMobile() (+7 more)

### Community 37 - "meja/page.tsx"
Cohesion: 0.13
Nodes (25): @hugeicons/core-free-icons, @hugeicons/react, createMeja(), deleteMeja(), generateNomorMeja(), getMeja(), getNextNomorMeja(), kosongkanMeja() (+17 more)

### Community 39 - "GrafikMenu.tsx"
Cohesion: 0.17
Nodes (9): recharts, COLORS, GrafikMenu(), TooltipPayload, COLORS, formatRupiah(), PieMetode(), PieMetodeProps (+1 more)

### Community 40 - "PieKategori.tsx"
Cohesion: 0.33
Nodes (4): CATEGORY_COLORS, PieKategori(), PieTooltipPayload, KategoriAnalisis

### Community 41 - "20260327055635_init/migration.sql"
Cohesion: 0.83
Nodes (3): "User", User_email_key, User_username_key

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "users/page.tsx"
Cohesion: 0.23
Nodes (14): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+6 more)

### Community 44 - "Button"
Cohesion: 0.21
Nodes (14): getCustomerPaymentStatus(), getPesananForCheckout(), getDaftarMenuResep(), hapusResepBahan(), PembayaranMetodePage(), ResepPage(), ResepClient(), handleRemove() (+6 more)

### Community 45 - "DashboardCharts.tsx"
Cohesion: 0.21
Nodes (12): ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah(), MejaData (+4 more)

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "stok-bahan/page.tsx"
Cohesion: 0.11
Nodes (35): createStokBahan(), deleteStokBahan(), getBahanDapurList(), getRiwayatStok(), getStokBahanList(), hitungStatus(), KelengkapanResep, kosong (+27 more)

### Community 54 - "dependencies"
Cohesion: 0.05
Nodes (37): dependencies, bcryptjs, class-variance-authority, cloudinary, clsx, exceljs, @hugeicons/core-free-icons, @hugeicons/react (+29 more)

### Community 57 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 64 - "login.ts"
Cohesion: 0.47
Nodes (7): loginAction(), signIn, checkRateLimit(), getKey(), RateLimitEntry, recordFailedAttempt(), resetRateLimit()

### Community 65 - "forgot-password.ts"
Cohesion: 0.38
Nodes (5): ref_crypto, nodemailer, forgotPasswordAction(), sendResetPasswordEmail(), transporter

### Community 66 - "ClockDisplay.tsx"
Cohesion: 0.60
Nodes (5): ClockDisplay(), getServerSnapshot(), getSnapshot(), pad(), subscribe()

### Community 67 - "next"
Cohesion: 0.15
Nodes (5): nextConfig, next, metodeConfig, PesananData, StatusPesanan

### Community 70 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

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
Cohesion: 0.08
Nodes (23): 1. Product Overview, 2. Core Features, 3. Product Backlog (PBI), 4. Definition of Done, 5. Future Plans, Customer Self-Order, Dashboard Admin, Fitur Baru (+15 more)

### Community 121 - "kasir/page.tsx"
Cohesion: 0.07
Nodes (30): accPesanan(), batalkanPesananKasir(), confirmQrisPayment(), generateQRISCode(), getPembayaranInfo(), getPesananRiwayatKasir(), KasirPesananItem, prosesPembayaranTunai() (+22 more)

### Community 122 - "Pringmoni - Resto POS & Monitoring"
Cohesion: 0.11
Nodes (17): Available Agents, Available Commands (/), Available Skills, Branch Terlindungi (JANGAN DIHAPUS), Folder Structure, graphify, Kompatibilitas Shell (PowerShell & Git Bash), Pembatasan Kerja (+9 more)

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
Cohesion: 0.14
Nodes (13): 1. Architecture Overview, 2. Database Schema, 3. Route Structure, 4. Server Actions, 5. Auth Flow, 6. Real-time Flow, 7. Payment Flow, 8. Stock & Availability Flow (+5 more)

### Community 132 - "Code Style"
Cohesion: 0.18
Nodes (10): Code Conventions - Pringmoni, Code Style, Commit Convention, File Naming, Folder Structure, Prisma, React, Server Actions (+2 more)

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

### Community 154 - "proxy.ts"
Cohesion: 0.27
Nodes (9): ALL_ROLES, config, getRouteRole(), isPublicRoute(), isRoleUser(), proxy(), PUBLIC_ROUTES, RESERVED_ROOT_SEGMENTS (+1 more)

### Community 158 - "cn"
Cohesion: 0.09
Nodes (29): class-variance-authority, radix-ui, react, satuanLabels, TransferDapurDialogProps, CardAction(), CardFooter(), Checkbox() (+21 more)

## Knowledge Gaps
- **713 isolated node(s):** `Tech Architecture`, `Models`, `Enums (stok & resep)`, `Enums (voucher)`, `3. Route Structure` (+708 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 835 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `cn` to `StaleNotificationBell.tsx`, `actions/shift.ts`, `LaporanClient.tsx`, `cart-sheet.tsx`, `menu/page.tsx`, `dashboard/pesanan/page.tsx`, `Card`, `resep-menu-dialog.tsx`, `pesanan.ts`, `package.json`, `[tokenMeja]/page.tsx`, `lucide-react`, `meja/page.tsx`, `users/page.tsx`, `Button`, `category-icon.tsx`, `stok-bahan/page.tsx`, `ClockDisplay.tsx`, `next`, `kasir/page.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `StaleNotificationBell.tsx`, `actions/shift.ts`, `src/types/index.ts`, `LaporanClient.tsx`, `cart-sheet.tsx`, `menu/page.tsx`, `dashboard/pesanan/page.tsx`, `dashboard.ts`, `auth`, `GrafikPeakHours.tsx`, `Card`, `resep-menu-dialog.tsx`, `cn`, `package.json`, `[tokenMeja]/page.tsx`, `meja/page.tsx`, `GrafikMenu.tsx`, `PieKategori.tsx`, `users/page.tsx`, `Button`, `DashboardCharts.tsx`, `stok-bahan/page.tsx`, `next`, `PerbandinganCard.tsx`, `kasir/page.tsx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `auth` connect `auth` to `StaleNotificationBell.tsx`, `actions/shift.ts`, `lucide-react`, `meja/page.tsx`, `MenuPage`, `users/page.tsx`, `Button`, `dashboard/pesanan/page.tsx`, `dashboard.ts`, `laporan.ts`, `stok-bahan/page.tsx`, `upload.ts`, `kasir/page.tsx`, `proxy.ts`, `pesanan.ts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `Tech Architecture`, `Models`, `Enums (stok & resep)` to the rest of the system?**
  _713 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StaleNotificationBell.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12681159420289856 - nodes in this community are weakly interconnected._
- **Should `@prisma/client` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `actions/shift.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06542443064182195 - nodes in this community are weakly interconnected._