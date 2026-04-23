import { describe, it, expect } from 'vitest'

const validateLoginForm = (username: string, password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!username || username.trim().length === 0) {
    errors.push('Username wajib diisi')
  } else if (username.length < 3) {
    errors.push('Username minimal 3 karakter')
  }

  if (!password || password.trim().length === 0) {
    errors.push('Password wajib diisi')
  } else if (password.length < 6) {
    errors.push('Password minimal 6 karakter')
  }

  return { valid: errors.length === 0, errors }
}

const calculateKembalian = (total: number, bayar: number): number => {
  if (bayar < total) return -1
  return bayar - total
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

describe('Login Validation', () => {
  describe('validateLoginForm', () => {
    it('should return valid for correct credentials', () => {
      const result = validateLoginForm('admin', 'password123')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty username', () => {
      const result = validateLoginForm('', 'password123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Username wajib diisi')
    })

    it('should reject empty password', () => {
      const result = validateLoginForm('admin', '')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password wajib diisi')
    })

    it('should reject username less than 3 characters', () => {
      const result = validateLoginForm('ab', 'password123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Username minimal 3 karakter')
    })

    it('should reject password less than 6 characters', () => {
      const result = validateLoginForm('admin', '12345')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password minimal 6 karakter')
    })

    it('should trim whitespace from username', () => {
      const result = validateLoginForm('  admin  ', 'password123')
      expect(result.valid).toBe(true)
    })

    it('should return multiple errors', () => {
      const result = validateLoginForm('', '')
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
    })
  })
})

describe('Payment Logic', () => {
  describe('calculateKembalian', () => {
    it('should return correct change', () => {
      expect(calculateKembalian(50000, 75000)).toBe(25000)
    })

    it('should return 0 when payment equals total', () => {
      expect(calculateKembalian(50000, 50000)).toBe(0)
    })

    it('should return -1 when payment is insufficient', () => {
      expect(calculateKembalian(50000, 25000)).toBe(-1)
    })

    it('should handle large amounts', () => {
      expect(calculateKembalian(1000000, 1500000)).toBe(500000)
    })
  })

  describe('formatCurrency', () => {
    it('should format to IDR', () => {
      const result = formatCurrency(50000)
      expect(result).toContain('50.000')
    })

    it('should handle zero', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0')
    })

    it('should format large numbers with thousand separators', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('1.000.000')
    })
  })
})
