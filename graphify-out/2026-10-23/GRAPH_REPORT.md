# Graph Report - pringmoni  (2026-10-23)

## Corpus Check
- 237 files · ~305,353 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1638 nodes · 3342 edges · 130 communities (98 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d52fd705`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- seed-2025.ts
- actions/shift.ts
- PageLoader
- compilerOptions
- menu.ts
- src/types/index.ts
- LaporanClient.tsx
- types/index.ts
- components.json
- 2. MVP (Minimum Viable Product)
- cart-sheet.tsx
- Button
- dropdown-menu.tsx
- dashboard.ts
- 20260408053831_init_all_schema/migration.sql
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- login.ts
- OWASP Top 10 Focus Areas
- GrafikPeakHours.tsx
- optionalDependencies
- DashboardCharts.tsx
- upload.ts
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- ResepClient.tsx
- next
- overrides
- prisma
- package.json
- react
- scripts
- Header.tsx
- [tokenMeja]/page.tsx
- meja/page.tsx
- components/BankIcon.tsx
- PieKategori.tsx
- forgot-password.ts
- 20260327055635_init/migration.sql
- security-scan.ts
- pesanan.ts
- logs.ts
- stok-bahan/page.tsx
- README.md
- notifications.ts
- parallel-guard.ts
- verification.ts
- category-icon.tsx
- menu/page.tsx
- dependencies
- eslint.config.mjs
- stok-bahan.ts
- auth.ts
- GrafikMenu.tsx
- proxy.ts
- "users"
- PerbandinganCard.tsx
- 20261017000001_add_jadwal_shift_dan_kas_keluar/migration.sql
- 20260930000001_add_shift_kasir/migration.sql
- "pesanan"
- MenuPage
- Card
- users.ts
- print-struk.ts
- uploadthing.ts
- dashboard/layout.tsx
- Tester Agent
- utils.ts
- menu-foto.ts
- prisma.ts
- checkout/page.tsx
- fee.ts
- PesananBaruPage
- checkbox.tsx
- postcss.config.mjs
- { GET, POST }
- vitest
- Refactorer Agent
- Test Architect Agent
- Orchestrator Agent (Single-Worker Mode)
- Design System - Pringmoni (UI & Visual Design)
- Code Reviewer Agent
- 3. Product Backlog (PBI)
- KasirPage
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
- cn

## God Nodes (most connected - your core abstractions)
1. `cn()` - 79 edges
2. `react` - 52 edges
3. `Button()` - 49 edges
4. `MenuPage()` - 49 edges
5. `lucide-react` - 43 edges
6. `StokBahanPage()` - 39 edges
7. `createLog()` - 37 edges
8. `MejaPage()` - 34 edges
9. `ResepMenuDialog()` - 34 edges
10. `Card()` - 32 edges

## Surprising Connections (you probably didn't know these)
- `8. Optimasi delay >5 detik` --references--> `getDashboardStats()`  [INFERRED]
  .opencode/PROGRESS.md → src/app/actions/dashboard.ts
- `6. Komponen (shadcn/ui)` --references--> `cn()`  [INFERRED]
  .opencode/DESIGN.md → src/lib/utils.ts
- `3. Delay navigasi halaman (loading.tsx)` --references--> `PageLoader()`  [INFERRED]
  .opencode/PROGRESS.md → src/components/ui/page-loader.tsx
- `Priority Test` --references--> `createMenu()`  [INFERRED]
  .opencode/agent/tester.md → src/app/actions/menu.ts
- `6. Komponen (shadcn/ui)` --references--> `Select()`  [INFERRED]
  .opencode/DESIGN.md → src/components/ui/select.tsx

## Import Cycles
- None detected.

## Communities (130 total, 19 thin omitted)

### Community 1 - "seed-2025.ts"
Cohesion: 0.11
Nodes (18): main(), prisma, randomInt(), randomItem(), randomTime(), main(), prisma, randomInt() (+10 more)

### Community 2 - "actions/shift.ts"
Cohesion: 0.06
Nodes (70): ambilShiftRow(), autoCloseShifts(), bukaShift(), getDaftarKasir(), getJadwalShift(), getKasKeluarAktif(), getRiwayatShift(), getShiftAktif() (+62 more)

### Community 3 - "PageLoader"
Cohesion: 0.08
Nodes (27): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 9. Animasi loading di loading state lokal (+19 more)

### Community 4 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 5 - "menu.ts"
Cohesion: 0.16
Nodes (19): Priority Test, createKategori(), createMenu(), CreateMenuInput, deleteKategori(), getKategoriMenus(), getMenus(), requireOwner() (+11 more)

### Community 6 - "src/types/index.ts"
Cohesion: 0.06
Nodes (31): AnalisisTambahan, CreateStokBahanInput, CreateUserInput, DashboardStats, DetailPesananItem, JenisPerubahanStok, KategoriBahan, KategoriMenu (+23 more)

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

### Community 11 - "cart-sheet.tsx"
Cohesion: 0.18
Nodes (15): @radix-ui/react-dialog, CartSheet(), CartSheetProps, getItemKey(), sampleVouchers, Voucher, src_components_ui_sheet_sheet, SheetContent (+7 more)

### Community 12 - "Button"
Cohesion: 0.17
Nodes (29): 6. Komponen (shadcn/ui), lucide-react, radix-ui, getPesananByTokenAndId(), initialState, DetailPesananPage(), metodeConfig, PesananData (+21 more)

### Community 13 - "dropdown-menu.tsx"
Cohesion: 0.12
Nodes (15): NotifikasiPesananTerlambat, formatDurasi(), labelStatus(), StaleNotificationBell(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem() (+7 more)

### Community 14 - "dashboard.ts"
Cohesion: 0.19
Nodes (16): pusher, autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), getStaleOrders(), PaidStaleOrder, StaleOrder (+8 more)

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.16
Nodes (19): "detail_pesanan", "kategori_menu", kategori_menu_nama_kategori_key, "logs", "meja", meja_nomor_meja_key, meja_token_meja_key, "menu" (+11 more)

### Community 16 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, @testing-library/jest-dom (+12 more)

### Community 18 - "laporan.ts"
Cohesion: 0.28
Nodes (16): A. Optimasi laporan (belum dikerjakan), 🔜 Langkah Besok, getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir() (+8 more)

### Community 19 - "login.ts"
Cohesion: 0.22
Nodes (13): HasilValidasi, loginAction(), LoginState, STATE_AWAL, validasiKredensial(), LoginPage(), checkRateLimit(), getKey() (+5 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "GrafikPeakHours.tsx"
Cohesion: 0.20
Nodes (7): amberGradient(), calcTicks(), GrafikPeakHours(), TooltipPayload, GrafikPendapatan(), TooltipPayload, GrafikPoint

### Community 22 - "optionalDependencies"
Cohesion: 0.67
Nodes (3): optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 23 - "DashboardCharts.tsx"
Cohesion: 0.21
Nodes (12): ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah(), MejaData (+4 more)

### Community 25 - "app/layout.tsx"
Cohesion: 0.21
Nodes (10): next-auth, src_app_globals, geistMono, geistMonoHeading, geistSans, inter, metadata, RootLayout() (+2 more)

### Community 26 - "export-laporan.ts"
Cohesion: 0.26
Nodes (12): exceljs, jspdf, centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport (+4 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "ResepClient.tsx"
Cohesion: 0.33
Nodes (10): getDaftarMenuResep(), hapusResepBahan(), ResepPage(), ResepClient(), handleRemove(), load(), renderKartu(), satuanLabels (+2 more)

### Community 32 - "package.json"
Cohesion: 0.06
Nodes (32): name, private, version, babel-plugin-react-compiler, cloudinary, lightningcss-win32-x64-msvc, pg, prisma (+24 more)

### Community 33 - "react"
Cohesion: 0.19
Nodes (14): react, getPesananById(), getPesananForDashboard(), markItemDiantar(), PesananDetail, PesananItem, PesananPage(), statusBayarColors (+6 more)

### Community 34 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, seed-2025, seed-resep, seed-resep:dry, start

### Community 35 - "Header.tsx"
Cohesion: 0.39
Nodes (6): logoutAction(), ClockDisplay(), getServerSnapshot(), getSnapshot(), pad(), subscribe()

### Community 36 - "[tokenMeja]/page.tsx"
Cohesion: 0.17
Nodes (15): jsqr, getActivePesananByToken(), getCustomerMenuData, getMejaByToken(), getMejaTersediaPindah(), getMenusForCustomer(), getStatusPesananAktifMeja(), updateNamaPelanggan() (+7 more)

### Community 37 - "meja/page.tsx"
Cohesion: 0.13
Nodes (25): qrcode.react, createMeja(), deleteMeja(), generateNomorMeja(), getMeja(), getNextNomorMeja(), kosongkanMeja(), MejaResult (+17 more)

### Community 39 - "PieKategori.tsx"
Cohesion: 0.15
Nodes (10): recharts, CATEGORY_COLORS, PieKategori(), PieTooltipPayload, COLORS, formatRupiah(), PieMetode(), PieMetodeProps (+2 more)

### Community 40 - "forgot-password.ts"
Cohesion: 0.38
Nodes (5): ref_crypto, nodemailer, forgotPasswordAction(), sendResetPasswordEmail(), transporter

### Community 41 - "20260327055635_init/migration.sql"
Cohesion: 0.83
Nodes (3): "User", User_email_key, User_username_key

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "pesanan.ts"
Cohesion: 0.09
Nodes (46): @prisma/client, accPesanan(), batalkanPesananKasir(), confirmQrisPayment(), generateQRISCode(), getPembayaranInfo(), getPesananRiwayatKasir(), KasirPesananItem (+38 more)

### Community 44 - "logs.ts"
Cohesion: 0.38
Nodes (5): getLogCount(), getLogs(), getUniqueUsers(), LogItem, LoggingPage()

### Community 45 - "stok-bahan/page.tsx"
Cohesion: 0.16
Nodes (15): getRiwayatStok(), resetAllStokBahan(), BahanLogo(), BahanLogoConfig, emptyForm, getBahanLogoConfig(), jenisPerubahanLabels, kategoriLabels (+7 more)

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "menu/page.tsx"
Cohesion: 0.11
Nodes (35): MenuWithKategori, StokBahanWithType, aksiColors, aksiKategori, aksiLabels, JenisAksi, ActionResult, KategoriMenu (+27 more)

### Community 54 - "dependencies"
Cohesion: 0.05
Nodes (37): dependencies, bcryptjs, class-variance-authority, cloudinary, clsx, exceljs, @hugeicons/core-free-icons, @hugeicons/react (+29 more)

### Community 57 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 64 - "stok-bahan.ts"
Cohesion: 0.15
Nodes (25): createStokBahan(), deleteStokBahan(), getBahanDapurList(), getResepMenu(), getStokBahanList(), hitungKelengkapanResep(), hitungStatus(), KelengkapanResep (+17 more)

### Community 65 - "auth.ts"
Cohesion: 0.13
Nodes (12): bcryptjs, CustomUser, { handlers, auth, signIn, signOut }, next-auth, Session, User, AMBANG_SESI_AKTIF_MS, ambilVersiSesi() (+4 more)

### Community 66 - "GrafikMenu.tsx"
Cohesion: 0.40
Nodes (3): COLORS, GrafikMenu(), TooltipPayload

### Community 67 - "proxy.ts"
Cohesion: 0.17
Nodes (13): StatGrid(), StatGridProps, COOKIE_PERANGKAT, ALL_ROLES, config, getRouteRole(), isPublicRoute(), isRoleUser() (+5 more)

### Community 70 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 74 - "MenuPage"
Cohesion: 0.21
Nodes (6): deleteMenu(), MenuPage(), confirmDelete(), confirmDeleteFoto(), loadMenuFotos(), openDialog()

### Community 75 - "Card"
Cohesion: 0.31
Nodes (13): resetPasswordConfirmAction(), ForgotPasswordPage(), initialState, initialState, ResetPasswordPage(), StatCard(), StatCardProps, Card() (+5 more)

### Community 76 - "users.ts"
Cohesion: 0.30
Nodes (11): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+3 more)

### Community 77 - "print-struk.ts"
Cohesion: 0.30
Nodes (11): centerText(), formatRupiah(), nomorPesanan(), printStruk(), printStruk58(), renderAllPages(), renderDoc(), renderStruk() (+3 more)

### Community 78 - "uploadthing.ts"
Cohesion: 0.22
Nodes (8): @uploadthing/react, GET, POST, UploadButton, useUploadThing, f, OurFileRouter, utapi

### Community 79 - "dashboard/layout.tsx"
Cohesion: 0.29
Nodes (8): LaporanPage(), DashboardLayout(), DashboardClient(), Header(), UserContext, UserContextValue, UserProvider(), useUserRole()

### Community 80 - "Tester Agent"
Cohesion: 0.20
Nodes (9): Component Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester), Tester UI (FE Tester) (+1 more)

### Community 81 - "utils.ts"
Cohesion: 0.24
Nodes (7): clsx, tailwind-merge, DashboardClientProps, SidebarMobile(), useMediaQuery(), Sidebar(), SidebarProps

### Community 82 - "menu-foto.ts"
Cohesion: 0.31
Nodes (7): uploadthing, deleteAllMenuFotos(), deleteMenuFoto(), getMenuFotos(), requireOwner(), saveMenuFotoUrls(), utapi

### Community 83 - "prisma.ts"
Cohesion: 0.22
Nodes (3): getIp(), JenisAksiLog, globalForPrisma

### Community 84 - "checkout/page.tsx"
Cohesion: 0.33
Nodes (7): CheckoutData, CheckoutPage(), CreatePesananResult, metodeOptions, ambilKeranjangCheckout(), CHECKOUT_STORAGE_KEY, hapusKeranjangCheckout()

### Community 85 - "fee.ts"
Cohesion: 0.29
Nodes (5): ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee()

### Community 87 - "checkbox.tsx"
Cohesion: 0.50
Nodes (3): @hugeicons/core-free-icons, @hugeicons/react, Checkbox()

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

### Community 121 - "KasirPage"
Cohesion: 0.09
Nodes (16): 8. Optimasi delay >5 detik, getPaidOrdersForNotification(), getPesananBelumBayar(), KasirLayout(), KasirPage(), getGrandTotal(), handleBatalFinal(), handleBayarTunaiStep() (+8 more)

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
Cohesion: 0.16
Nodes (15): class-variance-authority, CardAction(), CardFooter(), SelectGroup(), SelectLabel(), SelectSeparator(), Separator(), TableCaption() (+7 more)

## Knowledge Gaps
- **724 isolated node(s):** `Tech Architecture`, `Models`, `Enums (stok & resep)`, `Enums (voucher)`, `3. Route Structure` (+719 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 860 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `actions/shift.ts`, `LaporanClient.tsx`, `cart-sheet.tsx`, `Button`, `dropdown-menu.tsx`, `ResepClient.tsx`, `next`, `cn`, `package.json`, `Header.tsx`, `[tokenMeja]/page.tsx`, `meja/page.tsx`, `pesanan.ts`, `stok-bahan/page.tsx`, `category-icon.tsx`, `menu/page.tsx`, `Card`, `dashboard/layout.tsx`, `utils.ts`, `checkout/page.tsx`, `checkbox.tsx`, `KasirPage`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `PageLoader`, `meja/page.tsx`, `Card`, `Button`, `stok-bahan/page.tsx`, `dropdown-menu.tsx`, `cart-sheet.tsx`, `utils.ts`, `menu/page.tsx`, `checkbox.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Button` to `actions/shift.ts`, `src/types/index.ts`, `LaporanClient.tsx`, `cart-sheet.tsx`, `dropdown-menu.tsx`, `dashboard.ts`, `GrafikPeakHours.tsx`, `DashboardCharts.tsx`, `ResepClient.tsx`, `package.json`, `react`, `Header.tsx`, `[tokenMeja]/page.tsx`, `meja/page.tsx`, `PieKategori.tsx`, `pesanan.ts`, `stok-bahan/page.tsx`, `menu/page.tsx`, `GrafikMenu.tsx`, `proxy.ts`, `PerbandinganCard.tsx`, `Card`, `utils.ts`, `checkout/page.tsx`, `KasirPage`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `Tech Architecture`, `Models`, `Enums (stok & resep)` to the rest of the system?**
  _724 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `seed-2025.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11333333333333333 - nodes in this community are weakly interconnected._
- **Should `actions/shift.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05777345017851347 - nodes in this community are weakly interconnected._
- **Should `PageLoader` be split into smaller, more focused modules?**
  _Cohesion score 0.07804878048780488 - nodes in this community are weakly interconnected._