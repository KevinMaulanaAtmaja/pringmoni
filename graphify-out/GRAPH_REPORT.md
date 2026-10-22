# Graph Report - pringmoni  (2026-10-17)

## Corpus Check
- 202 files · ~91,101 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .toml 4, (none) 2, .example 1)

## Summary
- 1554 nodes · 3437 edges · 110 communities (87 shown, 23 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3f3c0e3c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dashboard/pesanan/page.tsx
- seed-2025.ts
- ShiftKasirPanel.tsx
- page-loader.tsx
- compilerOptions
- menu.ts
- src/types/index.ts
- LaporanClient.tsx
- types/index.ts
- components.json
- 2. MVP (Minimum Viable Product)
- next
- [tokenMeja]/page.tsx
- Button
- dashboard.ts
- 20260408053831_init_all_schema/migration.sql
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- auth.ts
- OWASP Top 10 Focus Areas
- ClockDisplay.tsx
- optionalDependencies
- auth
- prisma.ts
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- react
- lucide-react
- overrides
- prisma
- package.json
- print-struk.ts
- scripts
- logging/page.tsx
- stok-bahan/page.tsx
- DashboardCharts.tsx
- components/BankIcon.tsx
- PieKategori.tsx
- meja.ts
- 20260327055635_init/migration.sql
- security-scan.ts
- checkbox.tsx
- meja/page.tsx
- pesanan.ts
- README.md
- notifications.ts
- parallel-guard.ts
- verification.ts
- category-icon.tsx
- stok-bahan.ts
- dependencies
- eslint.config.mjs
- useOrdersRealtime
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
- login.ts
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
- cart-sheet.tsx

## God Nodes (most connected - your core abstractions)
1. `auth` - 92 edges
2. `cn()` - 79 edges
3. `Button()` - 60 edges
4. `react` - 51 edges
5. `MenuPage()` - 49 edges
6. `next` - 46 edges
7. `Input()` - 45 edges
8. `KasirPage()` - 43 edges
9. `lucide-react` - 42 edges
10. `Card()` - 42 edges

## Surprising Connections (you probably didn't know these)
- `8. Stock & Availability Flow` --references--> `createPesanan()`  [INFERRED]
  .opencode/ARCHITECTURE.md → src/app/actions/pesanan.ts
- `8. Optimasi delay >5 detik` --references--> `getDashboardStats()`  [INFERRED]
  .opencode/PROGRESS.md → src/app/actions/dashboard.ts
- `8. Optimasi delay >5 detik` --references--> `getPesananBelumBayar()`  [INFERRED]
  .opencode/PROGRESS.md → src/app/actions/kasir.ts
- `Priority Test` --references--> `createMenu()`  [INFERRED]
  .opencode/agent/tester.md → src/app/actions/menu.ts
- `6. Komponen (shadcn/ui)` --references--> `Card()`  [INFERRED]
  .opencode/DESIGN.md → src/components/ui/card.tsx

## Import Cycles
- None detected.

## Communities (110 total, 23 thin omitted)

### Community 0 - "dashboard/pesanan/page.tsx"
Cohesion: 0.17
Nodes (26): getPesananById(), getPesananForDashboard(), getDaftarKasir(), PesananDetailPage(), statusBayarColors, statusColors, PesananDetail, PesananItem (+18 more)

### Community 1 - "seed-2025.ts"
Cohesion: 0.09
Nodes (29): main(), prisma, randomInt(), randomItem(), randomTime(), main(), prisma, randomInt() (+21 more)

### Community 2 - "ShiftKasirPanel.tsx"
Cohesion: 0.13
Nodes (26): ambilShiftRow(), bukaShift(), getRiwayatShift(), getShiftAktif(), HasilShiftAktif, keShiftAktif(), SaranUangAwal, selectShift (+18 more)

### Community 3 - "page-loader.tsx"
Cohesion: 0.08
Nodes (28): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 8. Optimasi delay >5 detik (+20 more)

### Community 4 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 5 - "menu.ts"
Cohesion: 0.06
Nodes (51): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+43 more)

