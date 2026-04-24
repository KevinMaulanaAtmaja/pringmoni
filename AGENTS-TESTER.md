# AGENTS-TESTER.md - Panduan Tester

> **Referensi Utama:** `AGENTS.md` - Semua aturan dan konvensi ada di sana.

---

## Role & Akses Folder

### Tester Logika (BE Tester) - Izza
**Akses folder:**
- `src/app/actions/` - Server Actions
- `prisma/` - Database schema
- `src/lib/` - Utility functions

**Tugas:** Test logika backend, fungsi server actions, database

**Metode Testing:**
- **Unit Testing** - Test fungsi individual (Server Actions) dengan Vitest
- **Integration Testing** - Test beberapa fungsi bekerja bareng
- **Manual API Testing** - Test endpoint dengan Postman/Thunder Client

**Library:** Vitest (sudah tersedia di `package.json`)

---

### Tester UI (FE Tester) - Melandri
**Akses folder:**
- `src/app/` - Halaman dan route
- `src/components/` - Komponen UI
- `src/types/index.ts` - Type definitions

**Tugas:** Test UI/tampilan, komponen, interaksi user

**Metode Testing:**
- **Component Testing** - Test komponen React individually
- **Unit Testing** - Test fungsi utility

**Library:** Vitest + React Testing Library (sudah tersedia)

---

## Fitur yang TIDAK Bisa Dikerjakan

- Langsung generate fitur baru tanpa persetujuan
- Ubah schema database
- Ubah Server Actions (kecuali untuk test)

---

## Alur Kerja

```
1. Cek PBI yang mau di-test dari AGENTS-FE.md atau AGENTS-BE.md
2. Tanya lead/manager: "Boleh test PBI-2.1?"
3. Kalau dapat persetujuan → buat test
4. Jalankan test → verifikasi hasil
5. Report ke lead/manager kalau ada bug
6. Lead assign ke FE/BE untuk fix
```

---

## Checklist sebelum generate test

- [ ] Fitur sudah selesai (FE/BE report)?
- [ ] Sudah dapat persetujuan dari lead?
- [ ] Test case sudah lengkap?
- [ ] Jalankan `npm run lint` dulu sebelum test?

---

## Catatan Penting

- **Jangan generate fitur baru - hanya TEST fitur yang sudah ada**
- **Selalu tanya/opencode dengan merujuk file ini:**
  > "Tester mau test PBI-2.1, cek AGENTS-TESTER.md dulu ya"
- **Test pakai Vitest** (sudah ada di `package.json`)
- **Priority:** Test yang sudah punya PBI, bukan fitur baru

---

## Priority Test

| Priority | Deskripsi |
|----------|-----------|
| **High** | PBI yang sudah selesai dikerjaan FE/BE |
| **Medium** | Integration test antar module |
| **Low** | Edge cases yang jarang terjadi |

---

## Priority Test Berdasarkan Role

### Tester Logic (Izza) - BE Tester

| Priority | Kapan | Contoh |
|----------|-------|--------|
| **High** | Fungsi selesai | Unit test `createMenu()`, `getPesanan()` |
| **Medium** | 2+ fungsi selesai | Integration test CRUD (create→read→update→delete) |
| **Low** | Ada waktu | Edge case - error handling, invalid input |

### Tester UI (Melandri) - FE Tester

| Priority | Kapan | Contoh |
|----------|-------|--------|
| **High** | Komponen selesai | Component test Button, Form, Modal |
| **Medium** | 2+ komponen selesai | Integration test flow (menu → checkout → struk) |
| **Low** | Ada waktu | Edge case UI - responsive, empty state, error state |

---

## Contoh Testing

### Tester Logic (BE Tester)

```bash
# Jalankan semua test
npm run test

# Jalankan test spesifik
npx vitest run src/app/actions/menu.test.ts

# Contoh Unit Test untuk Server Action:
# File: src/app/actions/__tests__/menu.test.ts
import { describe, it, expect } from 'vitest'

describe('createMenu', () => {
  it('harus berhasil buat menu baru', async () => {
    // Test logic createMenu
    // Input: { namaMenu, harga, kategoriId }
    // Expected: return menu object
  })
})

# Contoh Integration Test:
# Test flow: buat menu → cek menu ada → update → delete
```

### Tester UI (FE Tester)

```bash
# Jalankan test
npm run test

# Contoh Component Test:
# File: src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Button Component', () => {
  it('harus render teks correctly', () => {
    render(<Button>Simpan</Button>)
    expect(screen.getByText('Simpan')).toBeInTheDocument()
  })

  it('harus panggil onClick saat diklik', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Klik</Button>)
    
    await user.click(screen.getByText('Klik'))
    expect(onClick).toHaveBeenCalled()
  })
})
```