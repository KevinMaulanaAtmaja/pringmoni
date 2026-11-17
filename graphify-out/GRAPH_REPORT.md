# Graph Report - pringmoni  (2026-11-17)

## Corpus Check
- 260 files · ~317,441 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2016 nodes · 3867 edges · 209 communities (114 shown, 65 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `85047d25`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [kodeAkses]/page.tsx
- actions/shift.ts
- page-loader.tsx
- compilerOptions
- reservasi-customer.ts
- src/types/index.ts
- LaporanClient.tsx
- types/index.ts
- components.json
- 2. MVP (Minimum Viable Product)
- cn
- button.tsx
- pesanan.ts
- app/layout.tsx
- 20260408053831_init_all_schema/migration.sql
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- login.ts
- OWASP Top 10 Focus Areas
- dropdown-menu.tsx
- ReservasiCustomerPage
- DashboardCharts.tsx
- GrafikPeakHours.tsx
- actions/reservasi.ts
- export-laporan.ts
- Debugging Methodology
- menu.ts
- reservasi/page.tsx
- [tokenMeja]/page.tsx
- PieKategori.tsx
- notifikasi.ts
- ✅ SELESAI
- scripts
- scripts.js
- package.json
- components/BankIcon.tsx
- PieMetode.tsx
- prisma.ts
- 20260327055635_init/migration.sql
- security-scan.ts
- createLog
- stok-bahan/page.tsx
- optionalDependencies
- README.md
- notifications.ts
- parallel-guard.ts
- verification.ts
- category-icon.tsx
- Tester Agent
- dependencies
- eslint.config.mjs
- users.ts
- useOrdersRealtime
- cloudinary
- refund.ts
- logs.ts
- 20261017000001_add_jadwal_shift_dan_kas_keluar/migration.sql
- 20260930000001_add_shift_kasir/migration.sql
- "reservasi"
- ref_react
- KasirOrderNotifications.tsx
- print-struk.ts
- ReservasiPage
- prisma
- "reservasi"
- graphify.js
- StaleNotificationBell.tsx
- PerbandinganCard.tsx
- jsqr
- babel-plugin-react-compiler
- next
- ref_dotenv
- ref_uploadthing
- dashboard.ts
- KasirPage
- ref_prisma_client
- pusher-js
- seed-menu.ts
- CekReservasiPage
- clsx
- kasir/page.tsx
- cn
- exceljs
- postcss.config.mjs
- jspdf
- uploadthing.ts
- lucide-react
- nodemailer
- zod
- stok-bahan.ts
- pg
- radix-ui
- @prisma/adapter-pg
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
- 20261117000001_add_pengaturan_tabel/migration.sql
- PBIs (Product Backlog Items)
- Security Best Practices
- Backend Developer Agent
- Phase 2: Multi-Perspective Analysis
- vercel.json
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
- @prisma/client
- shadcn
- pusher
- qrcode
- @radix-ui/react-dialog
- react
- react-dom
- sharp
- tw-animate-css
- xlsx
- GrafikMenu.tsx
- Implementasi Reservasi (PBI-7.1)
- eslint
- "reservasi"
- eslint-config-next
- uploadthing
- uuid
- @hugeicons/react
- next-auth
- 8. Rencana: Pengaturan Jam Reservasi oleh Owner
- qrcode.react
- recharts
- @uploadthing/react
- @tailwindcss/postcss
- @testing-library/jest-dom
- @testing-library/react
- tsx
- @types/node
- @types/nodemailer
- @types/react
- @types/react-dom
- typescript
- PROGRESS - Sesi 2026-09-02
- PROGRESS.md
- auth.ts
- seed-2025.ts
- seed-historical.ts
- seed-resep.ts
- PROGRESS - Sesi 2026-11-17 (Status awal reservasi customer)
- PROGRESS - Sesi 2026-11-17 (Feedback halaman Reservasi Berhasil)
- PROGRESS - Sesi 2026-11-17 (Penandaan Status Meja + QR Reservasi)
- PROGRESS - Sesi 2026-11-04
- Sesi feedback #2 /reservasi/PRINGSEWU26
- PROGRESS - Sesi 2026-11-17 (Akses kasir /dashboard/reservasi)
- PROGRESS - Sesi 2026-11-15 (Link Reservasi Umum + Window 7 Hari)

## God Nodes (most connected - your core abstractions)
1. `cn()` - 82 edges
2. `createLog()` - 53 edges
3. `Button()` - 36 edges
4. `triggerPusher()` - 30 edges
5. `ReservasiPage()` - 26 edges
6. `KasirPage()` - 23 edges
7. `Badge()` - 23 edges
8. `Input()` - 23 edges
9. `Card()` - 22 edges
10. `CardContent()` - 21 edges

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

## Communities (209 total, 65 thin omitted)

### Community 1 - "[kodeAkses]/page.tsx"
Cohesion: 0.10
Nodes (27): ref_lucide_react, MejaTersediaPindah, LANGKAH, MejaInfo, MenuItem, PERIODE_RESERVASI, SARAN_CATATAN, VoucherItem (+19 more)

### Community 2 - "actions/shift.ts"
Cohesion: 0.06
Nodes (74): ambilShiftRow(), autoCloseShifts(), bukaShift(), getDaftarKasir(), getDaftarKasirLengkap(), getJadwalShift(), getKasKeluarAktif(), getRiwayatShift() (+66 more)

### Community 4 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node (+22 more)

### Community 5 - "reservasi-customer.ts"
Cohesion: 0.18
Nodes (17): getMenusForCustomer(), cekDanCatatRate(), cekStatusReservasi(), createReservasiCustomer(), CreateReservasiCustomerInput, getIp(), getReservasiCustomer(), globalStore (+9 more)

### Community 6 - "src/types/index.ts"
Cohesion: 0.05
Nodes (35): AnalisisTambahan, CreateStokBahanInput, CreateUserInput, DashboardStats, DetailPesananItem, JenisPerubahanStok, KategoriBahan, KategoriMenu (+27 more)

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

### Community 11 - "cn"
Cohesion: 0.08
Nodes (38): ref_class_variance_authority, ref_clsx, ref_hugeicons_core_free_icons, ref_hugeicons_react, ref_tailwind_merge, getMeja(), MenuWithKategori, CartItem (+30 more)

### Community 12 - "button.tsx"
Cohesion: 0.13
Nodes (27): ref_radix_ui, metodeConfig, PesananData, StatusPesanan, PembayaranInfo, Menu, MenuCardProps, MenuFoto (+19 more)

### Community 13 - "pesanan.ts"
Cohesion: 0.16
Nodes (18): cancelExpiredOrders(), CreatePesananData, CreatePesananItem, getCustomerPaymentStatus(), getPesananById(), getPesananForCheckout(), getPesananForDashboard(), konfirmasiPembayaranCustomer() (+10 more)

### Community 14 - "app/layout.tsx"
Cohesion: 0.12
Nodes (16): nextConfig, ref_agentation, ref_next, src_app_globals, geistMono, geistMonoHeading, geistSans, inter (+8 more)

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.16
Nodes (14): "detail_pesanan", "kategori_menu", "logs", "meja", "menu", "menu_foto", "pesanan", "users" (+6 more)

### Community 16 - "devDependencies"
Cohesion: 0.12
Nodes (17): agentation, agentation-mcp, devDependencies, agentation, agentation-mcp, tailwindcss, @testing-library/user-event, ts-node (+9 more)

### Community 18 - "laporan.ts"
Cohesion: 0.32
Nodes (14): getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir(), getLaporanKategori(), getLaporanMenuTerlaris() (+6 more)

### Community 19 - "login.ts"
Cohesion: 0.08
Nodes (35): ref_vitest, HasilValidasi, loginAction(), LoginState, STATE_AWAL, validasiKredensial(), LoginPage(), checkRateLimit() (+27 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "dropdown-menu.tsx"
Cohesion: 0.17
Nodes (7): DropdownMenuCheckboxItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent(), DropdownMenuSubTrigger()

### Community 22 - "ReservasiCustomerPage"
Cohesion: 0.11
Nodes (26): formatRupiah(), formatTanggalPanjang(), formatWaktu(), pad2(), ReservasiCustomerPage(), lanjut(), pilihTanggal(), unduhQris() (+18 more)

### Community 23 - "DashboardCharts.tsx"
Cohesion: 0.19
Nodes (12): ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah(), MejaData (+4 more)

### Community 24 - "GrafikPeakHours.tsx"
Cohesion: 0.23
Nodes (7): amberGradient(), calcTicks(), GrafikPeakHours(), TooltipPayload, GrafikPendapatan(), TooltipPayload, GrafikPoint

### Community 25 - "actions/reservasi.ts"
Cohesion: 0.17
Nodes (18): activeReservationStatuses(), ALLOWED_ROLES, cancelReservasi(), confirmKedatanganReservasi(), createReservasi(), CreateReservasiData, CreateReservasiItem, expireReservasi() (+10 more)

### Community 26 - "export-laporan.ts"
Cohesion: 0.31
Nodes (10): ref_jspdf, centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport, MonthPDFData (+2 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "menu.ts"
Cohesion: 0.08
Nodes (35): applyStokHarian(), createKategori(), createMenu(), CreateMenuInput, deleteKategori(), deleteMenu(), deleteAllMenuFotos(), deleteMenuFoto() (+27 more)

### Community 29 - "reservasi/page.tsx"
Cohesion: 0.20
Nodes (9): ALASAN_CEPAT, MejaRow, MenuRow, METODE_DP_LABEL, ReservasiItemDraft, ReservasiItemRow, ReservasiRow, STATUS_LABEL (+1 more)

### Community 30 - "[tokenMeja]/page.tsx"
Cohesion: 0.06
Nodes (52): ref_jsqr, createPesanan(), getActivePesananByToken(), getCustomerMenuData, getMejaByToken(), getMejaTersediaPindah(), getStatusPesananAktifMeja(), updateNamaPelanggan() (+44 more)

### Community 31 - "PieKategori.tsx"
Cohesion: 0.33
Nodes (4): CATEGORY_COLORS, PieKategori(), PieTooltipPayload, KategoriAnalisis

### Community 32 - "notifikasi.ts"
Cohesion: 0.22
Nodes (12): awalHari(), getNotifikasiDashboard(), getNotifikasiTerlambat(), KIND_PER_ROLE, klasifikasiPesanan(), NotifikasiPesananTerlambat, PesananNotifikasi, PRIORITAS_KIND (+4 more)

### Community 33 - "✅ SELESAI"
Cohesion: 0.20
Nodes (10): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 8. Optimasi delay >5 detik (+2 more)

### Community 34 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, graph:update, lint, seed-2025, seed-menu, seed-resep (+3 more)

### Community 35 - "scripts.js"
Cohesion: 0.32
Nodes (14): addSimReplay(), advanceSimOnSlide(), beginSimStream(), beginSimThink(), escapeHtml(), finishSim(), go(), initSims() (+6 more)

### Community 36 - "package.json"
Cohesion: 0.25
Nodes (7): name, overrides, effect, prisma, seed, private, version

### Community 39 - "PieMetode.tsx"
Cohesion: 0.33
Nodes (5): COLORS, formatRupiah(), PieMetode(), PieMetodeProps, PieTooltipPayload

### Community 40 - "prisma.ts"
Cohesion: 0.13
Nodes (10): ref_crypto, forgotPasswordAction(), kosongkanMeja(), MejaResult, ForgotPasswordPage(), sendResetPasswordEmail(), transporter, getIp() (+2 more)

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "createLog"
Cohesion: 0.19
Nodes (24): accPesanan(), batalkanPesananKasir(), confirmQrisPayment(), generateQRISCode(), getPembayaranInfo(), KasirPesananItem, konfirmasiPembayaran(), prosesPembayaranQRIS() (+16 more)

### Community 44 - "stok-bahan/page.tsx"
Cohesion: 0.17
Nodes (12): StokBahanWithType, BahanLogo(), BahanLogoConfig, emptyForm, getBahanLogoConfig(), jenisPerubahanLabels, kategoriLabels, satuanLabels (+4 more)

### Community 45 - "optionalDependencies"
Cohesion: 0.40
Nodes (5): lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "Tester Agent"
Cohesion: 0.18
Nodes (10): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+2 more)

### Community 54 - "dependencies"
Cohesion: 0.22
Nodes (9): bcryptjs, class-variance-authority, dependencies, bcryptjs, class-variance-authority, @react-pdf/renderer, tailwind-merge, @react-pdf/renderer (+1 more)

### Community 64 - "users.ts"
Cohesion: 0.22
Nodes (12): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+4 more)

### Community 65 - "useOrdersRealtime"
Cohesion: 0.50
Nodes (4): getPesananByTokenAndId(), DetailPesananPage(), DashboardRealtimeRefresh(), useOrdersRealtime()

### Community 67 - "refund.ts"
Cohesion: 0.27
Nodes (7): ref_pusher, deleteRefundBukti(), RefundBuktiInput, RefundInfo, requireKasir(), ORDERS_CHANNEL, PESANAN_EVENTS

### Community 69 - "logs.ts"
Cohesion: 0.38
Nodes (5): getLogCount(), getLogs(), getUniqueUsers(), LogItem, LoggingPage()

### Community 75 - "ref_react"
Cohesion: 0.17
Nodes (17): ref_react, resetPasswordConfirmAction(), initialState, initialState, initialState, ResetPasswordPage(), ReservasiTampilan, CafeSpotlightProps (+9 more)

### Community 76 - "KasirOrderNotifications.tsx"
Cohesion: 0.21
Nodes (10): getPaidOrdersForNotification(), getPesananBelumBayar(), KasirOrderNotifications(), NotifOrder, PaidOrder, soundedConfirmedOrders, soundedPaidOrders, ToastData (+2 more)

### Community 77 - "print-struk.ts"
Cohesion: 0.18
Nodes (15): ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee(), centerText(), formatRupiah(), nomorPesanan() (+7 more)

### Community 78 - "ReservasiPage"
Cohesion: 0.05
Nodes (32): createMeja(), deleteMeja(), generateNomorMeja(), getNextNomorMeja(), updateMeja(), LaporanPage(), getQrFrameClass(), MejaPage() (+24 more)

### Community 79 - "prisma"
Cohesion: 0.67
Nodes (3): prisma, prisma, prisma

### Community 81 - "graphify.js"
Cohesion: 0.32
Nodes (6): hasGraph(), location, IMPORTANT: keep the reminder string free of backticks and $(...) constructs., server(), setup(), ref_path

### Community 82 - "StaleNotificationBell.tsx"
Cohesion: 0.19
Nodes (13): NotifikasiItem, NotifikasiKind, buildSubtext(), formatDurasi(), formatRupiah(), KIND_META, KindMeta, labelStatus() (+5 more)

### Community 83 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 89 - "dashboard.ts"
Cohesion: 0.26
Nodes (9): autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), PaidStaleOrder, DashboardPage(), StatCard(), StatGrid() (+1 more)

