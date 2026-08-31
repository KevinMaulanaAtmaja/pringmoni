# Design System - Pringmoni (UI & Visual Design)

Dokumen ini mendefinisikan **design system** UI, warna, tipografi, dan pola visual untuk **Pringmoni Resto POS & Monitoring**. Gunakan sebagai referensi saat membangun/meninjau UI.

> Sumber nilai token: `src/app/globals.css` dan `src/app/layout.tsx`. Jika ada selisih, **file tersebut yang benar**.

---

## 1. Brand & Identity

- **App name**: Pringmoni
- **Brand color**: Hijau Emerald (kesan segar, restoran/kuliner, natural)
- **Font utama**: Inter (body), Geist Mono (heading/code)
- **Desi gn system**: shadcn/ui v4.1.1 (berbasis Tailwind CSS v4)

---

## 2. Color Palette

Warna didefinisikan sebagai CSS variables di `globals.css` (format **OKLCH**, mendukung light + dark mode).

### Primary (Brand)
| Token | Light (OKLCH) | Penggunaan |
|-------|---------------|-----------|
| `--primary` | `oklch(0.532 0.157 131.589)` | Tombol utama, CTA, link aktif |
| `--primary-foreground` | `oklch(0.986 0.031 120.757)` | Teks di atas tombol primary |
| `--ring` | `oklch(0.723 0.014 214.4)` | Focus ring pada form |

> Primary = **hijau emerald** (hue ~131). Di dark mode `--primary` lebih gelap (`0.453`).

### Emerald Scale (Untuk status/aksen)
| Tingkat | Light (OKLCH) |
|---------|---------------|
| 50 | `oklch(0.979 0.021 166.113)` |
| 100 | `oklch(0.95 0.052 163.051)` |
| 200 | `oklch(0.905 0.093 164.15)` |
| 300 | `oklch(0.845 0.143 164.978)` |
| 400 | `oklch(0.765 0.177 163.223)` |
| 500 | `oklch(0.696 0.17 162.48)` |
| 600 | `oklch(0.596 0.145 163.225)` |
| 700 | `oklch(0.508 0.118 165.612)` |
| 800 | `oklch(0.432 0.095 166.913)` |
| 900 | `oklch(0.378 0.077 168.94)` |
| 950 | `oklch(0.262 0.051 172.552)` |

### Neutral / Surface
| Token | Light | Dark | Penggunaan |
|-------|-------|------|-----------|
| `--background` | `oklch(1 0 0)` (putih) | `oklch(0.148 0.004 228.8)` | Latar halaman |
| `--foreground` | `oklch(0.148 0.004 228.8)` | `oklch(0.987 0.002 197.1)` | Teks utama |
| `--card` | `oklch(1 0 0)` | `oklch(0.218 0.008 223.9)` | Kartu/kontainer |
| `--card-foreground` | `oklch(0.148 0.004 228.8)` | `oklch(0.987 0.002 197.1)` | Teks kartu |
| `--secondary` | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | Tombol sekunder |
| `--secondary-foreground` | `oklch(0.21 0.006 285.885)` | `oklch(0.985 0 0)` | Teks sekunder |
| `--muted` | `oklch(0.963 0.002 197.1)` | `oklch(0.275 0.011 216.9)` | Latar konten redup |
| `--muted-foreground` | `oklch(0.56 0.021 213.5)` | `oklch(0.723 0.014 214.4)` | Teks redup/placeholder |
| `--accent` | `oklch(0.963 0.002 197.1)` | `oklch(0.275 0.011 216.9)` | Hover/highlight |
| `--border` | `oklch(0.925 0.005 214.3)` | `oklch(1 0 0 / 10%)` | Garis batas |
| `--input` | `oklch(0.925 0.005 214.3)` | `oklch(1 0 0 / 15%)` | Latar input |

