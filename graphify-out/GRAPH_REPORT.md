# Graph Report - pringmoni-deck  (2026-11-18)

## Corpus Check
- 297 files · ~191,902 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .toml 4, (none) 2, .css 2)

## Summary
- 3074 nodes · 5156 edges · 184 communities (136 shown, 48 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ee5dd1ea`
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
- reservasi/page.tsx
- 20260408053831_init_all_schema/migration.sql
- devDependencies
- ui/BankIcon.tsx
- laporan.ts
- auth.ts
- OWASP Top 10 Focus Areas
- stok-bahan/page.tsx
- auth-mock.ts
- DashboardCharts.tsx
- GrafikPeakHours.tsx
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- menu.ts
- react
- testing/page.tsx
- PROGRESS.md
- optionalDependencies
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
- proxy.ts
- shift/page.tsx
- README.md
- notifications.ts
- parallel-guard.ts
- verification.ts
- category-icon.tsx
- pindah-meja-sheet.tsx
- dependencies
- eslint.config.mjs
- stok-bahan.test.ts
- vitest
- db-test
- DashboardClient.tsx
- lib/shift.ts
- PerbandinganCard.tsx
- 20261017000001_add_jadwal_shift_dan_kas_keluar/migration.sql
- 20260930000001_add_shift_kasir/migration.sql
- refund.ts
- login.ts
- card.tsx
- users.test.ts
- print-struk.ts
- actions/voucher.ts
- export-laporan.test.ts
- stok-bahan/page.tsx
- fee.ts
- PrismaMock
- proxy.ts
- prisma-mock.ts
- UsersPage
- RoleUser
- next.config.ts
- checkout/page.tsx
- [tokenMeja]/page.tsx
- cart-sheet.tsx
- Database Test (Docker) — Setup & Cara Menjalankan
- include
- PieKategori.tsx
- PROGRESS - Sesi 2026-11-08 (Rencana integration testing)
- vitest
- test-db.mjs
- 20261113000001_reservasi_dp_bukti/migration.sql
- seed-historical.ts
- ClockDisplay.tsx
- postcss.config.mjs
- notifikasi.ts
- seed-resep.ts
- PROGRESS - Sesi 2026-11-04
- @prisma/adapter-pg@^5.22.0
- kategori-icon.ts
- TC-03 — Kelola Menu (`createMenu`)
- cart-sheet.tsx
- PROGRESS - Sesi 2026-11-10 (Latihan uji operasi DB di file terpisah)
- integration/tc05-confirm-qris-payment.test.ts
- { GET, POST }
- Demo Test Case — Level Menengah (5 TC)
- Refactorer Agent
- Test Architect Agent
- Orchestrator Agent (Single-Worker Mode)
- Design System - Pringmoni (UI & Visual Design)
- Code Reviewer Agent
- 3. Product Backlog (PBI)
- 2. Baseline Library & Kondisi Saat Ini
- Pringmoni - Resto POS & Monitoring
- Documentation Types
- OWASP Top 10 Analysis
- TC-02 — Kelola Meja (`createMeja`)
- PBIs (Product Backlog Items)
- Security Best Practices
- Backend Developer Agent
- Phase 2: Multi-Perspective Analysis
- PROGRESS - Sesi 2026-11-05 (Whitebox Testing S2)
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
- TC-05 — Pembayaran QRIS (`confirmQrisPayment`)
- prisma
- delete/route.ts
- PROGRESS - Sesi 2026-11-05 (Whitebox Testing S3-S6)
- 6. Strategi Mock & Fixture
- 8. Konfigurasi Coverage & Perintah
- qrcode@^1.5.4
- qrcode.react@^4.2.0
- ReservasiPage
- 3. Strategi Whitebox
- shadcn@^4.1.1
- PROGRESS - Sesi 2026-11-05 (Whitebox Testing S1)
- Tester Agent
- seed.ts
- sharp@^0.34.5
- PROGRESS - Sesi 2026-11-05 (Whitebox Testing S0)
- testPrisma.ts
- PROGRESS - Sesi 2026-11-06 (Whitebox Testing S1-S3 lanjutan)
- uuid@^14.0.0
- jspdf@^4.2.1
- cloudinary@^2.10.0

## God Nodes (most connected - your core abstractions)
1. `-` - 882 edges
2. `cn()` - 82 edges
3. `createLog()` - 52 edges
4. `Button()` - 39 edges
5. `PrismaMock` - 28 edges
6. `triggerPusher()` - 26 edges
7. `PageLoader()` - 25 edges
8. `sessionUntuk()` - 25 edges
9. `Card()` - 24 edges
10. `KasirPage()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Penjelasan Assertion Integration` --references--> `validateVoucher()`  [INFERRED]
  docs/test-cases/medium/tc04-voucher.md → src/app/actions/voucher.ts
- `3. Delay navigasi halaman (loading.tsx)` --references--> `PageLoader()`  [INFERRED]
  .opencode/PROGRESS.md → src/components/ui/page-loader.tsx
- `2. Status Saat Ini` --references--> `confirmQrisPayment()`  [INFERRED]
  .opencode/INTEGRATION_TESTING_PLAN.md → src/app/actions/kasir.ts
- `Penjelasan Assertion Unit` --references--> `createLog()`  [INFERRED]
  docs/test-cases/medium/tc04-voucher.md → src/lib/log.ts
- `Selesai` --references--> `pindahMeja()`  [INFERRED]
  .opencode/PROGRESS.md → src/app/actions/pesanan.ts

## Import Cycles
- None detected.

## Communities (184 total, 48 thin omitted)

### Community 1 - "seed-2025.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 2 - "actions/shift.ts"
Cohesion: 0.11
Nodes (37): Selesai, ambilShiftRow(), getDaftarKasir(), getDaftarKasirLengkap(), getJadwalShift(), getRiwayatShift(), getSisaPesanan(), hapusJadwalShift() (+29 more)

### Community 3 - "page-loader.tsx"
Cohesion: 0.15
Nodes (13): Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading() (+5 more)

### Community 4 - "compilerOptions"
Cohesion: 0.10
Nodes (21): dom, dom.iterable, esnext, node, compilerOptions, allowJs, esModuleInterop, incremental (+13 more)

### Community 5 - "uploadthing.ts"
Cohesion: 0.40
Nodes (4): { GET, POST }, f, OurFileRouter, utapi

### Community 6 - "src/types/index.ts"
Cohesion: 0.05
Nodes (35): AnalisisTambahan, BandingData, CreateStokBahanInput, CreateUserInput, DashboardStats, DetailPesananItem, JenisPerubahanStok, KasKeluarItem (+27 more)

### Community 7 - "LaporanClient.tsx"
Cohesion: 0.13
Nodes (16): currentYear, dateToWeekStr(), getWeekRange(), LaporanClient(), LaporanKasirItem, loadingState, TabBanding(), TabBulanan() (+8 more)

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
Cohesion: 0.17
Nodes (26): initialState, metodeConfig, PesananData, StatusPesanan, PembayaranInfo, statusColors, statusLabels, tipeMejaLabels (+18 more)

### Community 13 - "dashboard.ts"
Cohesion: 0.28
Nodes (12): autoCancelStaleUnpaid(), cekAutoCancelOtomatis(), getDashboardCharts(), getDashboardStats(), getPaidStaleWarnings(), getStaleOrders(), PaidStaleOrder, StaleOrder (+4 more)

### Community 14 - "reservasi/page.tsx"
Cohesion: 0.09
Nodes (28): radix-ui, MenuTabs(), buildSubtext(), formatDurasi(), formatRupiah(), KIND_META, KindMeta, labelStatus() (+20 more)

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.18
Nodes (11): "detail_pesanan", "kategori_menu", "logs", "meja", "menu", "menu_foto", "pesanan", "users" (+3 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (41): devDependencies, agentation-mcp@^1.3.2, babel-plugin-react-compiler@1.0.0, eslint@^9, eslint-config-next@16.2.1, tailwindcss@^4, @tailwindcss/postcss@^4, @testing-library/jest-dom@^6.9.1 (+33 more)

### Community 18 - "laporan.ts"
Cohesion: 0.26
Nodes (17): A. Optimasi laporan (belum dikerjakan), 🔜 Langkah Besok, getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir() (+9 more)

### Community 19 - "auth.ts"
Cohesion: 0.13
Nodes (11): { handlers, auth, signIn, signOut }, next-auth, User, AMBANG_SESI_AKTIF_MS, ambilVersiSesi(), cacheVersi, catatAktivitasSesi(), catatVersiSesi() (+3 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "stok-bahan/page.tsx"
Cohesion: 0.15
Nodes (12): 10. Risiko & Mitigasi, 12. Riwayat Perubahan, 1. Tujuan & Ruang Lingkup, 4.1 Critical (11 TC) — Path + Branch + Statement, 4.3 Medium (17 TC) — Statement, 4. Inventaris Test Case (42 TC), 5. Rencana File Test, 9. Definition of Done (+4 more)

### Community 22 - "auth-mock.ts"
Cohesion: 0.33
Nodes (8): clearLogs(), getLogCount(), getLogs(), getUniqueUsers(), LogItem, LoggingPage(), { authMock }, waktu

### Community 23 - "DashboardCharts.tsx"
Cohesion: 0.19
Nodes (12): ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah(), MejaData (+4 more)

### Community 24 - "GrafikPeakHours.tsx"
Cohesion: 0.23
Nodes (7): amberGradient(), calcTicks(), GrafikPeakHours(), TooltipPayload, GrafikPendapatan(), TooltipPayload, GrafikPoint

### Community 25 - "app/layout.tsx"
Cohesion: 0.14
Nodes (14): agentation@^3.1.2, agentation, geistMono, geistMonoHeading, geistSans, inter, metadata, RootLayout() (+6 more)

### Community 26 - "export-laporan.ts"
Cohesion: 0.20
Nodes (13): COLORS, GrafikMenu(), TooltipPayload, centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan() (+5 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "menu.ts"
Cohesion: 0.05
Nodes (52): KATEGORI_SEED, KategoriSeed, main(), MENU_CAFE_SEED, MENU_PAKET_SEED, MenuSeed, prisma, upsertKategori() (+44 more)

### Community 29 - "react"
Cohesion: 0.24
Nodes (7): next, react, getPesananByTokenAndId(), DetailPesananPage(), DashboardRealtimeRefresh(), PESANAN_EVENTS, useOrdersRealtime()

### Community 30 - "testing/page.tsx"
Cohesion: 0.09
Nodes (31): BarisTest(), formatDurasi(), formatWaktu(), gayaStatusFase, gayaStatusTest, labelStatusFase, labelStatusTest, TestingPage() (+23 more)

### Community 31 - "PROGRESS.md"
Cohesion: 0.40
Nodes (4): B. Verifikasi (belum dijalankan), ⏳ BELUM SELESAI, 📁 File yang Diubah (sesi ini), PROGRESS - Sesi 2026-09-02

### Community 32 - "optionalDependencies"
Cohesion: 0.40
Nodes (5): optionalDependencies, lightningcss-win32-x64-msvc@^1.32.0, @tailwindcss/oxide-win32-x64-msvc@^4.2.4, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 33 - "meja.ts"
Cohesion: 0.09
Nodes (24): Konsep Dasar (mengapa ada `describe`, `it`, `expect`, mock), Penjelasan Test Operasi Database — `meja-operasi.test.ts`, Ringkasan, Test Case 1 — `getMeja` : menolak tanpa session, Test Case 2 — `getMeja` : mengembalikan daftar meja aktif, Test Case 3 — `createMeja` : membuat meja dengan token unik, Test Case 4 — `createMeja` : menolak kapasitas, Test Case 5 — `kosongkanMeja` : tidak membatalkan pesanan (+16 more)

### Community 34 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, dev, graph:update, lint, seed-2025, seed-menu, seed-resep (+10 more)

### Community 35 - "scripts.js"
Cohesion: 0.32
Nodes (14): addSimReplay(), advanceSimOnSlide(), beginSimStream(), beginSimThink(), escapeHtml(), finishSim(), go(), initSims() (+6 more)

### Community 36 - "pesanan.ts"
Cohesion: 0.09
Nodes (35): 5.5 Voucher (validasi -> dipakai di pesanan), 11. Progress Tracker, 7.2 Jalur paralel (opsional, target ~4 hari), 7. Fase Implementasi Dipercepat (7 Sesi Kerja), cancelExpiredOrders(), cancelPesanan(), createPesanan(), CreatePesananData (+27 more)

### Community 37 - "kasir/page.tsx"
Cohesion: 0.11
Nodes (21): metodeColors, metodeIcons, metodeLabels, Pesanan, PesananItem, statusBayarColors, statusBayarLabels, PesananDetail (+13 more)

### Community 39 - "PieMetode.tsx"
Cohesion: 0.33
Nodes (5): COLORS, formatRupiah(), PieMetode(), PieMetodeProps, PieTooltipPayload

### Community 40 - "KasirPage"
Cohesion: 0.13
Nodes (9): generateQRISCode(), KasirPage(), getGrandTotal(), handleBayar(), handleBayarTunaiStep(), handleMethodWarningProceed(), useShiftAktif(), getQrisStaticUrl() (+1 more)

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "createLog"
Cohesion: 0.09
Nodes (38): 5.1 Pesanan + Pembayaran (customer -> kasir), pusher@^5.3.3, pusher, accPesanan(), batalkanPesananKasir(), confirmQrisPayment(), getPembayaranInfo(), getPesananRiwayatKasir() (+30 more)

### Community 44 - "proxy.ts"
Cohesion: 0.20
Nodes (10): getPaidOrdersForNotification(), getPesananBelumBayar(), KasirOrderNotifications(), NotifOrder, PaidOrder, soundedConfirmedOrders, soundedPaidOrders, ToastData (+2 more)

### Community 45 - "shift/page.tsx"
Cohesion: 0.10
Nodes (37): 6. Komponen (shadcn/ui), @hugeicons/core-free-icons, @hugeicons/react, MenuWithKategori, CartItem, aksiColors, aksiKategori, aksiLabels (+29 more)

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "pindah-meja-sheet.tsx"
Cohesion: 0.21
Nodes (12): getMejaTersediaPindah(), MejaTersediaPindah, PindahMejaSheet(), handleOpenChange(), PindahMejaSheetProps, SheetContent, SheetContentProps, SheetDescription (+4 more)

### Community 54 - "dependencies"
Cohesion: 0.04
Nodes (46): dependencies, bcryptjs@^3.0.3, class-variance-authority@^0.7.1, clsx@^2.1.1, cn@^0.5.0, exceljs@^4.4.0, @hugeicons/core-free-icons@^4.0.0, @hugeicons/react@^1.1.6 (+38 more)

### Community 64 - "stok-bahan.test.ts"
Cohesion: 0.19
Nodes (23): createStokBahan(), deleteStokBahan(), getBahanDapurList(), getRiwayatStok(), getStokBahanList(), hapusResepBahan(), hitungStatus(), requireOwner() (+15 more)

### Community 65 - "vitest"
Cohesion: 0.12
Nodes (11): forgotPasswordAction(), resetPasswordConfirmAction(), resetPasswordAction(), ForgotPasswordPage(), ResetPasswordPage(), sendResetPasswordEmail(), transporter, globalForPrisma (+3 more)

### Community 66 - "db-test"
Cohesion: 0.08
Nodes (23): command, container_name, environment, healthcheck, image, ports, restart, shm_size (+15 more)

### Community 67 - "DashboardClient.tsx"
Cohesion: 0.10
Nodes (21): LaporanPage(), jamLabel(), rupiah(), ShiftSidebarStatus(), ClockDisplay(), getServerSnapshot(), getSnapshot(), pad() (+13 more)

### Community 69 - "lib/shift.ts"
Cohesion: 0.17
Nodes (29): 5.3 Shift (buka -> transaksi -> kas keluar -> tutup -> rekap), 6. Matriks Cakupan, 7.1 Detail per sesi, autoCloseShifts(), bukaShift(), getShiftAktif(), tambahKasKeluar(), tutupShift() (+21 more)

### Community 70 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 73 - "refund.ts"
Cohesion: 0.21
Nodes (11): 5.4 Refund (bayar -> ajukan refund + bukti), ajukanRefund(), deleteRefundBukti(), getRefundInfo(), requireKasir(), pesananFixture, orderKasir(), orderRiwayat() (+3 more)

### Community 74 - "login.ts"
Cohesion: 0.18
Nodes (13): HasilValidasi, loginAction(), LoginState, STATE_AWAL, validasiKredensial(), LoginPage(), checkRateLimit(), getKey() (+5 more)

### Community 75 - "card.tsx"
Cohesion: 0.17
Nodes (17): lucide-react, initialState, initialState, CheckoutData, CreatePesananResult, metodeOptions, CafeSpotlight(), CafeSpotlightProps (+9 more)

### Community 76 - "users.test.ts"
Cohesion: 0.20
Nodes (15): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+7 more)

### Community 77 - "print-struk.ts"
Cohesion: 0.22
Nodes (13): centerText(), formatRupiah(), nomorPesanan(), printStruk(), printStruk58(), renderAllPages(), renderDoc(), renderStruk() (+5 more)

### Community 78 - "actions/voucher.ts"
Cohesion: 0.12
Nodes (10): createLogNoSession(), sessionUntuk(), TestRole, TestSession, TestSessionUser, sessionUtil(), { authMock, createLogMock, triggerPusherMock }, SEKARANG (+2 more)

### Community 79 - "export-laporan.test.ts"
Cohesion: 0.13
Nodes (10): clickMock, createElementMock, createObjectUrlMock, excelState, FakeJsPDF, FakeWorkbook, FakeWorksheet, pdfState (+2 more)

### Community 80 - "stok-bahan/page.tsx"
Cohesion: 0.15
Nodes (16): StokBahanWithType, BahanLogo(), BahanLogoConfig, emptyForm, getBahanLogoConfig(), jenisPerubahanLabels, kategoriLabels, satuanLabels (+8 more)

### Community 81 - "fee.ts"
Cohesion: 0.42
Nodes (7): 4.2 High (14 TC) — Branch + Statement, ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee(), hitungExpiryMenit()

### Community 82 - "PrismaMock"
Cohesion: 0.12
Nodes (15): 1. Prinsip, 2. Status Saat Ini, 3. Prasyarat Eksekusi (nanti), 4. Helper & Isolasi, 5.2 Stok Dapur (pesanan selesai -> potong stok), 5. Rencana per Alur, 7. Definition of Done, 8. Risiko & Catatan (+7 more)

### Community 83 - "proxy.ts"
Cohesion: 0.18
Nodes (14): COOKIE_PERANGKAT, ALL_ROLES, config, getRouteRole(), isPublicRoute(), isRoleUser(), proxy(), PUBLIC_ROUTES (+6 more)

### Community 84 - "prisma-mock.ts"
Cohesion: 0.29
Nodes (6): createPrismaMock(), MockFunction, model(), PrismaModelMock, config, h

### Community 85 - "UsersPage"
Cohesion: 0.38
Nodes (4): UsersPage(), handleDeleteConfirm(), handleSubmit(), loadData()

### Community 86 - "RoleUser"
Cohesion: 0.40
Nodes (5): StatGrid(), StatGridProps, CustomUser, Session, RoleUser

### Community 88 - "checkout/page.tsx"
Cohesion: 0.15
Nodes (21): createVoucher(), deleteVoucher(), getVoucherList(), HasilValidasiVoucher, normalisasiKode(), requireOwner(), setStatusVoucher(), updateVoucher() (+13 more)

### Community 89 - "[tokenMeja]/page.tsx"
Cohesion: 0.21
Nodes (16): getCustomerMenuData, getMejaByToken(), getStatusPesananAktifMeja(), getVoucherAktif(), CheckoutPage(), CustomerMenuPage(), Menu, KeranjangItem (+8 more)

### Community 90 - "cart-sheet.tsx"
Cohesion: 0.35
Nodes (8): validateVoucher(), CartSheet(), CartSheetProps, getItemKey(), formatRupiah(), hitungPotonganDiskon(), VoucherOpsi, VoucherTerpakai

### Community 91 - "Database Test (Docker) — Setup & Cara Menjalankan"
Cohesion: 0.18
Nodes (11): Alur di Balik Layar, Cara Menjalankan (Quick Start), Catatan CI, Catatan Keamanan, Database Test (Docker) — Setup & Cara Menjalankan, Konfigurasi Environment, Perintah npm, Prasyarat (+3 more)

### Community 92 - "include"
Cohesion: 0.18
Nodes (10): tsx@^4.21.0, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, tsx (+2 more)

### Community 93 - "PieKategori.tsx"
Cohesion: 0.33
Nodes (4): CATEGORY_COLORS, PieKategori(), PieTooltipPayload, KategoriAnalisis

### Community 94 - "PROGRESS - Sesi 2026-11-08 (Rencana integration testing)"
Cohesion: 0.40
Nodes (5): Berikutnya, Catatan, Hasil verifikasi, PROGRESS - Sesi 2026-11-08 (Rencana integration testing), Selesai

### Community 96 - "test-db.mjs"
Cohesion: 0.22
Nodes (5): CLI, env, ENV_FILES, fail(), run()

### Community 97 - "20261113000001_reservasi_dp_bukti/migration.sql"
Cohesion: 0.20
Nodes (10): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 8. Optimasi delay >5 detik (+2 more)

### Community 98 - "seed-historical.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 99 - "ClockDisplay.tsx"
Cohesion: 0.14
Nodes (15): SaranUangAwalSendiri, ShiftLainAktif, bacaRingkasanTersimpan(), durasiLabel(), HasilShiftAktif, jamLabel(), RingkasanTutupShift, rupiah() (+7 more)

### Community 101 - "notifikasi.ts"
Cohesion: 0.21
Nodes (11): awalHari(), getNotifikasiDashboard(), getNotifikasiTerlambat(), KIND_PER_ROLE, klasifikasiPesanan(), NotifikasiItem, NotifikasiKind, NotifikasiPesananTerlambat (+3 more)

### Community 102 - "seed-resep.ts"
Cohesion: 0.47
Nodes (5): butuhBumbu(), DRY_RUN, main(), prisma, upsertBahan()

### Community 104 - "PROGRESS - Sesi 2026-11-04"
Cohesion: 0.50
Nodes (4): ⏳ BELUM / MENUNGGU KEPUTUSAN, PROGRESS - Sesi 2026-11-04, 🧹 Rampingkan graphify (2026-11-04), ✅ SELESAI (verifikasi & pembersihan)

### Community 105 - "@prisma/adapter-pg@^5.22.0"
Cohesion: 0.22
Nodes (8): Alur Integration, Cara Menjalankan, Integration Test, Penjelasan Assertion Integration, Penjelasan Assertion Unit, TC-01 — Kelola User (`createUser`), Tujuan, Unit Test

### Community 106 - "kategori-icon.ts"
Cohesion: 0.36
Nodes (7): CATEGORY_ICON_MAP, CATEGORY_ICON_OPTIONS, EXTRA_CATEGORY_ICONS, getKategoriIcon(), KategoriIconOption, LEGACY_ICON_ALIASES, suggestKategoriIcon()

### Community 107 - "TC-03 — Kelola Menu (`createMenu`)"
Cohesion: 0.22
Nodes (8): Aturan Status Menu, Cara Menjalankan, Integration Test, Penjelasan Assertion Integration, Penjelasan Assertion Unit, TC-03 — Kelola Menu (`createMenu`), Tujuan, Unit Test

### Community 108 - "cart-sheet.tsx"
Cohesion: 0.25
Nodes (8): Aturan Bisnis, Cara Menjalankan, Integration Test, Penjelasan Assertion Integration, Penjelasan Assertion Unit, TC-04 — Voucher (`createVoucher` + `validateVoucher`), Tujuan, Unit Test

### Community 111 - "PROGRESS - Sesi 2026-11-10 (Latihan uji operasi DB di file terpisah)"
Cohesion: 0.50
Nodes (4): Berikutnya, Hasil verifikasi, PROGRESS - Sesi 2026-11-10 (Latihan uji operasi DB di file terpisah), Selesai

### Community 112 - "integration/tc05-confirm-qris-payment.test.ts"
Cohesion: 0.33
Nodes (3): { authMock, revalidatePathMock, triggerPusherMock }, siapkanPesanan(), suffix()

### Community 114 - "Demo Test Case — Level Menengah (5 TC)"
Cohesion: 0.22
Nodes (9): Cara Menjalankan, Catatan, Demo Test Case — Level Menengah (5 TC), Level Menengah — Kenapa?, Pembagian Demo per Individu, Prasyarat Integration Test, Prinsip Unit vs Integration, Ringkasan (+1 more)

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

### Community 121 - "2. Baseline Library & Kondisi Saat Ini"
Cohesion: 0.50
Nodes (4): 2.1 Library tersedia, 2.2 Test yang sudah berjalan (27 file, 526 test), 2.3 Gap yang harus ditutup di Fase 0, 2. Baseline Library & Kondisi Saat Ini

### Community 122 - "Pringmoni - Resto POS & Monitoring"
Cohesion: 0.10
Nodes (19): Aturan Hemat Token (WAJIB), Available Agents, Available Commands (/), Available Skills, Branch Terlindungi (JANGAN DIHAPUS), Folder Structure, graphify, Kompatibilitas Shell (PowerShell & Git Bash) (+11 more)

### Community 123 - "Documentation Types"
Cohesion: 0.13
Nodes (14): 1. README Files, 2. API Documentation, 3. Guides and Tutorials, 4. Inline Documentation, 5. Architecture Documentation, Clarity, Core Philosophy, Critical Rules (+6 more)

### Community 124 - "OWASP Top 10 Analysis"
Cohesion: 0.13
Nodes (14): A01: Broken Access Control, A02: Cryptographic Failures, A03: Injection, A04: Insecure Design, A05: Security Misconfiguration, A06: Vulnerable Components, A07: Authentication Failures, A08: Software and Data Integrity Failures (+6 more)

### Community 125 - "TC-02 — Kelola Meja (`createMeja`)"
Cohesion: 0.22
Nodes (8): Cara Menjalankan, Integration Test, Logika yang Diuji, Penjelasan Assertion Integration, Penjelasan Assertion Unit, TC-02 — Kelola Meja (`createMeja`), Tujuan, Unit Test

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

### Community 130 - "PROGRESS - Sesi 2026-11-05 (Whitebox Testing S2)"
Cohesion: 0.50
Nodes (4): Berikutnya, Catatan, PROGRESS - Sesi 2026-11-05 (Whitebox Testing S2), Selesai

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

### Community 154 - "TC-05 — Pembayaran QRIS (`confirmQrisPayment`)"
Cohesion: 0.22
Nodes (8): Alur Action, Cara Menjalankan, Integration Test, Penjelasan Assertion Integration, Penjelasan Assertion Unit, TC-05 — Pembayaran QRIS (`confirmQrisPayment`), Tujuan, Unit Test

### Community 155 - "prisma"
Cohesion: 0.67
Nodes (3): prisma@5.22.0, prisma@^5.22.0, prisma

### Community 157 - "PROGRESS - Sesi 2026-11-05 (Whitebox Testing S3-S6)"
Cohesion: 0.40
Nodes (5): Berikutnya, Catatan, Hasil verifikasi, PROGRESS - Sesi 2026-11-05 (Whitebox Testing S3-S6), Selesai

### Community 158 - "6. Strategi Mock & Fixture"
Cohesion: 0.33
Nodes (6): 6.1 Mock Prisma (wajib), 6.2 Transaksi, 6.3 Auth per role, 6.4 Waktu & ID, 6.5 Yang tidak boleh dilakukan, 6. Strategi Mock & Fixture

### Community 159 - "8. Konfigurasi Coverage & Perintah"
Cohesion: 0.33
Nodes (6): 8.1 `vitest.config.ts` (target Fase 0), 8.2 Perintah, 8.3 Struktur folder test (unit vs integration), 8.4 Rencana integration testing (iterasi berikutnya), 8.5 Rencana Penting Lain (Menunggu / TODO), 8. Konfigurasi Coverage & Perintah

### Community 162 - "ReservasiPage"
Cohesion: 0.40
Nodes (5): Berikutnya, Catatan, Hasil verifikasi, PROGRESS - Sesi 2026-11-07 (Whitebox: rencana ke depan + commit unit test S0-S6), Selesai

### Community 163 - "3. Strategi Whitebox"
Cohesion: 0.40
Nodes (5): 3.1 Teknik per level kritikalitas, 3.2 Prinsip test, 3.3 Kontrak: Test = Spek (WAJIB), 3.4 Target coverage, 3. Strategi Whitebox

### Community 165 - "PROGRESS - Sesi 2026-11-05 (Whitebox Testing S1)"
Cohesion: 0.50
Nodes (4): Berikutnya, Catatan, PROGRESS - Sesi 2026-11-05 (Whitebox Testing S1), Selesai

### Community 166 - "Tester Agent"
Cohesion: 0.18
Nodes (10): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+2 more)

### Community 169 - "PROGRESS - Sesi 2026-11-05 (Whitebox Testing S0)"
Cohesion: 0.50
Nodes (4): Berikutnya, Catatan, PROGRESS - Sesi 2026-11-05 (Whitebox Testing S0), Selesai

### Community 171 - "PROGRESS - Sesi 2026-11-06 (Whitebox Testing S1-S3 lanjutan)"
Cohesion: 0.50
Nodes (4): Berikutnya, Catatan, Hasil verifikasi, PROGRESS - Sesi 2026-11-06 (Whitebox Testing S1-S3 lanjutan)

### Community 203 - "cloudinary@^2.10.0"
Cohesion: 0.11
Nodes (10): cloudinary@^2.10.0, @uploadthing/react@^7.3.3, xlsx@^0.18.5, overrides, effect, prisma, seed, cloudinary (+2 more)

## Knowledge Gaps
- **12 isolated node(s):** `{ GET, POST }`, `@opencode-ai/plugin`, `dom`, `dom.iterable`, `esnext` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1944 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `reservasi/page.tsx` to `DashboardClient.tsx`, `page-loader.tsx`, `kasir/page.tsx`, `card.tsx`, `ShiftKasirPanel.tsx`, `shift/page.tsx`, `stok-bahan/page.tsx`, `pindah-meja-sheet.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `createLog()` (e.g. with `Integration Test` and `Penjelasan Assertion Unit`) actually correct?**
  _`createLog()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `{ GET, POST }`, `@opencode-ai/plugin`, `dom` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `actions/shift.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `kasir/page.tsx`, `card.tsx`, `ShiftKasirPanel.tsx`, `proxy.ts`, `reservasi/page.tsx`, `shift/page.tsx`, `devDependencies`, `stok-bahan/page.tsx`, `pindah-meja-sheet.tsx`, `dependencies`, `app/layout.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `src/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._