### Community 90 - "KasirPage"
Cohesion: 0.15
Nodes (6): getPesananRiwayatKasir(), KasirPage(), getGrandTotal(), handleBatalFinal(), handleBayarTunaiStep(), handleMethodWarningProceed()

### Community 91 - "ref_prisma_client"
Cohesion: 0.18
Nodes (5): prisma, prisma, ref_prisma_client, p, p

### Community 93 - "seed-menu.ts"
Cohesion: 0.24
Nodes (9): KATEGORI_SEED, KategoriSeed, main(), MENU_CAFE_SEED, MENU_PAKET_SEED, MenuSeed, prisma, upsertKategori() (+1 more)

### Community 94 - "CekReservasiPage"
Cohesion: 0.29
Nodes (5): CekReservasiPage(), handleCek(), formatRupiah(), formatWaktu(), labelStatus()

### Community 96 - "kasir/page.tsx"
Cohesion: 0.09
Nodes (40): ref_pusher_js, ref_qrcode_react, metodeColors, metodeIcons, metodeLabels, Pesanan, PesananItem, statusBayarColors (+32 more)

### Community 104 - "uploadthing.ts"
Cohesion: 0.40
Nodes (4): { GET, POST }, f, OurFileRouter, utapi

### Community 108 - "stok-bahan.ts"
Cohesion: 0.19
Nodes (21): createStokBahan(), deleteStokBahan(), getBahanDapurList(), getRiwayatStok(), getStokBahanList(), hapusResepBahan(), hitungStatus(), requireOwner() (+13 more)

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

