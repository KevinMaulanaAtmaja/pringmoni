# Graph Report - pringmoni  (2026-09-24)

## Corpus Check
- 184 files · ~76,588 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1419 nodes · 2301 edges · 155 communities (85 shown, 58 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dc37d321`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- kasir/page.tsx
- dashboard/pesanan/page.tsx
- cn
- page-loader.tsx
- compilerOptions
- menu.ts
- src/types/index.ts
- LaporanClient.tsx
- types/index.ts
- components.json
- 2. MVP (Minimum Viable Product)
- logs.ts
- cloudinary
- button.tsx
- dashboard.ts
- users.ts
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- auth.ts
- OWASP Top 10 Focus Areas
- GrafikPeakHours.tsx
- optionalDependencies
- bcryptjs
- prisma.ts
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- menu/page.tsx
- 20260408053831_init_all_schema/migration.sql
- prisma
- DashboardCharts.tsx
- package.json
- card.tsx
- scripts
- seed-2025.ts
- seed-historical.ts
- print-struk.ts
- components/BankIcon.tsx
- PieMetode.tsx
- @hugeicons/core-free-icons
- GrafikMenu.tsx
- security-scan.ts
- category-icon.tsx
- meja.ts
- pesanan.ts
- README.md
- notifications.ts
- parallel-guard.ts
- verification.ts
- graphify.js
- stok-bahan/page.tsx
- seed.ts
- testPrisma.ts
- dependencies
- next-auth
- PerbandinganCard.tsx
- eslint.config.mjs
- ✅ SELESAI
- exceljs
- eslint-config-next
- @hugeicons/react
- jspdf
- jsqr
- qrcode
- next
- react-dom
- next.config.ts
- nodemailer
- @prisma/adapter-pg
- @prisma/client
- pusher
- pusher-js
- useOrdersRealtime
- radix-ui
- @radix-ui/react-dialog
- react
- uploadthing.ts
- @react-pdf/renderer
- recharts
- shadcn
- sharp
- tailwind-merge
- tw-animate-css
- uploadthing
- @uploadthing/react
- xlsx
- zod
- pg
- qrcode.react
- tailwindcss
- @tailwindcss/postcss
- @testing-library/react
- ts-node
- tsx
- @types/bcryptjs
- @types/pg
- postcss.config.mjs
- 20260327055635_init/migration.sql
- { GET, POST }
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
- login.ts
- PBIs (Product Backlog Items)
- Security Best Practices
- Backend Developer Agent
- Phase 2: Multi-Perspective Analysis
- Tester Agent
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
- @types/react
- @types/react-dom
- vitest

## God Nodes (most connected - your core abstractions)
1. `cn()` - 78 edges
2. `createLog()` - 29 edges
3. `Button()` - 25 edges
4. `triggerPusher()` - 21 edges
5. `KasirPage()` - 21 edges
6. `Card()` - 19 edges
7. `CardContent()` - 19 edges
8. `compilerOptions` - 17 edges
9. `Badge()` - 16 edges
10. `Input()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `handleBatalFinal()` --calls--> `batalkanPesananKasir()`  [EXTRACTED]
  src/app/dashboard/kasir/page.tsx → src/app/actions/kasir.ts
- `cancelExpiredOrders()` --calls--> `createLog()`  [EXTRACTED]
  src/app/actions/pesanan.ts → src/lib/log.ts
- `LoginPage()` --indirect_call--> `loginAction()`  [INFERRED]
  src/app/(auth)/login/page.tsx → src/app/actions/login.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts
- `CardFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (155 total, 58 thin omitted)

### Community 0 - "kasir/page.tsx"
Cohesion: 0.14
Nodes (27): accPesanan(), batalkanPesananKasir(), confirmQrisPayment(), generateQRISCode(), getPembayaranInfo(), getPesananRiwayatKasir(), KasirPesananItem, konfirmasiPembayaran() (+19 more)

### Community 1 - "dashboard/pesanan/page.tsx"
Cohesion: 0.15
Nodes (18): cancelPesanan(), getPesananById(), getPesananForDashboard(), markItemDiantar(), markPesananSelesai(), updateStatusPesanan(), PesananDetailPage(), statusBayarColors (+10 more)

### Community 2 - "cn"
Cohesion: 0.08
Nodes (31): DashboardClientProps, SidebarMobile(), Sidebar(), SidebarProps, Checkbox(), DialogOverlay(), DropdownMenuCheckboxItem(), DropdownMenuContent() (+23 more)

### Community 4 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node (+22 more)

### Community 5 - "menu.ts"
Cohesion: 0.09
Nodes (29): createKategori(), createMenu(), CreateMenuInput, deleteKategori(), deleteMenu(), deleteAllMenuFotos(), deleteMenuFoto(), getMenuFotos() (+21 more)

### Community 6 - "src/types/index.ts"
Cohesion: 0.07
Nodes (28): AnalisisTambahan, CreateStokBahanInput, CreateUserInput, CustomerMenu, DashboardStats, JenisPerubahanStok, KategoriBahan, KategoriMenu (+20 more)

### Community 7 - "LaporanClient.tsx"
Cohesion: 0.10
Nodes (20): currentYear, dateToWeekStr(), getWeekRange(), LaporanClient(), LaporanKasirItem, loadingState, TabBanding(), TabBulanan() (+12 more)

### Community 8 - "types/index.ts"
Cohesion: 0.08
Nodes (24): CustomerMenu, DashboardStats, DetailPesananItem, GrafikPoint, ItemLaporanPesanan, KategoriMenu, LaporanKasir, LaporanMenuTerlaris (+16 more)

### Community 9 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "2. MVP (Minimum Viable Product)"
Cohesion: 0.10
Nodes (20): 1. Tujuan Proyek, 2. MVP (Minimum Viable Product), 3. Fitur Lengkap, 4. DOD (Definition of Done) & Kendala, 5. Plan Next Semester, Admin Dashboard, Customer-Facing, Dokumentasi (+12 more)

### Community 11 - "logs.ts"
Cohesion: 0.38
Nodes (5): getLogCount(), getLogs(), getUniqueUsers(), LogItem, LoggingPage()

### Community 13 - "button.tsx"
Cohesion: 0.19
Nodes (17): metodeConfig, PesananData, StatusPesanan, Menu, MenuCardProps, MenuFoto, Button(), buttonVariants (+9 more)

### Community 14 - "dashboard.ts"
Cohesion: 0.23
Nodes (12): autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), getStaleOrders(), PaidStaleOrder, StaleOrder, DashboardPage() (+4 more)

### Community 15 - "users.ts"
Cohesion: 0.22
Nodes (12): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+4 more)

### Community 16 - "devDependencies"
Cohesion: 0.13
Nodes (15): babel-plugin-react-compiler, eslint, devDependencies, babel-plugin-react-compiler, eslint, @testing-library/jest-dom, @testing-library/user-event, @types/node (+7 more)

### Community 18 - "laporan.ts"
Cohesion: 0.32
Nodes (14): getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir(), getLaporanKategori(), getLaporanMenuTerlaris() (+6 more)

### Community 19 - "auth.ts"
Cohesion: 0.12
Nodes (9): utapi, StatCard(), StatGrid(), StatGridProps, CustomUser, { handlers, auth, signIn, signOut }, next-auth, Session (+1 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "GrafikPeakHours.tsx"
Cohesion: 0.24
Nodes (5): amberGradient(), calcTicks(), GrafikPeakHours(), GrafikPendapatan(), GrafikPoint

### Community 22 - "optionalDependencies"
Cohesion: 0.40
Nodes (5): lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 24 - "prisma.ts"
Cohesion: 0.14
Nodes (9): forgotPasswordAction(), resetPasswordConfirmAction(), ForgotPasswordPage(), ResetPasswordPage(), sendResetPasswordEmail(), transporter, getIp(), JenisAksiLog (+1 more)

### Community 25 - "app/layout.tsx"
Cohesion: 0.22
Nodes (8): geistMono, geistMonoHeading, geistSans, inter, metadata, RootLayout(), Providers(), Footer()

### Community 26 - "export-laporan.ts"
Cohesion: 0.33
Nodes (10): centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport, MonthPDFData, renderRingkasanPDF() (+2 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "menu/page.tsx"
Cohesion: 0.12
Nodes (35): getMeja(), CartItem, aksiColors, aksiKategori, aksiLabels, JenisAksi, statusColors, statusLabels (+27 more)

### Community 29 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.42
Nodes (8): "detail_pesanan", "kategori_menu", "logs", "meja", "menu", "menu_foto", "pesanan", "users"

### Community 30 - "prisma"
Cohesion: 0.67
Nodes (3): prisma, prisma, prisma

### Community 31 - "DashboardCharts.tsx"
Cohesion: 0.09
Nodes (21): logoutAction(), ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah() (+13 more)

### Community 32 - "package.json"
Cohesion: 0.25
Nodes (7): name, overrides, effect, prisma, seed, private, version

### Community 33 - "card.tsx"
Cohesion: 0.26
Nodes (11): initialState, initialState, initialState, StatCardProps, Card(), CardAction(), CardDescription(), CardFooter() (+3 more)

### Community 34 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, seed-2025, start

### Community 35 - "seed-2025.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 36 - "seed-historical.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 37 - "print-struk.ts"
Cohesion: 0.17
Nodes (16): ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee(), centerText(), formatRupiah(), nomorPesanan() (+8 more)

### Community 39 - "PieMetode.tsx"
Cohesion: 0.40
Nodes (4): COLORS, formatRupiah(), PieMetode(), PieMetodeProps

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 44 - "meja.ts"
Cohesion: 0.17
Nodes (11): createMeja(), deleteMeja(), generateNomorMeja(), getNextNomorMeja(), kosongkanMeja(), MejaResult, updateMeja(), MejaPage() (+3 more)

### Community 45 - "pesanan.ts"
Cohesion: 0.09
Nodes (34): cancelExpiredOrders(), createPesanan(), CreatePesananData, CreatePesananItem, getActivePesananByToken(), getCustomerMenuData, getCustomerPaymentStatus(), getMejaByToken() (+26 more)

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "stok-bahan/page.tsx"
Cohesion: 0.14
Nodes (27): createStokBahan(), deleteStokBahan(), getRiwayatStok(), getStokBahanList(), hitungStatus(), requireOwner(), resetAllStokBahan(), restockBahan() (+19 more)

### Community 54 - "dependencies"
Cohesion: 0.22
Nodes (9): class-variance-authority, clsx, lucide-react, dependencies, class-variance-authority, clsx, lucide-react, uuid (+1 more)

### Community 56 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 58 - "✅ SELESAI"
Cohesion: 0.12
Nodes (16): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 8. Optimasi delay >5 detik (+8 more)

### Community 74 - "useOrdersRealtime"
Cohesion: 0.17
Nodes (12): getPaidOrdersForNotification(), getPesananBelumBayar(), DetailPesananPage(), DashboardRealtimeRefresh(), KasirOrderNotifications(), NotifOrder, PaidOrder, soundedConfirmedOrders (+4 more)

### Community 78 - "uploadthing.ts"
Cohesion: 0.28
Nodes (6): { GET, POST }, UploadButton, { useUploadThing }, f, OurFileRouter, utapi

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
Cohesion: 0.11
Nodes (17): 1. Product Overview, 2. Core Features, 3. Product Backlog (PBI), 4. Definition of Done, 5. Future Plans, Customer Self-Order, Dashboard Admin, Fitur Baru (+9 more)

### Community 121 - "KasirPage"
Cohesion: 0.16
Nodes (5): KasirPage(), getGrandTotal(), handleBatalFinal(), handleBayarTunaiStep(), handleMethodWarningProceed()

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
Cohesion: 0.44
Nodes (7): loginAction(), LoginPage(), checkRateLimit(), getKey(), RateLimitEntry, recordFailedAttempt(), resetRateLimit()

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

### Community 130 - "Tester Agent"
Cohesion: 0.18
Nodes (10): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+2 more)

### Community 131 - "ARCHITECTURE - Pringmoni"
Cohesion: 0.18
Nodes (10): 1. Architecture Overview, 2. Database Schema, 3. Route Structure, 4. Server Actions, 5. Auth Flow, 6. Real-time Flow, 7. Payment Flow, ARCHITECTURE - Pringmoni (+2 more)

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
Nodes (3): @opencode-ai/plugin, dependencies, @opencode-ai/plugin

### Community 153 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 154 - "proxy.ts"
Cohesion: 0.40
Nodes (5): config, getRouteRole(), proxy(), roleRouteAccess, RoleUser

## Knowledge Gaps
- **639 isolated node(s):** `statusColors`, `statusLabels`, `tipeMejaLabels`, `RoleUser`, `roleRouteAccess` (+634 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 782 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **58 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `card.tsx`, `page-loader.tsx`, `button.tsx`, `stok-bahan/page.tsx`, `app/layout.tsx`, `menu/page.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `MenuPage()` connect `menu.ts` to `menu/page.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `KasirPage()` connect `KasirPage` to `kasir/page.tsx`, `useOrdersRealtime`, `print-struk.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `statusColors`, `statusLabels`, `tipeMejaLabels` to the rest of the system?**
  _639 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `kasir/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13793103448275862 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.0797979797979798 - nodes in this community are weakly interconnected._
- **Should `page-loader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._