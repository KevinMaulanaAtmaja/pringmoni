import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatGrid } from '@/components/dashboard/StatGrid'

const mockStats = {
  pesananHariIni: 15,
  totalPendapatan: 1500000,
  mejaKosong: 5,
  mejaTerpakai: 3,
  pesananMenunggu: 8,
  showMeja: true,
  showPendapatan: true,
}

describe('StatGrid', () => {
  describe('Rendering', () => {
    it('should render Pesanan Hari Ini card', () => {
      render(<StatGrid stats={mockStats} role="owner" />)
      expect(screen.getByText('Pesanan Hari Ini')).toBeDefined()
      expect(screen.getByText('15')).toBeDefined()
    })

    it('should render Pendapatan card for owner', () => {
      render(<StatGrid stats={mockStats} role="owner" />)
      expect(screen.getByText('Pendapatan Hari Ini')).toBeDefined()
    })

    it('should render Meja Kosong card for owner', () => {
      render(<StatGrid stats={mockStats} role="owner" />)
      expect(screen.getByText('Meja Kosong')).toBeDefined()
      expect(screen.getByText('5')).toBeDefined()
    })

    it('should render Pesanan Menunggu card', () => {
      render(<StatGrid stats={mockStats} role="owner" />)
      expect(screen.getByText('Pesanan Menunggu')).toBeDefined()
      expect(screen.getByText('8')).toBeDefined()
    })

    it('should not render Meja Kosong card for cashier', () => {
      render(<StatGrid stats={mockStats} role="cashier" />)
      expect(screen.queryByText('Meja Kosong')).toBeNull()
    })

    it('should not render Pendapatan card for waiter', () => {
      const waiterStats = { ...mockStats, showPendapatan: true }
      render(<StatGrid stats={waiterStats} role="waiter" />)
      expect(screen.queryByText('Pendapatan Hari Ini')).toBeNull()
    })
  })

  describe('Icons', () => {
    it('should render icons for each card', () => {
      render(<StatGrid stats={mockStats} role="owner" />)
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Empty States', () => {
    it('should render cards with zero values', () => {
      const emptyStats = {
        pesananHariIni: 0,
        pesananMenunggu: 0,
      }
      render(<StatGrid stats={emptyStats} role="owner" />)
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThanOrEqual(1)
    })
  })
})