### Community 165 - "GrafikMenu.tsx"
Cohesion: 0.40
Nodes (4): COLORS, GrafikMenu(), TooltipPayload, MenuTerlaris

### Community 166 - "Implementasi Reservasi (PBI-7.1)"
Cohesion: 0.10
Nodes (19): 1. Ringkasan, 2. Perubahan Database, 3. Server Actions, 4. UI, 5. Integrasi, 6. Verifikasi, 7. Checklist Uji Manual, 8. Batasan yang Diketahui (+11 more)

### Community 176 - "8. Rencana: Pengaturan Jam Reservasi oleh Owner"
Cohesion: 0.08
Nodes (23): 1. Keputusan yang sudah disepakati, 2. Ruang Lingkup, 3. Desain Data v2, 4. Fase Pengerjaan, 5. Alur Meja, 6. Verifikasi, 7. Urutan Eksekusi & Commit, 8.1 Keputusan yang sudah disepakati (+15 more)

### Community 198 - "PROGRESS - Sesi 2026-09-02"
Cohesion: 0.20
Nodes (10): A. Optimasi laporan (belum dikerjakan), B. Verifikasi (belum dijalankan), ⏳ BELUM SELESAI, File diubah, 📁 File yang Diubah (sesi ini), 🔜 Langkah Besok, PROGRESS - Sesi 2026-09-02, Selesai (+2 more)

