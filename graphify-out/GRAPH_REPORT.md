# Graph Report - pringmoni-deck  (2026-11-17)

## Corpus Check
- 280 files · ~162,467 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .toml 4, (none) 2, .css 2)

## Summary
- 2982 nodes · 5168 edges · 160 communities (111 shown, 49 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 67 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `09fdb57e`
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
- reservasi/page.tsx
- 20260408053831_init_all_schema/migration.sql
- package.json
- ui/BankIcon.tsx
- laporan.ts
- logging/page.tsx
- OWASP Top 10 Focus Areas
- stok-bahan/page.tsx
- dashboard/pesanan/page.tsx
- DashboardCharts.tsx
- GrafikPeakHours.tsx
- app/layout.tsx
- export-laporan.ts
- Debugging Methodology
- menu.ts
- pesanan.ts
- (customer)/[tokenMeja]/page.tsx
- menu-management.tsx
- cbf.ts
- auth.ts
- scripts
- scripts.js
- login.ts
- dropdown-menu.tsx
- components/BankIcon.tsx
- PieMetode.tsx
- reservasi-customer.ts
- 20260327055635_init/migration.sql
- security-scan.ts
- createLog
- proxy.ts
- scoring.ts
- README.md
- notifications.ts
- parallel-guard.ts
- verification.ts
- category-icon.tsx
- prisma.ts
- dependencies
- eslint.config.mjs
- stok-bahan.ts
- vitest
- rekomendasi/route.ts
- voice-order-sheet.tsx
- cf.ts
- include
- 20261017000001_add_jadwal_shift_dan_kas_keluar/migration.sql
- 20260930000001_add_shift_kasir/migration.sql
- rate-limiter.ts
- VOICE_ORDER_PLAN.md
- actions/shift.ts
- users.ts
- print-struk.ts
- actions/voucher.ts
- reservasi/page.tsx
- cn
- package.json
- PerbandinganCard.tsx
- use-voice-input.ts
- PesananBaruPage
- GrafikMenu.tsx
- next.config.ts
- checkout/page.tsx
- DashboardClient.tsx
- use-audio-transcribe.ts
- pusher
- Tester Agent
- qrcode@^1.5.4
- pindah-meja-sheet.tsx
- Header.tsx
- similarity-refresh
- seed-historical.ts
- ClockDisplay.tsx
- postcss.config.mjs
- prisma
- seed-resep.ts
- jspdf
- @prisma/adapter-pg@^5.22.0
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
- ReservasiPage
- Implementasi Reservasi (PBI-7.1)
- seed.ts
- testPrisma.ts
- Rencana Reservasi Meja (PBI-7.1 + Reservasi Customer)

## God Nodes (most connected - your core abstractions)
1. `-` - 882 edges
2. `cn()` - 84 edges
3. `Button()` - 56 edges
4. `createLog()` - 53 edges
5. `KasirPage()` - 48 edges
6. `ReservasiPage()` - 47 edges
7. `MejaPage()` - 34 edges
8. `Badge()` - 34 edges
9. `react` - 33 edges
10. `Input()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `🎙️ Voice Order + SPK (F1-F5)` --references--> `setMatriksSimilarity()`  [INFERRED]
  .opencode/PROGRESS.md → src/lib/spk/cf.ts
- `SELESAI` --references--> `ajukanRefund()`  [INFERRED]
  .opencode/PROGRESS.md → src/app/actions/refund.ts
- `Modul 7: Reservasi & Operasional Meja` --references--> `getNotifikasiTerlambat()`  [INFERRED]
  .opencode/PRD.md → src/app/actions/notifikasi.ts
- `P0 - Stabilisasi kritis` --references--> `confirmKedatanganReservasi()`  [INFERRED]
  .opencode/RESERVASI_PLAN.md → src/app/actions/reservasi.ts
- `Priority Test` --references--> `createMenu()`  [INFERRED]
  .opencode/agent/tester.md → src/app/actions/menu.ts

## Import Cycles
- None detected.

## Communities (160 total, 49 thin omitted)

### Community 1 - "seed-2025.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 2 - "actions/shift.ts"
Cohesion: 0.05
Nodes (69): 1. Architecture Overview, 2. Database Schema, 3. Route Structure, 4.1 Shift Kasir & Serah Terima Kas, 4. Server Actions, 6. Real-time Flow, 7. Payment Flow, ARCHITECTURE - Pringmoni (+61 more)

### Community 3 - "page-loader.tsx"
Cohesion: 0.08
Nodes (29): 1. Teks "Coret item" → "Tandai item", 2. Fix bug checkbox waiter, 3. Delay navigasi halaman (loading.tsx), 4. Voice notifikasi pesanan masuk & dibayar, 5. Animasi loading + overlay gelap, 6. Responsive HP & tablet, 7. Icon logout nempel ke kanan, 8. Optimasi delay >5 detik (+21 more)

### Community 4 - "compilerOptions"
Cohesion: 0.10
Nodes (21): dom, dom.iterable, esnext, node, compilerOptions, allowJs, esModuleInterop, incremental (+13 more)

### Community 5 - "uploadthing.ts"
Cohesion: 0.25
Nodes (7): uploadthing@^7.7.4, uploadthing, { GET, POST }, f, ourFileRouter, OurFileRouter, utapi

### Community 6 - "src/types/index.ts"
Cohesion: 0.05
Nodes (39): 8. Stock & Availability Flow, AnalisisTambahan, CreateStokBahanInput, CreateUserInput, DashboardStats, DetailPesananItem, JadwalShift, JenisPerubahanStok (+31 more)

### Community 7 - "LaporanClient.tsx"
Cohesion: 0.09
Nodes (22): LaporanPage(), currentYear, dateToWeekStr(), getWeekRange(), LaporanClient(), LaporanKasirItem, loadingState, TabBanding() (+14 more)

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
Cohesion: 0.14
Nodes (32): 6. Komponen (shadcn/ui), cekAutoCancelOtomatis(), getRefundInfo(), initialState, DetailPesananPage(), metodeConfig, PesananData, StatusPesanan (+24 more)

### Community 13 - "dashboard.ts"
Cohesion: 0.14
Nodes (21): Modul 8: Notifikasi, QR & Backup, autoCancelStaleUnpaid(), getDashboardCharts(), getDashboardStats(), getStaleOrders(), PaidStaleOrder, StaleOrder, awalHari() (+13 more)

### Community 14 - "reservasi/page.tsx"
Cohesion: 0.21
Nodes (15): resetPasswordConfirmAction(), initialState, initialState, ResetPasswordPage(), CafeSpotlight(), CafeSpotlightProps, StatCard(), StatCardProps (+7 more)

### Community 15 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.15
Nodes (12): "detail_pesanan", "kategori_menu", "logs", "meja", "menu", "menu_foto", "pesanan", "users" (+4 more)

### Community 16 - "package.json"
Cohesion: 0.06
Nodes (36): devDependencies, agentation-mcp@^1.3.2, babel-plugin-react-compiler@1.0.0, eslint@^9, eslint-config-next@16.2.1, tailwindcss@^4, @tailwindcss/postcss@^4, @testing-library/jest-dom@^6.9.1 (+28 more)

### Community 18 - "laporan.ts"
Cohesion: 0.28
Nodes (16): A. Optimasi laporan (belum dikerjakan), 🔜 Langkah Besok, getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir() (+8 more)

### Community 19 - "logging/page.tsx"
Cohesion: 0.20
Nodes (12): getLogCount(), getLogs(), getUniqueUsers(), LogItem, aksiColors, aksiKategori, aksiLabels, JenisAksi (+4 more)

### Community 20 - "OWASP Top 10 Focus Areas"
Cohesion: 0.07
Nodes (26): 10. SSRF, 1. Broken Access Control, 1. Map Attack Surface, 2. Analyze Each Entry Point, 2. Cryptographic Failures, 3. Check Trust Boundaries, 3. Injection, 4. Insecure Design (+18 more)

### Community 21 - "stok-bahan/page.tsx"
Cohesion: 0.17
Nodes (12): StokBahanWithType, BahanLogo(), BahanLogoConfig, emptyForm, getBahanLogoConfig(), jenisPerubahanLabels, kategoriLabels, satuanLabels (+4 more)

### Community 22 - "dashboard/pesanan/page.tsx"
Cohesion: 0.08
Nodes (44): next-auth, getPesananRiwayatKasir(), getPesananById(), getPesananForDashboard(), markItemDiantar(), KasirPage(), getGrandTotal(), handleBayarTunaiStep() (+36 more)

### Community 23 - "DashboardCharts.tsx"
Cohesion: 0.19
Nodes (12): ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah(), MejaData (+4 more)

### Community 24 - "GrafikPeakHours.tsx"
Cohesion: 0.23
Nodes (7): amberGradient(), calcTicks(), GrafikPeakHours(), TooltipPayload, GrafikPendapatan(), TooltipPayload, GrafikPoint

### Community 25 - "app/layout.tsx"
Cohesion: 0.15
Nodes (14): agentation@^3.1.2, agentation, geistMono, geistMonoHeading, geistSans, inter, metadata, RootLayout() (+6 more)

### Community 26 - "export-laporan.ts"
Cohesion: 0.36
Nodes (9): centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport, MonthPDFData, renderRingkasanPDF() (+1 more)

### Community 27 - "Debugging Methodology"
Cohesion: 0.08
Nodes (25): 1. Race Conditions, 2. Null/Undefined References, 3. Off-by-One Errors, 4. State Mutations, 5. Environment Mismatches, 6. Dependency Conflicts, Common Bug Patterns, Core Philosophy (+17 more)

### Community 28 - "menu.ts"
Cohesion: 0.10
Nodes (31): applyStokHarian(), createKategori(), createMenu(), CreateMenuInput, deleteKategori(), deleteMenu(), deleteAllMenuFotos(), deleteMenuFoto() (+23 more)

### Community 29 - "pesanan.ts"
Cohesion: 0.15
Nodes (20): getKategoriMenus(), cancelExpiredOrders(), CreatePesananData, CreatePesananItem, getActivePesananByToken(), getCustomerMenuData, getCustomerPaymentStatus(), getMejaByToken() (+12 more)

### Community 30 - "(customer)/[tokenMeja]/page.tsx"
Cohesion: 0.22
Nodes (14): getVoucherAktif(), CustomerMenuPage(), Menu, CartSheet(), CartSheetProps, getItemKey(), KeranjangItem, ambilKeranjangCheckout() (+6 more)

### Community 31 - "menu-management.tsx"
Cohesion: 0.16
Nodes (17): ✅ SELESAI, 5. Integrasi, createMeja(), deleteMeja(), generateNomorMeja(), getMeja(), getNextNomorMeja(), kosongkanMeja() (+9 more)

### Community 32 - "cbf.ts"
Cohesion: 0.16
Nodes (17): buildVektorKriteria(), buildVektorMenu(), CacheKatalog, cosineSimilarity(), GlobalStore, globalThisStore, HasilRekomendasi, INDIKATOR_SUHU (+9 more)

### Community 33 - "auth.ts"
Cohesion: 0.13
Nodes (8): StatGrid(), StatGridProps, CustomUser, { handlers, auth, signIn, signOut }, next-auth, Session, User, RoleUser

### Community 34 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, graph:update, lint, seed-2025, seed-menu, seed-resep (+4 more)

### Community 35 - "scripts.js"
Cohesion: 0.32
Nodes (14): addSimReplay(), advanceSimOnSlide(), beginSimStream(), beginSimThink(), escapeHtml(), finishSim(), go(), initSims() (+6 more)

### Community 36 - "login.ts"
Cohesion: 0.15
Nodes (15): HasilValidasi, loginAction(), LoginState, STATE_AWAL, validasiKredensial(), LoginPage(), AMBANG_SESI_AKTIF_MS, ambilVersiSesi() (+7 more)

### Community 37 - "dropdown-menu.tsx"
Cohesion: 0.07
Nodes (30): getPaidOrdersForNotification(), getPesananBelumBayar(), NotifikasiItem, NotifikasiKind, KasirOrderNotifications(), NotifOrder, PaidOrder, soundedConfirmedOrders (+22 more)

### Community 39 - "PieMetode.tsx"
Cohesion: 0.33
Nodes (5): COLORS, formatRupiah(), PieMetode(), PieMetodeProps, PieTooltipPayload

### Community 40 - "reservasi-customer.ts"
Cohesion: 0.14
Nodes (17): @prisma/client, cekDanCatatRate(), createReservasiCustomer(), CreateReservasiCustomerInput, getIp(), globalStore, ItemReservasiInput, normalisasiNoHp() (+9 more)

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 43 - "createLog"
Cohesion: 0.16
Nodes (27): accPesanan(), batalkanPesananKasir(), confirmQrisPayment(), generateQRISCode(), getPembayaranInfo(), KasirPesananItem, konfirmasiPembayaran(), prosesPembayaranQRIS() (+19 more)

### Community 44 - "proxy.ts"
Cohesion: 0.18
Nodes (14): ALL_ROLES, config, getRouteRole(), isPublicRoute(), isRoleUser(), proxy(), PUBLIC_ROUTES, RESERVED_ROOT_SEGMENTS (+6 more)

### Community 45 - "scoring.ts"
Cohesion: 0.29
Nodes (13): MenuBahanData, matriksTersedia(), BOBOT_CBF_SAJA, BOBOT_HYBRID, bobotEfektif(), BobotHybrid, clamp01(), lolosGate() (+5 more)

### Community 46 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 51 - "prisma.ts"
Cohesion: 0.10
Nodes (13): forgotPasswordAction(), deleteRefundBukti(), RefundBuktiInput, RefundInfo, requireKasir(), ForgotPasswordPage(), sendResetPasswordEmail(), transporter (+5 more)

### Community 54 - "dependencies"
Cohesion: 0.05
Nodes (37): dependencies, bcryptjs@^3.0.3, class-variance-authority@^0.7.1, clsx@^2.1.1, @hugeicons/core-free-icons@^4.0.0, @hugeicons/react@^1.1.6, jsqr@^1.4.0, lucide-react@^1.8.0 (+29 more)

### Community 64 - "stok-bahan.ts"
Cohesion: 0.11
Nodes (31): BELUM, ⏳ BELUM, ⏳ BELUM / MENUNGGU KEPUTUSAN, PROGRESS - Sesi 2026-11-04, PROGRESS - Sesi 2026-11-04 (Reservasi PBI-7.1), PROGRESS - Sesi 2026-11-15 (Refund & Polish Reservasi), 🧹 Rampingkan graphify (2026-11-04), SELESAI (+23 more)

### Community 65 - "vitest"
Cohesion: 0.23
Nodes (10): HasilAnalisisGemini, ATURAN, AturanMood, HasilFallbackMood, KriteriaSaran, PREFIXES, stem(), STOPWORDS_ID (+2 more)

### Community 66 - "rekomendasi/route.ts"
Cohesion: 0.14
Nodes (17): vitest, analisaTranskrip(), dynamic, keMenuPenilaian(), PayloadValid, POST(), runtime, validasiPayload() (+9 more)

### Community 67 - "voice-order-sheet.tsx"
Cohesion: 0.16
Nodes (11): persen(), VoiceOrderSheet(), VoiceOrderSheetProps, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+3 more)

### Community 69 - "cf.ts"
Cohesion: 0.07
Nodes (38): main(), prisma, KATEGORI_SEED, KategoriSeed, main(), MENU_CAFE_SEED, MENU_PAKET_SEED, MenuSeed (+30 more)

### Community 70 - "include"
Cohesion: 0.18
Nodes (10): tsx@^4.21.0, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, tsx (+2 more)

### Community 73 - "rate-limiter.ts"
Cohesion: 0.15
Nodes (14): dynamic, POST(), responsError(), runtime, checkRateLimit(), consumeRateLimit(), getKey(), HasilConsumeRateLimit (+6 more)

### Community 74 - "VOICE_ORDER_PLAN.md"
Cohesion: 0.10
Nodes (18): 10. Risiko, 11. Urutan Eksekusi & Commit, 1. Keputusan yang sudah disepakati, 2. Hasil Riset Penyedia STT (Nov 2026), 3.1 CBF - Content-Based Filtering, 3.2 CF - Collaborative Filtering (item-item), 3.3 Precompute (offline, tanpa GPU), 3.4 Gerbang kelayakan (hard filter) (+10 more)

### Community 75 - "actions/shift.ts"
Cohesion: 0.14
Nodes (13): getKasKeluarAktif(), hapusKasKeluar(), HasilBukaShift, HasilShiftAktif, HasilTutupShift, InputJadwal, relasiShift, RingkasanTutup (+5 more)

### Community 76 - "users.ts"
Cohesion: 0.22
Nodes (12): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+4 more)

### Community 77 - "print-struk.ts"
Cohesion: 0.18
Nodes (15): ADMIN_FEE_QRIS_PERSEN, ADMIN_FEE_TRANSFER, EXPIRY_QRIS_MENIT, EXPIRY_TRANSFER_MENIT, hitungAdminFee(), centerText(), formatRupiah(), nomorPesanan() (+7 more)

### Community 78 - "actions/voucher.ts"
Cohesion: 0.26
Nodes (14): createVoucher(), deleteVoucher(), getVoucherList(), HasilValidasiVoucher, normalisasiKode(), requireOwner(), setStatusVoucher(), updateVoucher() (+6 more)

### Community 79 - "reservasi/page.tsx"
Cohesion: 0.07
Nodes (42): lucide-react, next, react, cekStatusReservasi(), ALASAN_CEPAT, MejaRow, MenuRow, METODE_DP_LABEL (+34 more)

### Community 80 - "cn"
Cohesion: 0.09
Nodes (35): @hugeicons/core-free-icons, @hugeicons/react, radix-ui, getMenus(), MenuWithKategori, CartItem, ActionResult, CATEGORY_ICON_MAP (+27 more)

### Community 82 - "package.json"
Cohesion: 0.07
Nodes (30): cloudinary@^2.10.0, cn@^0.5.0, exceljs@^4.4.0, nodemailer@^7.0.11, @react-pdf/renderer@^4.3.2, shadcn@^4.1.1, sharp@^0.34.5, tailwind-merge@^3.5.0 (+22 more)

### Community 83 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 84 - "use-voice-input.ts"
Cohesion: 0.21
Nodes (11): ambilKonstruktor(), HasilVoiceInput, pesanError(), SpeechRecognitionCtor, SpeechRecognitionErrorEvent, SpeechRecognitionItem, SpeechRecognitionLike, SpeechRecognitionResultEvent (+3 more)

### Community 86 - "GrafikMenu.tsx"
Cohesion: 0.40
Nodes (4): COLORS, GrafikMenu(), TooltipPayload, MenuTerlaris

### Community 88 - "checkout/page.tsx"
Cohesion: 0.29
Nodes (9): createPesanan(), validateVoucher(), CheckoutData, CheckoutPage(), CreatePesananResult, metodeOptions, ambilKodeVoucher(), hapusKeranjangCheckout() (+1 more)

### Community 89 - "DashboardClient.tsx"
Cohesion: 0.29
Nodes (9): jamLabel(), rupiah(), ShiftSidebarStatus(), DashboardClient(), DashboardClientProps, SidebarMobile(), useMediaQuery(), Sidebar() (+1 more)

### Community 90 - "use-audio-transcribe.ts"
Cohesion: 0.60
Nodes (4): didukungDiClient(), HasilAudioTranscribe, tanpaLangganan(), useAudioTranscribe()

### Community 92 - "Tester Agent"
Cohesion: 0.18
Nodes (10): Component Test, Priority Test, Project Context, Role & Folder Access, Rules, Test Examples, Tester Agent, Tester Logic (BE Tester) (+2 more)

### Community 94 - "pindah-meja-sheet.tsx"
Cohesion: 0.27
Nodes (8): getMejaTersediaPindah(), MejaTersediaPindah, pindahMeja(), PindahMejaSheet(), handleOpenChange(), handlePindah(), PindahMejaSheetProps, SheetContent

### Community 95 - "Header.tsx"
Cohesion: 0.28
Nodes (5): Header(), LogoutButton(), UserContext, UserContextValue, UserProvider()

### Community 96 - "similarity-refresh"
Cohesion: 0.29
Nodes (6): schedules, similarity-refresh, $schema, path, requestMethod, schedule

### Community 98 - "seed-historical.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 99 - "ClockDisplay.tsx"
Cohesion: 0.60
Nodes (5): ClockDisplay(), getServerSnapshot(), getSnapshot(), pad(), subscribe()

### Community 101 - "prisma"
Cohesion: 0.67
Nodes (3): prisma@5.22.0, prisma@^5.22.0, prisma

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
Nodes (3): @opencode-ai/plugin, dependencies, @opencode-ai/plugin

### Community 162 - "ReservasiPage"
Cohesion: 0.08
Nodes (33): 5.1 Ambil alih sesi (takeover antar perangkat), 5. Auth Flow, 3. Server Actions, 4. UI, P2 - Operasional & UX kasir, activeReservationStatuses(), ALLOWED_ROLES, cancelReservasi() (+25 more)

### Community 166 - "Implementasi Reservasi (PBI-7.1)"
Cohesion: 0.12
Nodes (17): 1. Ringkasan, 2. Perubahan Database, 6. Verifikasi, 7. Checklist Uji Manual, 8. Batasan yang Diketahui, 9. Reservasi Customer via QR (P3) — Rencana Eksekusi, Action baru (`src/app/actions/reservasi-customer.ts`), Action tambahan (`src/app/actions/reservasi.ts`) (+9 more)

### Community 175 - "Rencana Reservasi Meja (PBI-7.1 + Reservasi Customer)"
Cohesion: 0.14
Nodes (13): 1. Keputusan yang sudah disepakati, 2. Ruang Lingkup, 3. Desain Data v2, 4. Fase Pengerjaan, 5. Alur Meja, 6. Verifikasi, 7. Urutan Eksekusi & Commit, P0 - Stabilisasi kritis (+5 more)

## Knowledge Gaps
- **12 isolated node(s):** `{ GET, POST }`, `@opencode-ai/plugin`, `dom`, `dom.iterable`, `esnext` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1843 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `reservasi/page.tsx` to `voice-order-sheet.tsx`, `dropdown-menu.tsx`, `Button`, `reservasi/page.tsx`, `cn`, `package.json`, `logging/page.tsx`, `pindah-meja-sheet.tsx`, `use-voice-input.ts`, `dashboard/pesanan/page.tsx`, `dependencies`, `app/layout.tsx`, `use-audio-transcribe.ts`, `pesanan.ts`, `(customer)/[tokenMeja]/page.tsx`, `menu-management.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `cn()` (e.g. with `6. Komponen (shadcn/ui)` and `✅ SELESAI`) actually correct?**
  _`cn()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `{ GET, POST }`, `@opencode-ai/plugin`, `dom` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `actions/shift.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.051228070175438595 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `Button` to `DashboardClient.tsx`, `ReservasiPage`, `actions/shift.ts`, `voice-order-sheet.tsx`, `LaporanClient.tsx`, `reservasi/page.tsx`, `reservasi/page.tsx`, `cn`, `logging/page.tsx`, `stok-bahan/page.tsx`, `dashboard/pesanan/page.tsx`, `checkout/page.tsx`, `pindah-meja-sheet.tsx`, `pesanan.ts`, `(customer)/[tokenMeja]/page.tsx`, `menu-management.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `page-loader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07560975609756097 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._