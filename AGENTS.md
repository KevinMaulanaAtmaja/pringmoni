<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pringmoni - Resto POS & Monitoring

## SESSION STARTUP (WAJIB DIBACA SETIAP SESI BARU)

**Setiap kali sesi baru dimulai, agent WAJIB membaca dokumen referensi berikut secara berurutan:**

1. `.opencode/PRD.md` — Product Requirements Document, backlog PBI, status pengerjaan
2. `.opencode/DESIGN.md` — Design system (warna, tipografi, spacing, komponen)
3. `.opencode/ARCHITECTURE.md` — Arsitektur teknis (database schema, routes, auth flow)
4. `.opencode/CONVENTIONS.md` — Code conventions (naming, folder structure, commit format)
5. `.opencode/SECURITY.md` — Security rules (critical rules, best practices, audit checklist)

**Gunakan tools `read` untuk membaca file-file di atas sebelum memulai tugas apapun.**

## Project Overview

Sistem **Resto POS & Monitoring** untuk **Restoran Pringsewu** (PBL project).

### Tech Stack
| Library | Versi |
|---------|-------|
| Next.js | 16.2.1 |
| React | 19.2.4 |
| NextAuth | 5.0.0-beta.30 |
| Prisma | 5.22.0 |
| Tailwind CSS | v4 |
| shadcn/ui | v4.1.1 |
| jsPDF | v4.2.1 |
| Pusher | v5.3.3 |
| UploadThing | v7.7.4 |

## Project Structure (Ringkasan)

Agar agent langsung paham isi project tanpa eksplorasi, berikut peta ringkas `src/`:

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── (auth)/login/page.tsx           # Login (NextAuth v5)
│   ├── (customer)/[tokenMeja]/         # Customer kiosk (QR scan, tanpa login)
│   │   ├── page.tsx                    #   Menu & order
│   │   └── pesanan/page.tsx            #   Lihat pesanan
│   ├── dashboard/                      # Admin dashboard (auth)
│   │   ├── page.tsx                    #   Statistik
│   │   ├── pesanan/page.tsx            #   Kelola pesanan
│   │   ├── kasir/page.tsx              #   Kasir (POS)
│   │   ├── menu/page.tsx               #   Kelola menu
│   │   ├── meja/page.tsx               #   Kelola meja (+QR token)
│   │   ├── user/page.tsx               #   Kelola user
│   │   └── laporan/page.tsx            #   Laporan (PDF/Excel export)
│   └── api/auth/[...nextauth]/route.ts   # Auth API
├── app/actions/                        # Server Actions (inti logika bisnis)
│   ├── meja.ts  menu.ts  pesanan.ts
│   ├── users.ts  auth.ts  login.ts  forgot-password.ts
│   ├── dashboard.ts  laporan.ts  logs.ts  export-laporan.ts  print-struk.ts
├── components/                         # UI (shadcn/ui) + charts (recharts)
├── lib/                                # utils, prisma.ts, uploadthing.ts, dll
└── types/                              # Shared TypeScript types
```

Fitur & integrasi utama:
- **Auth**: NextAuth v5 + role-based (OWNER / CASHIER / WAITER)
- **Payment**: Midtrans (QRIS/Transfer/VA) + callback
- **Realtime**: Pusher (customer order -> dashboard update)
- **Export**: jsPDF (struk/laporan) & exceljs/xlsx
- **DB**: Prisma + PostgreSQL (models: Users, Meja, Menu, KategoriMenu, Pesanan, DetailPesanan, Logs)

## Workflow Configuration

Project ini menggunakan **OpenCode Workflow** dengan konfigurasi di folder `.opencode/`.

### Folder Structure
```
.opencode/
├── agent/          # Agents (orchestrator, specialists, project-specific)
├── command/        # Commands (/review, /commit, /start, dll)
├── skill/          # Skills (domain knowledge)
├── plugin/         # Plugins (auto-format, security-scan, dll)
├── PRD.md          # Product Requirements Document
├── DESIGN.md       # UI Design System (warna, tipografi, dll)
├── ARCHITECTURE.md # Arsitektur Teknis
├── CONVENTIONS.md  # Code Conventions
└── SECURITY.md     # Security Rules
```

### Available Agents

**Primary (Tab to switch):**
| Agent | Fungsi |
|-------|--------|
| `orchestrator` | Master coordinator, multi-step tasks |
| `build` | Default development work |
| `plan` | Analysis only, no file changes |

**Subagents (@mention):**
| Agent | Fungsi | Bash? | Edit? |
|-------|--------|-------|-------|
| `@code-reviewer` | Code quality review | No | No |
| `@debugger` | Bug investigation | Yes | No |
| `@security-auditor` | OWASP vulnerability check | No | No |
| `@refactorer` | Code cleanup | No | Yes |
| `@test-architect` | Test strategy & design | No | Yes |
| `@docs-writer` | Documentation generation | No | Yes |
| `@frontend-dev` | Frontend UI specialist | No | Yes |
| `@backend-dev` | Backend/database specialist | Yes | Yes |
| `@tester` | Testing specialist | No | Yes |

### Available Commands (/)

| Command | Fungsi |
|---------|--------|
| `/start` | Interactive PBI selector & role workflow |
| `/review` | Multi-perspective code review |
| `/commit` | Generate conventional commit message |
| `/architect` | High-level design session |
| `/rapid` | Fast iteration, minimal ceremony |
| `/debug` | Systematic bug investigation |
| `/refactor` | Code cleanup workflow |
| `/security-audit` | OWASP vulnerability check |
| `/test-design` | Plan test coverage |
| `/docs` | Generate documentation |
| `/parallel` | Run multiple tasks at once |
| `/verify-changes` | Lint -> Type -> Build -> Test -> Review |
| `/mentor` | Educational explanations |

### Available Skills

| Skill | Fungsi |
|-------|--------|
| `analyzing-projects` | Codebase exploration & architecture recognition |
| `designing-apis` | REST/GraphQL API design patterns |
| `designing-architecture` | Software architecture decisions |
| `designing-tests` | Test strategy & TDD/BDD approaches |
| `managing-git` | Git workflows & commit conventions |
| `optimizing-performance` | Performance optimization techniques |
| `parallel-execution` | Parallel task execution patterns |

### Plugins (Auto-activated)

| Plugin | Fungsi |
|--------|--------|
| `auto-format` | Auto-format files after edits |
| `security-scan` | Block edits to sensitive files (.env, keys) |
| `verification` | Reminds to test after 3+ file edits |
| `notifications` | Session completion notifications |
| `parallel-guard` | Educates about parallel execution |

## Pembatasan Kerja

| Aktivitas | Diizinkan |
|-----------|-----------|
| `npm run dev` | Tidak - dijalankan oleh user |
| `npm run build` | Ya |
| `npm run lint` | Ya |
| Install dependencies baru | Hanya BE yang boleh |
| Mengosongkan database | **HANYA atas perintah eksplisit user** |

## Referensi

- **PRD**: `.opencode/PRD.md`
- **Design System**: `.opencode/DESIGN.md`
- **Arsitektur**: `.opencode/ARCHITECTURE.md`
- **Conventions**: `.opencode/CONVENTIONS.md`
- **Security**: `.opencode/SECURITY.md`
- **Product Backlog**: `.opencode/PRD.md` (section 3)

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