### Community 199 - "PROGRESS.md"
Cohesion: 0.20
Nodes (9): BELUM, ⏳ BELUM, PROGRESS - Sesi 2026-11-04 (Reservasi PBI-7.1), PROGRESS - Sesi 2026-11-14 (Jadwal Reservasi Tetap + Rencana Owner Settings), PROGRESS - Sesi 2026-11-17 (Badge status meja), SELESAI, ✅ SELESAI, SELESAI (+1 more)

### Community 200 - "auth.ts"
Cohesion: 0.10
Nodes (17): ref_next_auth, logoutAction(), getPengaturan(), setPengaturan(), updateExpiryJam(), utapi, PengaturanPage(), src_lib_auth_auth (+9 more)

### Community 201 - "seed-2025.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 202 - "seed-historical.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 203 - "seed-resep.ts"
Cohesion: 0.47
Nodes (5): butuhBumbu(), DRY_RUN, main(), prisma, upsertBahan()

### Community 204 - "PROGRESS - Sesi 2026-11-17 (Status awal reservasi customer)"
Cohesion: 0.67
Nodes (3): PROGRESS - Sesi 2026-11-17 (Status awal reservasi customer), SELESAI, VERIFIKASI

### Community 205 - "PROGRESS - Sesi 2026-11-17 (Feedback halaman Reservasi Berhasil)"
Cohesion: 0.50
Nodes (4): BELUM, PROGRESS - Sesi 2026-11-17 (Feedback halaman Reservasi Berhasil), SELESAI, VERIFIKASI

