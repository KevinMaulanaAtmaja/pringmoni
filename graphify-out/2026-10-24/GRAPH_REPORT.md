# Graph Report - pringmoni  (2026-10-24)

## Corpus Check
- 238 files · ~306,431 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1660 nodes · 3185 edges · 168 communities (92 shown, 60 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fc88656a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- seed-2025.ts
- actions/shift.ts
- PageLoader
- compilerOptions
- uploadthing.ts
- src/types/index.ts
- LaporanClient.tsx
- types/index.ts
- components.json
- 2. MVP (Minimum Viable Product)
- cart-sheet.tsx
- Button
- dashboard.ts
- resep-menu-dialog.tsx
- 20260408053831_init_all_schema/migration.sql
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- login.ts
- OWASP Top 10 Focus Areas
- DashboardClient.tsx
- [tokenMeja]/page.tsx
- pembayaran/[metode]/page.tsx
- GrafikPeakHours.tsx
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- menu/page.tsx
- tabs.tsx
- GrafikMenu.tsx
- sesi.ts
- package.json
- dashboard/pesanan/page.tsx
- scripts
- proxy.ts
- pesanan.ts
- pesanan-baru/page.tsx
- components/BankIcon.tsx
- PieMetode.tsx
- class-variance-authority
- 20260327055635_init/migration.sql
- security-scan.ts
- createLog
- auth.ts
- stok-bahan/page.tsx
- README.md
- notifications.ts
- parallel-guard.ts
- verification.ts
- category-icon.tsx
- meja/page.tsx
- dependencies
- eslint.config.mjs
- stok-bahan.ts
- log.ts
- cloudinary
- dashboard/layout.tsx
- "users"
- PerbandinganCard.tsx
- 20261017000001_add_jadwal_shift_dan_kas_keluar/migration.sql
- 20260930000001_add_shift_kasir/migration.sql
- "pesanan"
- Tester Agent
- Card
- users.ts
- KasirPage
- cn
- prisma.ts
- exceljs
- ref_path
- @hugeicons/react
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
- radix-ui
- @radix-ui/react-dialog
- react-dom
- @react-pdf/renderer
- recharts
- postcss.config.mjs
- sharp
- tailwind-merge
- tw-animate-css
- @uploadthing/react
- xlsx
- zod
- optionalDependencies
- prisma
- { GET, POST }
- babel-plugin-react-compiler
- Refactorer Agent
- Test Architect Agent
- Orchestrator Agent (Single-Worker Mode)
- Design System - Pringmoni (UI & Visual Design)
- Code Reviewer Agent
- 3. Product Backlog (PBI)
- eslint
- Pringmoni - Resto POS & Monitoring
- Documentation Types
- OWASP Top 10 Analysis
- eslint-config-next
- PBIs (Product Backlog Items)
- Security Best Practices
- Backend Developer Agent
- Phase 2: Multi-Perspective Analysis
- @hugeicons/core-free-icons
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
- next-auth
- pg
- react
- shadcn
- cn
- @tailwindcss/postcss
- @testing-library/jest-dom
- @testing-library/react
- tsx
- @types/node
- @types/nodemailer
- @types/react
- @types/react-dom
- typescript

## God Nodes (most connected - your core abstractions)
1. `cn()` - 79 edges
2. `Button()` - 49 edges
3. `MenuPage()` - 49 edges
4. `StokBahanPage()` - 39 edges
5. `createLog()` - 37 edges
6. `ResepMenuDialog()` - 34 edges
7. `MejaPage()` - 34 edges
8. `Input()` - 32 edges
9. `Card()` - 32 edges
10. `UsersPage()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Priority Test` --references--> `createMenu()`  [INFERRED]
  .opencode/agent/tester.md → src/app/actions/menu.ts
- `6. Komponen (shadcn/ui)` --references--> `Input()`  [INFERRED]
  .opencode/DESIGN.md → src/components/ui/input.tsx
- `6. Komponen (shadcn/ui)` --references--> `cn()`  [INFERRED]
  .opencode/DESIGN.md → src/lib/utils.ts
- `3. Delay navigasi halaman (loading.tsx)` --references--> `PageLoader()`  [INFERRED]
  .opencode/PROGRESS.md → src/components/ui/page-loader.tsx
- `6. Komponen (shadcn/ui)` --references--> `Select()`  [INFERRED]
  .opencode/DESIGN.md → src/components/ui/select.tsx

## Import Cycles
- None detected.

## Communities (168 total, 60 thin omitted)

### Community 1 - "seed-2025.ts"
Cohesion: 0.11
Nodes (18): main(), prisma, randomInt(), randomItem(), randomTime(), main(), prisma, randomInt() (+10 more)

### Community 2 - "actions/shift.ts"
Cohesion: 0.06
Nodes (66): ambilShiftRow(), autoCloseShifts(), bukaShift(), getDaftarKasir(), getJadwalShift(), getRiwayatShift(), getShiftAktif(), hapusJadwalShift() (+58 more)

### Community 3 - "PageLoader"
Cohesion: 0.08
Nodes (27): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 9. Animasi loading di loading state lokal (+19 more)

### Community 4 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 5 - "uploadthing.ts"
Cohesion: 0.33
Nodes (5): GET, POST, f, OurFileRouter, utapi

### Community 6 - "src/types/index.ts"
Cohesion: 0.05
Nodes (36): AnalisisTambahan, CreateStokBahanInput, CreateUserInput, CustomerMenu, DashboardStats, DetailPesananItem, JadwalShift, JenisPerubahanStok (+28 more)

### Community 7 - "LaporanClient.tsx"
Cohesion: 0.10
Nodes (19): currentYear, dateToWeekStr(), getWeekRange(), LaporanKasirItem, loadingState, TabBanding(), TabBulanan(), TabHarian() (+11 more)

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
Cohesion: 0.19
Nodes (14): CartSheet(), CartSheetProps, getItemKey(), sampleVouchers, Voucher, src_components_ui_sheet_sheet, SheetContent, SheetContentProps (+6 more)

### Community 12 - "Button"
Cohesion: 0.13
Nodes (35): 6. Komponen (shadcn/ui), initialState, DetailPesananPage(), metodeConfig, PesananData, StatusPesanan, metodeColors, metodeIcons (+27 more)

### Community 13 - "dashboard.ts"
Cohesion: 0.05
Nodes (55): 8. Optimasi delay >5 detik, autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), getStaleOrders(), PaidStaleOrder, StaleOrder (+47 more)

