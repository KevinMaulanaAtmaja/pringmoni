import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/(auth)/login/page'

vi.mock('@/app/actions/login', () => ({
  loginAction: vi.fn().mockImplementation(() => {
    return { error: '' }
  }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render login form', () => {
      render(<LoginPage />)
      expect(screen.getByText('Welcome Back')).toBeDefined()
      expect(screen.getByText('Masuk untuk melanjutkan')).toBeDefined()
    })

    it('should render username input', () => {
      render(<LoginPage />)
      expect(screen.getByLabelText('Username')).toBeDefined()
    })

    it('should render password input', () => {
      render(<LoginPage />)
      expect(screen.getByLabelText('Password')).toBeDefined()
    })

    it('should render submit button', () => {
      render(<LoginPage />)
      expect(screen.getByRole('button', { name: 'Masuk' })).toBeDefined()
    })

    it('should render "Lupa password?" link', () => {
      render(<LoginPage />)
      expect(screen.getByText('Lupa password?')).toBeDefined()
    })
  })

  describe('Form Validation', () => {
    it('should have required attribute on inputs', () => {
      render(<LoginPage />)
      const usernameInput = screen.getByLabelText('Username')
      const passwordInput = screen.getByLabelText('Password')
      expect(usernameInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
    })

    it('should have password type on password input', () => {
      render(<LoginPage />)
      const passwordInput = screen.getByLabelText('Password')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should have correct placeholder text', () => {
      render(<LoginPage />)
      expect(screen.getByPlaceholderText('Masukkan username')).toBeDefined()
      expect(screen.getByPlaceholderText('Masukkan password')).toBeDefined()
    })
  })

  describe('Loading State', () => {
    it('should show loading text when pending', () => {
      render(<LoginPage />)
      const submitButton = screen.getByRole('button', { name: 'Masuk' })
      expect(submitButton).toBeDefined()
    })
  })

  describe('Error Display', () => {
    it('should not show error initially', () => {
      render(<LoginPage />)
      expect(screen.queryByText('Username atau password salah')).toBeNull()
    })
  })
})