### Status / Destructive
| Token | Light | Penggunaan |
|-------|-------|-----------|
| `--destructive` | `oklch(0.577 0.245 27.325)` | Hapus, batal, error (merah) |
| `--chart-1..5` | hijau tua → muda | Grafik & analitik |

### Sidebar
Mengikuti varian primary/neutral: `--sidebar`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring`.

---

## 3. Typography

### Font Stacks (dari `layout.tsx`)
| Peran | Font | Variable | Penggunaan |
|-------|------|----------|-----------|
| Body/Sans | **Inter** | `--font-sans` | Teks utama, body |
| Heading/Code | **Geist Mono** | `--font-heading` | Judul, heading, dialog/card title |
| Mono | **Geist Mono** | `--font-geist-mono` | Kode, numerik |

### Aturan Penggunaan
- `font-heading` → untuk heading, judul kartu, judul dialog (contoh: `dialog.tsx`, `card.tsx`, brand `Pringmoni`)
- `font-sans` (default) → untuk body dan konten umum (`html { @apply font-sans }`)
- Gunakan `antialiased` pada root agar teks tajam

### Type Scale (rekomendasi, konsisten dengan Tailwind)
| Elemen | Class |
|--------|-------|
| Halaman/H1 besar | `text-3xl font-bold` |
| Section heading | `text-2xl font-bold` |
| Card/Dialog title | `font-heading text-base font-medium` |
| Body | `text-sm` / `text-base` |
| Label/Placeholder | `text-sm text-muted-foreground` |
| Caption | `text-xs text-muted-foreground` |

---

## 4. Spacing, Radius & Layout

### Radius (dari `--radius: 0.625rem`)
| Token | Nilai |
|-------|-------|
| `--radius-sm` | `calc(0.625 * 0.6)` ≈ 0.375rem |
| `--radius-md` | `calc(0.625 * 0.8)` ≈ 0.5rem |
| `--radius-lg` | `0.625rem` (default) |
| `--radius-xl` | `calc(0.625 * 1.4)` ≈ 0.875rem |
| `--radius-2xl` | `calc(0.625 * 1.8)` ≈ 1.125rem |
| `--radius-3xl` | `calc(0.625 * 2.2)` ≈ 1.375rem |
| `--radius-4xl` | `calc(0.625 * 2.6)` ≈ 1.625rem |

### Layout Umum
- Spacing: gunakan skala Tailwind standar (`p-4`, `gap-4`, dst.)
- Kontainer: `w-full`, batas lebar maksimum sesuai konteks
- Base reset (`@layer base`): semua elemen `border-border`, body `bg-background text-foreground`

---

## 5. Dark Mode

- Diaktifkan lewat class `.dark` di root html
- Semua token punya varian dark otomatis (lihat bagian Warna di atas)
- Pilih teks/aksi utama pakai token (`--primary`, `--foreground`), **bukan** hardcode warna, agar otomatis menyesuaikan light/dark

---

## 6. Komponen (shadcn/ui)

Komponen reuse di `src/components/ui/`:
- `Button`, `Card`, `Dialog`, `Input`, `Select`, dll.
- Judul kartu/dialog wajib pakai `font-heading`
- Gunakan `cn()` (di `src/lib/utils.ts`) untuk merge class

---

## 7. Aturan Penggunaan Warna (Praktik)

| Situasi | Warna |
|---------|-------|
| Tombol aksi utama (Simpan, Bayar, Konfirmasi) | `primary` |
| Aksi sekunder / batal | `secondary` / `ghost` |
| Hapus / batal transaksi | `destructive` (merah) |
| Status sukses (pesanan selesai, dibayar) | hijau emerald (`emerald-600`) |
| Status pending / menunggu | `muted` / kuning per branding kebutuhan |
| Placeholder / teks redup | `muted-foreground` |
| Background halaman | `background` |
| Grafik statistik | `chart-1` .. `chart-5` |

> **Penting**: Selalu pakai semantic token (`bg-primary`, `text-muted-foreground`) daripada kode heks langsung, agar konsisten dan mendukung dark mode.