### Community 6 - "src/types/index.ts"
Cohesion: 0.05
Nodes (36): formatRupiah(), PerbandinganCard(), AnalisisTambahan, BandingData, CreateStokBahanInput, CreateUserInput, CustomerMenu, DashboardStats (+28 more)

### Community 7 - "LaporanClient.tsx"
Cohesion: 0.22
Nodes (23): LaporanPage(), AnalisisCard(), currentYear, dateToWeekStr(), FilterPeriode(), getWeekRange(), LaporanClient(), LaporanKasirItem (+15 more)

### Community 8 - "types/index.ts"
Cohesion: 0.08
Nodes (24): CustomerMenu, DashboardStats, DetailPesananItem, GrafikPoint, ItemLaporanPesanan, KategoriMenu, LaporanKasir, LaporanMenuTerlaris (+16 more)

### Community 9 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "2. MVP (Minimum Viable Product)"
Cohesion: 0.10
Nodes (20): 1. Tujuan Proyek, 2. MVP (Minimum Viable Product), 3. Fitur Lengkap, 4. DOD (Definition of Done) & Kendala, 5. Plan Next Semester, Admin Dashboard, Customer-Facing, Dokumentasi (+12 more)

### Community 11 - "next"
Cohesion: 0.12
Nodes (16): nextConfig, next, DashboardLayout(), jamLabel(), rupiah(), ShiftSidebarStatus(), DashboardClient(), DashboardClientProps (+8 more)

### Community 12 - "[tokenMeja]/page.tsx"
Cohesion: 0.22
Nodes (11): CheckoutData, CheckoutPage(), CreatePesananResult, metodeOptions, CustomerMenuPage(), Menu, KeranjangItem, ambilKeranjangCheckout() (+3 more)

### Community 13 - "Button"
Cohesion: 0.13
Nodes (32): 6. Komponen (shadcn/ui), StokBahanWithType, DetailPesananPage(), metodeConfig, PesananData, StatusPesanan, StokBahanPage(), Menu (+24 more)

### Community 14 - "dashboard.ts"
Cohesion: 0.24
Nodes (13): autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), getPaidStaleWarnings(), getStaleOrders(), PaidStaleOrder, StaleOrder (+5 more)

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.12
Nodes (24): "detail_pesanan", "kategori_menu", kategori_menu_nama_kategori_key, "logs", "meja", meja_nomor_meja_key, meja_token_meja_key, "menu" (+16 more)

### Community 16 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, @testing-library/jest-dom (+12 more)

### Community 18 - "laporan.ts"
Cohesion: 0.28
Nodes (16): A. Optimasi laporan (belum dikerjakan), 🔜 Langkah Besok, getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir() (+8 more)