### Community 14 - "resep-menu-dialog.tsx"
Cohesion: 0.16
Nodes (14): kategoriLabels, KategoriResep, newRow(), normalisasiKategori(), RESEP_KATEGORI, ResepMenuDialog(), ResepMenuDialogProps, ResepRow (+6 more)

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.16
Nodes (19): "detail_pesanan", "kategori_menu", kategori_menu_nama_kategori_key, "logs", "meja", meja_nomor_meja_key, meja_token_meja_key, "menu" (+11 more)

### Community 16 - "devDependencies"
Cohesion: 0.12
Nodes (17): agentation, agentation-mcp, devDependencies, agentation, agentation-mcp, tailwindcss, @testing-library/user-event, ts-node (+9 more)

### Community 18 - "laporan.ts"
Cohesion: 0.24
Nodes (18): A. Optimasi laporan (belum dikerjakan), 🔜 Langkah Besok, getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir() (+10 more)

### Community 19 - "login.ts"
Cohesion: 0.21
Nodes (13): HasilValidasi, loginAction(), LoginState, STATE_AWAL, validasiKredensial(), LoginPage(), checkRateLimit(), getKey() (+5 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "DashboardClient.tsx"
Cohesion: 0.33
Nodes (7): jamLabel(), rupiah(), ShiftSidebarStatus(), DashboardClientProps, SidebarMobile(), Sidebar(), SidebarProps

### Community 22 - "[tokenMeja]/page.tsx"
Cohesion: 0.23
Nodes (12): getStatusPesananAktifMeja(), CheckoutData, CheckoutPage(), CreatePesananResult, metodeOptions, CustomerMenuPage(), Menu, KeranjangItem (+4 more)

### Community 23 - "pembayaran/[metode]/page.tsx"
Cohesion: 0.24
Nodes (10): getPembayaranInfo(), getCustomerPaymentStatus(), getPesananForCheckout(), konfirmasiPembayaranCustomer(), PembayaranMetodePage(), PesananSelesaiPage(), loadData(), getQrisStaticUrl() (+2 more)

### Community 24 - "GrafikPeakHours.tsx"
Cohesion: 0.20
Nodes (7): amberGradient(), calcTicks(), GrafikPeakHours(), TooltipPayload, GrafikPendapatan(), TooltipPayload, GrafikPoint

### Community 25 - "app/layout.tsx"
Cohesion: 0.23
Nodes (9): src_app_globals, geistMono, geistMonoHeading, geistSans, inter, metadata, RootLayout(), Providers() (+1 more)

### Community 26 - "export-laporan.ts"
Cohesion: 0.33
Nodes (10): centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport, MonthPDFData, renderRingkasanPDF() (+2 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "menu/page.tsx"
Cohesion: 0.11
Nodes (32): createKategori(), createMenu(), CreateMenuInput, deleteKategori(), deleteMenu(), deleteAllMenuFotos(), deleteMenuFoto(), getMenuFotos() (+24 more)

### Community 29 - "tabs.tsx"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 30 - "GrafikMenu.tsx"
Cohesion: 0.40
Nodes (3): COLORS, GrafikMenu(), TooltipPayload

### Community 31 - "sesi.ts"
Cohesion: 0.24
Nodes (7): AMBANG_SESI_AKTIF_MS, ambilVersiSesi(), cacheVersi, catatAktivitasSesi(), catatVersiSesi(), COOKIE_PERANGKAT, terakhirCatatAktivitas

### Community 32 - "package.json"
Cohesion: 0.25
Nodes (7): name, overrides, effect, prisma, seed, private, version

### Community 33 - "dashboard/pesanan/page.tsx"
Cohesion: 0.21
Nodes (13): cancelPesanan(), getPesananById(), getPesananForDashboard(), markItemDiantar(), updateStatusPesanan(), PesananDetailPage(), statusBayarColors, statusColors (+5 more)

### Community 34 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, seed-2025, seed-menu, seed-resep, seed-resep:dry (+2 more)

### Community 35 - "proxy.ts"
Cohesion: 0.20
Nodes (13): ALL_ROLES, config, getRouteRole(), isPublicRoute(), isRoleUser(), proxy(), PUBLIC_ROUTES, RESERVED_ROOT_SEGMENTS (+5 more)

### Community 36 - "pesanan.ts"
Cohesion: 0.15
Nodes (20): cancelExpiredOrders(), createPesanan(), CreatePesananData, CreatePesananItem, getActivePesananByToken(), getCustomerMenuData, getMejaByToken(), getMejaTersediaPindah() (+12 more)

### Community 37 - "pesanan-baru/page.tsx"
Cohesion: 0.16
Nodes (11): createMeja(), generateNomorMeja(), getMeja(), getNextNomorMeja(), MejaResult, getMenus(), MenuWithKategori, CartItem (+3 more)

### Community 39 - "PieMetode.tsx"
Cohesion: 0.33
Nodes (5): COLORS, formatRupiah(), PieMetode(), PieMetodeProps, PieTooltipPayload

### Community 41 - "20260327055635_init/migration.sql"
Cohesion: 0.83
Nodes (3): "User", User_email_key, User_username_key

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "createLog"
Cohesion: 0.21
Nodes (20): accPesanan(), batalkanPesananKasir(), confirmQrisPayment(), generateQRISCode(), KasirPesananItem, konfirmasiPembayaran(), prosesPembayaranQRIS(), prosesPembayaranTunai() (+12 more)

### Community 44 - "auth.ts"
Cohesion: 0.14
Nodes (6): utapi, CustomUser, { handlers, auth, signIn, signOut }, next-auth, Session, User

### Community 45 - "stok-bahan/page.tsx"
Cohesion: 0.18
Nodes (11): StokBahanWithType, BahanLogo(), BahanLogoConfig, emptyForm, getBahanLogoConfig(), jenisPerubahanLabels, kategoriLabels, satuanLabels (+3 more)

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "meja/page.tsx"
Cohesion: 0.13
Nodes (31): deleteMeja(), kosongkanMeja(), updateMeja(), aksiColors, aksiKategori, aksiLabels, JenisAksi, MejaPage() (+23 more)

### Community 54 - "dependencies"
Cohesion: 0.22
Nodes (9): bcryptjs, clsx, dependencies, bcryptjs, clsx, uploadthing, uuid, uploadthing (+1 more)

### Community 64 - "stok-bahan.ts"
Cohesion: 0.10
Nodes (36): createStokBahan(), deleteStokBahan(), getBahanDapurList(), getDaftarMenuResep(), getResepMenu(), getRiwayatStok(), getStokBahanList(), hapusResepBahan() (+28 more)

### Community 65 - "log.ts"
Cohesion: 0.24
Nodes (6): ref_crypto, forgotPasswordAction(), sendResetPasswordEmail(), transporter, getIp(), JenisAksiLog

### Community 67 - "dashboard/layout.tsx"
Cohesion: 0.26
Nodes (9): LaporanPage(), DashboardLayout(), DashboardClient(), useMediaQuery(), Header(), UserContext, UserContextValue, UserProvider() (+1 more)

### Community 70 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 74 - "Tester Agent"
Cohesion: 0.18
Nodes (10): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+2 more)

### Community 75 - "Card"
Cohesion: 0.34
Nodes (12): resetPasswordConfirmAction(), ForgotPasswordPage(), initialState, initialState, ResetPasswordPage(), StatCard(), StatCardProps, Card() (+4 more)

### Community 76 - "users.ts"
Cohesion: 0.30
Nodes (11): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+3 more)

