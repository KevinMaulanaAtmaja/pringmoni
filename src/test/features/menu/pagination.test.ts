import { describe, it, expect } from 'vitest'

const formatHarga = (harga: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(harga)
}

const paginate = <T>(items: T[], currentPage: number, itemsPerPage: number): T[] => {
  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  return items.slice(start, end)
}

const getTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.ceil(totalItems / itemsPerPage)
}

describe('formatHarga', () => {
  it('should format 25000 to Rp 25.000', () => {
    const result = formatHarga(25000)
    expect(result).toContain('25.000')
  })

  it('should format 1000000 to Rp 1.000.000', () => {
    const result = formatHarga(1000000)
    expect(result).toContain('1.000.000')
  })

  it('should format 0 to Rp 0', () => {
    const result = formatHarga(0)
    expect(result).toContain('0')
  })

  it('should format small number', () => {
    const result = formatHarga(500)
    expect(result).toContain('500')
  })

  it('should format large number', () => {
    const result = formatHarga(9999999)
    expect(result).toContain('9.999.999')
  })
})

describe('pagination', () => {
  const ITEMS_PER_PAGE = 5
  const mockItems = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }))

  describe('paginate', () => {
    it('should return first 5 items on page 1', () => {
      const result = paginate(mockItems, 1, ITEMS_PER_PAGE)
      expect(result).toHaveLength(5)
      expect(result[0].id).toBe(1)
      expect(result[4].id).toBe(5)
    })

    it('should return items 6-10 on page 2', () => {
      const result = paginate(mockItems, 2, ITEMS_PER_PAGE)
      expect(result).toHaveLength(5)
      expect(result[0].id).toBe(6)
      expect(result[4].id).toBe(10)
    })

    it('should return remaining 2 items on page 3', () => {
      const result = paginate(mockItems, 3, ITEMS_PER_PAGE)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(11)
      expect(result[1].id).toBe(12)
    })

    it('should return empty array for page beyond total', () => {
      const result = paginate(mockItems, 10, ITEMS_PER_PAGE)
      expect(result).toHaveLength(0)
    })

    it('should handle exactly 5 items', () => {
      const fiveItems = mockItems.slice(0, 5)
      const result = paginate(fiveItems, 1, ITEMS_PER_PAGE)
      expect(result).toHaveLength(5)
    })

    it('should return empty array for empty input', () => {
      const result = paginate([], 1, ITEMS_PER_PAGE)
      expect(result).toHaveLength(0)
    })
  })

  describe('getTotalPages', () => {
    it('should return 1 page for 5 items', () => {
      expect(getTotalPages(5, ITEMS_PER_PAGE)).toBe(1)
    })

    it('should return 2 pages for 6 items', () => {
      expect(getTotalPages(6, ITEMS_PER_PAGE)).toBe(2)
    })

    it('should return 3 pages for 12 items', () => {
      expect(getTotalPages(12, ITEMS_PER_PAGE)).toBe(3)
    })

    it('should return 0 pages for 0 items', () => {
      expect(getTotalPages(0, ITEMS_PER_PAGE)).toBe(0)
    })

    it('should return 1 page for less than items per page', () => {
      expect(getTotalPages(3, ITEMS_PER_PAGE)).toBe(1)
    })
  })
})