### Community 19 - "auth.ts"
Cohesion: 0.14
Nodes (13): bcryptjs, logoutAction(), POST(), utapi, PesananBaruLayout(), Home(), StatGridProps, CustomUser (+5 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "ClockDisplay.tsx"
Cohesion: 0.60
Nodes (5): ClockDisplay(), getServerSnapshot(), getSnapshot(), pad(), subscribe()

### Community 22 - "optionalDependencies"
Cohesion: 0.67
Nodes (3): optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 23 - "auth"
Cohesion: 0.19
Nodes (26): pusher, accPesanan(), batalkanPesananKasir(), confirmQrisPayment(), generateQRISCode(), getPesananRiwayatKasir(), KasirPesananItem, konfirmasiPembayaran() (+18 more)

### Community 24 - "prisma.ts"
Cohesion: 0.12
Nodes (10): nodemailer, sharp, uuid, forgotPasswordAction(), uploadMenuFoto(), sendResetPasswordEmail(), transporter, getIp() (+2 more)

### Community 25 - "app/layout.tsx"
Cohesion: 0.23
Nodes (8): geistMono, geistMonoHeading, geistSans, inter, metadata, RootLayout(), Providers(), Footer()

### Community 26 - "export-laporan.ts"
Cohesion: 0.29
Nodes (11): exceljs, centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport, MonthPDFData (+3 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "react"
Cohesion: 0.20
Nodes (19): react, resetPasswordConfirmAction(), initialState, LoginPage(), ForgotPasswordPage(), initialState, initialState, ResetPasswordPage() (+11 more)

### Community 29 - "lucide-react"
Cohesion: 0.17
Nodes (17): lucide-react, getPembayaranInfo(), PesananSelesaiPage(), loadData(), StatCard(), StatCardProps, COLORS, CustomTooltip() (+9 more)

### Community 32 - "package.json"
Cohesion: 0.05
Nodes (37): name, private, version, babel-plugin-react-compiler, class-variance-authority, cloudinary, clsx, jsqr (+29 more)

### Community 33 - "print-struk.ts"
Cohesion: 0.16
Nodes (16): jspdf, ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee(), centerText(), formatRupiah() (+8 more)

### Community 34 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, seed-2025, seed-resep, seed-resep:dry, start

### Community 35 - "logging/page.tsx"
Cohesion: 0.24
Nodes (11): getLogCount(), getLogs(), getUniqueUsers(), LogItem, aksiColors, aksiKategori, aksiLabels, JenisAksi (+3 more)

### Community 36 - "stok-bahan/page.tsx"
Cohesion: 0.18
Nodes (12): BahanLogo(), BahanLogoConfig, emptyForm, getBahanLogoConfig(), jenisPerubahanLabels, kategoriLabels, satuanLabels, statusColors (+4 more)

### Community 37 - "DashboardCharts.tsx"
Cohesion: 0.21
Nodes (12): ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah(), MejaData (+4 more)

### Community 39 - "PieKategori.tsx"
Cohesion: 0.21
Nodes (10): recharts, CATEGORY_COLORS, PieKategori(), PieTooltip(), COLORS, formatRupiah(), PieMetode(), PieMetodeProps (+2 more)

### Community 40 - "meja.ts"
Cohesion: 0.24
Nodes (9): createMeja(), deleteMeja(), generateNomorMeja(), getNextNomorMeja(), kosongkanMeja(), MejaResult, handleDeleteConfirm(), handleKosongkanConfirm() (+1 more)

### Community 41 - "20260327055635_init/migration.sql"
Cohesion: 0.83
Nodes (3): "User", User_email_key, User_username_key

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "checkbox.tsx"
Cohesion: 0.50
Nodes (3): @hugeicons/core-free-icons, @hugeicons/react, Checkbox()

### Community 44 - "meja/page.tsx"
Cohesion: 0.12
Nodes (19): getMeja(), updateMeja(), PesananBaruPage(), handleSubmit(), MejaPage(), statusColors, statusLabels, tipeMejaLabels (+11 more)

### Community 45 - "pesanan.ts"
Cohesion: 0.16
Nodes (20): createPesanan(), CreatePesananData, CreatePesananItem, getActivePesananByToken(), getCustomerMenuData, getCustomerPaymentStatus(), getMejaByToken(), getMenusForCustomer() (+12 more)

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "stok-bahan.ts"
Cohesion: 0.09
Nodes (39): createStokBahan(), deleteStokBahan(), getBahanDapurList(), getDaftarMenuResep(), getResepMenu(), getRiwayatStok(), getStokBahanList(), hapusResepBahan() (+31 more)

### Community 54 - "dependencies"
Cohesion: 0.05
Nodes (37): dependencies, bcryptjs, class-variance-authority, cloudinary, clsx, exceljs, @hugeicons/core-free-icons, @hugeicons/react (+29 more)

### Community 57 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 74 - "useOrdersRealtime"
Cohesion: 0.25
Nodes (9): getPaidOrdersForNotification(), getPesananBelumBayar(), KasirLayout(), KasirOrderNotifications(), NotifOrder, PaidOrder, soundedConfirmedOrders, soundedPaidOrders (+1 more)

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
Nodes (21): 1. Product Overview, 2. Core Features, 3. Product Backlog (PBI), 4. Definition of Done, 5. Future Plans, Customer Self-Order, Dashboard Admin, Fitur Baru (+13 more)

### Community 121 - "kasir/page.tsx"
Cohesion: 0.10
Nodes (13): next-auth, KasirPage(), getGrandTotal(), handleBatalFinal(), handleBayarTunaiStep(), handleMethodWarningProceed(), metodeColors, metodeIcons (+5 more)

### Community 122 - "Pringmoni - Resto POS & Monitoring"
Cohesion: 0.12
Nodes (16): Available Agents, Available Commands (/), Available Skills, Folder Structure, graphify, Kompatibilitas Shell (PowerShell & Git Bash), Pembatasan Kerja, Plugins (Auto-activated) (+8 more)

### Community 123 - "Documentation Types"
Cohesion: 0.13
Nodes (14): 1. README Files, 2. API Documentation, 3. Guides and Tutorials, 4. Inline Documentation, 5. Architecture Documentation, Clarity, Core Philosophy, Critical Rules (+6 more)

### Community 124 - "OWASP Top 10 Analysis"
Cohesion: 0.13
Nodes (14): A01: Broken Access Control, A02: Cryptographic Failures, A03: Injection, A04: Insecure Design, A05: Security Misconfiguration, A06: Vulnerable Components, A07: Authentication Failures, A08: Software and Data Integrity Failures (+6 more)

### Community 125 - "login.ts"
Cohesion: 0.47
Nodes (7): loginAction(), signIn, checkRateLimit(), getKey(), RateLimitEntry, recordFailedAttempt(), resetRateLimit()

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
Cohesion: 0.15
Nodes (12): 1. Architecture Overview, 2. Database Schema, 3. Route Structure, 4. Server Actions, 5. Auth Flow, 6. Real-time Flow, 7. Payment Flow, 8. Stock & Availability Flow (+4 more)

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
Cohesion: 0.40
Nodes (5): config, getRouteRole(), proxy(), roleRouteAccess, RoleUser

### Community 158 - "cn"
Cohesion: 0.09
Nodes (24): radix-ui, CardAction(), CardFooter(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+16 more)

### Community 159 - "cart-sheet.tsx"
Cohesion: 0.18
Nodes (13): @radix-ui/react-dialog, CartSheet(), CartSheetProps, getItemKey(), sampleVouchers, Voucher, SheetContent, SheetContentProps (+5 more)

## Knowledge Gaps
- **30 isolated node(s):** `@opencode-ai/plugin`, `@prisma/adapter-pg`, `@react-pdf/renderer`, `cloudinary`, `pg` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 805 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `dashboard/pesanan/page.tsx`, `page-loader.tsx`, `stok-bahan/page.tsx`, `next`, `checkbox.tsx`, `Button`, `meja/page.tsx`, `app/layout.tsx`, `react`, `lucide-react`, `cart-sheet.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `@opencode-ai/plugin`, `@prisma/adapter-pg`, `@react-pdf/renderer` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `seed-2025.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08534850640113797 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `dashboard/pesanan/page.tsx`, `seed-2025.ts`, `ShiftKasirPanel.tsx`, `menu.ts`, `LaporanClient.tsx`, `[tokenMeja]/page.tsx`, `Button`, `dashboard.ts`, `auth.ts`, `auth`, `prisma.ts`, `app/layout.tsx`, `proxy.ts`, `react`, `lucide-react`, `package.json`, `meja.ts`, `pesanan.ts`, `stok-bahan.ts`, `useOrdersRealtime`, `kasir/page.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `ShiftKasirPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12643678160919541 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `dashboard/pesanan/page.tsx`, `ShiftKasirPanel.tsx`, `menu.ts`, `LaporanClient.tsx`, `next`, `[tokenMeja]/page.tsx`, `Button`, `dashboard.ts`, `ClockDisplay.tsx`, `lucide-react`, `cn`, `cart-sheet.tsx`, `package.json`, `logging/page.tsx`, `stok-bahan/page.tsx`, `checkbox.tsx`, `meja/page.tsx`, `pesanan.ts`, `category-icon.tsx`, `useOrdersRealtime`, `kasir/page.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Should `page-loader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07549361207897794 - nodes in this community are weakly interconnected._