# Graph Report - pringmoni  (2026-08-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 854 nodes · 1657 edges · 115 communities (44 shown, 59 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `10addf2b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- kasir/page.tsx
- pesanan.ts
- cn
- menu/page.tsx
- compilerOptions
- menu.ts
- src/types/index.ts
- LaporanClient.tsx
- types/index.ts
- components.json
- button.tsx
- dashboard/pesanan/page.tsx
- auth.ts
- card.tsx
- dashboard/layout.tsx
- users.ts
- devDependencies
- cart-sheet.tsx
- laporan.ts
- dashboard.ts
- DashboardCharts.tsx
- createLog
- meja.ts
- dependencies
- prisma.ts
- app/layout.tsx
- export-laporan.ts
- print-struk.ts
- GrafikPeakHours.tsx
- 20260408053831_init_all_schema/migration.sql
- login.ts
- uploadthing.ts
- package.json
- logs.ts
- scripts
- seed-2025.ts
- seed-historical.ts
- forgot-password.ts
- components/BankIcon.tsx
- PieMetode.tsx
- proxy.ts
- optionalDependencies
- security-scan.ts
- category-icon.tsx
- GrafikMenu.tsx
- PerbandinganCard.tsx
- auto-format.ts
- notifications.ts
- parallel-guard.ts
- verification.ts
- graphify.js
- prisma
- seed.ts
- testPrisma.ts
- download-qr/route.ts
- cloudinary
- clsx
- eslint.config.mjs
- eslint-config-next
- exceljs
- @hugeicons/core-free-icons
- @hugeicons/react
- jspdf
- jsqr
- lucide-react
- midtrans-client
- next
- next-auth
- next.config.ts
- nodemailer
- @prisma/adapter-pg
- @prisma/client
- pusher
- pusher-js
- qrcode
- radix-ui
- @radix-ui/react-dialog
- react
- react-dom
- @react-pdf/renderer
- recharts
- shadcn
- sharp
- tailwind-merge
- tw-animate-css
- @types/midtrans-client
- uploadthing
- @uploadthing/react
- xlsx
- zod
- tailwindcss
- @tailwindcss/postcss
- @testing-library/react
- ts-node
- tsx
- @types/bcryptjs
- @types/pg
- @types/react
- @types/react-dom
- vitest
- postcss.config.mjs
- 20260327055635_init/migration.sql
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `cn()` - 72 edges
2. `createLog()` - 29 edges
3. `KasirPage()` - 23 edges
4. `Button()` - 23 edges
5. `Card()` - 18 edges
6. `CardContent()` - 18 edges
7. `compilerOptions` - 17 edges
8. `Input()` - 15 edges
9. `Badge()` - 15 edges
10. `MenuPage()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `SheetFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/sheet.tsx → src/lib/utils.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/utils.ts
- `SheetDescription` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/sheet.tsx → src/lib/utils.ts
- `SheetOverlay` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/sheet.tsx → src/lib/utils.ts
- `LoginPage()` --indirect_call--> `loginAction()`  [INFERRED]
  src/app/(auth)/login/page.tsx → src/app/actions/login.ts

## Import Cycles
- None detected.

## Communities (115 total, 59 thin omitted)

### Community 0 - "kasir/page.tsx"
Cohesion: 0.06
Nodes (37): accPesanan(), BANK_LABELS, BANK_VA_PREFIX, batalkanPesananKasir(), confirmQrisPayment(), generateQRISCode(), generateVANumber(), getPembayaranInfo() (+29 more)

### Community 1 - "pesanan.ts"
Cohesion: 0.09
Nodes (38): getKategoriMenus(), buildPaymentResult(), cancelExpiredOrders(), checkMidtransPaymentStatus(), createMidtransPayment(), createPesanan(), CreatePesananData, CreatePesananItem (+30 more)

