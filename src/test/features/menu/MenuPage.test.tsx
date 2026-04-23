import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MenuPage from '@/app/dashboard/menu/page'

vi.mock('@/app/actions/menu', () => ({
  getMenus: vi.fn().mockResolvedValue([
    { id: 1, namaMenu: 'Nasi Goreng', deskripsi: 'Nasi goreng spesial', harga: 25000, kategoriId: 1, statusMenu: 'tersedia', createdAt: new Date(), updatedAt: null, deletedAt: null, kategori: { id: 1, namaKategori: 'Makanan', createdAt: new Date(), deletedAt: null } },
    { id: 2, namaMenu: 'Ayam Bakar', deskripsi: 'Ayam bakar rempah', harga: 35000, kategoriId: 1, statusMenu: 'tersedia', createdAt: new Date(), updatedAt: null, deletedAt: null, kategori: { id: 1, namaKategori: 'Makanan', createdAt: new Date(), deletedAt: null } },
    { id: 3, namaMenu: 'Es Teh', deskripsi: 'Teh manis dingin', harga: 5000, kategoriId: 2, statusMenu: 'tersedia', createdAt: new Date(), updatedAt: null, deletedAt: null, kategori: { id: 2, namaKategori: 'Minuman', createdAt: new Date(), deletedAt: null } },
    { id: 4, namaMenu: 'Sate Ayam', deskripsi: 'Sate dengan bumbu kacang', harga: 30000, kategoriId: 1, statusMenu: 'habis', createdAt: new Date(), updatedAt: null, deletedAt: null, kategori: { id: 1, namaKategori: 'Makanan', createdAt: new Date(), deletedAt: null } },
    { id: 5, namaMenu: 'Soto Ayam', deskripsi: 'Soto dengan ayam suwir', harga: 20000, kategoriId: 1, statusMenu: 'tersedia', createdAt: new Date(), updatedAt: null, deletedAt: null, kategori: { id: 1, namaKategori: 'Makanan', createdAt: new Date(), deletedAt: null } },
    { id: 6, namaMenu: 'Es Jeruk', deskripsi: 'Jeruk peras dingin', harga: 8000, kategoriId: 2, statusMenu: 'tersedia', createdAt: new Date(), updatedAt: null, deletedAt: null, kategori: { id: 2, namaKategori: 'Minuman', createdAt: new Date(), deletedAt: null } },
  ]),
  getKategoriMenus: vi.fn().mockResolvedValue([
    { id: 1, namaKategori: 'Makanan', createdAt: new Date(), deletedAt: null },
    { id: 2, namaKategori: 'Minuman', createdAt: new Date(), deletedAt: null },
  ]),
  createMenu: vi.fn().mockResolvedValue(undefined),
  updateMenu: vi.fn().mockResolvedValue(undefined),
  deleteMenu: vi.fn().mockResolvedValue(undefined),
}))

describe('MenuPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render page title', async () => {
      render(<MenuPage />)
      await waitFor(() => {
        expect(screen.getByText('Kelola Menu')).toBeDefined()
      })
    })

    it('should render "Tambah Menu" button', async () => {
      render(<MenuPage />)
      await waitFor(() => {
        expect(screen.getByText('Tambah Menu')).toBeDefined()
      })
    })

    it('should show loading state initially', () => {
      render(<MenuPage />)
      expect(screen.getByText('Memuat...')).toBeDefined()
    })
  })

  describe('Table Display', () => {
    it('should render table headers', async () => {
      render(<MenuPage />)
      await waitFor(() => {
        expect(screen.getByText('No')).toBeDefined()
        expect(screen.getByText('Nama Menu')).toBeDefined()
        expect(screen.getByText('Kategori')).toBeDefined()
        expect(screen.getByText('Harga')).toBeDefined()
        expect(screen.getByText('Status')).toBeDefined()
        expect(screen.getByText('Aksi')).toBeDefined()
      })
    })

    it('should render menu items', async () => {
      render(<MenuPage />)
      await waitFor(() => {
        expect(screen.getByText('Nasi Goreng')).toBeDefined()
        expect(screen.getByText('Ayam Bakar')).toBeDefined()
        expect(screen.getByText('Es Teh')).toBeDefined()
      })
    })

    it('should display status badges', async () => {
      render(<MenuPage />)
      await waitFor(() => {
        const tersediaBadges = screen.getAllByText('Tersedia')
        expect(tersediaBadges.length).toBeGreaterThanOrEqual(4)
        expect(screen.getByText('Habis')).toBeDefined()
      })
    })
  })

  describe('Pagination', () => {
    it('should show only 5 items on first page', async () => {
      render(<MenuPage />)
      await waitFor(() => {
        expect(screen.getByText('Nasi Goreng')).toBeDefined()
        expect(screen.queryByText('Es Jeruk')).toBeNull()
      })
    })

    it('should show pagination controls', async () => {
      render(<MenuPage />)
      await waitFor(() => {
        expect(screen.getByText('Halaman 1 dari 2')).toBeDefined()
      })
    })
  })

  describe('Dialog', () => {
    it('should open dialog when clicking "Tambah Menu"', async () => {
      render(<MenuPage />)
      await waitFor(() => {
        screen.getByText('Kelola Menu')
      })

      await userEvent.click(screen.getByText('Tambah Menu'))

      await waitFor(() => {
        expect(screen.getByText('Tambah Menu Baru')).toBeDefined()
      })
    })

    it('should have form fields in dialog', async () => {
      render(<MenuPage />)
      await userEvent.click(screen.getByText('Tambah Menu'))

      await waitFor(() => {
        expect(screen.getByLabelText('Nama Menu')).toBeDefined()
        expect(screen.getByLabelText('Deskripsi')).toBeDefined()
        expect(screen.getByLabelText('Harga')).toBeDefined()
      })
    })

    it('should close dialog when clicking Batal', async () => {
      render(<MenuPage />)
      await userEvent.click(screen.getByText('Tambah Menu'))

      await waitFor(() => {
        expect(screen.getByText('Tambah Menu Baru')).toBeDefined()
      })

      await userEvent.click(screen.getByText('Batal'))

      await waitFor(() => {
        expect(screen.queryByText('Tambah Menu Baru')).toBeNull()
      })
    })
  })
})