### Community 206 - "PROGRESS - Sesi 2026-11-17 (Penandaan Status Meja + QR Reservasi)"
Cohesion: 0.50
Nodes (4): BELUM, PROGRESS - Sesi 2026-11-17 (Penandaan Status Meja + QR Reservasi), SELESAI, VERIFIKASI

### Community 207 - "PROGRESS - Sesi 2026-11-04"
Cohesion: 0.50
Nodes (4): ⏳ BELUM / MENUNGGU KEPUTUSAN, PROGRESS - Sesi 2026-11-04, 🧹 Rampingkan graphify (2026-11-04), ✅ SELESAI (verifikasi & pembersihan)

### Community 208 - "Sesi feedback #2 /reservasi/PRINGSEWU26"
Cohesion: 0.40
Nodes (5): File diubah, Follow-up: Meja Bebas selectable, Selesai, Sesi feedback #2 /reservasi/PRINGSEWU26, Verifikasi

### Community 209 - "PROGRESS - Sesi 2026-11-17 (Akses kasir /dashboard/reservasi)"
Cohesion: 0.50
Nodes (4): BELUM, PROGRESS - Sesi 2026-11-17 (Akses kasir /dashboard/reservasi), SELESAI, VERIFIKASI

### Community 210 - "PROGRESS - Sesi 2026-11-15 (Link Reservasi Umum + Window 7 Hari)"
Cohesion: 0.67
Nodes (3): BELUM, PROGRESS - Sesi 2026-11-15 (Link Reservasi Umum + Window 7 Hari), SELESAI

## Knowledge Gaps
- **824 isolated node(s):** `$schema`, `@opencode-ai/plugin`, `recentTaskCalls`, `SENSITIVE_FILES`, `editedFiles` (+819 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1033 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `kasir/page.tsx`, `[kodeAkses]/page.tsx`, `page-loader.tsx`, `ref_react`, `stok-bahan/page.tsx`, `button.tsx`, `app/layout.tsx`, `StaleNotificationBell.tsx`, `dropdown-menu.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `createLog()` connect `createLog` to `notifikasi.ts`, `actions/shift.ts`, `refund.ts`, `prisma.ts`, `auth.ts`, `ref_react`, `pesanan.ts`, `login.ts`, `actions/reservasi.ts`, `dashboard.ts`, `menu.ts`, `[tokenMeja]/page.tsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `ReservasiPage()` connect `ReservasiPage` to `actions/reservasi.ts`, `reservasi-customer.ts`, `menu.ts`, `reservasi/page.tsx`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `$schema`, `@opencode-ai/plugin`, `recentTaskCalls` to the rest of the system?**
  _824 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `[kodeAkses]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09682539682539683 - nodes in this community are weakly interconnected._
- **Should `actions/shift.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05510388437217705 - nodes in this community are weakly interconnected._
- **Should `page-loader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._