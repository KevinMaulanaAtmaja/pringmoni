# Graph Report - pringmoni-deck  (2026-11-14)

## Corpus Check
- 249 files · ~150,339 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .toml 4, (none) 2, .css 2)

## Summary
- 2798 nodes · 4638 edges · 167 communities (104 shown, 63 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a6f0b16b`
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
- Button
- dashboard.ts
- cn
- 20260408053831_init_all_schema/migration.sql
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- login.ts
- OWASP Top 10 Focus Areas
- Whitebox Testing Plan - Pringmoni
- dashboard/pesanan/page.tsx
- DashboardCharts.tsx
- GrafikPeakHours.tsx
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- menu.ts
- notifikasi.ts
- (customer)/[tokenMeja]/page.tsx
- reservasi/page.tsx
- menu-management.tsx
- meja/page.tsx
- scripts
- scripts.js
- optionalDependencies
- ref_next
- components/BankIcon.tsx
- PieMetode.tsx
- reservasi-customer.ts
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
- pindah-meja-sheet.tsx
- dependencies
- eslint.config.mjs
- stok-bahan.ts
- forgot-password.ts
- cloudinary
- Header.tsx
- seed-menu.ts
- actions/voucher.ts
- 20261017000001_add_jadwal_shift_dan_kas_keluar/migration.sql
- 20260930000001_add_shift_kasir/migration.sql
- actions/reservasi.ts
- DashboardClient.tsx
- Input
- users.ts
- print-struk.ts
- prisma-mock.ts
- @hugeicons/react
- 3. Product Backlog (PBI)
- next-auth
- PerbandinganCard.tsx
- jsqr
- ref_prisma_client
- next
- next.config.ts
- hitungRincianDp
- logs.ts
- prisma.ts
- GrafikMenu.tsx
- pusher-js
- class-variance-authority
- qrcode.react
- recharts
- tailwind-merge
- seed-historical.ts
- @uploadthing/react
- postcss.config.mjs
- seed-resep.ts
- zod
- notifikasi.ts
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
- ReservasiPage
- kasir/page.tsx
- Implementasi Reservasi (PBI-7.1)
- seed.ts
- testPrisma.ts
- uploadthing
- uuid
- prisma
- stok-bahan/page.tsx

## God Nodes (most connected - your core abstractions)
1. `-` - 882 edges
2. `cn()` - 84 edges
3. `createLog()` - 53 edges
4. `Button()` - 50 edges
5. `KasirPage()` - 46 edges
6. `ReservasiPage()` - 44 edges
7. `MejaPage()` - 34 edges
8. `Badge()` - 32 edges
9. `Input()` - 31 edges
10. `triggerPusher()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Modul 7: Reservasi & Operasional Meja` --references--> `getNotifikasiTerlambat()`  [INFERRED]
  .opencode/PRD.md → src/app/actions/notifikasi.ts
- `P0 - Stabilisasi kritis` --references--> `confirmKedatanganReservasi()`  [INFERRED]
  .opencode/RESERVASI_PLAN.md → src/app/actions/reservasi.ts
- `4. UI` --references--> `expireReservasi()`  [INFERRED]
  .opencode/RESERVASI_IMPLEMENTATION.md → src/app/actions/reservasi.ts
- `P2 - Operasional & UX kasir` --references--> `getReservasi()`  [INFERRED]
  .opencode/RESERVASI_PLAN.md → src/app/actions/reservasi.ts
- `5. Integrasi` --references--> `JenisAksiLog`  [INFERRED]
  .opencode/RESERVASI_IMPLEMENTATION.md → src/lib/log.ts

## Import Cycles
- None detected.

## Communities (167 total, 63 thin omitted)

### Community 1 - "seed-2025.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 2 - "actions/shift.ts"
Cohesion: 0.06
Nodes (74): ambilShiftRow(), autoCloseShifts(), bukaShift(), getDaftarKasir(), getDaftarKasirLengkap(), getJadwalShift(), getKasKeluarAktif(), getRiwayatShift() (+66 more)

### Community 3 - "page-loader.tsx"
Cohesion: 0.08
Nodes (27): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 8. Optimasi delay >5 detik (+19 more)

### Community 4 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node (+22 more)

### Community 5 - "uploadthing.ts"
Cohesion: 0.24
Nodes (6): { GET, POST }, UploadButton, f, ourFileRouter, OurFileRouter, utapi

### Community 6 - "src/types/index.ts"
Cohesion: 0.06
Nodes (33): AnalisisTambahan, CreateStokBahanInput, CreateUserInput, CustomerMenu, DashboardStats, DetailPesananItem, JenisPerubahanStok, KategoriBahan (+25 more)

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

### Community 12 - "Button"
Cohesion: 0.16
Nodes (27): initialState, metodeConfig, PesananData, StatusPesanan, PembayaranInfo, Menu, MenuCard(), MenuCardProps (+19 more)

### Community 13 - "dashboard.ts"
Cohesion: 0.17
Nodes (16): Modul 8: Notifikasi, QR & Backup, autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), getStaleOrders(), PaidStaleOrder, StaleOrder (+8 more)

### Community 14 - "cn"
Cohesion: 0.08
Nodes (26): MenuTabs(), badgeVariants, CardAction(), CardFooter(), DropdownMenuCheckboxItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+18 more)

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.15
Nodes (12): "detail_pesanan", "kategori_menu", "logs", "meja", "menu", "menu_foto", "pesanan", "users" (+4 more)

### Community 16 - "devDependencies"
Cohesion: 0.05
Nodes (41): agentation, agentation-mcp, babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, agentation, agentation-mcp (+33 more)

### Community 18 - "laporan.ts"
Cohesion: 0.28
Nodes (16): A. Optimasi laporan (belum dikerjakan), 🔜 Langkah Besok, getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir() (+8 more)

### Community 19 - "login.ts"
Cohesion: 0.21
Nodes (13): HasilValidasi, loginAction(), LoginState, STATE_AWAL, validasiKredensial(), LoginPage(), checkRateLimit(), getKey() (+5 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "Whitebox Testing Plan - Pringmoni"
Cohesion: 0.16
Nodes (18): cancelExpiredOrders(), CreatePesananData, CreatePesananItem, getActivePesananByToken(), getCustomerMenuData, getCustomerPaymentStatus(), getMejaByToken(), getMenusForCustomer() (+10 more)

### Community 22 - "dashboard/pesanan/page.tsx"
Cohesion: 0.13
Nodes (30): getPesananById(), getPesananForDashboard(), markItemDiantar(), aksiColors, aksiKategori, aksiLabels, JenisAksi, PesananDetailPage() (+22 more)

### Community 23 - "DashboardCharts.tsx"
Cohesion: 0.19
Nodes (12): ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah(), MejaData (+4 more)

### Community 24 - "GrafikPeakHours.tsx"
Cohesion: 0.23
Nodes (7): amberGradient(), calcTicks(), GrafikPeakHours(), TooltipPayload, GrafikPendapatan(), TooltipPayload, GrafikPoint

### Community 25 - "app/layout.tsx"
Cohesion: 0.15
Nodes (12): geistMono, geistMonoHeading, geistSans, inter, metadata, RootLayout(), Providers(), AgentationToolbar() (+4 more)

### Community 26 - "export-laporan.ts"
Cohesion: 0.36
Nodes (9): centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport, MonthPDFData, renderRingkasanPDF() (+1 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "menu.ts"
Cohesion: 0.06
Nodes (45): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+37 more)

### Community 29 - "notifikasi.ts"
Cohesion: 0.23
Nodes (7): ajukanRefund(), deleteRefundBukti(), RefundBuktiInput, RefundInfo, requireKasir(), ORDERS_CHANNEL, PESANAN_EVENTS

### Community 30 - "(customer)/[tokenMeja]/page.tsx"
Cohesion: 0.14
Nodes (24): createPesanan(), getStatusPesananAktifMeja(), getVoucherAktif(), validateVoucher(), CheckoutData, CheckoutPage(), CreatePesananResult, metodeOptions (+16 more)

### Community 31 - "reservasi/page.tsx"
Cohesion: 0.18
Nodes (9): ALASAN_CEPAT, MejaRow, MenuRow, METODE_DP_LABEL, ReservasiItemDraft, ReservasiItemRow, ReservasiRow, STATUS_LABEL (+1 more)

### Community 32 - "menu-management.tsx"
Cohesion: 0.09
Nodes (24): getReservasiCustomerByToken(), formatRupiah(), formatWaktu(), HasilReservasi, KategoriItem, LANGKAH, MejaInfo, MenuItem (+16 more)

### Community 33 - "meja/page.tsx"
Cohesion: 0.12
Nodes (24): 6. Komponen (shadcn/ui), ✅ SELESAI, 5. Integrasi, createMeja(), deleteMeja(), generateNomorMeja(), getMeja(), getNextNomorMeja() (+16 more)

### Community 34 - "scripts"
Cohesion: 0.11
Nodes (18): name, overrides, effect, prisma, seed, private, scripts, build (+10 more)

### Community 35 - "scripts.js"
Cohesion: 0.32
Nodes (14): addSimReplay(), advanceSimOnSlide(), beginSimStream(), beginSimThink(), escapeHtml(), finishSim(), go(), initSims() (+6 more)

### Community 36 - "optionalDependencies"
Cohesion: 0.40
Nodes (5): lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 37 - "ref_next"
Cohesion: 0.12
Nodes (13): getPaidOrdersForNotification(), getPesananBelumBayar(), DetailPesananPage(), DashboardRealtimeRefresh(), KasirOrderNotifications(), NotifOrder, PaidOrder, soundedConfirmedOrders (+5 more)

### Community 39 - "PieMetode.tsx"
Cohesion: 0.33
Nodes (5): COLORS, formatRupiah(), PieMetode(), PieMetodeProps, PieTooltipPayload

### Community 40 - "reservasi-customer.ts"
Cohesion: 0.17
Nodes (16): cekDanCatatRate(), cekStatusReservasi(), createReservasiCustomer(), CreateReservasiCustomerInput, getIp(), globalStore, ItemReservasiInput, normalisasiNoHp() (+8 more)

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "createLog"
Cohesion: 0.16
Nodes (25): accPesanan(), confirmQrisPayment(), getPembayaranInfo(), KasirPesananItem, konfirmasiPembayaran(), prosesPembayaranQRIS(), prosesPembayaranTunai(), selesaikanPesananKasir() (+17 more)

### Community 44 - "auth.ts"
Cohesion: 0.11
Nodes (11): utapi, { handlers, auth, signIn, signOut }, next-auth, User, AMBANG_SESI_AKTIF_MS, ambilVersiSesi(), cacheVersi, catatAktivitasSesi() (+3 more)

### Community 45 - "prisma"
Cohesion: 0.67
Nodes (3): prisma, prisma, prisma

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "pindah-meja-sheet.tsx"
Cohesion: 0.21
Nodes (13): getMejaTersediaPindah(), pindahMeja(), PindahMejaSheet(), handleOpenChange(), handlePindah(), PindahMejaSheetProps, SheetContent, SheetContentProps (+5 more)

### Community 54 - "dependencies"
Cohesion: 0.05
Nodes (39): bcryptjs, clsx, cn, exceljs, jspdf, lucide-react, nodemailer, dependencies (+31 more)

### Community 64 - "stok-bahan.ts"
Cohesion: 0.11
Nodes (29): ⏳ BELUM, ⏳ BELUM / MENUNGGU KEPUTUSAN, PROGRESS - Sesi 2026-11-04, PROGRESS - Sesi 2026-11-04 (Reservasi PBI-7.1), 🧹 Rampingkan graphify (2026-11-04), ✅ SELESAI (verifikasi & pembersihan), createStokBahan(), deleteStokBahan() (+21 more)

### Community 65 - "forgot-password.ts"
Cohesion: 0.47
Nodes (4): forgotPasswordAction(), ForgotPasswordPage(), sendResetPasswordEmail(), transporter

### Community 67 - "Header.tsx"
Cohesion: 0.18
Nodes (13): ALL_ROLES, config, getRouteRole(), isPublicRoute(), isRoleUser(), proxy(), PUBLIC_ROUTES, RESERVED_ROOT_SEGMENTS (+5 more)

### Community 69 - "seed-menu.ts"
Cohesion: 0.22
Nodes (9): KATEGORI_SEED, KategoriSeed, main(), MENU_CAFE_SEED, MENU_PAKET_SEED, MenuSeed, prisma, upsertKategori() (+1 more)

### Community 70 - "actions/voucher.ts"
Cohesion: 0.26
Nodes (14): createVoucher(), deleteVoucher(), getVoucherList(), HasilValidasiVoucher, normalisasiKode(), requireOwner(), setStatusVoucher(), updateVoucher() (+6 more)

### Community 73 - "actions/reservasi.ts"
Cohesion: 0.24
Nodes (13): 3. Server Actions, activeReservationStatuses(), ALLOWED_ROLES, cancelReservasi(), createReservasi(), CreateReservasiData, CreateReservasiItem, expireReservasi() (+5 more)

### Community 74 - "DashboardClient.tsx"
Cohesion: 0.26
Nodes (9): jamLabel(), rupiah(), ShiftSidebarStatus(), DashboardClient(), DashboardClientProps, SidebarMobile(), useMediaQuery(), Sidebar() (+1 more)

### Community 75 - "Input"
Cohesion: 0.19
Nodes (19): initialState, initialState, formatRupiah(), formatWaktu(), labelStatus(), StatusData, StatusReservasiPage(), CafeSpotlight() (+11 more)

### Community 76 - "users.ts"
Cohesion: 0.22
Nodes (12): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+4 more)

### Community 77 - "print-struk.ts"
Cohesion: 0.16
Nodes (16): ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee(), centerText(), formatRupiah(), nomorPesanan() (+8 more)

### Community 78 - "prisma-mock.ts"
Cohesion: 0.17
Nodes (12): LaporanPage(), ClockDisplay(), getServerSnapshot(), getSnapshot(), pad(), subscribe(), Header(), LogoutButton() (+4 more)

### Community 80 - "3. Product Backlog (PBI)"
Cohesion: 0.20
Nodes (10): 3. Product Backlog (PBI), Modul 10: Voucher & Diskon, Modul 1: User Management, Modul 2: Pesanan, Modul 3: Pembayaran, Modul 4: Sistem, Modul 5: Laporan & Analitik, Modul 6: Stok Bahan & Stok Harian (+2 more)

### Community 83 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 88 - "hitungRincianDp"
Cohesion: 0.39
Nodes (5): DP_PERSEN, DP_ROUNDING_UNIT, hitungDpNominal(), hitungRincianDp(), RincianDp

### Community 89 - "logs.ts"
Cohesion: 0.38
Nodes (5): getLogCount(), getLogs(), getUniqueUsers(), LogItem, LoggingPage()

### Community 91 - "GrafikMenu.tsx"
Cohesion: 0.40
Nodes (4): COLORS, GrafikMenu(), TooltipPayload, MenuTerlaris

### Community 98 - "seed-historical.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 102 - "seed-resep.ts"
Cohesion: 0.47
Nodes (5): butuhBumbu(), DRY_RUN, main(), prisma, upsertBahan()

### Community 108 - "notifikasi.ts"
Cohesion: 0.12
Nodes (22): awalHari(), getNotifikasiDashboard(), getNotifikasiTerlambat(), KIND_PER_ROLE, klasifikasiPesanan(), NotifikasiItem, NotifikasiKind, NotifikasiPesananTerlambat (+14 more)

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
Cohesion: 0.15
Nodes (12): 1. Product Overview, 2. Core Features, 4. Definition of Done, 5. Future Plans, Customer Self-Order, Dashboard Admin, Fitur Baru, Kasir System (+4 more)

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

### Community 162 - "ReservasiPage"
Cohesion: 0.14
Nodes (9): formatKategoriNama(), ReservasiPage(), handleConfirmCancel(), handleConfirmKedatangan(), handleCreateReservasi(), handleNextStep(), handleVerifikasiDp(), resetFormReservasi() (+1 more)

### Community 163 - "kasir/page.tsx"
Cohesion: 0.10
Nodes (18): batalkanPesananKasir(), generateQRISCode(), getPesananRiwayatKasir(), KasirPage(), getGrandTotal(), handleBatalFinal(), handleBayar(), handleBayarTunaiStep() (+10 more)

### Community 166 - "Implementasi Reservasi (PBI-7.1)"
Cohesion: 0.11
Nodes (18): 1. Ringkasan, 2. Perubahan Database, 4. UI, 6. Verifikasi, 7. Checklist Uji Manual, 8. Batasan yang Diketahui, 9. Reservasi Customer via QR (P3) — Rencana Eksekusi, Action baru (`src/app/actions/reservasi-customer.ts`) (+10 more)

### Community 176 - "prisma"
Cohesion: 0.13
Nodes (14): 1. Keputusan yang sudah disepakati, 2. Ruang Lingkup, 3. Desain Data v2, 4. Fase Pengerjaan, 5. Alur Meja, 6. Verifikasi, 7. Urutan Eksekusi & Commit, P0 - Stabilisasi kritis (+6 more)

### Community 179 - "stok-bahan/page.tsx"
Cohesion: 0.20
Nodes (10): BahanLogo(), BahanLogoConfig, emptyForm, getBahanLogoConfig(), jenisPerubahanLabels, kategoriLabels, satuanLabels, statusColors (+2 more)

## Knowledge Gaps
- **71 isolated node(s):** `zod`, `radix-ui`, `{ GET, POST }`, `@hugeicons/core-free-icons`, `@opencode-ai/plugin` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1833 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `menu-management.tsx`, `meja/page.tsx`, `page-loader.tsx`, `DashboardClient.tsx`, `Input`, `Button`, `notifikasi.ts`, `stok-bahan/page.tsx`, `pindah-meja-sheet.tsx`, `dashboard/pesanan/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `cn()` (e.g. with `6. Komponen (shadcn/ui)` and `✅ SELESAI`) actually correct?**
  _`cn()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `zod`, `radix-ui`, `{ GET, POST }` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `actions/shift.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05721168322794339 - nodes in this community are weakly interconnected._
- **Why does `ReservasiPage()` connect `ReservasiPage` to `meja/page.tsx`, `actions/reservasi.ts`, `createLog`, `Button`, `Input`, `cn`, `Whitebox Testing Plan - Pringmoni`, `dashboard/pesanan/page.tsx`, `hitungRincianDp`, `menu.ts`, `reservasi/page.tsx`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Should `page-loader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08097165991902834 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._