### Community 2 - "cn"
Cohesion: 0.08
Nodes (27): CardAction(), CardFooter(), Checkbox(), DialogOverlay(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel() (+19 more)

### Community 3 - "menu/page.tsx"
Cohesion: 0.15
Nodes (29): getMeja(), getMenus(), MenuWithKategori, CartItem, aksiColors, aksiKategori, aksiLabels, JenisAksi (+21 more)

### Community 4 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node (+22 more)

### Community 5 - "menu.ts"
Cohesion: 0.12
Nodes (24): createKategori(), createMenu(), CreateMenuInput, deleteKategori(), deleteMenu(), deleteAllMenuFotos(), deleteMenuFoto(), getMenuFotos() (+16 more)

### Community 6 - "src/types/index.ts"
Cohesion: 0.07
Nodes (24): CATEGORY_COLORS, PieKategori(), AnalisisTambahan, BandingData, CreateUserInput, DashboardStats, DetailPesananItem, KategoriAnalisis (+16 more)

### Community 7 - "LaporanClient.tsx"
Cohesion: 0.12
Nodes (16): currentYear, dateToWeekStr(), getWeekRange(), LaporanClient(), LaporanKasirItem, loadingState, TabBanding(), TabBulanan() (+8 more)

### Community 8 - "types/index.ts"
Cohesion: 0.08
Nodes (24): CustomerMenu, DashboardStats, DetailPesananItem, GrafikPoint, ItemLaporanPesanan, KategoriMenu, LaporanKasir, LaporanMenuTerlaris (+16 more)

### Community 9 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "button.tsx"
Cohesion: 0.19
Nodes (16): metodeConfig, PesananData, StatusPesanan, Menu, MenuCardProps, MenuFoto, Button(), buttonVariants (+8 more)

### Community 11 - "dashboard/pesanan/page.tsx"
Cohesion: 0.20
Nodes (16): cancelPesanan(), getPesananById(), getPesananForDashboard(), markItemDiantar(), markPesananSelesai(), updateStatusPesanan(), PesananDetailPage(), statusBayarColors (+8 more)

### Community 12 - "auth.ts"
Cohesion: 0.13
Nodes (9): utapi, StatCard(), StatGrid(), StatGridProps, CustomUser, { handlers, auth, signIn, signOut }, next-auth, Session (+1 more)

### Community 13 - "card.tsx"
Cohesion: 0.30
Nodes (11): initialState, initialState, initialState, StatCardProps, Card(), CardContent(), CardDescription(), CardHeader() (+3 more)

### Community 14 - "dashboard/layout.tsx"
Cohesion: 0.16
Nodes (10): ClockDisplay(), pad(), DashboardClient(), DashboardClientProps, Header(), Sidebar(), SidebarProps, UserContext (+2 more)

### Community 15 - "users.ts"
Cohesion: 0.22
Nodes (12): createUser(), deleteUser(), getKasirUsers(), getUsers(), requireOwner(), toggleUserStatus(), updateUser(), UserWithRole (+4 more)

### Community 16 - "devDependencies"
Cohesion: 0.13
Nodes (15): babel-plugin-react-compiler, eslint, devDependencies, babel-plugin-react-compiler, eslint, @testing-library/jest-dom, @testing-library/user-event, @types/node (+7 more)

### Community 17 - "cart-sheet.tsx"
Cohesion: 0.17
Nodes (13): CartSheet(), CartSheetProps, getItemKey(), KeranjangItem, sampleVouchers, Voucher, SheetContent, SheetContentProps (+5 more)

### Community 18 - "laporan.ts"
Cohesion: 0.36
Nodes (13): getAnalisisTambahan(), getDateRange(), getGrafikPendapatan(), getLaporanAll(), getLaporanBanding(), getLaporanKasir(), getLaporanKategori(), getLaporanMenuTerlaris() (+5 more)

### Community 19 - "dashboard.ts"
Cohesion: 0.31
Nodes (9): autoCancelStaleUnpaid(), getDashboardCharts(), getDashboardStats(), getStaleOrders(), PaidStaleOrder, StaleOrder, DashboardPage(), formatDurasi() (+1 more)

### Community 20 - "DashboardCharts.tsx"
Cohesion: 0.19
Nodes (12): ChartItem, ChartTooltip(), DashboardChartData, DashboardCharts(), ensureData(), ensureMetode(), formatRupiah(), MejaData (+4 more)

### Community 21 - "createLog"
Cohesion: 0.24
Nodes (9): konfirmasiPembayaran(), prosesPembayaranQRIS(), logoutAction(), updatePembayaran(), resetPasswordConfirmAction(), ResetPasswordPage(), createLog(), getIp() (+1 more)

### Community 22 - "meja.ts"
Cohesion: 0.24
Nodes (9): createMeja(), deleteMeja(), generateNomorMeja(), getNextNomorMeja(), MejaResult, updateMeja(), MejaPage(), handleDeleteConfirm() (+1 more)

### Community 23 - "dependencies"
Cohesion: 0.18
Nodes (11): bcryptjs, class-variance-authority, dependencies, bcryptjs, class-variance-authority, pg, qrcode.react, uuid (+3 more)

### Community 24 - "prisma.ts"
Cohesion: 0.20
Nodes (4): POST(), runtime, createLogNoSession(), globalForPrisma

### Community 25 - "app/layout.tsx"
Cohesion: 0.22
Nodes (8): geistMono, geistMonoHeading, geistSans, inter, metadata, RootLayout(), Providers(), Footer()

### Community 26 - "export-laporan.ts"
Cohesion: 0.33
Nodes (10): centerText(), exportLaporanPDF(), footerLaporan(), formatRupiah(), headerLaporan(), KasirExport, MonthPDFData, renderRingkasanPDF() (+2 more)

### Community 27 - "print-struk.ts"
Cohesion: 0.33
Nodes (10): centerText(), formatRupiah(), nomorPesanan(), printStruk58(), renderAllPages(), renderDoc(), renderStruk(), rightText() (+2 more)

### Community 28 - "GrafikPeakHours.tsx"
Cohesion: 0.24
Nodes (5): amberGradient(), calcTicks(), GrafikPeakHours(), GrafikPendapatan(), GrafikPoint

### Community 29 - "20260408053831_init_all_schema/migration.sql"
Cohesion: 0.42
Nodes (8): "detail_pesanan", "kategori_menu", "logs", "meja", "menu", "menu_foto", "pesanan", "users"

### Community 30 - "login.ts"
Cohesion: 0.44
Nodes (7): loginAction(), LoginPage(), checkRateLimit(), getKey(), RateLimitEntry, recordFailedAttempt(), resetRateLimit()

### Community 31 - "uploadthing.ts"
Cohesion: 0.28
Nodes (6): { GET, POST }, UploadButton, { useUploadThing }, f, OurFileRouter, utapi

### Community 32 - "package.json"
Cohesion: 0.25
Nodes (7): name, overrides, effect, prisma, seed, private, version

### Community 33 - "logs.ts"
Cohesion: 0.38
Nodes (5): getLogCount(), getLogs(), getUniqueUsers(), LogItem, LoggingPage()

### Community 34 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, seed-2025, start

### Community 35 - "seed-2025.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 36 - "seed-historical.ts"
Cohesion: 0.60
Nodes (5): main(), prisma, randomInt(), randomItem(), randomTime()

### Community 37 - "forgot-password.ts"
Cohesion: 0.47
Nodes (4): forgotPasswordAction(), ForgotPasswordPage(), sendResetPasswordEmail(), transporter

### Community 39 - "PieMetode.tsx"
Cohesion: 0.40
Nodes (4): COLORS, formatRupiah(), PieMetode(), PieMetodeProps

### Community 40 - "proxy.ts"
Cohesion: 0.40
Nodes (5): config, getRouteRole(), proxy(), roleRouteAccess, RoleUser

### Community 41 - "optionalDependencies"
Cohesion: 0.40
Nodes (5): lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc, @tailwindcss/oxide-win32-x64-msvc

### Community 42 - "security-scan.ts"
Cohesion: 0.67
Nodes (3): isSensitiveFile(), SecurityScanPlugin(), SENSITIVE_FILES

### Community 45 - "PerbandinganCard.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), PerbandinganCard(), PerbandinganData

### Community 51 - "prisma"
Cohesion: 0.67
Nodes (3): prisma, prisma, prisma

## Knowledge Gaps
- **272 isolated node(s):** `KasirPesananItem`, `Pesanan`, `PesananItem`, `MidtransTransactionData`, `CreatePesananData` (+267 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 366 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **59 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `menu/page.tsx`, `button.tsx`, `card.tsx`, `dashboard/layout.tsx`, `cart-sheet.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `KasirPage()` connect `kasir/page.tsx` to `dashboard/pesanan/page.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`, `prisma`, `cloudinary`, `clsx`, `exceljs`, `@hugeicons/core-free-icons`, `@hugeicons/react`, `jspdf`, `jsqr`, `lucide-react`, `midtrans-client`, `next`, `next-auth`, `nodemailer`, `@prisma/adapter-pg`, `@prisma/client`, `pusher`, `pusher-js`, `qrcode`, `radix-ui`, `@radix-ui/react-dialog`, `react`, `react-dom`, `@react-pdf/renderer`, `recharts`, `shadcn`, `sharp`, `tailwind-merge`, `tw-animate-css`, `@types/midtrans-client`, `uploadthing`, `@uploadthing/react`, `xlsx`, `zod`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `KasirPesananItem`, `Pesanan`, `PesananItem` to the rest of the system?**
  _272 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `kasir/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05584415584415584 - nodes in this community are weakly interconnected._
- **Should `pesanan.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0858843537414966 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.08108108108108109 - nodes in this community are weakly interconnected._