# Code Conventions - Pringmoni

## File Naming

| Tipe | Convention | Contoh |
|------|-----------|--------|
| Page components | `page.tsx` | `src/app/dashboard/page.tsx` |
| UI components | `{nama}.tsx` | `Button.tsx`, `Modal.tsx` |
| Server actions | `{nama}.ts` | `meja.ts`, `menu.ts` |
| Types | `index.ts` | `src/types/index.ts` |
| Utils | `{nama}.ts` | `src/lib/utils.ts` |

## Folder Structure

```
src/
├── app/              # Routes & pages (Next.js App Router)
│   ├── actions/      # Server Actions (BE only)
│   ├── (auth)/       # Auth pages
│   ├── (customer)/   # Public customer pages
│   └── dashboard/    # Admin dashboard
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── customer/     # Customer-specific components
│   ├── pesanan/      # Order components
│   ├── kasir/        # Cashier components
│   └── layout/       # Layout components
├── types/            # TypeScript type definitions
├── lib/              # Utilities & config
│   ├── prisma.ts     # Prisma client
│   ├── auth.ts       # NextAuth config
│   └── utils.ts      # Utility functions
└── proxy.ts          # Route protection (Next.js 16)
```

## Code Style

### TypeScript
- Use TypeScript for all files
- Prefer interfaces over types for object shapes
- Use `readonly` for immutable data

### React
- Use functional components with hooks
- Prefer Server Components by default
- Use `'use client'` only when needed (interactivity)

### Server Actions
- Always use `'use server'` directive
- Return plain objects (no class instances)
- Handle errors with try/catch

### Tailwind CSS
- Use utility classes, avoid custom CSS
- Follow shadcn/ui conventions
- Mobile-first responsive design

### Prisma
- Always validate before commit: `npx prisma validate`
- Generate client after schema changes: `npx prisma generate`
- Use relations, avoid raw SQL when possible

## Commit Convention

Format: `type(scope): description`

| Type | Kapan |
|------|-------|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `refactor` | Ubah struktur tanpa ubah fungsi |
| `test` | Tambah test |
| `docs` | Ubah dokumentasi |
| `chore` | Maintenance |

Branch convention:
- `feature/fe-{nama}` - Frontend
- `feature/be-{nama}` - Backend
- `test/{type}-{nama}` - Testing