### Community 77 - "KasirPage"
Cohesion: 0.08
Nodes (23): getPesananRiwayatKasir(), KasirPage(), getGrandTotal(), handleBatalFinal(), handleBayarTunaiStep(), handleMethodWarningProceed(), useShiftAktif(), ADMIN_FEE_QRIS_PERSEN (+15 more)

### Community 79 - "prisma.ts"
Cohesion: 0.16
Nodes (6): getLogCount(), getLogs(), getUniqueUsers(), LogItem, LoggingPage(), globalForPrisma

### Community 111 - "optionalDependencies"
Cohesion: 0.40
Nodes (5): lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 112 - "prisma"
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
Nodes (17): 1. Brand & Identity, 2. Color Palette, 3. Typography, 4. Spacing, Radius & Layout, 5. Dark Mode, 7. Aturan Penggunaan Warna (Praktik), Aturan Penggunaan, Design System - Pringmoni (UI & Visual Design) (+9 more)

### Community 119 - "Code Reviewer Agent"
Cohesion: 0.11
Nodes (17): 1. Code Quality, 2. Security (Surface Level), 3. Performance (Surface Level), 4. Maintainability, 5. Consistency, Anti-Patterns to Flag, Code Reviewer Agent, Core Philosophy (+9 more)

### Community 120 - "3. Product Backlog (PBI)"
Cohesion: 0.08
Nodes (23): 1. Product Overview, 2. Core Features, 3. Product Backlog (PBI), 4. Definition of Done, 5. Future Plans, Customer Self-Order, Dashboard Admin, Fitur Baru (+15 more)

### Community 122 - "Pringmoni - Resto POS & Monitoring"
Cohesion: 0.11
Nodes (18): Available Agents, Available Commands (/), Available Skills, Branch Terlindungi (JANGAN DIHAPUS), Folder Structure, graphify, Kompatibilitas Shell (PowerShell & Git Bash), ⚠️ Larangan: `next build` bersamaan dengan `next dev` (+10 more)

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

### Community 158 - "cn"
Cohesion: 0.11
Nodes (19): CardAction(), CardFooter(), Checkbox(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+11 more)

## Knowledge Gaps
- **700 isolated node(s):** `SaranUangAwal`, `HasilShiftAktif`, `RingkasanTutupShift`, `CartSheetProps`, `Voucher` (+695 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 844 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **60 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `PageLoader`, `Card`, `Button`, `stok-bahan/page.tsx`, `resep-menu-dialog.tsx`, `cart-sheet.tsx`, `meja/page.tsx`, `DashboardClient.tsx`, `app/layout.tsx`, `tabs.tsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `Button()` connect `Button` to `stok-bahan.ts`, `dashboard/pesanan/page.tsx`, `actions/shift.ts`, `pesanan-baru/page.tsx`, `LaporanClient.tsx`, `Card`, `cart-sheet.tsx`, `stok-bahan/page.tsx`, `resep-menu-dialog.tsx`, `meja/page.tsx`, `DashboardClient.tsx`, `[tokenMeja]/page.tsx`, `pembayaran/[metode]/page.tsx`, `menu/page.tsx`, `cn`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `PageLoader()` connect `PageLoader` to `cn`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `SaranUangAwal`, `HasilShiftAktif`, `RingkasanTutupShift` to the rest of the system?**
  _700 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `seed-2025.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11333333333333333 - nodes in this community are weakly interconnected._
- **Should `actions/shift.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05701592002961866 - nodes in this community are weakly interconnected._
- **Should `PageLoader` be split into smaller, more focused modules?**
  _Cohesion score 0.07804878048780488 - nodes in this community are weakly interconnected._